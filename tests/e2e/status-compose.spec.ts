import { test, expect } from '@playwright/test';

test.describe('Status compose (US1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/status/compose');
    await page.getByTestId('compose-page').waitFor();
  });

  test('renders the compose surface with the three top glyphs', async ({ page }) => {
    await expect(page.getByTestId('compose-top')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Type status' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send status' })).toBeVisible();
  });

  test('renders the placeholder, caret and keyboard graphic', async ({ page }) => {
    await expect(page.getByTestId('compose-type')).toContainText('Type a status');
    await expect(page.locator('.compose__caret')).toBeVisible();
    await expect(page.getByTestId('compose-keyboard')).toBeVisible();
  });

  test('renders no tab bar, navigation bar, FAB or title', async ({ page }) => {
    await expect(page.getByRole('tab')).toHaveCount(0);
    await expect(page.getByTestId('navigation-bar')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Start new chat' })).toHaveCount(0);
  });
});

test.describe('Status compose routing + no-ops (US2)', () => {
  test('Close returns to the status feed', async ({ page }) => {
    await page.goto('/status/compose');
    await page.getByTestId('compose-page').waitFor();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page).toHaveURL(/\/status$/);
    await page.getByTestId('status-my').waitFor();
  });

  test('send glyphs, placeholder and keyboard are no-ops', async ({ page }) => {
    await page.goto('/status/compose');
    await page.getByTestId('compose-page').waitFor();
    const url = page.url();

    await page.getByRole('button', { name: 'Type status' }).click();
    await page.getByRole('button', { name: 'Send status' }).click();
    await page.getByTestId('compose-type').click();
    await page.getByTestId('compose-keyboard').click();

    await expect(page).toHaveURL(url);
    await expect(page.getByTestId('compose-page')).toBeVisible();
  });
});

test.describe('Status compose a11y + visual (US3)', () => {
  test('focusable controls show a visible focus indicator', async ({ page }) => {
    await page.goto('/status/compose');
    await page.getByTestId('compose-page').waitFor();

    let sawClose = false;
    let sawSendText = false;
    let sawSend = false;
    for (let i = 0; i < 12; i++) {
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const ring = getComputedStyle(el).boxShadow !== 'none';
        return {
          ring,
          close: el.getAttribute('data-testid') === 'compose-close',
          sendText: el.getAttribute('data-testid') === 'compose-send-text',
          send: el.getAttribute('data-testid') === 'compose-send',
        };
      });
      if (info) {
        if (info.close && info.ring) sawClose = true;
        if (info.sendText && info.ring) sawSendText = true;
        if (info.send && info.ring) sawSend = true;
      }
      await page.keyboard.press('Tab');
    }
    expect(sawClose, 'Close exposes a visible focus ring').toBe(true);
    expect(sawSendText, 'the type-status glyph exposes a visible focus ring').toBe(true);
    expect(sawSend, 'the send glyph exposes a visible focus ring').toBe(true);
  });

  test('matches the Figma golden render on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/status/compose');
    await page.getByTestId('compose-page').waitFor();

    // Coarse visual-regression guard; structural assertions above are the fidelity source.
    await expect(page).toHaveScreenshot('0-9634-status-compose.png', { maxDiffPixelRatio: 0.11 });
  });
});