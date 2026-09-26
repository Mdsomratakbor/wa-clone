import { test, expect } from '@playwright/test';

test.describe('Settings screen (US1)', () => {
  test('renders chrome: Back leading, Settings title, no FAB', async ({ page }) => {
    await page.goto('/settings');
    await page.getByTestId('settings-page').waitFor();
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
    await expect(
      page.getByTestId('navigation-bar').getByRole('heading', { name: 'Settings' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start new chat' })).toHaveCount(0);
  });

  test('renders profile header and the settings rows', async ({ page }) => {
    await page.goto('/settings');
    await page.getByTestId('settings-page').waitFor();
    await expect(page.getByTestId('settings-profile')).toHaveAttribute(
      'aria-label',
      'Edit profile',
    );
    await expect(page.getByTestId('settings-name')).toContainText('Ani');

    const rows = page.getByTestId('settings-row');
    await expect(rows.first()).toBeVisible();
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);
    for (let i = 0; i < count; i++) {
      const label = (await rows.nth(i).getAttribute('aria-label')) ?? '';
      expect(label.length, 'row has a non-empty aria-label').toBeGreaterThan(0);
    }
  });

  test('tab bar has Settings active and routes Chats/Camera/Calls/Status away', async ({ page }) => {
    await page.goto('/settings');
    await page.getByTestId('settings-page').waitFor();
    await expect(page.getByRole('tab', { name: 'Settings' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    for (const name of ['Chats', 'Camera', 'Calls', 'Status']) {
      await page.getByRole('tab', { name }).click();
      await expect(page).toHaveURL(new RegExp(`/${name.toLowerCase().replace(' ', '')}$`));
      await page.goto('/settings');
      await page.getByTestId('settings-page').waitFor();
    }
  });
});

test.describe('Settings routing (US2)', () => {
  test('Account, Chats Settings, Notifications and Data & Storage rows navigate; last row is a no-op; Back returns', async ({
    page,
  }) => {
    await page.goto('/settings');
    await page.getByTestId('settings-page').waitFor();

    await page.getByTestId('settings-row').nth(4).click();
    await expect(page.getByTestId('settings-page')).toBeVisible();

    await page.getByTestId('settings-row').first().click();
    await expect(page).toHaveURL(/\/settings\/account$/);
    await page.getByTestId('account-page').waitFor();

    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/settings$/);
    await page.getByTestId('settings-page').waitFor();

    await page.getByTestId('settings-row').nth(1).click();
    await expect(page).toHaveURL(/\/settings\/chats$/);
    await page.getByTestId('chats-settings-page').waitFor();

    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/settings$/);
    await page.getByTestId('settings-page').waitFor();

    await page.getByTestId('settings-row').nth(2).click();
    await expect(page).toHaveURL(/\/settings\/notifications$/);
    await page.getByTestId('notifications-page').waitFor();

    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/settings$/);
    await page.getByTestId('settings-page').waitFor();

    await page.getByTestId('settings-row').nth(3).click();
    await expect(page).toHaveURL(/\/settings\/data-storage$/);
    await page.getByTestId('data-storage-page').waitFor();

    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/settings$/);
    await page.getByTestId('settings-page').waitFor();
  });
});

test.describe('Settings a11y + visual (US3)', () => {
  test('Settings options opens and backdrop-dismisses the 011 sheet with focus return', async ({
    page,
  }) => {
    await page.goto('/settings');
    await page.getByTestId('settings-page').waitFor();
    await page.getByRole('button', { name: 'Settings options' }).click();
    await expect(page.getByTestId('action-sheet')).toBeVisible();
    await page.getByTestId('action-sheet-backdrop').click({ position: { x: 10, y: 10 } });
    await expect(page.getByTestId('action-sheet')).toHaveCount(0);
    await expect(page.getByTestId('settings-options')).toBeFocused();
  });

  test.skip(
    'matches the Figma golden render on mobile',
    async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/settings');
      await page.getByTestId('settings-page').waitFor();

      await expect(page).toHaveScreenshot('0-9198-settings.png', {
        maxDiffPixelRatio: 0.11,
      });
    },
    // Unskip after Figma capture (~2026-09-28). Measure baseline from the failing tight
    // threshold, then set maxDiffPixelRatio = measured + 0.05 (feature 007 practice).
  );
});