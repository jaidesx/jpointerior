const { test, expect } = require('@playwright/test');

const pages = [
  { name: 'Home',     path: '/index.html',    heading: 'Modern Interior' },
  { name: 'Shop',     path: '/shop.html',     heading: 'Shop' },
  { name: 'About',    path: '/about.html',    heading: 'About Us' },
  { name: 'Services', path: '/services.html', heading: 'Services' },
  { name: 'Blog',     path: '/blog.html',     heading: 'Latest Blog' },
  { name: 'Checkout', path: '/checkout.html', heading: 'Checkout' },
  { name: 'Contact',  path: '/contact.html',  heading: 'Contact' },
  { name: 'Cart',     path: '/cart.html',     heading: 'Cart' },
];

test.describe('Page loading', () => {
  for (const page of pages) {
    test(`${page.name} page loads without errors`, async ({ page: p }) => {
      const errors = [];
      p.on('pageerror', (err) => errors.push(err.message));

      await p.goto(page.path);
      await p.waitForLoadState('domcontentloaded');

      await expect(p).toHaveTitle(/JPO INTERIOR/i);
      expect(errors).toHaveLength(0);
    });
  }
});

test.describe('Navigation bar', () => {
  test('navbar is present on every page', async ({ page }) => {
    for (const { path } of pages) {
      await page.goto(path);
      await expect(page.locator('nav.custom-navbar')).toBeVisible();
    }
  });

  test('brand logo link points to index.html', async ({ page }) => {
    await page.goto('/shop.html');
    const brand = page.locator('a.navbar-brand');
    await expect(brand).toHaveAttribute('href', 'index.html');
  });

  test('nav links on home page resolve to valid pages', async ({ page }) => {
    await page.goto('/index.html');
    const navLinks = [
      ['Home',     'index.html'],
      ['Shop',     'shop.html'],
      ['About',    'about.html'],
      ['Services', 'services.html'],
      ['Blog',     'blog.html'],
      ['Checkout', 'checkout.html'],
      ['Contact',  'contact.html'],
    ];

    for (const [label, href] of navLinks) {
      const link = page.locator(`nav a.nav-link[href="${href}"]`).first();
      await expect(link).toBeVisible();
    }
  });

  test('cart icon in navbar links to cart.html', async ({ page }) => {
    await page.goto('/index.html');
    const cartLink = page.locator('.custom-navbar-cta a[href="cart.html"]');
    await expect(cartLink).toBeVisible();
  });
});

test.describe('Hero section', () => {
  test('each page has a hero section with an h1', async ({ page }) => {
    for (const { path } of pages) {
      await page.goto(path);
      const h1 = page.locator('.hero h1');
      await expect(h1).toBeVisible();
    }
  });
});

test.describe('Footer', () => {
  test('footer is present on every page', async ({ page }) => {
    for (const { path } of pages) {
      await page.goto(path);
      await expect(page.locator('footer.footer-section')).toBeVisible();
    }
  });
});
