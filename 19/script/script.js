function updateTimer() {
  const now = new Date();
  
  // 오늘 밤 22:00 설정
  const target = new Date();
  target.setHours(22, 0, 0, 0);
  
  // 이미 22시가 지났으면 다음날 22시로
  if (now >= target) {
    target.setDate(target.getDate() + 1);
  }
  
  const diff = target - now; // 남은 밀리초

  const hours   = Math.floor(diff / 1000 / 60 / 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  // 두 자리로 포맷 (예: 9 → 09)
  const pad = n => String(n).padStart(2, '0');

  // DOM 업데이트 (각 자리 숫자를 개별 요소로 분리)
  document.getElementById('h1').textContent = pad(hours)[0];
  document.getElementById('h2').textContent = pad(hours)[1];
  document.getElementById('m1').textContent = pad(minutes)[0];
  document.getElementById('m2').textContent = pad(minutes)[1];
  document.getElementById('s1').textContent = pad(seconds)[0];
  document.getElementById('s2').textContent = pad(seconds)[1];
}

// 즉시 실행 + 매 1초마다 갱신
updateTimer();
setInterval(updateTimer, 1000);


document.getElementById('submit').addEventListener('click', function(e) {
  e.preventDefault();

  // 1. 선택된 상품 가져오기 (라디오 버튼)
  const selectedGift = document.querySelector('input[name="choice"]:checked');
  
  // 2. 입력한 정답 가져오기 (중요: id가 'text'인 input에서 가져와야 함)
  const answerInput = document.getElementById('text'); 
  const answerText = answerInput.value; 

  // 유효성 검사
  if (!selectedGift) {
    alert("상품을 선택해주세요!");
    return;
  }
  if (!answerText.trim()) {
    alert("정답을 입력해주세요!");
    answerInput.focus();
    return;
  }

  // 3. 데이터 전송 준비
  const scriptURL = 'https://script.google.com/macros/s/AKfycbxI7lPTspPeRUByxAg19A1hYEDR0oqHtaTUKdlgDxcrkMBLdFt-DNFtsYsskRNPPM18/exec'; // 여기에 URL 꼭 확인!
  const data = new URLSearchParams();
  
  // 시트로 보낼 이름(key)은 구글 앱스 스크립트의 data.choice, data.answer와 일치해야 합니다.
  data.append("choice", selectedGift.value); 
  data.append("answer", answerText); // 여기에 '응모하기'가 아니라 answerText가 들어가야 합니다.

  // 4. 전송
  fetch(scriptURL, { 
    method: 'POST', 
    body: data,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
  .then(response => {
    alert("정상적으로 응모되었습니다!");
    // 전송 후 입력창 비우기
    answerInput.value = "";
    selectedGift.checked = false;
  })
  .catch(error => {
    console.error('Error!', error.message);
    alert("전송에 실패했습니다.");
  });
});