

// 1. 배너 자동 슬라이드 기능
const bannerWrapper = document.getElementById('bannerWrapper');
let currentIdx = 0;
const bannerCount = 2;

function slideBanner() {
    currentIdx++;
    if (currentIdx >= bannerCount) {
        currentIdx = 0;
    }
    bannerWrapper.style.transform = `translateX(-${currentIdx * 100}%)`;
}

// 3초마다 슬라이드 실행
setInterval(slideBanner, 3000);

// 2. 찜하기 버튼 토글 기능
function toggleLike(element) {
    element.classList.toggle('active');
    
    if(element.classList.contains('active')) {
        element.style.color = '#FFB7C5';
        // 실제로는 여기서 서버 API를 호출하여 DB에 저장합니다.
        console.log("관심 상품에 추가되었습니다.");
    } else {
        element.style.color = '#ccc';
        console.log("관심 상품에서 제거되었습니다.");
    }
}

// 페이지 이동 시 하단 바 애니메이션 (간단 구현)
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});

// 장바구니 수량 조절 버튼 기능 (Cart 페이지용)
const stepperButtons = document.querySelectorAll('.stepper button');
stepperButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        const span = this.parentElement.querySelector('span');
        let count = parseInt(span.innerText);
        
        if(this.innerText === '+') {
            count++;
        } else if(this.innerText === '-' && count > 1) {
            count--;
        }
        span.innerText = count;
        
        // 실제로는 여기서 가격 재계산 로직이 들어갑니다.
    });
});

// 터지는 이모지 리스트 (포근한 컨셉에 맞춰 수정 가능)
const emojis = ['💖', '✨', '🧸', '🌸', '☁️', '🎀', '🎁', '💌'];

function createEmojiPop(e) {
    // 클릭된 위치 좌표 (버튼의 중앙 혹은 클릭 지점)
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;

    // 한 번에 터질 이모지 개수
    const count = 12;

    for (let i = 0; i < count; i++) {
        const span = document.createElement('span');
        span.classList.add('emoji-particle');
        
        // 랜덤 이모지 선택
        span.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        
        // 랜덤한 이동 거리와 회전값 설정 (CSS 변수 활용)
        const moveX = (Math.random() - 0.5) * 300 + 'px';
        const moveY = (Math.random() - 0.5) * 300 + 'px';
        const rotate = (Math.random() - 0.5) * 45 + 'deg';
        
        span.style.setProperty('--x', moveX);
        span.style.setProperty('--y', moveY);
        span.style.setProperty('--r', rotate);
        
        // 클릭 위치에 생성
        span.style.left = clientX + 'px';
        span.style.top = clientY + 'px';
        
        document.body.appendChild(span);

        // 애니메이션 종료 후 DOM에서 제거 (메모리 관리)
        span.addEventListener('animationend', () => {
            span.remove();
        });
    }
}

// "구매하기" 혹은 "주문하기" 버튼이 있는 페이지에서 실행될 수 있도록 이벤트 연결
document.addEventListener('DOMContentLoaded', () => {
    // btn-order 또는 btn-more 클래스를 가진 버튼들에 효과 적용
    const actionButtons = document.querySelectorAll('.btn-order, .btn-more');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            createEmojiPop(e);
            
            // 실제 주문 로직(알림창 등)은 효과가 나타난 뒤 실행되도록 약간의 지연을 줄 수 있습니다.
            if(btn.classList.contains('btn-order')) {
                setTimeout(() => {
                    alert('포근한 상품이 주문되었습니다! 🧸');
                }, 500);
            }
        });
    });
});

// 카테고리 필터링 기능
function filterCategory(categoryName) {
    const products = document.querySelectorAll('.product-card');
    
    products.forEach(product => {
        if (categoryName === '전체') {
            product.style.display = 'block';
        } else {
            // 상품의 data-category 속성과 클릭한 카테고리명이 일치하는지 확인
            if (product.getAttribute('data-category') === categoryName) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        }
    });
}
