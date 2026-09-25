import { test, expect } from '@playwright/test';

test.describe('Chats settings entry (US1)', () => {
  test('Settings Chats Settings row navigates to /settings/chats', async ({ page }) => {
    await page.goto('/settings');
    await page.getByTestId('settings-page').waitFor();
    await page.getByTestId('settings-row').nth(1).click();
    await expect(page).toHaveURL(/\/settings\/chats$/);
    await page.getByTestId('chats-settings-page').waitFor();
  });
});

test.describe('Chats settings screen (US2)', () => {
  test('renders chrome: Back leading, Chats Settings title, no tab bar', async ({ page }) => {
    await page.goto('/settings/chats');
    await page.getByTestId('chats-settings-page').waitFor();
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
    await expect(
      page
        .getByTestId('navigation-bar')
        .getByRole('heading', { name: 'Chats Settings' }),
    ).toBeVisible();
    await expect(page.getByTestId('tab-bar')).toHaveCount(0);
  });

  test('renders labelled Chats Settings rows from the seed', async ({ page }) => {
    await page.goto('/settings/chats');
    await page.getByTestId('chats-settings-page').waitFor();

    const rows = page.getByTestId('chats-settings-row');
    await expect(rows.first()).toBeVisible();
    await expect(rows.first()).toHaveAttribute('aria-label', 'Wallpaper');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);
    for (let i = 0; i < count; i++) {
      const label = (await rows.nth(i).getAttribute('aria-label')) ?? '';
      expect(label.length, 'row has a non-empty aria-label').toBeGreaterThan(0);
    }
  });
});

test.describe('Chats settings chroming + visual (US3)', () => {
  test('Back returns to /settings; rows are no-ops', async ({ page }) => {
    await page.goto('/settings/chats');
    await page.getByTestId('chats-settings-page').waitFor();
    await page.getByTestId('chats-settings-row').first().click();
    await expect(page).toHaveURL(/\/settings\/chats$/);

    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/settings$/);
    await page.getByTestId('settings-page').waitFor();
  });

  test.skip(
    'matches the Figma golden render on mobile',
    async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/settings/chats');
      await page.getByTestId('chats-settings-page').waitFor();

      await expect(page).toHaveScreenshot('0-9973-chats-settings.png', {
        maxDiffPixelRatio: 0.11,
      });
    },
    // Unskip after Figma capture (~2026-09-28). Measure baseline from the failing tight
    // threshold, then set maxDiffPixelRatio = measured + 0.05 (feature 007 practice).
  );
});