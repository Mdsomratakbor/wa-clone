import { test, expect } from '@playwright/test';
import { CHAT_SEED } from '../../src/app/features/chat-window/chat-window.seed';

test.describe('Persistence (feature 024) - localStorage', () => {
  test('sent messages survive a reload', async ({ page }) => {
    await page.goto('/chat/chat-006');
    const input = page.getByRole('textbox', { name: 'Message', exact: true });
    await input.fill('persist me');
    await input.press('Enter');
    await expect(page.getByText('persist me', { exact: true })).toBeVisible();

    await page.reload();
    await expect(page.getByText('persist me', { exact: true })).toBeVisible();
    await expect(page.locator('app-message-bubble')).toHaveCount(CHAT_SEED.length + 1);
  });

  test('a created conversation survives a reload', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Start new chat' }).click();
    await page.getByRole('button', { name: 'New contact' }).click();
    await expect(page).toHaveURL(/\/chat\/chat-new-1$/);

    await page.reload();
    await expect(page).toHaveURL(/\/chat\/chat-new-1$/);
    await expect(page.getByText('New contact', { exact: true }).first()).toBeVisible();

    await page.getByRole('button', { name: 'Back to chats' }).click();
    await expect(page.getByRole('button', { name: 'New contact' })).toBeVisible();
  });

  test('Read All survives a reload', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('button', { name: 'Read All' }).click();

    await page.reload();
    await expect(page.getByTestId('read-tick-chat-001')).toBeVisible();
    await expect(page.getByTestId('read-tick-chat-009')).toBeVisible();
  });
});