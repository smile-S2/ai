/* 1. 타이머 로직 (기존 유지) */
function updateTimer() {
    const now = new Date();
    const target = new Date();
    target.setHours(22, 0, 0, 0);
    
    if (now >= target) {
        target.setDate(target.getDate() + 1);
    }
    
    const diff = target - now;
    const pad = n => String(n).padStart(2, '0');

    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    if (document.getElementById('h1')) {
        const hStr = pad(hours);
        const mStr = pad(minutes);
        const sStr = pad(seconds);
        document.getElementById('h1').textContent = hStr[0];
        document.getElementById('h2').textContent = hStr[1];
        document.getElementById('m1').textContent = mStr[0];
        document.getElementById('m2').textContent = mStr[1];
        document.getElementById('s1').textContent = sStr[0];
        document.getElementById('s2').textContent = sStr[1];
    }
}

// 타이머 실행
setInterval(updateTimer, 1000);
updateTimer();

/* 2. 모달 및 전송 로직 (자동 응모 방지 적용) */
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modalContainer');
    const openBtn = document.getElementById('openModalBtn');
    const closeBtn = document.getElementById('closeModal');
    const entryForm = document.getElementById('entryForm');
    const phoneInput = document.getElementById('userPhone');

    // [중요] 메인 페이지의 상위 form이 있다면 새로고침 방지
    const mainForm = document.querySelector('form');
    if (mainForm && mainForm.id !== 'entryForm') {
        mainForm.addEventListener('submit', (e) => e.preventDefault());
    }

    // 모달 열기 버튼 클릭 이벤트
    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault(); // 클릭 시 페이지 새로고침 방지
            const selectedGift = document.querySelector('input[name="choice"]:checked');
            if (!selectedGift) {
                alert('경품을 먼저 선택해 주세요!');
                return;
            }
            modal.style.display = 'flex';
        });
    }

    // 모달 닫기
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // 연락처 하이픈 자동 생성
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/[^0-9]/g, '');
            let res = '';
            if (val.length < 4) res = val;
            else if (val.length < 8) res = val.substring(0, 3) + '-' + val.substring(3);
            else res = val.substring(0, 3) + '-' + val.substring(3, 7) + '-' + val.substring(7, 11);
            e.target.value = res;
        });
    }

    // 실제 데이터 전송 (제출하기 버튼 클릭 시에만 작동)
    if (entryForm) {
        entryForm.addEventListener('submit', function(e) {
            e.preventDefault(); // 폼 제출 시 자동 새로고침 및 중복 실행 방지

            const submitBtn = this.querySelector('.btn-primary');
            submitBtn.disabled = true;
            submitBtn.textContent = '전송 중...';

            const selectedGift = document.querySelector('input[name="choice"]:checked');
            const formData = {
                name: document.getElementById('userName').value,
                email: document.getElementById('userEmail').value,
                phone: document.getElementById('userPhone').value,
                gift: selectedGift ? selectedGift.value : "미선택"
            };

            // 제공해주신 새로운 GAS URL
            const GAS_URL = "https://script.google.com/macros/s/AKfycbzHgOofaCUJAPp8ngJ7gLhBMDD78nMm0G2VvDv6WvPqprrcuzL1oL7USemk22BWJBc9/exec";

            fetch(GAS_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(formData)
            })
            .then(() => {
                alert('응모가 완료되었습니다!');
                modal.style.display = 'none';
                entryForm.reset();
            })
            .catch(err => {
                console.error('전송 에러:', err);
                alert('전송 중 오류가 발생했습니다.');
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = '제출하기';
            });
        });
    }
});