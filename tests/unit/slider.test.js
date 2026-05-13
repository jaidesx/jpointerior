describe('tinyslider initialization', () => {
  beforeEach(() => {
    global.tns = jest.fn().mockReturnValue({});
    jest.resetModules();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    delete global.tns;
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
});
