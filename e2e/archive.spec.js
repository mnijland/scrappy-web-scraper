import { test, expect } from '@playwright/test';

test.describe('Archive Page', () => {
  test('should load the archive page', async ({ page }) => {
    await page.goto('/archive');

    await expect(page.locator('h1')).toContainText('Archive');
    await expect(page.locator('text=Manage and search through all your scraping sessions.')).toBeVisible();
  });

  test('should display search bar', async ({ page }) => {
    await page.goto('/archive');

    const searchInput = page.locator('input[placeholder="Search sessions by name or domain..."]');
    await expect(searchInput).toBeVisible();
  });

  test('should display table headers', async ({ page }) => {
    await page.goto('/archive');

    await expect(page.locator('th:has-text("Session")')).toBeVisible();
    await expect(page.locator('th:has-text("Items")')).toBeVisible();
    await expect(page.locator('th:has-text("Last Updated")')).toBeVisible();
  });

  test('should show empty state or sessions in table', async ({ page }) => {
    await page.goto('/archive');

    // Wait for loading to complete
    await page.waitForSelector('table');

    const noSessions = page.locator('text=No sessions found.');
    const sessionRows = page.locator('tbody tr');

    // Either empty state or session rows
    await expect(noSessions.or(sessionRows.first())).toBeVisible();
  });

  test('should filter sessions with search', async ({ page }) => {
    await page.goto('/archive');

    const searchInput = page.locator('input[placeholder="Search sessions by name or domain..."]');
    await searchInput.fill('nonexistent-search-query-xyz');

    // Should show no sessions found after filtering
    await expect(page.locator('text=No sessions found.')).toBeVisible();
  });
});
