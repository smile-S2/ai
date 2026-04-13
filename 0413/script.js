// 집반찬연구소 - script.js

document.addEventListener('DOMContentLoaded', function () {

  // ==========================================
  // Category Tab Switching
  // ==========================================
  var tabBtns = document.querySelectorAll('.tab-btn');

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });

  // ==========================================
  // Cart Button Click
  // ==========================================
  var cartBtns = document.querySelectorAll('.cart-btn');

  cartBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var card = btn.closest('.product-card');
      var nameEl = card.querySelector('.product-name');
      var name = nameEl ? nameEl.textContent : '상품';
      showToast('🛒 장바구니에 담았습니다: ' + name);
    });
  });

  // ==========================================
  // Toast Notification
  // ==========================================
  function showToast(msg) {
    var toast = document.getElementById('toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notification';
      toast.style.cssText = [
        'position:fixed',
        'bottom:30px',
        'left:50%',
        'transform:translateX(-50%) translateY(20px)',
        'background:rgba(45,106,63,0.95)',
        'color:#fff',
        'padding:12px 24px',
        'border-radius:30px',
        'font-size:13px',
        'font-family:inherit',
        'font-weight:500',
        'z-index:9999',
        'opacity:0',
        'transition:opacity 0.3s, transform 0.3s',
        'box-shadow:0 4px 18px rgba(0,0,0,0.2)',
        'white-space:nowrap'
      ].join(';');
      document.body.appendChild(toast);
    }

    toast.textContent = msg;
    requestAnimationFrame(function () {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2400);
  }

  // ==========================================
  // Sticky Header Shadow on Scroll
  // ==========================================
  var header = document.querySelector('.header');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 10) {
      header.style.boxShadow = '0 2px 12px rgba(0,0,0,0.1)';
    } else {
      header.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)';
    }
  });

  // ==========================================
  // Product Card Click
  // ==========================================
  var productCards = document.querySelectorAll('.product-card');
  productCards.forEach(function (card) {
    card.addEventListener('click', function () {
      var nameEl = card.querySelector('.product-name');
      var name = nameEl ? nameEl.textContent : '상품';
      showToast('📦 ' + name + ' 상품 페이지로 이동합니다');
    });
  });

  // ==========================================
  // Banner Link Click
  // ==========================================
  var bannerLinks = document.querySelectorAll('.banner-link');
  bannerLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      var title = link.querySelector('.banner-title, .banner-text, .banner-number');
      if (title) {
        showToast('🔗 ' + title.textContent + ' 페이지로 이동합니다');
      }
    });
  });

  // ==========================================
  // Search (Enter key & button)
  // ==========================================
  var searchInput = document.querySelector('.header-search input');
  var searchBtn   = document.querySelector('.search-btn');

  function doSearch() {
    var val = searchInput ? searchInput.value.trim() : '';
    if (val) {
      showToast('🔍 "' + val + '" 검색 중...');
    }
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') doSearch();
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', doSearch);
  }

});
