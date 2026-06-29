/**
 * tests/unit/slider.test.js
 *
 * FIX: The original test never mocked the `bootstrap` global.
 * custom.js calls `bootstrap.Collapse.getInstance(navCollapse)` inside
 * mobileMenuClose(), which throws in jsdom because `bootstrap` is undefined.
 * We now set up a minimal bootstrap stub before each require().
 */

describe('tinyslider initialization', () => {
  beforeEach(() => {
    // Mock tns (tiny-slider global)
    global.tns = jest.fn().mockReturnValue({});

    // FIX: Mock bootstrap global so mobileMenuClose() does not throw
    global.bootstrap = {
      Collapse: {
        getInstance: jest.fn().mockReturnValue(null),
      },
    };

    jest.resetModules();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    delete global.tns;
    delete global.bootstrap;
  });

  test('does not call tns when no .testimonial-slider element exists', () => {
    require('../../js/custom.js');
    expect(global.tns).not.toHaveBeenCalled();
  });

  test('calls tns when a .testimonial-slider element is present', () => {
    document.body.innerHTML = '<div class="testimonial-slider"></div>';
    require('../../js/custom.js');
    expect(global.tns).toHaveBeenCalledTimes(1);
  });

  test('passes correct config options to tns', () => {
    document.body.innerHTML = '<div class="testimonial-slider"></div>';
    require('../../js/custom.js');
    expect(global.tns).toHaveBeenCalledWith(
      expect.objectContaining({
        container: '.testimonial-slider',
        items: 1,
        autoplay: true,
        autoplayHoverPause: true,
        autoplayTimeout: 3500,
        autoplayButtonOutput: false,
      })
    );
  });

  test('does not call tns when slider element is absent after DOM is empty', () => {
    document.body.innerHTML = '<div class="other-element"></div>';
    require('../../js/custom.js');
    expect(global.tns).not.toHaveBeenCalled();
  });

  // FIX: Added test to confirm mobileMenuClose does not throw when bootstrap is mocked
  test('module loads without throwing when bootstrap is mocked', () => {
    expect(() => {
      require('../../js/custom.js');
    }).not.toThrow();
  });

  // FIX: Added test to confirm shopFilter does nothing when no filter buttons present
  test('shopFilter does nothing when no .filter-btn elements exist', () => {
    document.body.innerHTML = '';
    expect(() => {
      require('../../js/custom.js');
    }).not.toThrow();
  });

  test('shopFilter search hides non-matching products and updates count', () => {
    document.body.innerHTML = `
      <button class="filter-btn active" data-filter="all">All</button>
      <input id="product-search" type="search">
      <span id="product-result-count"></span>
      <div id="product-empty-state"></div>
      <div id="product-grid">
        <div class="product-col" data-category="sofas">
          <h3 class="product-title">Emerald Sofa</h3>
          <button class="add-to-cart-btn" data-product-name="Emerald Sofa" data-product-price="1850"></button>
        </div>
        <div class="product-col" data-category="chairs">
          <h3 class="product-title">Accent Chair</h3>
          <button class="add-to-cart-btn" data-product-name="Accent Chair" data-product-price="450"></button>
        </div>
      </div>
    `;

    require('../../js/custom.js');
    const search = document.getElementById('product-search');
    search.value = 'chair';
    search.dispatchEvent(new Event('input', { bubbles: true }));

    const products = document.querySelectorAll('.product-col');
    expect(products[0].classList.contains('hidden')).toBe(true);
    expect(products[1].classList.contains('hidden')).toBe(false);
    expect(document.getElementById('product-result-count').textContent).toBe('1 item');
  });

  test('shopFilter sort orders products by price', () => {
    document.body.innerHTML = `
      <button class="filter-btn active" data-filter="all">All</button>
      <select id="product-sort"><option value="price-asc">Price: low to high</option></select>
      <div id="product-grid">
        <div class="product-col" data-category="sofas">
          <button class="add-to-cart-btn" data-product-name="Emerald Sofa" data-product-price="1850"></button>
        </div>
        <div class="product-col" data-category="chairs">
          <button class="add-to-cart-btn" data-product-name="Accent Chair" data-product-price="450"></button>
        </div>
      </div>
    `;

    require('../../js/custom.js');
    document.getElementById('product-sort').dispatchEvent(new Event('change', { bubbles: true }));

    const first = document.querySelector('#product-grid .product-col .add-to-cart-btn');
    expect(first.dataset.productName).toBe('Accent Chair');
  });
});
