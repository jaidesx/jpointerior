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
      var quantityAmount = quantityContainer.getElementsByClassName('quantity-amount')[0];
      var increase = quantityContainer.getElementsByClassName('increase')[0];
      var decrease = quantityContainer.getElementsByClassName('decrease')[0];
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

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        var filter = btn.dataset.filter;
        productCols.forEach(function (col) {
          if (filter === 'all' || col.dataset.category === filter) {
            col.classList.remove('hidden');
          } else {
            col.classList.add('hidden');
          }
        });
      });
    });
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
