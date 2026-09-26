import { test, expect } from '@playwright/test';

test.describe('Settings toggles (feature 027) - persisted preferences', () => {
  test('Enter key sends off makes Enter inert in a chat', async ({ page }) => {
    await page.goto('/settings/chats');
    await page.getByTestId('chats-settings-page').waitFor();

    const enterSwitch = page.getByRole('switch', { name: 'Enter key sends' });
    await enterSwitch.click();

    await page.goto('/chat/chat-006');
    const input = page.getByRole('textbox', { name: 'Message' });
    await input.fill('no enter send');
    await input.press('Enter');
    await expect(input).toHaveValue('no enter send');
  });

  test('Enter key sends on sends with Enter (default behavior)', async ({ page }) => {
    await page.goto('/chat/chat-006');
    const input = page.getByRole('textbox', { name: 'Message' });
    await input.fill('enter sends');
    await input.press('Enter');
    await expect(input).toHaveValue('');
    await expect(page.getByText('enter sends', { exact: true })).toBeVisible();
  });

  test('chat setting toggles persist across reload', async ({ page }) => {
    await page.goto('/settings/chats');
    await page.getByTestId('chats-settings-page').waitFor();
    await page.getByRole('switch', { name: 'Media visibility' }).click();
    await page.reload();
    await expect(page.getByRole('switch', { name: 'Media visibility' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  test('notification toggles reflect persisted state across reload', async ({ page }) => {
    await page.goto('/settings/notifications');
    await page.getByTestId('notifications-page').waitFor();
    await page.getByRole('switch', { name: 'Show previews' }).click();
    await page.reload();
    await expect(page.getByRole('switch', { name: 'Show previews' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });
});