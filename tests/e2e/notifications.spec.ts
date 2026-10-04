import { test, expect } from '@playwright/test';

test.describe('Notifications entry (US1)', () => {
  test('Settings Notifications row navigates to /settings/notifications', async ({ page }) => {
    await page.goto('/settings');
    await page.getByTestId('settings-page').waitFor();
    await page.getByTestId('settings-row').nth(2).click();
    await expect(page).toHaveURL(/\/settings\/notifications$/);
    await page.getByTestId('notifications-page').waitFor();
  });
});

test.describe('Notifications screen (US2)', () => {
  test('renders chrome: Back leading, Notifications title, no tab bar', async ({ page }) => {
    await page.goto('/settings/notifications');
    await page.getByTestId('notifications-page').waitFor();
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
    await expect(
      page
        .getByTestId('navigation-bar')
        .getByRole('heading', { name: 'Notifications' }),
    ).toBeVisible();
    await expect(page.getByTestId('tab-bar')).toHaveCount(0);
  });

  test('renders labelled Notifications rows from the seed', async ({ page }) => {
    await page.goto('/settings/notifications');
    await page.getByTestId('notifications-page').waitFor();

    const rows = page.getByTestId('notifications-row');
    await expect(rows.first()).toBeVisible();
    await expect(rows.first()).toHaveAttribute('aria-label', 'Sound');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);
    for (let i = 0; i < count; i++) {
      const label = (await rows.nth(i).getAttribute('aria-label')) ?? '';
      expect(label.length, 'row has a non-empty aria-label').toBeGreaterThan(0);
    }
  });
});

test.describe('Notifications chroming + visual (US3)', () => {
  test('Back returns to /settings; Sound, Vibrate and Show previews are live toggles', async ({
    page,
  }) => {
    await page.goto('/settings/notifications');
    await page.getByTestId('notifications-page').waitFor();

    // F-060 FR-003: sound/vibrate returned with the send-feedback consumer and
    // are live toggles; the Disabled-only claim from F-046 no longer holds for
    // them (Popup notification and Light remain disabled).
    const sound = page.getByRole('switch', { name: 'Sound' });
    const vibrate = page.getByRole('switch', { name: 'Vibrate' });
    const previews = page.getByRole('switch', { name: 'Show previews' });
    await expect(sound).toBeEnabled();
    await expect(vibrate).toBeEnabled();
    await expect(previews).toBeEnabled();

    await expect(page.getByRole('switch', { name: 'Popup notification' })).toBeDisabled();
    await expect(page.getByRole('switch', { name: 'Light' })).toBeDisabled();

    await sound.click();
    await expect(sound).toHaveAttribute('aria-checked', 'false');

    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/settings$/);
    await page.getByTestId('settings-page').waitFor();
  });

  test.skip(
    'matches the Figma golden render on mobile',
    async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/settings/notifications');
      await page.getByTestId('notifications-page').waitFor();

      await expect(page).toHaveScreenshot('0-10758-notifications.png', {
        maxDiffPixelRatio: 0.11,
      });
    },
    // Unskip after Figma capture (~2026-09-28). Measure baseline from the failing tight
    // threshold, then set maxDiffPixelRatio = measured + 0.05 (feature 007 practice).
  );
});