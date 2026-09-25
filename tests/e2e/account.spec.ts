import { test, expect } from '@playwright/test';

test.describe('Account entry (US1)', () => {
  test('Settings Account row navigates to /settings/account', async ({ page }) => {
    await page.goto('/settings');
    await page.getByTestId('settings-page').waitFor();
    await page.getByTestId('settings-row').first().click();
    await expect(page).toHaveURL(/\/settings\/account$/);
    await page.getByTestId('account-page').waitFor();
  });
});

test.describe('Account screen (US2)', () => {
  test('renders chrome: Back leading, Account title, no tab bar', async ({ page }) => {
    await page.goto('/settings/account');
    await page.getByTestId('account-page').waitFor();
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
    await expect(
      page.getByTestId('navigation-bar').getByRole('heading', { name: 'Account' }),
    ).toBeVisible();
    await expect(page.getByTestId('tab-bar')).toHaveCount(0);
  });

  test('renders the hero block and labelled Account rows', async ({ page }) => {
    await page.goto('/settings/account');
    await page.getByTestId('account-page').waitFor();
    await expect(page.getByTestId('account-hero')).toBeVisible();

    const rows = page.getByTestId('account-row');
    await expect(rows.first()).toBeVisible();
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);
    for (let i = 0; i < count; i++) {
      const label = (await rows.nth(i).getAttribute('aria-label')) ?? '';
      expect(label.length, 'row has a non-empty aria-label').toBeGreaterThan(0);
    }
  });
});

test.describe('Account chroming + visual (US3)', () => {
  test('Back returns to /settings', async ({ page }) => {
    await page.goto('/settings/account');
    await page.getByTestId('account-page').waitFor();
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/settings$/);
    await page.getByTestId('settings-page').waitFor();
  });

  test.skip(
    'matches the Figma golden render on mobile',
    async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/settings/account');
      await page.getByTestId('account-page').waitFor();

      await expect(page).toHaveScreenshot('0-9371-account.png', {
        maxDiffPixelRatio: 0.11,
      });
    },
    // Unskip after Figma capture (~2026-09-28). Measure baseline from the failing tight
    // threshold, then set maxDiffPixelRatio = measured + 0.05 (feature 007 practice).
  );
});