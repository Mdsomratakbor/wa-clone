import { test, expect } from '@playwright/test';

test.describe('Starred messages (US1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/starred-messages');
    await page.getByTestId('starred-page').waitFor();
  });

  test('renders chrome: Settings back action, Starred Messages title, no tab bar or FAB', async ({
    page,
  }) => {
    await expect(page.getByTestId('navigation-bar')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();
    await expect(
      page.getByTestId('navigation-bar').getByRole('heading', { name: 'Starred Messages' }),
    ).toBeVisible();
    await expect(page.getByTestId('tab-bar')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Start new chat' })).toHaveCount(0);
    await expect(page.getByTestId('chat-actions')).toHaveCount(0);
    await expect(page.getByTestId('call-info')).toHaveCount(0);
  });

  test('renders the empty-state tip with avatar, title and body', async ({ page }) => {
    await expect(
      page.getByTestId('starred-tip-avatar'),
    ).toHaveAttribute('src', '/starred-messages-avatar.png');
    await expect(page.getByTestId('starred-tip-title')).toHaveText('No Starred Messages');
    await expect(page.getByTestId('starred-tip-body')).toContainText(
      'Tap and hold on any message to star it, so you can easily find it later.',
    );
  });
});

test.describe('Starred routing (US2)', () => {
  test('Back navigates to /settings; /settings Back returns to /starred-messages', async ({
    page,
  }) => {
    await page.goto('/starred-messages');
    await page.getByTestId('starred-page').waitFor();

    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page).toHaveURL(/\/settings$/);
    await page.getByTestId('settings-page').waitFor();
    await expect(page.getByTestId('settings-page')).toContainText('coming soon');

    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/starred-messages$/);
    await page.getByTestId('starred-page').waitFor();
  });
});

test.describe('Starred a11y + visual (US3)', () => {
  test('Back exposes a visible focus indicator', async ({ page }) => {
    await page.goto('/starred-messages');
    await page.getByTestId('starred-page').waitFor();

    let sawBack = false;
    for (let i = 0; i < 12; i++) {
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        return {
          ring: getComputedStyle(el).boxShadow !== 'none',
          back: el.textContent?.trim() === 'Settings',
        };
      });
      if (info?.back && info.ring) sawBack = true;
      await page.keyboard.press('Tab');
    }
    expect(sawBack, 'Back exposes a visible focus ring').toBe(true);
  });

  test.skip(
    'matches the Figma golden render on mobile',
    async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/starred-messages');
      await page.getByTestId('starred-page').waitFor();

      await expect(page).toHaveScreenshot('0-8820-starred-messages.png', {
        maxDiffPixelRatio: 0.11,
      });
    },
    // Unskip after Figma capture (~2026-09-28). Measure baseline from the failing tight
    // threshold, then set maxDiffPixelRatio = measured + 0.05 (feature 007 practice).
  );
});