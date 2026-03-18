import { test, expect } from '@playwright/test';

test.describe('Sidebar Navigation', () => {
  test('should display the sidebar with branding', async ({ page }) => {
    await page.goto('/');

    const sidebar = page.locator('aside.sidebar');
    await expect(sidebar).toBeVisible();
    await expect(sidebar.locator('text=Scrappy')).toBeVisible();
  });

  test('should display user profile section', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('text=Maarten K.')).toBeVisible();
    await expect(page.locator('text=Pro Plan')).toBeVisible();
  });

  test('should navigate to Dashboard', async ({ page }) => {
    await page.goto('/settings');

    await page.locator('text=Dashboard').click();
    await expect(page).toHaveURL('/');
  });

  test('should navigate to Archive', async ({ page }) => {
    await page.goto('/');

    await page.locator('text=Archive').click();
    await expect(page).toHaveURL('/archive');
  });

  test('should navigate to Settings', async ({ page }) => {
    await page.goto('/');

    await page.locator('text=Settings').click();
    await expect(page).toHaveURL('/settings');
  });

  test('should highlight active navigation item', async ({ page }) => {
    await page.goto('/');

    // Dashboard link should have active styling (bg-card background)
    const dashboardLink = page.locator('a[href="/"]').locator('div').first();
    await expect(dashboardLink).toHaveCSS('font-weight', '600');
  });
});
