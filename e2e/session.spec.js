import { test, expect } from '@playwright/test';

test.describe('Session Page', () => {
  let sessionId;

  test.beforeAll(async ({ request }) => {
    // Create a session via API for testing
    const res = await request.post('/api/sessions', {
      data: { name: 'E2E Test Session' },
    });
    const session = await res.json();
    sessionId = session.id;
  });

  test.afterAll(async ({ request }) => {
    // Clean up test session
    if (sessionId) {
      await request.delete(`/api/sessions/${sessionId}`);
    }
  });

  test('should load the session page', async ({ page }) => {
    await page.goto(`/session/${sessionId}`);

    // Should show session name as editable input
    const nameInput = page.locator('input[style*="font-size: 2.25rem"]');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveValue('E2E Test Session');
  });

  test('should display back to dashboard link', async ({ page }) => {
    await page.goto(`/session/${sessionId}`);

    const backLink = page.locator('text=Back to Dashboard');
    await expect(backLink).toBeVisible();

    await backLink.click();
    await expect(page).toHaveURL('/');
  });

  test('should display action buttons', async ({ page }) => {
    await page.goto(`/session/${sessionId}`);

    await expect(page.locator('text=Import')).toBeVisible();
    await expect(page.locator('text=JSON')).toBeVisible();
    await expect(page.locator('text=Export to Figma')).toBeVisible();
  });

  test('should display the scraper form', async ({ page }) => {
    await page.goto(`/session/${sessionId}`);

    const input = page.locator('input[type="url"]');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('placeholder', 'Paste product URL (or category page) here...');
  });

  test('should show empty state when session has no items', async ({ page }) => {
    await page.goto(`/session/${sessionId}`);

    await expect(page.locator('text=No products added yet.')).toBeVisible();
  });

  test('should show item count badge', async ({ page }) => {
    await page.goto(`/session/${sessionId}`);

    await expect(page.locator('text=0 ITEMS')).toBeVisible();
  });

  test('should show autosaved indicator', async ({ page }) => {
    await page.goto(`/session/${sessionId}`);

    await expect(page.locator('text=Autosaved')).toBeVisible();
  });

  test('should allow editing the session name', async ({ page }) => {
    await page.goto(`/session/${sessionId}`);

    const nameInput = page.locator('input[style*="font-size: 2.25rem"]');
    await nameInput.fill('Renamed Session');
    await nameInput.blur();

    // Verify the name was updated
    await expect(nameInput).toHaveValue('Renamed Session');
  });

  test('should show 404 for non-existent session', async ({ page }) => {
    await page.goto('/session/non-existent-id');

    await expect(page.locator('text=Session not found.')).toBeVisible();
  });
});
