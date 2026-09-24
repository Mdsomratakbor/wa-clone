import { test, expect } from '@playwright/test';
import { CHAT_SEED } from '../../src/app/features/chat-window/chat-window.seed';

test.describe('Chat window (feature 002)', () => {
  test('renders the header with contact identity and actions', async ({ page }) => {
    await page.goto('/chat/chat-006');
    await expect(page.getByTestId('chat-header')).toBeVisible();
    await expect(page.getByText('Martha Craig')).toBeVisible();
    await expect(page.getByText('tap here for contact info')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back to chats' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Video call/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Call/ })).toBeVisible();
  });

  test('renders the date chip and the full seeded thread', async ({ page }) => {
    await page.goto('/chat/chat-006');
    await expect(page.getByText('Fri, Jul 26')).toBeVisible();
    await expect(page.locator('app-message-bubble')).toHaveCount(CHAT_SEED.length);
    await expect(page.locator('.chat-window__row--outgoing')).toHaveCount(10);
    await expect(page.locator('.chat-window__row--incoming')).toHaveCount(3);
  });

  test('renders file bubbles with filename, size and extension', async ({ page }) => {
    await page.goto('/chat/chat-006');
    await expect(page.getByText('IMG_0481', { exact: true })).toBeVisible();
    await expect(page.getByText('2.8 MB', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('png', { exact: true }).first()).toBeVisible();
  });

  test('renders the composer controls', async ({ page }) => {
    await page.goto('/chat/chat-006');
    const composer = page.getByTestId('composer');
    await expect(composer).toBeVisible();
    await expect(page.getByRole('toolbar')).toHaveAttribute('aria-label', 'Message composer');
    await expect(page.getByRole('button', { name: 'Add attachment' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Emoji stickers' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Camera' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Record audio' })).toBeVisible();
  });

  test('header and composer controls are keyboard-focusable with a visible indicator', async ({
    page,
  }) => {
    await page.goto('/chat/chat-006');
    const labels: (string | null)[] = [];
    let sawFocusRing = false;
    for (let i = 0; i < 12; i++) {
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        return {
          label: el.getAttribute('aria-label') ?? el.tagName,
          ring:
            el.tagName === 'BUTTON' ? getComputedStyle(el).boxShadow !== 'none' : false,
        };
      });
      if (info) {
        labels.push(info.label);
        if (info.ring) sawFocusRing = true;
      }
      await page.keyboard.press('Tab');
    }
    expect(sawFocusRing, 'focused controls expose a visible focus indicator').toBe(true);
    expect(labels).toContain('Back to chats');
    expect(labels).toContain('Record audio');
  });

  test('back returns to the chats list', async ({ page }) => {
    await page.goto('/chat/chat-006');
    await page.getByRole('button', { name: 'Back to chats' }).click();
    await expect(page).toHaveURL(/\/chats$/);
    await expect(page.getByTestId('chat-list')).toBeVisible();
  });

  test('a chats row navigates to the matching chat window', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Martha Craig' }).click();
    await expect(page).toHaveURL(/\/chat\/chat-006/);
    await expect(page.getByText('Martha Craig', { exact: true }).first()).toBeVisible();
  });

  test('composer accepts typed text locally', async ({ page }) => {
    await page.goto('/chat/chat-006');
    const input = page.getByRole('textbox', { name: 'Message', exact: true });
    await input.fill('hello tokyo');
    await expect(input).toHaveValue('hello tokyo');
  });

  test('matches the Figma golden render on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/chat/chat-006');
    await page.getByTestId('message-thread').waitFor();
    // Coarse visual-regression guard. The Figma wallpaper is a photo image fill that is not
    // embeddable (see figma/design-analysis.md); it is owner-approved approximated with
    // #EFEFF4, inflating the baseline diff in the thread region. Structural assertions above
    // are the fidelity source of truth.
    await expect(page).toHaveScreenshot('0-8257-chat.png', { maxDiffPixelRatio: 0.5 });
  });
});