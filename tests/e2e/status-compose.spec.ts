import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

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
  // F-051: the band is a real keyboard component now, not the inert PNG graphic.
  test('renders a real input and the on-screen keyboard (F-049 FR-001, F-051 FR-001)', async ({
    page,
  }) => {
    await expect(page.getByTestId('compose-input')).toHaveAttribute('placeholder', 'Type a status');
    await expect(page.getByTestId('compose-input')).toHaveValue('');
    await expect(page.locator('.compose__caret')).toHaveCount(0);
    await expect(page.getByTestId('compose-keyboard')).toBeVisible();
  });

  // F-051: tapping a key edits the same value signal the input uses (FR-007); shift
  // is covered by the unit suite - here the one-shot uppercase is sampled once.
  test('a tapped key types into the field and backspace removes it (F-051 FR-002, FR-004, FR-007)', async ({
    page,
  }) => {
    await page.getByTestId('compose-key-shift').click();
    await page.getByTestId('compose-key-h').click();
    await expect(page.getByTestId('compose-input')).toHaveValue('H');
    await page.getByTestId('compose-key-i').click();
    await expect(page.getByTestId('compose-input')).toHaveValue('Hi');
    await page.getByTestId('compose-key-backspace').click();
    await expect(page.getByTestId('compose-input')).toHaveValue('H');
  });

  test('keyboard Send publishes the status and navigates to the feed (F-051 FR-006, FR-007)', async ({
    page,
  }) => {
    await page.getByTestId('compose-key-h').click();
    await page.getByTestId('compose-key-i').click();
    await page.getByTestId('compose-key-e').click();
    await page.getByTestId('compose-key-send').click();

    await expect(page).toHaveURL(/\/status$/);
    await expect(page.getByTestId('status-mine')).toContainText('hie');
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

test.describe('Status compose photo mode (F-050)', () => {
  // AUTHORED but never executed: Playwright is paused by owner directive
  // 2026-09-26. It is updated in lockstep with the unit tests and will run when
  // the pause is lifted.
  test('choosing a photo shows a preview, Send publishes, and the feed survives a reload (FR-002, FR-004, FR-005, FR-008)', async ({
    page,
  }) => {
    await page.goto('/status/compose?kind=photo');
    await page.getByTestId('compose-page').waitFor();

    await expect(page.getByTestId('compose-keyboard')).toHaveCount(0);
    await expect(page.getByTestId('compose-input')).toHaveCount(0);
    await expect(page.getByTestId('compose-photo-empty')).toContainText(
      'Choose a photo to add to your status.',
    );
    await expect(page.getByRole('button', { name: 'Send status' })).toBeDisabled();

    await page.getByTestId('compose-file').setInputFiles({
      name: 'status.png',
      mimeType: 'image/png',
      buffer: readFileSync(join(__dirname, 'golden', 'status-my-avatar.png')),
    });

    await expect(page.getByTestId('compose-photo-preview')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send status' })).toBeEnabled();

    await page.getByRole('button', { name: 'Send status' }).click();
    await expect(page).toHaveURL(/\/status$/);

    const photo = page.getByTestId('status-mine-photo');
    await expect(photo).toBeVisible();
    await expect(photo).toHaveAttribute('src', /^data:image\/jpeg;base64,/);
    await expect(photo).toHaveAttribute('alt', 'Status photo');
    await expect(page.getByTestId('status-mine-text')).toHaveCount(0);
    await expect(page.getByTestId('status-tip')).toHaveCount(0);

    // F-052: the photo renders as a rounded preview block, not the 43px band.
    await expect(page.getByTestId('status-mine')).toHaveCSS('border-radius', '8px');
    await expect(page.getByTestId('status-mine')).toHaveCSS('margin-left', '16px');
    await expect(page.locator('.status-page__mine--photo')).toHaveCount(0);

    await page.reload();
    await expect(page.getByTestId('status-mine-photo')).toBeVisible();
  });

  test('Close in photo mode returns to the feed without publishing (FR-011)', async ({ page }) => {
    await page.goto('/status/compose?kind=photo');
    await page.getByTestId('compose-page').waitFor();

    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page).toHaveURL(/\/status$/);
    await page.getByTestId('status-my').waitFor();
    await expect(page.getByTestId('status-mine')).toHaveCount(0);
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

  test('the keyboard holds 26 live letter keys and no decorative sub-keys (F-051 FR-001, FR-008)', async ({
    page,
  }) => {
    await page.goto('/status/compose');
    await page.getByTestId('compose-page').waitFor();

    await expect(page.getByTestId('compose-key-h')).toBeVisible();
    await expect(page.getByTestId('compose-key-z')).toBeVisible();
    await expect(page.getByTestId('compose-key-123')).toHaveCount(0);
    await expect(page.getByTestId('compose-key-globe')).toHaveCount(0);
    await expect(page.getByTestId('compose-key-emoji')).toHaveCount(0);
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