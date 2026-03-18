import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
  test('should load the settings page', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.locator('h1')).toContainText('Settings');
    await expect(page.locator('text=Configure global application preferences.')).toBeVisible();
  });

  test('should display general settings card', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.locator('h3:has-text("General")')).toBeVisible();
    await expect(page.locator('text=Settings will be available in a future update.')).toBeVisible();
  });

  test('should have sidebar navigation active on settings', async ({ page }) => {
    await page.goto('/settings');

    const settingsLink = page.locator('a[href="/settings"]').locator('div').first();
    await expect(settingsLink).toHaveCSS('font-weight', '600');
  });
});
