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

// F-057 - authored only, never executed (Playwright pause directive 2026-09-26).
// Sub-screen chrome is PROVISIONAL (no design node exists; G1 capture blocked).
test.describe('Account sub-screens (F-057)', () => {
  const row = (page: import('@playwright/test').Page, label: string) =>
    page.getByRole('button', { name: label });

  test('each Account row navigates to its sub-screen and Back returns to Account', async ({
    page,
  }) => {
    const cases = [
      { label: 'Security', url: /\/settings\/account\/security$/ },
      { label: 'Two-step verification', url: /\/settings\/account\/two-step$/ },
      { label: 'Change number', url: /\/settings\/account\/change-number$/ },
      { label: 'Delete my account', url: /\/settings\/account\/delete$/ },
    ];

    for (const c of cases) {
      await page.goto('/settings/account');
      await page.getByTestId('account-page').waitFor();
      await row(page, c.label).click();
      await expect(page).toHaveURL(c.url);
    }
  });

  test('Security: notifications toggle is honestly disabled; two-step status reflects state', async ({
    page,
  }) => {
    await page.goto('/settings/account/security');
    await page.getByTestId('security-page').waitFor();
    await expect(row(page, 'Show security notifications')).toBeDisabled();
    await expect(page.getByTestId('security-two-step-status')).toHaveText(
      'Additional PIN you can create to further protect your account',
    );
    await row(page, 'Two-step verification').click();
    await expect(page).toHaveURL(/\/settings\/account\/two-step$/);
  });

  test('Two-step: a valid PIN + recovery email enables, then remove requires the PIN', async ({
    page,
  }) => {
    await page.goto('/settings/account/two-step');
    await page.getByTestId('two-step-page').waitFor();

    await expect(page.getByTestId('two-step-set')).toBeDisabled();
    await page.getByTestId('two-step-pin').fill('123456');
    await page.getByTestId('two-step-pin-confirm').fill('123456');
    await page.getByTestId('two-step-email').fill('e@example.com');
    await expect(page.getByTestId('two-step-set')).toBeEnabled();

    await page.getByTestId('two-step-set').click();
    await expect(page.getByTestId('two-step-enabled')).toBeVisible();
    await expect(page.getByTestId('two-step-status')).toHaveText(
      'Two-step verification is enabled',
    );

    await page.getByTestId('two-step-remove').click();
    await page.getByTestId('two-step-remove-pin').fill('123456');
    await page.getByTestId('two-step-remove-confirm').click();
    await expect(page.getByTestId('two-step-disabled')).toBeVisible();
  });

  test('Change number persists the new number and announces', async ({ page }) => {
    await page.goto('/settings/account/change-number');
    await page.getByTestId('change-number-page').waitFor();

    await expect(page.getByTestId('change-number-submit')).toBeDisabled();
    await page.getByTestId('change-number-current').fill('+1 555-0100');
    await page.getByTestId('change-number-new').fill('+44 20 7946 0958');
    await expect(page.getByTestId('change-number-submit')).toBeEnabled();

    await page.getByTestId('change-number-submit').click();
    await expect(page.getByTestId('change-number-status')).toHaveText(
      'Your number has been changed',
    );
    await expect(page.getByTestId('change-number-current')).toHaveValue('+44 20 7946 0958');
  });

  test('Delete my account: DELETE gates the wipe, which lands on the deleted state', async ({
    page,
  }) => {
    await page.goto('/settings/account/delete');
    await page.getByTestId('delete-account-page').waitFor();

    await expect(page.getByTestId('delete-account-confirm-button')).toBeDisabled();
    await page.getByTestId('delete-account-confirm').fill('DELETE');
    await expect(page.getByTestId('delete-account-confirm-button')).toBeEnabled();
    await page.getByTestId('delete-account-confirm-button').click();

    await expect(page.getByTestId('delete-account-deleted')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back' })).toHaveCount(0);

    await page.getByTestId('delete-account-continue').click();
    await expect(page).toHaveURL(/\/chats$/);
  });

  test('no tab bar on any sub-screen, and no horizontal overflow at mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const paths = [
      '/settings/account/security',
      '/settings/account/two-step',
      '/settings/account/change-number',
      '/settings/account/delete',
    ];
    for (const path of paths) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      expect(overflow, `${path} must not overflow`).toBe(false);
      await expect(page.getByTestId('tab-bar')).toHaveCount(0);
    }
  });
});