// 1. 필요한 엘리먼트 참조
const sliderWrapper = document.getElementById('sliderWrapper');
const sliderCounter = document.getElementById('sliderCounter');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// 2. 초기 상태 설정
let currentIndex = 0;
const totalSlides = 5;
const slideInterval = 3000; // 3초마다 전환

/**
 * 슬라이드 위치와 카운터 숫자를 업데이트하는 함수
 */
function updateSlider() {
    // 슬라이드 이동 (가로로 -20%, -40% ... 이동)
    const movePercentage = currentIndex * (100 / totalSlides);
    sliderWrapper.style.transform = `translateX(-${movePercentage}%)`;
    
    // 카운터 텍스트 업데이트 (index는 0부터 시작하므로 +1)
    sliderCounter.textContent = `${currentIndex + 1} / ${totalSlides}`;
}

/**
 * 다음 슬라이드로 이동
 */
function goToNext() {
    currentIndex = (currentIndex + 1) % totalSlides; // 마지막에서 처음으로 순환
    updateSlider();
}

/**
 * 이전 슬라이드로 이동
 */
function goToPrev() {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides; // 처음에서 마지막으로 순환
    updateSlider();
}

// 3. 이벤트 리스너 등록
nextBtn.addEventListener('click', () => {
    goToNext();
    resetTimer(); // 수동 조작 시 타이머 초기화
});

prevBtn.addEventListener('click', () => {
    goToPrev();
    resetTimer(); // 수동 조작 시 타이머 초기화
});

// 4. 자동 재생 설정
let autoSlide = setInterval(goToNext, slideInterval);

/**
 * 사용자가 버튼을 클릭했을 때 자동 재생 타이머를 초기화하는 기능
 */
function resetTimer() {
    clearInterval(autoSlide);
    autoSlide = setInterval(goToNext, slideInterval);
}

// 초기 화면 셋팅
updateSlider();