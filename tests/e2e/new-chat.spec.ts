import { test, expect } from '@playwright/test';
import { CHAT_SEED } from '../../src/app/features/chat-list/chat-list.seed';

test.describe('New Chat creation (feature 023) - client store', () => {
  test('FAB -> New contact opens an empty chat with the new name', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Start new chat' }).click();
    await page.getByRole('button', { name: 'New contact' }).click();

    await expect(page).toHaveURL(/\/chat\/chat-new-1$/);
    await expect(page.getByText('New contact', { exact: true }).first()).toBeVisible();
    await expect(page.locator('app-message-bubble')).toHaveCount(0);
  });

  test('sending in the new chat appends a bubble and feeds the chat list', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Start new chat' }).click();
    await page.getByRole('button', { name: 'New contact' }).click();

    const input = page.getByRole('textbox', { name: 'Message', exact: true });
    await input.fill('hello there');
    await input.press('Enter');
    await expect(page.getByText('hello there', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Back to chats' }).click();
    await expect(page).toHaveURL(/\/chats$/);

    const row = page.getByRole('button', { name: 'New contact' });
    await expect(row).toContainText('hello there');
    await expect(page.getByTestId('read-tick-chat-new-1')).toBeVisible();
  });

  test('each creation gets a unique conversation id', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Start new chat' }).click();
    await page.getByRole('button', { name: 'New contact' }).click();
    await expect(page).toHaveURL(/\/chat\/chat-new-1$/);
    await page.getByRole('button', { name: 'Back to chats' }).click();

    await page.getByRole('button', { name: 'Start new chat' }).click();
    await page.getByRole('button', { name: 'New contact' }).click();
    await expect(page).toHaveURL(/\/chat\/chat-new-2$/);
  });

  test('New group remains a no-op: sheet stays open', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Start new chat' }).click();
    await page.getByRole('button', { name: 'New group' }).click();
    await expect(page.getByTestId('action-sheet')).toBeVisible();
    await expect(
      page.getByTestId('chat-list').locator('app-chat-list-item'),
    ).toHaveCount(CHAT_SEED.length);
  });
});