/* =================================================================
   app.js  –  이벤트 페이지 메인 스크립트
   - 카운트다운 (매일 22:00 까지)
   - 상품 카드 렌더링 & 선택
   - 응모 모달 열기/닫기
   - 구글 시트로 데이터 전송 (config.js 의 SHEET_URL 사용)
================================================================= */

/* ─── 상품 데이터 ─────────────────────────────────────────── */
const PRIZES = [
  { id: 1, name: '소니 미러리스 A5100',   count: 3,   emoji: '📷' },
  { id: 2, name: '신라호텔 더 파크 뷰 식사권 2인', count: 0,  emoji: '🎁' },
  { id: 3, name: '외장하드 1TB',          count: 10,  emoji: '💾' },
  { id: 4, name: '라미 만년필',           count: 3,   emoji: '🖊️' },
  { id: 5, name: '백화점 상품권 1만원',   count: 20,  emoji: '🎫' },
  { id: 6, name: '바나나맛 우유',         count: 100, emoji: '🍼' },
];

let selectedPrize = null;   // 현재 선택된 상품 id

/* ─── 상품 카드 렌더링 ────────────────────────────────────── */
function renderPrizes() {
  const grid = document.getElementById('prizeGrid');
  grid.innerHTML = '';

  PRIZES.forEach(prize => {
    const card = document.createElement('div');
    card.className = 'prize-card';
    card.dataset.id = prize.id;

    card.innerHTML = `
      <p class="prize-name">${prize.name}</p>
      <div class="prize-img-wrap">
        <span class="prize-img-icon">${prize.emoji}</span>
      </div>
      <p class="prize-count"><strong>${prize.count}</strong>개 남음</p>
      <div class="prize-radio"></div>
    `;

    card.addEventListener('click', () => selectPrize(prize.id));
    grid.appendChild(card);
  });
}

function selectPrize(id) {
  selectedPrize = id;
  document.querySelectorAll('.prize-card').forEach(c => {
    c.classList.toggle('selected', Number(c.dataset.id) === id);
  });
}

/* ─── 카운트다운 (매일 22:00) ────────────────────────────── */
function getTargetTime() {
  const now = new Date();
  const target = new Date(now);
  target.setHours(22, 0, 0, 0);
  // 이미 22시가 지났으면 다음날 22시
  if (now >= target) target.setDate(target.getDate() + 1);
  return target;
}

function pad(n) { return String(n).padStart(2, '0'); }

function updateDigit(elId, char) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (el.textContent !== char) {
    el.textContent = char;
    el.classList.remove('flip');
    // reflow trigger
    void el.offsetWidth;
    el.classList.add('flip');
  }
}

function updateCountdown() {
  const diff = Math.max(0, getTargetTime() - new Date());
  const totalSec = Math.floor(diff / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  const hh = pad(h);
  const mm = pad(m);
  const ss = pad(s);

  updateDigit('h1', hh[0]);
  updateDigit('h2', hh[1]);
  updateDigit('m1', mm[0]);
  updateDigit('m2', mm[1]);
  updateDigit('s1', ss[0]);
  updateDigit('s2', ss[1]);
}

/* ─── 모달 제어 ──────────────────────────────────────────── */
const modalOverlay = document.getElementById('modalOverlay');
const modalStatus  = document.getElementById('modalStatus');

function openModal() {
  modalOverlay.classList.add('active');
  document.getElementById('inputName').focus();
  clearStatus();
}

function closeModal() {
  modalOverlay.classList.remove('active');
}

function clearStatus() {
  modalStatus.textContent = '';
  modalStatus.className = 'modal-status';
}

function setStatus(msg, type) {
  modalStatus.textContent = msg;
  modalStatus.className = `modal-status ${type}`;
}

/* ─── 유효성 검사 ────────────────────────────────────────── */
function validateForm() {
  const name  = document.getElementById('inputName').value.trim();
  const email = document.getElementById('inputEmail').value.trim();
  const phone = document.getElementById('inputPhone').value.trim();

  if (!name)  { setStatus('이름을 입력해 주세요.', 'error'); return null; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setStatus('올바른 이메일 주소를 입력해 주세요.', 'error'); return null;
  }
  if (!phone || !/^[\d\-+() ]{9,}$/.test(phone)) {
    setStatus('올바른 전화번호를 입력해 주세요.', 'error'); return null;
  }
  return { name, email, phone };
}

/* ─── 구글 시트 전송 ─────────────────────────────────────── */
async function sendToSheet(data) {
  // CONFIG 는 config.js 에서 주입됨
  if (!window.SHEET_URL || window.SHEET_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    console.warn('SHEET_URL 이 설정되지 않았습니다. config.js 를 확인하세요.');
    return { ok: false, demo: true };
  }

  const params = new URLSearchParams({
    name:    data.name,
    email:   data.email,
    phone:   data.phone,
    prize:   data.prize  || '',
    answer:  data.answer || '',
    timestamp: new Date().toISOString(),
  });

  const res = await fetch(`${window.SHEET_URL}?${params.toString()}`, {
    method: 'GET',   // Apps Script Web App 은 GET 으로도 수신 가능
  });

  if (!res.ok) throw new Error('서버 응답 오류');
  return { ok: true };
}

/* ─── 제출 처리 ──────────────────────────────────────────── */
async function handleSubmit() {
  const formData = validateForm();
  if (!formData) return;

  const prizeName = selectedPrize
    ? (PRIZES.find(p => p.id === selectedPrize) || {}).name || ''
    : '';
  const answer = document.getElementById('answerInput').value.trim();

  const submitBtn = document.getElementById('modalSubmitBtn');
  submitBtn.disabled = true;
  setStatus('전송 중입니다…', 'loading');

  try {
    const result = await sendToSheet({
      ...formData,
      prize: prizeName,
      answer,
    });

    if (result.demo) {
      setStatus('✅ (데모) 응모가 완료되었습니다! (SHEET_URL 미설정)', 'success');
    } else {
      setStatus('🎉 응모가 완료되었습니다! 당첨 시 연락드리겠습니다.', 'success');
    }

    // 입력 필드 초기화
    ['inputName', 'inputEmail', 'inputPhone'].forEach(id => {
      document.getElementById(id).value = '';
    });

    setTimeout(closeModal, 2600);
  } catch (err) {
    console.error(err);
    setStatus('오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'error');
  } finally {
    submitBtn.disabled = false;
  }
}

/* ─── 이벤트 리스너 ──────────────────────────────────────── */
document.getElementById('submitBtn').addEventListener('click', openModal);
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalSubmitBtn').addEventListener('click', handleSubmit);

// 오버레이 클릭 시 닫기
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});

// ESC 키로 닫기
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ─── 초기화 ─────────────────────────────────────────────── */
renderPrizes();
updateCountdown();
setInterval(updateCountdown, 1000);
