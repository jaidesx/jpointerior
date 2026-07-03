const { test, expect } = require('@playwright/test');

const pages = [
  { name: 'Home',     path: '/index.html',    heading: 'Complete Homes' },
  { name: 'Shop',     path: '/shop.html',     heading: 'Shop the Pieces' },
  { name: 'About',    path: '/about.html',    heading: 'About Us' },
  { name: 'Services', path: '/services.html', heading: 'Our Services' },
  // FIX: Was 'Latest Blog' — the actual h1 on blog.html is 'The Journal'
  { name: 'Blog',     path: '/blog.html',     heading: 'The Journal' },
  { name: 'Checkout', path: '/checkout.html', heading: 'Checkout' },
  { name: 'Contact',  path: '/contact.html',  heading: 'Contact' },
  { name: 'Cart',     path: '/cart.html',     heading: 'Cart' },
];

test.describe('Page loading', () => {
  for (const pg of pages) {
    test(`${pg.name} page loads without errors`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', (err) => errors.push(err.message));

      await page.goto(pg.path);
      await page.waitForLoadState('domcontentloaded');

      await expect(page).toHaveTitle(/JPO INTERIOR/i);
      expect(errors).toHaveLength(0);
    });
  }
});

test.describe('Navigation bar', () => {
  test('navbar is present on every page', async ({ page }) => {
    for (const pg of pages) {
      await page.goto(pg.path);
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
      // FIX: checkout.html is not in the home navbar (it appears on checkout page only)
      // so we test contact instead which IS always in the home navbar
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
    for (const pg of pages) {
      await page.goto(pg.path);
      const h1 = page.locator('.hero h1');
      await expect(h1).toBeVisible();
    }
  });

  // FIX: Added targeted h1 text assertions per page to catch future heading regressions
  for (const pg of pages) {
    test(`${pg.name} page h1 contains expected text`, async ({ page }) => {
      await page.goto(pg.path);
      const h1 = page.locator('.hero h1');
      await expect(h1).toContainText(pg.heading);
    });
  }
});

test.describe('Footer', () => {
  test('footer is present on every page', async ({ page }) => {
    for (const pg of pages) {
      await page.goto(pg.path);
      await expect(page.locator('footer.footer-section')).toBeVisible();
    }
  });

  // FIX: Added brand name consistency assertion — all footers should say JPO INTERIOR
  test('footer brand name is consistent across all pages', async ({ page }) => {
    for (const pg of pages) {
      await page.goto(pg.path);
      const footerLogo = page.locator('footer .footer-logo').first();
      await expect(footerLogo).toContainText('JPO INTERIOR');
    }
  });
});
