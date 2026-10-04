import { test, expect } from '@playwright/test';
import { CHAT_SEED } from '../../src/app/features/chat-window/chat-window.seed';

/**
 * A real, tiny 1x1 PNG so the browser-side decode (F-058 FR-002) succeeds when
 * Playwright executes again after the pause directive (2026-09-26) is lifted.
 */
const PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

test.describe('Messaging loop (feature 022) - client store', () => {
  test('typing reveals Send; sending appends the bubble and clears the input', async ({
    page,
  }) => {
    await page.goto('/chat/chat-006');
    const bubbles = page.locator('app-message-bubble');
    await expect(bubbles).toHaveCount(CHAT_SEED.length);

    const input = page.getByRole('textbox', { name: 'Message', exact: true });
    await input.fill('hello tokyo');
    await expect(page.getByRole('button', { name: 'Send message' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Record audio' })).toBeHidden();

    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(input).toHaveValue('');
    await expect(bubbles).toHaveCount(CHAT_SEED.length + 1);
    await expect(page.getByText('hello tokyo', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Record audio' })).toBeVisible();
  });

  test('Enter sends the message', async ({ page }) => {
    await page.goto('/chat/chat-006');
    const input = page.getByRole('textbox', { name: 'Message', exact: true });
    await input.fill('on my way');
    await input.press('Enter');
    await expect(input).toHaveValue('');
    await expect(page.getByText('on my way', { exact: true })).toBeVisible();
  });

  test('sending updates the chat-list preview and read tick after back', async ({ page }) => {
    await page.goto('/chat/chat-006');
    const input = page.getByRole('textbox', { name: 'Message', exact: true });
    await input.fill('good morning!');
    await input.press('Enter');

    await page.getByRole('button', { name: 'Back to chats' }).click();
    await expect(page).toHaveURL(/\/chats$/);

    const row = page.getByRole('button', { name: 'Martha Craig' });
    await expect(row).toContainText('good morning!');
    await expect(page.getByTestId('read-tick-chat-006')).toBeVisible();
  });

  test('Read All marks every conversation read', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('button', { name: 'Read All' }).click();
    await expect(page.getByTestId('read-tick-chat-001')).toBeVisible();
    await expect(page.getByTestId('read-tick-chat-009')).toBeVisible();
  });
});

test.describe('Composer attachment (feature 058) - client store', () => {
  test('picking a photo shows the pending strip and Send is reachable', async ({ page }) => {
    await page.goto('/chat/chat-006');
    await page.getByRole('button', { name: 'Add attachment' }).click();

    const sheet = page.getByRole('dialog');
    await expect(sheet).toContainText('Photos & Videos');
    await expect(sheet).toContainText('Document');
    await expect(sheet).toContainText('Add attachment');

    await page.getByRole('button', { name: 'Photos & Videos' }).click();
    await page.setInputFiles('input[data-testid="composer-photo-input"]', {
      name: 'IMG_0475.png',
      mimeType: 'image/png',
      buffer: PIXEL_PNG,
    });

    await expect(page.getByTestId('composer-pending')).toBeVisible();
    await expect(page.getByTestId('composer-pending-thumb')).toHaveAttribute(
      'src',
      /data:image\/jpeg/,
    );
    await expect(page.getByTestId('composer-pending-name')).toContainText('IMG_0475');
    await expect(page.getByRole('button', { name: 'Send message' })).toBeVisible();
  });

  test('sending a photo renders an inline photo bubble with the draft as caption', async ({
    page,
  }) => {
    await page.goto('/chat/chat-006');
    const bubbles = page.locator('app-message-bubble');
    await page.getByRole('textbox', { name: 'Message', exact: true }).fill('look at the lake');

    await page.getByRole('button', { name: 'Add attachment' }).click();
    await page.getByRole('button', { name: 'Photos & Videos' }).click();
    await page.setInputFiles('input[data-testid="composer-photo-input"]', {
      name: 'IMG_0475.png',
      mimeType: 'image/png',
      buffer: PIXEL_PNG,
    });
    await expect(page.getByTestId('composer-pending')).toBeVisible();

    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(bubbles).toHaveCount(CHAT_SEED.length + 1);
    await expect(page.locator('[data-testid="bubble-photo"]')).toBeVisible();
    await expect(page.getByTestId('bubble-caption')).toContainText('look at the lake');
    await expect(page.getByTestId('composer-pending')).toBeHidden();
    await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toHaveValue('');
    await expect(page.getByRole('button', { name: 'Record audio' })).toBeVisible();
  });

  test('a document becomes a file bubble and the chat list preview reflects the send', async ({
    page,
  }) => {
    await page.goto('/chat/chat-006');
    await page.getByRole('button', { name: 'Add attachment' }).click();
    await page.getByRole('button', { name: 'Document' }).click();
    await page.setInputFiles('input[data-testid="composer-doc-input"]', {
      name: 'notes.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from([0x25, 0x50, 0x44, 0x46]),
    });

    await expect(page.getByTestId('composer-pending-name')).toContainText('notes.pdf');
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByText('notes.pdf', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Back to chats' }).click();
    await expect(page.getByRole('button', { name: 'Martha Craig' })).toContainText('notes.pdf');
  });

  test('removing the pending file keeps the draft and restores the mic', async ({ page }) => {
    await page.goto('/chat/chat-006');
    await page.getByRole('textbox', { name: 'Message', exact: true }).fill('keep me');
    await page.getByRole('button', { name: 'Add attachment' }).click();
    await page.getByRole('button', { name: 'Document' }).click();
    await page.setInputFiles('input[data-testid="composer-doc-input"]', {
      name: 'notes.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from([0x25, 0x50, 0x44, 0x46]),
    });
    await expect(page.getByTestId('composer-pending')).toBeVisible();

    await page.getByTestId('composer-pending-remove').click();
    await expect(page.getByTestId('composer-pending')).toBeHidden();
    await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toHaveValue('keep me');
    await expect(page.getByRole('button', { name: 'Record audio' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send message' })).toBeHidden();
  });

  test('the pending strip does not overflow the 375px canvas', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/chat/chat-006');
    await page.getByRole('button', { name: 'Add attachment' }).click();
    await page.getByRole('button', { name: 'Photos & Videos' }).click();
    await page.setInputFiles('input[data-testid="composer-photo-input"]', {
      name: 'IMG_0475.png',
      mimeType: 'image/png',
      buffer: PIXEL_PNG,
    });
    await expect(page.getByTestId('composer-pending')).toBeVisible();
    const noScroll =
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    expect(noScroll).toBe(true);
  });
});