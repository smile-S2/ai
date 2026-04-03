/* =================================================================
   app.js
================================================================= */

/* ─── 상품 데이터 ─────────────────────────────────────────── */
var PRIZES = [
  { id: 1, name: '소니 미러리스 A5100',           count: 3,   emoji: '📷' },
  { id: 2, name: '신라호텔 더 파크 뷰 식사권 2인', count: 0,   emoji: '🎁' },
  { id: 3, name: '외장하드 1TB',                  count: 10,  emoji: '💾' },
  { id: 4, name: '라미 만년필',                   count: 3,   emoji: '🖊️' },
  { id: 5, name: '백화점 상품권 1만원',            count: 20,  emoji: '🎫' },
  { id: 6, name: '바나나맛 우유',                 count: 100, emoji: '🍼' },
];

var selectedPrize = null;

/* ─── 상품 카드 렌더링 ────────────────────────────────────── */
function renderPrizes() {
  var grid = document.getElementById('prizeGrid');
  if (!grid) return;
  grid.innerHTML = '';
  PRIZES.forEach(function(prize) {
    var card = document.createElement('div');
    card.className = 'prize-card';
    card.dataset.id = prize.id;
    card.innerHTML =
      '<p class="prize-name">' + prize.name + '</p>' +
      '<div class="prize-img-wrap"><span class="prize-img-icon">' + prize.emoji + '</span></div>' +
      '<p class="prize-count"><strong>' + prize.count + '</strong>개 남음</p>' +
      '<div class="prize-radio"></div>';
    card.addEventListener('click', (function(id){ return function(){ selectPrize(id); }; })(prize.id));
    grid.appendChild(card);
  });
}

function selectPrize(id) {
  selectedPrize = id;
  document.querySelectorAll('.prize-card').forEach(function(c) {
    c.classList.toggle('selected', Number(c.dataset.id) === id);
  });
}

/* ─── 카운트다운 ─────────────────────────────────────────── */
function getTargetTime() {
  var now    = new Date();
  var target = new Date(now);
  target.setHours(22, 0, 0, 0);
  if (now >= target) target.setDate(target.getDate() + 1);
  return target;
}
function pad(n) { return ('0' + n).slice(-2); }
function updateDigit(id, ch) {
  var el = document.getElementById(id);
  if (!el) return;
  if (el.textContent !== ch) {
    el.textContent = ch;
    el.classList.remove('flip');
    void el.offsetWidth;
    el.classList.add('flip');
  }
}
function updateCountdown() {
  var diff = Math.max(0, getTargetTime() - new Date());
  var t    = Math.floor(diff / 1000);
  var h = pad(Math.floor(t / 3600));
  var m = pad(Math.floor((t % 3600) / 60));
  var s = pad(t % 60);
  updateDigit('h1', h[0]); updateDigit('h2', h[1]);
  updateDigit('m1', m[0]); updateDigit('m2', m[1]);
  updateDigit('s1', s[0]); updateDigit('s2', s[1]);
}

/* ─── 상태 메시지 ────────────────────────────────────────── */
function setStatus(msg, type) {
  var el = document.getElementById('modalStatus');
  if (!el) return;
  el.textContent = msg;
  el.className = 'modal-status ' + (type || '');
}

/* ─── 모달 열기 / 닫기 ───────────────────────────────────── */
function openModal() {
  var ov = document.getElementById('modalOverlay');
  if (ov) ov.classList.add('active');
  setStatus('', '');
  var el = document.getElementById('inputName');
  if (el) el.focus();
}
function closeModal() {
  var ov = document.getElementById('modalOverlay');
  if (ov) ov.classList.remove('active');
}

/* ─── 유효성 검사 ────────────────────────────────────────── */
function validateForm() {
  var n = (document.getElementById('inputName').value  || '').trim();
  var e = (document.getElementById('inputEmail').value || '').trim();
  var p = (document.getElementById('inputPhone').value || '').trim();

  if (!n)                                         { setStatus('이름을 입력해 주세요.', 'error');            return null; }
  if (!e || e.indexOf('@') < 1)                   { setStatus('올바른 이메일을 입력해 주세요.', 'error');   return null; }
  if (!p || p.replace(/\D/g, '').length < 9)      { setStatus('올바른 전화번호를 입력해 주세요.', 'error'); return null; }
  return { name: n, email: e, phone: p };
}

/* ─── 구글 시트 전송 ─────────────────────────────────────── */
function sendToSheet(payload, onSuccess, onError) {
  var url = window.SHEET_URL || '';

  // SHEET_URL 미설정 → 데모 성공 처리
  if (!url || url === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    onSuccess(true); // true = demo mode
    return;
  }

  var qs = 'name='      + encodeURIComponent(payload.name)
         + '&email='    + encodeURIComponent(payload.email)
         + '&phone='    + encodeURIComponent(payload.phone)
         + '&prize='    + encodeURIComponent(payload.prize)
         + '&answer='   + encodeURIComponent(payload.answer)
         + '&timestamp='+ encodeURIComponent(new Date().toISOString());

  // no-cors: Apps Script CORS 우회 (응답 읽기 불가하나 시트에는 정상 기록)
  fetch(url + '?' + qs, { method: 'GET', mode: 'no-cors' })
    .then(function()    { onSuccess(false); })
    .catch(function(err){ onError(err); });
}

/* ─── 제출 처리 ──────────────────────────────────────────── */
function handleSubmit() {
  var fd = validateForm();
  if (!fd) return;

  var prizeObj  = selectedPrize ? PRIZES.filter(function(p){ return p.id === selectedPrize; })[0] : null;
  var prizeName = prizeObj ? prizeObj.name : '';
  var answerEl  = document.getElementById('answerInput');
  var answer    = answerEl ? answerEl.value.trim() : '';

  var btn = document.getElementById('modalSubmitBtn');
  if (btn) btn.disabled = true;
  setStatus('전송 중입니다…', 'loading');

  sendToSheet(
    { name: fd.name, email: fd.email, phone: fd.phone, prize: prizeName, answer: answer },
    function(isDemo) {
      // 성공
      if (isDemo) {
        setStatus('✅ 응모 완료! (테스트 모드 – SHEET_URL 미설정)', 'success');
      } else {
        setStatus('🎉 응모가 완료되었습니다! 당첨 시 연락드리겠습니다.', 'success');
      }
      ['inputName','inputEmail','inputPhone'].forEach(function(id){
        var el = document.getElementById(id); if (el) el.value = '';
      });
      setTimeout(closeModal, 2600);
      if (btn) btn.disabled = false;
    },
    function(err) {
      // 실패
      console.error('전송 오류:', err);
      setStatus('전송 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'error');
      if (btn) btn.disabled = false;
    }
  );
}

/* ─── 이벤트 바인딩 ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  renderPrizes();
  updateCountdown();
  setInterval(updateCountdown, 1000);

  var el;
  el = document.getElementById('submitBtn');
  if (el) el.addEventListener('click', openModal);

  el = document.getElementById('modalClose');
  if (el) el.addEventListener('click', closeModal);

  el = document.getElementById('modalSubmitBtn');
  if (el) el.addEventListener('click', handleSubmit);

  el = document.getElementById('modalOverlay');
  if (el) el.addEventListener('click', function(ev){ if (ev.target === el) closeModal(); });

  document.addEventListener('keydown', function(ev){ if (ev.key === 'Escape') closeModal(); });
});
