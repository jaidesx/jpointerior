const { test, expect } = require('@playwright/test');

const TEST_CART_ITEMS = [
  {
    id: 'cabinet-001',
    name: 'Classic Wooden Kitchen Cabinet Set',
    price: 2800,
    image: 'images/classic-wooden-kitchen-cabinet-set.jpeg',
    quantity: 1
  },
  {
    id: 'chair-armchair-001',
    name: 'Modern Grey Accent Armchair',
    price: 450,
    image: 'images/modern-grey-accent-armchair.jpg',
    quantity: 2
  }
];

async function gotoWithCart(page, path) {
  await page.addInitScript((items) => {
    localStorage.setItem('jpo_cart', JSON.stringify(items));
  }, TEST_CART_ITEMS);
  await page.goto(path, { waitUntil: 'domcontentloaded' });
}

test.describe('Cart page structure', () => {
  test.beforeEach(async ({ page }) => {
    await gotoWithCart(page, '/cart.html');
  });

  test('page title is correct', async ({ page }) => {
    await expect(page).toHaveTitle(/JPO INTERIOR/i);
  });

  test('cart table is visible with expected columns', async ({ page }) => {
    const table = page.locator('.site-blocks-table table');
    await expect(table).toBeVisible();

    const headers = page.locator('.site-blocks-table thead th');
    await expect(headers).toHaveCount(6);
    await expect(headers.nth(0)).toContainText('Image');
    await expect(headers.nth(1)).toContainText('Product');
    await expect(headers.nth(2)).toContainText('Price');
    await expect(headers.nth(3)).toContainText('Quantity');
    await expect(headers.nth(4)).toContainText('Total');
    await expect(headers.nth(5)).toContainText('Remove');
  });

  test('cart has at least one product row', async ({ page }) => {
    const rows = page.locator('.site-blocks-table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('"Proceed To Checkout" link is visible', async ({ page }) => {
    const checkoutLink = page.locator('a', { hasText: 'Proceed To Checkout' });
    await expect(checkoutLink).toBeVisible();
  });

  test('coupon input field is present', async ({ page }) => {
    await expect(page.locator('#coupon')).toBeVisible();
  });
});

test.describe('Cart quantity controls', () => {
  test.beforeEach(async ({ page }) => {
    await gotoWithCart(page, '/cart.html');
  });

  test('each cart row has increase and decrease buttons', async ({ page }) => {
    const containers = page.locator('.quantity-container');
    const count = await containers.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const container = containers.nth(i);
      await expect(container.locator('.increase')).toBeVisible();
      await expect(container.locator('.decrease')).toBeVisible();
      await expect(container.locator('.quantity-amount')).toBeVisible();
    }
  });

  test('clicking increase on first row increments its value', async ({ page }) => {
    const firstContainer = page.locator('.quantity-container').first();
    const input = firstContainer.locator('.quantity-amount');
    const initial = parseInt(await input.inputValue(), 10);

    await firstContainer.locator('.increase').click();

    const updated = parseInt(await input.inputValue(), 10);
    expect(updated).toBe(initial + 1);
  });

  test('clicking decrease on first row decrements its value', async ({ page }) => {
    const firstContainer = page.locator('.quantity-container').first();
    const input = firstContainer.locator('.quantity-amount');

    // Ensure value is at least 2 before decrementing
    await firstContainer.locator('.increase').click();
    await firstContainer.locator('.increase').click();
    const before = parseInt(await input.inputValue(), 10);

    await firstContainer.locator('.decrease').click();
    const after = parseInt(await input.inputValue(), 10);

    expect(after).toBe(before - 1);
  });

  test('decrease does not drop below 1', async ({ page }) => {
    const firstContainer = page.locator('.quantity-container').first();
    const input = firstContainer.locator('.quantity-amount');

    // Click decrease many times to try to go below 1
    for (let i = 0; i < 10; i++) {
      await firstContainer.locator('.decrease').click();
    }
    const value = parseInt(await input.inputValue(), 10);
    expect(value).toBeGreaterThanOrEqual(1);
  });

  test('two quantity containers are independent', async ({ page }) => {
    const containers = page.locator('.quantity-container');
    const count = await containers.count();

    if (count < 2) {
      test.skip();
      return;
    }

    const input2 = containers.nth(1).locator('.quantity-amount');
    const initial2 = await input2.inputValue();

    await containers.nth(0).locator('.increase').click();
    await containers.nth(0).locator('.increase').click();

    // Second container should be unchanged
    expect(await input2.inputValue()).toBe(initial2);
  });
});

test.describe('Checkout page structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/checkout.html', { waitUntil: 'domcontentloaded' });
  });

  test('checkout page loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/JPO INTERIOR/i);
  });

  test('checkout page has an h1 heading', async ({ page }) => {
    const h1 = page.locator('.hero h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Checkout');
  });
});

test.describe('Contact page structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact.html', { waitUntil: 'domcontentloaded' });
  });

  test('contact form has first name, last name, email and message fields', async ({ page }) => {
    await expect(page.locator('#fname')).toBeVisible();
    await expect(page.locator('#lname')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#message')).toBeVisible();
  });

  test('contact form fields are editable', async ({ page }) => {
    await page.fill('#fname', 'Jane');
    await page.fill('#lname', 'Doe');
    await page.fill('#email', 'jane@example.com');
    await page.fill('#message', 'Hello, I am interested in your services.');

    await expect(page.locator('#fname')).toHaveValue('Jane');
    await expect(page.locator('#lname')).toHaveValue('Doe');
    await expect(page.locator('#email')).toHaveValue('jane@example.com');
    await expect(page.locator('#message')).toHaveValue('Hello, I am interested in your services.');
  });
});
