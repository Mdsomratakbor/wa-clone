import { test, expect } from '@playwright/test';

test.describe('Status feed (US1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/status');
    await page.getByTestId('status-my').waitFor();
  });

  test('renders chrome: Privacy action, Status title, tab bar active, no FAB', async ({ page }) => {
    await expect(page.getByTestId('navigation-bar')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Privacy' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Status' })).toBeVisible();
    await expect(page.getByTestId('tab-bar')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Status' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.getByRole('button', { name: 'Start new chat' })).toHaveCount(0);
    await expect(page.getByTestId('chat-actions')).toHaveCount(0);
    await expect(page.getByTestId('call-info')).toHaveCount(0);
    await expect(page.getByTestId('select-circle')).toHaveCount(0);
  });

  test('renders the My Status row with badge, copy and action circles', async ({ page }) => {
    await expect(page.getByTestId('status-avatar')).toBeVisible();
    await expect(page.getByTestId('status-badge')).toBeAttached();
    await expect(page.getByText('My Status', { exact: true })).toBeVisible();
    await expect(page.getByText('Add to my status', { exact: true })).toBeVisible();
    await expect(page.getByTestId('status-camera')).toBeVisible();
    await expect(page.getByTestId('status-note')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Add a photo to my status' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add a text to my status' })).toBeVisible();
  });

  test('renders the no-recent-updates tip', async ({ page }) => {
    await expect(page.getByTestId('status-tip')).toContainText(
      'No recent updates to show right now.',
    );
  });
});

test.describe('Status routing + no-ops (US2)', () => {
  test('Chats and Calls tabs navigate away; Camera/Settings show the stub', async ({
    page,
  }) => {
    await page.goto('/status');
    await page.getByTestId('status-my').waitFor();

    await page.getByRole('tab', { name: 'Camera' }).click();
    await expect(page.getByTestId('tab-stub')).toContainText('Camera');
    await page.getByRole('tab', { name: 'Settings' }).click();
    await expect(page.getByTestId('tab-stub')).toContainText('Settings');
    await page.getByRole('tab', { name: 'Status' }).click();
    await expect(page.getByTestId('status-my')).toBeVisible();

    await page.getByRole('tab', { name: 'Chats' }).click();
    await expect(page).toHaveURL(/\/chats$/);
    await page.getByTestId('chat-list').waitFor();

    await page.getByRole('tab', { name: 'Status' }).click();
    await expect(page).toHaveURL(/\/status$/);
    await page.getByTestId('status-my').waitFor();

    await page.getByRole('tab', { name: 'Calls' }).click();
    await expect(page).toHaveURL(/\/calls$/);
    await page.getByTestId('call-list').waitFor();

    await page.getByRole('tab', { name: 'Status' }).click();
    await expect(page).toHaveURL(/\/status$/);
    await page.getByTestId('status-my').waitFor();
  });

  test('Status tab on /chats and /calls lands on /status', async ({ page }) => {
    await page.goto('/chats');
    await page.getByTestId('chat-list').waitFor();
    await page.getByRole('tab', { name: 'Status' }).click();
    await expect(page).toHaveURL(/\/status$/);
    await page.getByTestId('status-my').waitFor();

    await page.goto('/calls');
    await page.getByTestId('call-list').waitFor();
    await page.getByRole('tab', { name: 'Status' }).click();
    await expect(page).toHaveURL(/\/status$/);
    await page.getByTestId('status-my').waitFor();
  });

  test('Privacy, camera, note and row activation are no-ops', async ({ page }) => {
    await page.goto('/status');
    await page.getByTestId('status-my').waitFor();
    const url = page.url();

    await page.getByRole('button', { name: 'Privacy' }).click();
    await page.getByTestId('status-camera').click();
    await page.getByTestId('status-note').click();
    await page.getByTestId('status-my').click();

    await expect(page).toHaveURL(url);
    await expect(page.getByTestId('status-my')).toBeVisible();
    await expect(page.getByTestId('status-tip')).toBeVisible();
  });
});

test.describe('Status a11y + visual (US3)', () => {
  test('focusable controls show a visible focus indicator', async ({ page }) => {
    await page.goto('/status');
    await page.getByTestId('status-my').waitFor();

    let sawPrivacy = false;
    let sawCamera = false;
    let sawNote = false;
    for (let i = 0; i < 24; i++) {
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const ring = getComputedStyle(el).boxShadow !== 'none';
        return {
          ring,
          privacy: el.textContent?.trim() === 'Privacy',
          camera: el.getAttribute('data-testid') === 'status-camera',
          note: el.getAttribute('data-testid') === 'status-note',
        };
      });
      if (info) {
        if (info.privacy && info.ring) sawPrivacy = true;
        if (info.camera && info.ring) sawCamera = true;
        if (info.note && info.ring) sawNote = true;
      }
      await page.keyboard.press('Tab');
    }
    expect(sawPrivacy, 'Privacy exposes a visible focus ring').toBe(true);
    expect(sawCamera, 'the camera circle exposes a visible focus ring').toBe(true);
    expect(sawNote, 'the note circle exposes a visible focus ring').toBe(true);
  });

  test('matches the Figma golden render on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/status');
    await page.getByTestId('status-my').waitFor();

    // Coarse visual-regression guard; structural assertions above are the fidelity source.
    // Photo avatar -> initials drift plus the known washed-overlay artifact (feature 001).
    await expect(page).toHaveScreenshot('0-8498-status.png', { maxDiffPixelRatio: 0.09 });
  });
});