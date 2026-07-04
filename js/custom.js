(function () {
  'use strict';

  /* ── Testimonial slider ─────────────────────────────────────── */
  var tinyslider = function () {
    var el = document.querySelectorAll('.testimonial-slider');
    if (el.length > 0) {
      tns({
        container: '.testimonial-slider',
        items: 1,
        axis: 'horizontal',
        controlsContainer: '#testimonial-nav',
        swipeAngle: false,
        speed: 700,
        nav: true,
        controls: true,
        autoplay: true,
        autoplayHoverPause: true,
        autoplayTimeout: 3500,
        autoplayButtonOutput: false
      });
    }
  };
  tinyslider();

  /* ── Cart quantity +/- ──────────────────────────────────────── */
  var sitePlusMinus = function () {
    var quantity = document.getElementsByClassName('quantity-container');

    function createBindings(quantityContainer) {
      if (quantityContainer.closest('#cart-items')) return;

      var quantityAmount = quantityContainer.getElementsByClassName('quantity-amount')[0];
      var increase = quantityContainer.getElementsByClassName('increase')[0];
      var decrease = quantityContainer.getElementsByClassName('decrease')[0];
      if (!quantityAmount || !increase || !decrease) return;

      increase.addEventListener('click', function (e) { increaseValue(e, quantityAmount); });
      decrease.addEventListener('click', function (e) { decreaseValue(e, quantityAmount); });
    }

    for (var i = 0; i < quantity.length; i++) {
      createBindings(quantity[i]);
    }
  };
  sitePlusMinus();

  /* ── Back-to-top button ─────────────────────────────────────── */
  var backToTop = function () {
    var btn = document.createElement('a');
    btn.className = 'back-to-top';
    btn.href = '#';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<i class="fa fa-chevron-up"></i>';
    document.body.appendChild(btn);

    window.addEventListener('scroll', function () {
      btn.classList.toggle('visible', window.scrollY > 420);
    });

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };
  backToTop();

  /* ── Mobile menu: close on nav-link click ───────────────────── */
  var mobileMenuClose = function () {
    var navCollapse = document.getElementById('navbarsJPO');
    if (!navCollapse) return;
    var links = navCollapse.querySelectorAll('.nav-link');
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth < 768 && navCollapse.classList.contains('show')) {
          var bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
          if (bsCollapse) bsCollapse.hide();
        }
      });
    });
  };
  mobileMenuClose();

  /* ── Shop category filter ───────────────────────────────────── */
  var shopFilter = function () {
    var filterBtns = document.querySelectorAll('.filter-btn');
    var productCols = document.querySelectorAll('.product-col');
    if (!filterBtns.length || !productCols.length) return;
    var searchInput = document.getElementById('product-search');
    var sortSelect = document.getElementById('product-sort');
    var countEl = document.getElementById('product-result-count');
    var emptyEl = document.getElementById('product-empty-state');
    var productRow = document.getElementById('product-grid');
    var activeFilter = 'all';

    productCols.forEach(function (col, index) {
      var btn = col.querySelector('.add-to-cart-btn');
      var title = btn ? btn.dataset.productName : (col.querySelector('.product-title') || {}).textContent;
      var price = btn ? btn.dataset.productPrice : '0';
      col.dataset.name = (title || '').toLowerCase();
      col.dataset.price = price || '0';
      col.dataset.originalOrder = String(index);
    });

    filterBtns.forEach(function (btn) { btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false'); });

    function applyShopControls() {
      var term = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var visibleCount = 0;

      productCols.forEach(function (col) {
        var matchesFilter = activeFilter === 'all' || col.dataset.category === activeFilter;
        var matchesSearch = !term || col.dataset.name.indexOf(term) !== -1;
        var isVisible = matchesFilter && matchesSearch;
        col.classList.toggle('hidden', !isVisible);
        if (isVisible) visibleCount += 1;
      });

      if (countEl) {
        countEl.textContent = visibleCount + ' ' + (visibleCount === 1 ? 'item' : 'items');
      }
      if (emptyEl) {
        emptyEl.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    }

    function sortProducts() {
      if (!sortSelect || !productRow) return;
      var sorted = Array.prototype.slice.call(productCols);
      var mode = sortSelect.value;

      sorted.sort(function (a, b) {
        if (mode === 'price-asc') return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
        if (mode === 'price-desc') return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
        if (mode === 'name') return a.dataset.name.localeCompare(b.dataset.name);
        return parseInt(a.dataset.originalOrder, 10) - parseInt(b.dataset.originalOrder, 10);
      });

      sorted.forEach(function (col) { productRow.appendChild(col); });
    }

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        activeFilter = btn.dataset.filter;
        applyShopControls();
      });
    });

    if (searchInput) searchInput.addEventListener('input', applyShopControls);
    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        sortProducts();
        applyShopControls();
      });
    }

    applyShopControls();
  };
  shopFilter();

  /* ── Blog post: inject read-more overlay ────────────────────── */
  var blogOverlay = function () {
    var thumbs = document.querySelectorAll('.post-entry .post-thumbnail');
    thumbs.forEach(function (thumb) {
      if (!thumb.querySelector('.read-overlay')) {
        var overlay = document.createElement('div');
        overlay.className = 'read-overlay';
        overlay.innerHTML = '<span>Read Article</span>';
        thumb.appendChild(overlay);
      }
    });
  };
  blogOverlay();

  /* ── Newsletter forms: friendly no-backend feedback ─────────── */
  var newsletterForms = function () {
    document.querySelectorAll('.subscription-form form').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = form.querySelector('input[type="email"]');
        if (email && !email.checkValidity()) {
          email.reportValidity();
          return;
        }

        var msg = form.parentElement.querySelector('.newsletter-message');
        if (!msg) {
          msg = document.createElement('p');
          msg.className = 'newsletter-message';
          msg.setAttribute('role', 'status');
          form.parentElement.appendChild(msg);
        }

        msg.textContent = 'Thanks. We will send fresh design notes your way.';
        form.reset();
      });
    });
  };
  newsletterForms();

  /* ── PWA install prompt and service worker ─────────────────── */
  var pwaEnhancements = function () {
    var installPromptEvent = null;
    var displayModeStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    var isStandalone = displayModeStandalone || window.navigator.standalone === true;
    var navCta = document.querySelector('.custom-navbar-cta');
    var installItem = null;
    var installButton = null;

    function hideInstallButton() {
      if (installButton) {
        installButton.hidden = true;
        installButton.setAttribute('aria-hidden', 'true');
      }
    }

    function showInstallButton() {
      if (!installButton || isStandalone) return;
      installButton.hidden = false;
      installButton.setAttribute('aria-hidden', 'false');
    }

    if (navCta && !isStandalone) {
      installItem = document.createElement('li');
      installItem.className = 'install-app-item';

      installButton = document.createElement('button');
      installButton.type = 'button';
      installButton.className = 'install-app-btn';
      installButton.hidden = true;
      installButton.setAttribute('aria-hidden', 'true');
      installButton.innerHTML = '<i class="fa fa-download" aria-hidden="true"></i><span>Install App</span>';

      installItem.appendChild(installButton);
      navCta.insertBefore(installItem, navCta.firstChild);

      installButton.addEventListener('click', function () {
        if (!installPromptEvent) return;
        installPromptEvent.prompt();
        installPromptEvent.userChoice.finally(function () {
          installPromptEvent = null;
          hideInstallButton();
        });
      });
    }

    window.addEventListener('beforeinstallprompt', function (event) {
      event.preventDefault();
      installPromptEvent = event;
      showInstallButton();
    });

    window.addEventListener('appinstalled', function () {
      installPromptEvent = null;
      hideInstallButton();
    });

    if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('service-worker.js').catch(function () {});
      });
    }
  };
  pwaEnhancements();

})();

function increaseValue(event, quantityAmount) {
  var value = parseInt(quantityAmount.value, 10);
  value = isNaN(value) ? 0 : value;
  value++;
  quantityAmount.value = value;
}

function decreaseValue(event, quantityAmount) {
  var value = parseInt(quantityAmount.value, 10);
  value = isNaN(value) ? 0 : value;
  if (value > 0) value--;
  quantityAmount.value = value;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { increaseValue, decreaseValue };
}
