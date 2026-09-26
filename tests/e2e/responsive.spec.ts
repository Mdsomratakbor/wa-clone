import { test, expect } from '@playwright/test';

const BREAKPOINTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 800, height: 600 },
  { name: 'desktop', width: 1440, height: 900 },
];

test.describe('Responsive adaptation (owner-approved drift)', () => {
  test('no horizontal overflow at any breakpoint', async ({ page }) => {
    for (const vp of BREAKPOINTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `${vp.name} should not overflow horizontally`).toBe(false);
    }
  });

  test('shell column is capped at 480px and centred on tablet/desktop', async ({ page }) => {
    for (const vp of [BREAKPOINTS[1], BREAKPOINTS[2]]) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      const column = await page.locator('.app-shell__column').boundingBox();
      expect(column?.width, `${vp.name} column width`).toBeCloseTo(480, 0);
      const expectedX = (vp.width - 480) / 2;
      expect(
        Math.abs((column?.x ?? 0) - expectedX),
        `${vp.name} column centred`,
      ).toBeLessThan(1);
    }
  });

  test('chat window never overflows horizontally at any breakpoint', async ({ page }) => {
    for (const vp of BREAKPOINTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/chat/chat-006');
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `${vp.name} chat window should not overflow`).toBe(false);
    }
  });

  test('chats edit mode never overflows horizontally at any breakpoint', async ({ page }) => {
    for (const vp of BREAKPOINTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.getByRole('button', { name: 'Edit' }).click();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `${vp.name} chats edit mode should not overflow`).toBe(false);
    }
  });

  test('calls screen never overflows horizontally at any breakpoint', async ({ page }) => {
    for (const vp of BREAKPOINTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/calls');
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `${vp.name} calls screen should not overflow`).toBe(false);
    }
  });

  test('calls edit mode never overflows horizontally at any breakpoint', async ({ page }) => {
    for (const vp of BREAKPOINTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/calls');
      await page.getByRole('button', { name: 'Edit' }).click();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `${vp.name} calls edit mode should not overflow`).toBe(false);
    }
  });

  test('status feed never overflows horizontally at any breakpoint', async ({ page }) => {
    for (const vp of BREAKPOINTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/status');
      await page.getByTestId('status-my').waitFor();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `${vp.name} status feed should not overflow`).toBe(false);
    }
  });

  test('status compose never overflows horizontally at any breakpoint', async ({ page }) => {
    for (const vp of BREAKPOINTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/status/compose');
      await page.getByTestId('compose-page').waitFor();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `${vp.name} status compose should not overflow`).toBe(false);
    }
  });

  test('starred messages never overflows horizontally at any breakpoint', async ({ page }) => {
    for (const vp of BREAKPOINTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/starred-messages');
      await page.getByTestId('starred-page').waitFor();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `${vp.name} starred messages should not overflow`).toBe(false);
    }
  });

  test('settings screen never overflows horizontally at any breakpoint', async ({ page }) => {
    for (const vp of BREAKPOINTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/settings');
      await page.getByTestId('settings-page').waitFor();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `${vp.name} settings screen should not overflow`).toBe(false);
    }
  });

  test('new chat modal never overflows horizontally at any breakpoint', async ({ page }) => {
    for (const vp of BREAKPOINTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/chats');
      await page.getByRole('button', { name: 'Start new chat' }).click();
      await page.getByTestId('action-sheet').waitFor();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `${vp.name} new chat modal should not overflow`).toBe(false);
    }
  });

  test('chat actions modal never overflows horizontally at any breakpoint', async ({ page }) => {
    for (const vp of BREAKPOINTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/chat/chat-001');
      await page.getByRole('button', { name: 'More options' }).click();
      await page.getByTestId('action-sheet').waitFor();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `${vp.name} chat actions modal should not overflow`).toBe(false);
    }
  });

  test('settings modal never overflows horizontally at any breakpoint', async ({ page }) => {
    for (const vp of BREAKPOINTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/settings');
      await page.getByRole('button', { name: 'Settings options' }).click();
      await page.getByTestId('action-sheet').waitFor();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `${vp.name} settings modal should not overflow`).toBe(false);
    }
  });

  test('camera screen never overflows horizontally at any breakpoint', async ({ page }) => {
    for (const vp of BREAKPOINTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/camera');
      await page.getByTestId('camera-page').waitFor();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `${vp.name} camera screen should not overflow`).toBe(false);
    }
  });

  test('account screen never overflows horizontally at any breakpoint', async ({ page }) => {
    for (const vp of BREAKPOINTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/settings/account');
      await page.getByTestId('account-page').waitFor();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `${vp.name} account screen should not overflow`).toBe(false);
    }
  });

  test('contact info screen never overflows horizontally at any breakpoint', async ({ page }) => {
    for (const vp of BREAKPOINTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/contact/chat-001');
      await page.getByTestId('contact-page').waitFor();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `${vp.name} contact info screen should not overflow`).toBe(false);
    }
  });

  test('chats settings screen never overflows horizontally at any breakpoint', async ({ page }) => {
    for (const vp of BREAKPOINTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/settings/chats');
      await page.getByTestId('chats-settings-page').waitFor();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `${vp.name} chats settings screen should not overflow`).toBe(false);
    }
  });

  test('notifications screen never overflows horizontally at any breakpoint', async ({ page }) => {
    for (const vp of BREAKPOINTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/settings/notifications');
      await page.getByTestId('notifications-page').waitFor();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `${vp.name} notifications screen should not overflow`).toBe(false);
    }
  });

  test('data storage screen never overflows horizontally at any breakpoint', async ({ page }) => {
    for (const vp of BREAKPOINTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/settings/data-storage');
      await page.getByTestId('data-storage-page').waitFor();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `${vp.name} data storage screen should not overflow`).toBe(false);
    }
  });

  test('edit contact screen never overflows horizontally at any breakpoint', async ({ page }) => {
    for (const vp of BREAKPOINTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/contact/chat-001/edit');
      await page.getByTestId('edit-contact-page').waitFor();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `${vp.name} edit contact screen should not overflow`).toBe(false);
    }
  });

  test('edit profile screen never overflows horizontally at any breakpoint', async ({ page }) => {
    for (const vp of BREAKPOINTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/settings/profile');
      await page.getByTestId('profile-page').waitFor();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `${vp.name} edit profile screen should not overflow`).toBe(false);
    }
  });
});