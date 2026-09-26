import { test, expect } from '@playwright/test';

test.describe('Star flow (feature 025) - long-press + starred list', () => {
  test('long-press stars a message; the badge survives a reload', async ({ page }) => {
    await page.goto('/chat/chat-006');
    await page.getByTestId('message-thread').waitFor();
    const bubble = page.getByTestId('bubble-msg-007');

    const box = await bubble.boundingBox();
    if (!box) throw new Error('bubble not visible');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(700);
    await page.mouse.up();

    await expect(bubble.getByTestId('star-badge')).toBeVisible();
    await page.reload();
    await expect(page.getByTestId('bubble-msg-007').getByTestId('star-badge')).toBeVisible();
  });

  test('right-click toggles star on and off', async ({ page }) => {
    await page.goto('/chat/chat-006');
    await page.getByTestId('message-thread').waitFor();
    const bubble = page.getByTestId('bubble-msg-001');

    await bubble.click({ button: 'right' });
    await expect(bubble.getByTestId('star-badge')).toBeVisible();

    await bubble.click({ button: 'right' });
    await expect(bubble.getByTestId('star-badge')).toBeHidden();
  });

  test('starred messages render in the Starred list and open their chat', async ({ page }) => {
    await page.goto('/chat/chat-006');
    await page.getByTestId('message-thread').waitFor();
    await page.getByTestId('bubble-msg-007').click({ button: 'right' });
    await expect(page.getByTestId('bubble-msg-007').getByTestId('star-badge')).toBeVisible();

    await page.goto('/starred-messages');
    await expect(page.getByTestId('starred-list')).toBeVisible();
    await expect(page.getByText('Martha Craig', { exact: true })).toBeVisible();
    await expect(page.getByText('Do you know what time is it?', { exact: true })).toBeVisible();

    await page.getByTestId('starred-row').first().click();
    await expect(page).toHaveURL(/\/chat\/chat-006$/);
    await expect(page.getByTestId('message-thread')).toBeVisible();
  });

  test('the empty tip shows when nothing is starred', async ({ page }) => {
    await page.goto('/starred-messages');
    await expect(page.getByTestId('starred-tip')).toBeVisible();
    await expect(page.getByTestId('starred-list')).toHaveCount(0);
    await expect(page.locator('app-message-bubble')).toHaveCount(0);
  });
});