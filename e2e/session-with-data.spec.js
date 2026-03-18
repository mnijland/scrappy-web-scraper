import { test, expect } from '@playwright/test';

test.describe('Session Page with Data', () => {
  let sessionId;

  test.beforeAll(async ({ request }) => {
    // Create a session with items via API
    const res = await request.post('/api/sessions', {
      data: { name: 'Test Data Session' },
    });
    const session = await res.json();
    sessionId = session.id;

    // Add items to the session
    await request.put(`/api/sessions/${sessionId}`, {
      data: {
        name: 'Test Data Session',
        items: [
          {
            title: 'Test Product 1',
            price: '29.99',
            currency: 'EUR',
            brand: 'TestBrand',
            url: 'https://example.com/product-1',
            image: '',
            stock: 'In Stock',
            rating: '4.5',
            reviewCount: '120',
            shortDescription: 'A test product description',
            longDescription: 'A longer test product description with more details',
            sku: 'SKU-001',
            ean: '1234567890123',
          },
          {
            title: 'Test Product 2',
            price: '49.99',
            currency: 'USD',
            brand: 'AnotherBrand',
            url: 'https://example.com/product-2',
            image: '',
            stock: 'Out of Stock',
            rating: '3.8',
            reviewCount: '45',
            shortDescription: 'Second test product',
            longDescription: '',
            sku: 'SKU-002',
            ean: '',
          },
        ],
      },
    });
  });

  test.afterAll(async ({ request }) => {
    if (sessionId) {
      await request.delete(`/api/sessions/${sessionId}`);
    }
  });

  test('should display the data table with items', async ({ page }) => {
    await page.goto(`/session/${sessionId}`);

    // Table should be visible (not empty state)
    await expect(page.locator('table')).toBeVisible();

    // Items should be shown
    await expect(page.locator('input[value="Test Product 1"]')).toBeVisible();
    await expect(page.locator('input[value="Test Product 2"]')).toBeVisible();
  });

  test('should display correct item count', async ({ page }) => {
    await page.goto(`/session/${sessionId}`);

    await expect(page.locator('text=2 ITEMS')).toBeVisible();
  });

  test('should show editable column headers', async ({ page }) => {
    await page.goto(`/session/${sessionId}`);

    // Default column names
    await expect(page.locator('input[value="#product_name"]')).toBeVisible();
    await expect(page.locator('input[value="#product_price"]')).toBeVisible();
    await expect(page.locator('input[value="#product_stock"]')).toBeVisible();
    await expect(page.locator('input[value="#product_rating"]')).toBeVisible();
  });

  test('should allow editing product title inline', async ({ page }) => {
    await page.goto(`/session/${sessionId}`);

    const titleInput = page.locator('input[value="Test Product 1"]');
    await titleInput.fill('Updated Product Name');

    await expect(titleInput).toHaveValue('Updated Product Name');
  });

  test('should allow editing price inline', async ({ page }) => {
    await page.goto(`/session/${sessionId}`);

    const priceInput = page.locator('input[value="29.99"]');
    await priceInput.fill('39.99');

    await expect(priceInput).toHaveValue('39.99');
  });

  test('should allow editing brand inline', async ({ page }) => {
    await page.goto(`/session/${sessionId}`);

    const brandInput = page.locator('input[value="TestBrand"]');
    await brandInput.fill('NewBrand');

    await expect(brandInput).toHaveValue('NewBrand');
  });

  test('should show stock values', async ({ page }) => {
    await page.goto(`/session/${sessionId}`);

    await expect(page.locator('input[value="In Stock"]')).toBeVisible();
    await expect(page.locator('input[value="Out of Stock"]')).toBeVisible();
  });

  test('should show rating and review count', async ({ page }) => {
    await page.goto(`/session/${sessionId}`);

    await expect(page.locator('input[value="4.5"]')).toBeVisible();
    await expect(page.locator('text=(120)')).toBeVisible();
  });

  test('should allow deleting an item', async ({ page }) => {
    await page.goto(`/session/${sessionId}`);

    // Confirm dialog auto-accept
    page.on('dialog', (dialog) => dialog.accept());

    // Click the first delete button (Trash icon)
    const deleteButtons = page.locator('button:has(svg)').filter({ hasText: '' });
    const trashButton = page.locator('table tbody tr').first().locator('button').last();
    await trashButton.click();

    // Should now show 1 item
    await expect(page.locator('text=1 ITEMS')).toBeVisible();
  });

  test('should allow editing column header names', async ({ page }) => {
    await page.goto(`/session/${sessionId}`);

    const columnInput = page.locator('input[value="#product_name"]');
    await columnInput.fill('Product Title');

    await expect(columnInput).toHaveValue('Product Title');
  });
});
