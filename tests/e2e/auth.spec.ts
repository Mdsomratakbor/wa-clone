import { test, expect } from '@playwright/test';

test.describe('Authorization route (US1)', () => {
  test('/auth renders the cold-start Authorization screen', async ({ page }) => {
    await page.goto('/auth');
    await page.getByTestId('auth-page').waitFor();
  });
});

test.describe('Authorization screen (US2)', () => {
  test('renders the brand title, number region, keypad and Continue; no bars', async ({ page }) => {
    await page.goto('/auth');
    await page.getByTestId('auth-page').waitFor();
    await expect(page.getByTestId('auth-title')).toHaveText('WhatsApp');
    await expect(page.getByTestId('auth-country')).toBeVisible();
    await expect(page.getByTestId('auth-phone')).toBeVisible();

    const keys = page.getByTestId('auth-key');
    await expect(keys.first()).toBeVisible();
    const count = await keys.count();
    expect(count).toBe(10);
    for (const digit of ['0', '1', '5', '9']) {
      await expect(page.getByRole('button', { name: digit, exact: true })).toBeVisible();
    }
    await expect(page.getByRole('button', { name: 'Delete digit' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
    await expect(page.getByTestId('tab-bar')).toHaveCount(0);
  });
});

test.describe('Authorization chroming + visual (US3)', () => {
  test('Continue and keypad are no-ops', async ({ page }) => {
    await page.goto('/auth');
    await page.getByTestId('auth-page').waitFor();
    await page.getByTestId('auth-key').first().click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL(/\/auth$/);
    await page.getByTestId('auth-page').waitFor();
  });

  test.skip(
    'matches the Figma golden render on mobile',
    async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/auth');
      await page.getByTestId('auth-page').waitFor();

      await expect(page).toHaveScreenshot('0-11030-auth.png', {
        maxDiffPixelRatio: 0.11,
      });
    },
    // Unskip after Figma capture (~2026-09-28). Measure baseline from the failing tight
    // threshold, then set maxDiffPixelRatio = measured + 0.05 (feature 007 practice).
  );
});