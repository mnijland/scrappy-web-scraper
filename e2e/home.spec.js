import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page with correct layout', async ({ page }) => {
    await page.goto('/');

    // Sidebar should be visible with brand name
    await expect(page.locator('text=Scrappy')).toBeVisible();

    // Navigation links should be present
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Archive')).toBeVisible();
    await expect(page.locator('text=Settings')).toBeVisible();
  });

  test('should display the hero section', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toContainText('Turn any website');
    await expect(page.locator('text=into data.')).toBeVisible();
    await expect(page.locator('text=AI-Powered Extraction')).toBeVisible();
  });

  test('should have a working URL input form', async ({ page }) => {
    await page.goto('/');

    const input = page.locator('input[type="url"]');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('placeholder', 'Paste a product URL to start...');
  });

  test('should show recent sessions heading', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('text=Recent Sessions')).toBeVisible();
  });

  test('should show empty state when no sessions exist', async ({ page }) => {
    await page.goto('/');

    // Either sessions load or empty state is shown
    const sessionList = page.locator('text=No sessions yet.');
    const sessionCards = page.locator('a[href^="/session/"]');

    // One of these should be visible
    await expect(sessionList.or(sessionCards.first())).toBeVisible();
  });

  test('should show error on invalid URL submission', async ({ page }) => {
    await page.goto('/');

    const input = page.locator('input[type="url"]');
    await input.fill('not-a-valid-url');

    // The HTML5 URL validation should prevent submission
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Browser validation should prevent navigation, page stays on home
    await expect(page).toHaveURL('/');
  });

  test('should navigate to session when valid URL is submitted', async ({ page }) => {
    await page.goto('/');

    const input = page.locator('input[type="url"]');
    await input.fill('https://example.com');

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Should show loading state (button becomes disabled)
    await expect(submitButton).toBeDisabled();

    // Wait for navigation to session page (may take time due to scraping)
    await page.waitForURL(/\/session\//, { timeout: 60000 });
    expect(page.url()).toContain('/session/');
  });
});
