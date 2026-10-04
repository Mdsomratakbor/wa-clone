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
  // F-059 FR-002: the Wallpaper row now opens the picker, so "first row is a
  // no-op" no longer holds; the remaining rows stay on the screen.
  test('rows that own screens navigate, then Back returns to /settings/chats', async ({ page }) => {
    await page.goto('/settings/chats');
    await page.getByTestId('chats-settings-page').waitFor();
    await page.getByTestId('chats-settings-row').first().click();
    await expect(page).toHaveURL(/\/settings\/chats\/wallpaper$/);
    await page.getByTestId('wallpaper-page').waitFor();

    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/settings\/chats$/);
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

// F-059: Chats Settings screen completion - wallpaper picker, keyboard screen and
// media visibility. Authored but NOT executed: Playwright is paused by owner
// directive 2026-09-26. The wallpaper palette, its labels and the media-hidden
// placeholder are PROVISIONAL until the G1 Figma capture clears (recorded in
// specs/059-chats-settings-complete/research.md and plan.md).
test.describe('Wallpaper picker (F-059/FR-002, FR-003, FR-005, FR-006)', () => {
  test('the Chats Settings Wallpaper row opens the picker', async ({ page }) => {
    await page.goto('/settings/chats');
    await page.getByTestId('chats-settings-page').waitFor();
    await page.getByTestId('chats-settings-row').filter({ hasText: 'Wallpaper' }).click();
    await expect(page).toHaveURL(/\/settings\/chats\/wallpaper$/);
    await page.getByTestId('wallpaper-page').waitFor();
  });

  test('renders chrome: Back leading, Wallpaper title, six options, no tab bar', async ({ page }) => {
    await page.goto('/settings/chats/wallpaper');
    await page.getByTestId('wallpaper-page').waitFor();
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
    await expect(
      page.getByTestId('navigation-bar').getByRole('heading', { name: 'Wallpaper' }),
    ).toBeVisible();
    await expect(page.getByRole('radiogroup', { name: 'Wallpaper' })).toBeVisible();
    await expect(page.getByTestId('wallpaper-option')).toHaveCount(6);
    await expect(page.getByRole('radio', { name: 'Default' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(page.getByTestId('tab-bar')).toHaveCount(0);
  });

  test('choosing a wallpaper repaints the chat scroll canvas through the scoped token', async ({ page }) => {
    await page.goto('/settings/chats/wallpaper');
    await page.getByTestId('wallpaper-options').waitFor();
    await page.getByRole('radio', { name: 'Sky' }).click();
    await expect(page.getByRole('radio', { name: 'Sky' })).toHaveAttribute('aria-checked', 'true');

    await page.goto('/chat/chat-006');
    await page.getByTestId('message-thread').waitFor();
    await expect(page.locator('.chat-window')).toHaveAttribute('data-wallpaper', 'sky');
    expect(
      await page.locator('.chat-window').evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe('rgb(199, 224, 244)');
  });

  test('the wallpaper choice survives a reload', async ({ page }) => {
    await page.goto('/settings/chats/wallpaper');
    await page.getByTestId('wallpaper-options').waitFor();
    await page.getByRole('radio', { name: 'Slate' }).click();

    await page.reload();
    await page.getByTestId('wallpaper-options').waitFor();
    await expect(page.getByRole('radio', { name: 'Slate' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await page.goto('/chat/chat-006');
    await page.getByTestId('message-thread').waitFor();
    await expect(page.locator('.chat-window')).toHaveAttribute('data-wallpaper', 'slate');
  });
});

test.describe('Keyboard screen (F-059/FR-004, FR-007, FR-011)', () => {
  test('the Chats Settings Keyboard row opens the keyboard screen', async ({ page }) => {
    await page.goto('/settings/chats');
    await page.getByTestId('chats-settings-page').waitFor();
    await page.getByTestId('chats-settings-row').filter({ hasText: 'Keyboard' }).click();
    await expect(page).toHaveURL(/\/settings\/chats\/keyboard$/);
    await page.getByTestId('keyboard-page').waitFor();
  });

  test('renders chrome: Back leading, Keyboard title, no tab bar', async ({ page }) => {
    await page.goto('/settings/chats/keyboard');
    await page.getByTestId('keyboard-page').waitFor();
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
    await expect(
      page.getByTestId('navigation-bar').getByRole('heading', { name: 'Keyboard' }),
    ).toBeVisible();
    await expect(page.getByTestId('tab-bar')).toHaveCount(0);
  });

  test('shows the PROVISIONAL reference note and claims no other shortcuts (F-059 FR-006)', async ({ page }) => {
    await page.goto('/settings/chats/keyboard');
    await page.getByTestId('keyboard-page').waitFor();
    await expect(page.getByTestId('keyboard-note')).toContainText(
      'Enter is the only keyboard preference this app can honour today.',
    );
  });

  test('hosts one switch for Enter key sends, persisted across reloads', async ({ page }) => {
    await page.goto('/settings/chats/keyboard');
    await page.getByTestId('keyboard-enter-sends').waitFor();
    const switches = page.getByRole('switch', { name: 'Enter key sends' });
    await expect(switches).toHaveCount(1);
    await expect(switches).toHaveAttribute('aria-checked', 'true');

    await switches.click();
    await expect(switches).toHaveAttribute('aria-checked', 'false');

    await page.reload();
    await page.getByTestId('keyboard-enter-sends').waitFor();
    await expect(page.getByRole('switch', { name: 'Enter key sends' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  test('the standalone Enter key sends row is gone from /settings/chats', async ({ page }) => {
    await page.goto('/settings/chats');
    await page.getByTestId('chats-settings-page').waitFor();
    const rows = page.getByTestId('chats-settings-row');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      expect(await rows.nth(i).getAttribute('aria-label')).not.toBe('Enter key sends');
    }
  });
});

test.describe('Media visibility (F-059/FR-008, FR-009)', () => {
  test('a photo/file bubble masks its media surface when visibility is off', async ({ page }) => {
    await page.goto('/settings/chats');
    await page.getByTestId('chats-settings-page').waitFor();
    await page
      .getByTestId('chats-settings-row')
      .filter({ hasText: 'Media visibility' })
      .getByRole('switch')
      .click();

    await page.goto('/chat/chat-006');
    await page.getByTestId('message-thread').waitFor();
    await expect(page.getByTestId('bubble-media-private').first()).toBeVisible();
    expect(await page.locator('.message-bubble__file').count()).toBe(0);
    // text bubbles and captions are unaffected
    expect(await page.locator('.message-bubble__text').count()).toBeGreaterThan(0);
  });

  test('media reappears when visibility is on again', async ({ page }) => {
    await page.goto('/settings/chats');
    await page.getByTestId('chats-settings-page').waitFor();
    await page
      .getByTestId('chats-settings-row')
      .filter({ hasText: 'Media visibility' })
      .getByRole('switch')
      .click(); // -> off
    await page
      .getByTestId('chats-settings-row')
      .filter({ hasText: 'Media visibility' })
      .getByRole('switch')
      .click(); // -> on

    await page.goto('/chat/chat-006');
    await page.getByTestId('message-thread').waitFor();
    await expect(page.locator('.message-bubble__file').first()).toBeVisible();
    await expect(page.getByTestId('bubble-media-private')).toHaveCount(0);
  });
});