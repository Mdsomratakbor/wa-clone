import { test, expect } from '@playwright/test';
import { CHAT_SEED } from '../../src/app/features/chat-window/chat-window.seed';

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