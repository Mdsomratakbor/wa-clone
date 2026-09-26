import { test, expect } from '@playwright/test';

test.describe('Edit profile entry (US1)', () => {
  test('Settings profile header tap navigates to /settings/profile', async ({ page }) => {
    await page.goto('/settings');
    await page.getByTestId('settings-page').waitFor();
    await page.getByTestId('settings-profile').click();
    await expect(page).toHaveURL(/\/settings\/profile$/);
    await page.getByTestId('profile-page').waitFor();
  });
});

test.describe('Edit profile screen (US2)', () => {
  test('renders chrome: Back leading, Edit Profile title, no tab bar', async ({ page }) => {
    await page.goto('/settings/profile');
    await page.getByTestId('profile-page').waitFor();
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
    await expect(
      page
        .getByTestId('navigation-bar')
        .getByRole('heading', { name: 'Edit Profile' }),
    ).toBeVisible();
    await expect(page.getByTestId('tab-bar')).toHaveCount(0);
  });

  test('renders Name prefilled, About field and Save action', async ({ page }) => {
    await page.goto('/settings/profile');
    await page.getByTestId('profile-page').waitFor();
    await expect(page.getByTestId('profile-name')).toHaveValue('Ani');
    await expect(page.getByTestId('profile-about')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
  });
});

test.describe('Edit profile chroming + visual (US3)', () => {
  test('Back returns to /settings; Save is a no-op', async ({ page }) => {
    await page.goto('/settings/profile');
    await page.getByTestId('profile-page').waitFor();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page).toHaveURL(/\/settings\/profile$/);

    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/settings$/);
    await page.getByTestId('settings-page').waitFor();
  });

  test.skip(
    'matches the Figma golden render on mobile',
    async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/settings/profile');
      await page.getByTestId('profile-page').waitFor();

      await expect(page).toHaveScreenshot('0-10659-profile.png', {
        maxDiffPixelRatio: 0.11,
      });
    },
    // Unskip after Figma capture (~2026-09-28). Measure baseline from the failing tight
    // threshold, then set maxDiffPixelRatio = measured + 0.05 (feature 007 practice).
  );
});