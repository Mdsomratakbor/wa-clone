import { test, expect } from '@playwright/test';

test.describe('Settings overflow sheet navigation (feature 029)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await page.getByTestId('settings-options').click();
  });

  test('Notifications row routes to the Notifications screen', async ({ page }) => {
    await page.getByRole('button', { name: 'Notifications' }).click();
    await expect(page).toHaveURL(/\/settings\/notifications$/);
    await expect(page.getByTestId('notifications-page')).toBeVisible();
  });

  test('Storage row routes to the Data and Storage screen', async ({ page }) => {
    await page.getByRole('button', { name: 'Storage' }).click();
    await expect(page).toHaveURL(/\/settings\/data-storage$/);
    await expect(page.getByTestId('data-storage-page')).toBeVisible();
  });

  test('More keeps the sheet open without navigating', async ({ page }) => {
    await page.getByRole('button', { name: 'More' }).click();
    await expect(page.getByTestId('action-sheet')).toBeVisible();
    await expect(page).toHaveURL(/\/settings$/);
  });
});