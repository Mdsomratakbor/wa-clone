import { test, expect } from '@playwright/test';

async function openMore(page: import('@playwright/test').Page) {
  await page.getByTestId('chat-header__more').click();
}

test.describe('Chat More menu - clear messages / delete chat (feature 031)', () => {
  test('Clear messages empties the thread and survives a reload', async ({ page }) => {
    await page.goto('/chat/chat-006');
    await page.getByTestId('message-thread').waitFor();
    expect(await page.locator('app-message-bubble').count()).toBeGreaterThan(0);

    await openMore(page);
    await page.getByTestId('action-sheet-row').nth(2).click();
    await expect(page.getByTestId('action-sheet-row')).toHaveText([
      'Clear messages',
      'Delete chat',
    ]);

    await page.getByTestId('action-sheet-row').first().click();
    await expect(page.locator('app-message-bubble')).toHaveCount(0);
    await expect(page.getByTestId('action-sheet')).toHaveCount(0);

    await page.reload();
    await page.getByTestId('message-thread').waitFor();
    await expect(page.locator('app-message-bubble')).toHaveCount(0);

    // the chat survives clearing, with an empty preview
    await page.getByRole('button', { name: 'Back to chats' }).click();
    await expect(page).toHaveURL(/\/chats$/);
    await expect(page.getByTestId('chat-search')).toBeVisible();
  });

  test('Delete chat returns to the chats list without the conversation, even after reload', async ({
    page,
  }) => {
    await page.goto('/chat/chat-006');
    await page.getByTestId('message-thread').waitFor();

    await openMore(page);
    await page.getByTestId('action-sheet-row').nth(2).click();
    await page.getByTestId('action-sheet-row').nth(1).click();

    await expect(page).toHaveURL(/\/chats$/);
    await expect(page.getByRole('button', { name: /Martha Craig/ })).toHaveCount(0);

    await page.reload();
    await expect(page.getByRole('button', { name: /Martha Craig/ })).toHaveCount(0);
  });

  test('Wallpaper still does nothing', async ({ page }) => {
    await page.goto('/chat/chat-006');
    await page.getByTestId('message-thread').waitFor();

    await openMore(page);
    await page.getByTestId('action-sheet-row').nth(1).click();
    await expect(page).toHaveURL(/\/chat\/chat-006$/);
    await expect(page.getByTestId('action-sheet')).toBeVisible();
    await expect(page.getByTestId('action-sheet-row')).toHaveText([
      'Mute',
      'Wallpaper',
      'More',
    ]);
  });

  test('Mute still toggles from the parent sheet while the More submenu is available', async ({
    page,
  }) => {
    await page.goto('/chat/chat-006');
    await page.getByTestId('message-thread').waitFor();

    await openMore(page);
    await page.getByTestId('action-sheet-row').first().click();
    await expect(page.getByTestId('chat-header__muted-bell')).toBeVisible();
    await expect(page.getByTestId('action-sheet-row').first()).toHaveText('Unmute');
  });
});
