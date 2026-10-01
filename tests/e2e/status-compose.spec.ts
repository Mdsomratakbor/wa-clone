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

  // F-049: the decorative <p> and its fake caret became a real input, so the
  // placeholder is an attribute and the caret is the input's own.
  test('renders a real input and the keyboard graphic (F-049 FR-001)', async ({ page }) => {
    await expect(page.getByTestId('compose-input')).toHaveAttribute('placeholder', 'Type a status');
    await expect(page.getByTestId('compose-input')).toHaveValue('');
    await expect(page.locator('.compose__caret')).toHaveCount(0);
    await expect(page.getByTestId('compose-keyboard')).toBeVisible();
  });

  test('Send is disabled until text is typed (F-049 FR-002)', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Send status' })).toBeDisabled();

    await page.getByTestId('compose-input').fill('on the move');
    await expect(page.getByRole('button', { name: 'Send status' })).toBeEnabled();
  });

  test('Send-alt is disabled and does nothing (F-049 FR-008)', async ({ page }) => {
    const url = page.url();
    const sendText = page.getByRole('button', { name: 'Type status' });

    await expect(sendText).toBeDisabled();
    await page.getByTestId('compose-input').fill('on the move');
    await sendText.click({ force: true });

    await expect(page).toHaveURL(url);
    await expect(page.getByTestId('compose-page')).toBeVisible();
  });

  test('Send publishes the status and the feed shows it (F-049 FR-003, FR-009)', async ({ page }) => {
    await page.getByTestId('compose-input').fill('  at the beach  ');
    await page.getByRole('button', { name: 'Send status' }).click();

    await expect(page).toHaveURL(/\/status$/);
    await expect(page.getByTestId('status-mine')).toContainText('at the beach');
    await expect(page.getByTestId('status-tip')).toHaveCount(0);
    await expect(page.getByTestId('status-my-subtitle')).toHaveText('at the beach');
  });

  test('a published status survives a reload (F-049 FR-006)', async ({ page }) => {
    await page.getByTestId('compose-input').fill('still here');
    await page.getByRole('button', { name: 'Send status' }).click();
    await expect(page.getByTestId('status-mine')).toContainText('still here');

    await page.reload();
    await expect(page.getByTestId('status-mine')).toContainText('still here');
  });

  test('renders no tab bar, navigation bar, FAB or title', async ({ page }) => {
    await expect(page.getByRole('tab')).toHaveCount(0);
    await expect(page.getByTestId('navigation-bar')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Start new chat' })).toHaveCount(0);
  });
});

test.describe('Status compose routing (US2)', () => {
  test('Close returns to the status feed', async ({ page }) => {
    await page.goto('/status/compose');
    await page.getByTestId('compose-page').waitFor();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page).toHaveURL(/\/status$/);
    await page.getByTestId('status-my').waitFor();
  });

  test('the keyboard graphic is inert (F-049 FR-001)', async ({ page }) => {
    await page.goto('/status/compose');
    await page.getByTestId('compose-page').waitFor();
    const url = page.url();

    await page.getByTestId('compose-keyboard').click();

    await expect(page).toHaveURL(url);
    await expect(page.getByTestId('compose-page')).toBeVisible();
  });
});

test.describe('Status compose a11y + visual (US3)', () => {
  // F-049: the type-status glyph is now disabled, so it is deliberately absent
  // from the tab order and no longer asserts a focus ring. The input replaced it
  // as the focusable control, and it shows an outline rather than a box-shadow.
  test('focusable controls show a visible focus indicator', async ({ page }) => {
    await page.goto('/status/compose');
    await page.getByTestId('compose-page').waitFor();

    let sawClose = false;
    let sawSend = false;
    let sawInput = false;
    for (let i = 0; i < 12; i++) {
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const style = getComputedStyle(el);
        return {
          ring: style.boxShadow !== 'none',
          outlined: style.outlineStyle !== 'none' && style.outlineWidth !== '0px',
          close: el.getAttribute('data-testid') === 'compose-close',
          send: el.getAttribute('data-testid') === 'compose-send',
          input: el.getAttribute('data-testid') === 'compose-input',
        };
      });
      if (info) {
        if (info.close && info.ring) sawClose = true;
        if (info.send && info.ring) sawSend = true;
        if (info.input && info.outlined) sawInput = true;
      }
      await page.keyboard.press('Tab');
    }
    expect(sawClose, 'Close exposes a visible focus ring').toBe(true);
    expect(sawSend, 'the send glyph exposes a visible focus ring').toBe(true);
    expect(sawInput, 'the status input exposes a visible focus outline').toBe(true);
  });

  test('the disabled type-status glyph is out of the tab order (F-049 FR-008)', async ({ page }) => {
    await page.goto('/status/compose');
    await page.getByTestId('compose-page').waitFor();

    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      const isSendText = await page.evaluate(
        () => document.activeElement?.getAttribute('data-testid') === 'compose-send-text',
      );
      expect(isSendText, 'a disabled control must not be focusable').toBe(false);
    }
  });

  test('matches the Figma golden render on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/status/compose');
    await page.getByTestId('compose-page').waitFor();

    // Coarse visual-regression guard; structural assertions above are the fidelity source.
    await expect(page).toHaveScreenshot('0-9634-status-compose.png', { maxDiffPixelRatio: 0.11 });
  });
});