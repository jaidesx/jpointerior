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
});
