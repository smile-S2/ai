/* =================================================================
   app.js  –  이벤트 페이지 메인 스크립트
================================================================= */

/* ─── 상품 데이터 ─────────────────────────────────────────── */
const PRIZES = [
  { id: 1, name: '소니 미러리스 A5100',        count: 3,   emoji: '📷' },
  { id: 2, name: '신라호텔 더 파크 뷰 식사권 2인', count: 0, emoji: '🎁' },
  { id: 3, name: '외장하드 1TB',               count: 10,  emoji: '💾' },
  { id: 4, name: '라미 만년필',                count: 3,   emoji: '🖊️' },
  { id: 5, name: '백화점 상품권 1만원',         count: 20,  emoji: '🎫' },
  { id: 6, name: '바나나맛 우유',              count: 100, emoji: '🍼' },
];

let selectedPrize = null;

/* ─── 상품 카드 렌더링 ────────────────────────────────────── */
function renderPrizes() {
  const grid = document.getElementById('prizeGrid');
  if (!grid) return;
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
  const now    = new Date();
  const target = new Date(now);
  target.setHours(22, 0, 0, 0);
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
    void el.offsetWidth;
    el.classList.add('flip');
  }
}

function updateCountdown() {
  const diff     = Math.max(0, getTargetTime() - new Date());
  const totalSec = Math.floor(diff / 1000);
  const h  = Math.floor(totalSec / 3600);
  const m  = Math.floor((totalSec % 3600) / 60);
  const s  = totalSec % 60;
  const hh = pad(h), mm = pad(m), ss = pad(s);
  updateDigit('h1', hh[0]); updateDigit('h2', hh[1]);
  updateDigit('m1', mm[0]); updateDigit('m2', mm[1]);
  updateDigit('s1', ss[0]); updateDigit('s2', ss[1]);
}

/* ─── 모달 제어 ──────────────────────────────────────────── */
function getOverlay()     { return document.getElementById('modalOverlay'); }
function getStatusEl()    { return document.getElementById('modalStatus'); }

function openModal() {
  getOverlay().classList.add('active');
  const nameEl = document.getElementById('inputName');
  if (nameEl) nameEl.focus();
  clearStatus();
}

function closeModal() {
  getOverlay().classList.remove('active');
}

function clearStatus() {
  const el = getStatusEl();
  if (el) { el.textContent = ''; el.className = 'modal-status'; }
}

function setStatus(msg, type) {
  const el = getStatusEl();
  if (el) { el.textContent = msg; el.className = 'modal-status ' + type; }
}

/* ─── 유효성 검사 ────────────────────────────────────────── */
function validateForm() {
  const name  = (document.getElementById('inputName')  || {}).value || '';
  const email = (document.getElementById('inputEmail') || {}).value || '';
  const phone = (document.getElementById('inputPhone') || {}).value || '';

  const n = name.trim(), e = email.trim(), p = phone.trim();

  if (!n) { setStatus('이름을 입력해 주세요.', 'error'); return null; }
  if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
    setStatus('올바른 이메일 주소를 입력해 주세요.', 'error'); return null;
  }
  if (!p || p.replace(/[\d\-+() ]/g, '').length > 0 || p.replace(/\D/g,'').length < 9) {
    setStatus('올바른 전화번호를 입력해 주세요. (숫자 9자리 이상)', 'error'); return null;
  }
  return { name: n, email: e, phone: p };
}

/* ─── 구글 시트 전송 ─────────────────────────────────────── */
function sendToSheet(data) {
  // config.js 에서 SHEET_URL 을 설정하지 않았으면 데모 모드로 처리
  var url = (typeof window !== 'undefined' && window.SHEET_URL) ? window.SHEET_URL : '';
  if (!url || url === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    return Promise.resolve({ ok: false, demo: true });
  }

  var params = new URLSearchParams({
    name:      data.name,
    email:     data.email,
    phone:     data.phone,
    prize:     data.prize  || '',
    answer:    data.answer || '',
    timestamp: new Date().toISOString(),
  });

  // Apps Script 는 CORS 리다이렉트를 반환하므로 no-cors 모드 사용.
  // no-cors 에서는 응답 내용을 읽을 수 없지만 시트에는 정상 기록됨.
  return fetch(url + '?' + params.toString(), {
    method: 'GET',
    mode:   'no-cors',
  }).then(function() {
    return { ok: true };
  });
}

/* ─── 제출 처리 ──────────────────────────────────────────── */
function handleSubmit() {
  var formData = validateForm();
  if (!formData) return;

  var prize  = selectedPrize ? (PRIZES.find(function(p){ return p.id === selectedPrize; }) || {}) : {};
  var prizeName = prize.name || '';
  var answerEl  = document.getElementById('answerInput');
  var answer    = answerEl ? answerEl.value.trim() : '';

  var submitBtn = document.getElementById('modalSubmitBtn');
  if (submitBtn) submitBtn.disabled = true;
  setStatus('전송 중입니다…', 'loading');

  sendToSheet({ name: formData.name, email: formData.email, phone: formData.phone, prize: prizeName, answer: answer })
    .then(function(result) {
      if (result.demo) {
        setStatus('✅ 응모가 완료되었습니다! (테스트 모드 – SHEET_URL 미설정)', 'success');
      } else {
        setStatus('🎉 응모가 완료되었습니다! 당첨 시 연락드리겠습니다.', 'success');
      }
      // 입력 필드 초기화
      ['inputName','inputEmail','inputPhone'].forEach(function(id){
        var el = document.getElementById(id);
        if (el) el.value = '';
      });
      setTimeout(closeModal, 2600);
    })
    .catch(function(err) {
      console.error('응모 전송 오류:', err);
      setStatus('전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'error');
    })
    .finally(function() {
      if (submitBtn) submitBtn.disabled = false;
    });
}

/* ─── 이벤트 리스너 연결 ──────────────────────────────────── */
function bindEvents() {
  var submitBtn      = document.getElementById('submitBtn');
  var modalClose     = document.getElementById('modalClose');
  var modalSubmitBtn = document.getElementById('modalSubmitBtn');
  var overlay        = getOverlay();

  if (submitBtn)      submitBtn.addEventListener('click', openModal);
  if (modalClose)     modalClose.addEventListener('click', closeModal);
  if (modalSubmitBtn) modalSubmitBtn.addEventListener('click', handleSubmit);
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeModal();
    });
  }
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
  });
}

/* ─── 초기화 ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  renderPrizes();
  updateCountdown();
  setInterval(updateCountdown, 1000);
  bindEvents();
});
