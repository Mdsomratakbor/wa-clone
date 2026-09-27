import { test, expect } from '@playwright/test';

test.describe('Chat mute / unmute (feature 030)', () => {
  test('Mute mutes the conversation, flips the label and shows the header bell', async ({
    page,
  }) => {
    await page.goto('/chat/chat-006');
    await page.getByTestId('message-thread').waitFor();

    await page.getByTestId('chat-header__more').click();
    await expect(page.getByTestId('action-sheet-row')).toHaveText([
      'Mute',
      'Wallpaper',
      'More',
    ]);

    await page.getByTestId('action-sheet-row').first().click();

    // sheet stays open and the row reflects the new state
    await expect(page.getByTestId('action-sheet')).toBeVisible();
    await expect(page.getByTestId('action-sheet-row')).toHaveText([
      'Unmute',
      'Wallpaper',
      'More',
    ]);
    await expect(page.getByTestId('chat-header__muted-bell')).toBeVisible();
  });

  test('muted state survives a reload and Unmute restores it', async ({ page }) => {
    await page.goto('/chat/chat-006');
    await page.getByTestId('message-thread').waitFor();

    await page.getByTestId('chat-header__more').click();
    await page.getByTestId('action-sheet-row').first().click();
    await expect(page.getByTestId('chat-header__muted-bell')).toBeVisible();

    await page.reload();
    await expect(page.getByTestId('message-thread')).toBeVisible();
    await expect(page.getByTestId('chat-header__muted-bell')).toBeVisible();

    await page.getByTestId('chat-header__more').click();
    await expect(page.getByTestId('action-sheet-row').first()).toHaveText('Unmute');
    await page.getByTestId('action-sheet-row').first().click();
    await expect(page.getByTestId('chat-header__muted-bell')).toHaveCount(0);
    await expect(page.getByTestId('action-sheet-row').first()).toHaveText('Mute');
  });

  test('muting is per conversation', async ({ page }) => {
    await page.goto('/chat/chat-006');
    await page.getByTestId('message-thread').waitFor();
    await page.getByTestId('chat-header__more').click();
    await page.getByTestId('action-sheet-row').first().click();
    await expect(page.getByTestId('chat-header__muted-bell')).toBeVisible();

    await page.getByRole('button', { name: 'Back to chats' }).click();
    await expect(page).toHaveURL(/\/chats$/);

    await page.goto('/chat/chat-001');
    await page.getByTestId('message-thread').waitFor();
    await expect(page.getByTestId('chat-header__muted-bell')).toHaveCount(0);
  });

  test('Wallpaper and More stay no-ops', async ({ page }) => {
    await page.goto('/chat/chat-006');
    await page.getByTestId('message-thread').waitFor();
    await page.getByTestId('chat-header__more').click();
    await page.getByTestId('action-sheet-row').nth(1).click();
    await expect(page).toHaveURL(/\/chat\/chat-006$/);
    await expect(page.getByTestId('action-sheet')).toBeVisible();
    await expect(page.getByTestId('chat-header__muted-bell')).toHaveCount(0);
  });

  test('the chat list row shows a mute badge and keeps it after a reload (feature 033)', async ({
    page,
  }) => {
    await page.goto('/chat/chat-006');
    await page.getByTestId('message-thread').waitFor();
    await page.getByTestId('chat-header__more').click();
    await page.getByTestId('action-sheet-row').first().click();
    await expect(page.getByTestId('chat-header__muted-bell')).toBeVisible();

    await page.getByRole('button', { name: 'Back to chats' }).click();
    await expect(page).toHaveURL(/\/chats$/);
    await expect(page.getByTestId('chat-mute-badge-chat-006')).toBeVisible();
    await expect(page.locator('[data-testid^="chat-mute-badge-"]')).toHaveCount(1);

    await page.reload();
    await expect(page.getByTestId('chat-mute-badge-chat-006')).toBeVisible();
  });

  test('unmuting clears the row badge (feature 033)', async ({ page }) => {
    await page.goto('/chat/chat-006');
    await page.getByTestId('message-thread').waitFor();
    await page.getByTestId('chat-header__more').click();
    await page.getByTestId('action-sheet-row').first().click();
    await page.getByTestId('action-sheet-row').first().click();
    await expect(page.getByTestId('chat-header__muted-bell')).toHaveCount(0);

    await page.getByRole('button', { name: 'Back to chats' }).click();
    await expect(page.locator('[data-testid^="chat-mute-badge-"]')).toHaveCount(0);
  });
});
