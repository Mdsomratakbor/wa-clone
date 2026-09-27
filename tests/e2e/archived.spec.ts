import { test, expect } from '@playwright/test';

const COUNT = 9;

async function archiveFirst(page: import('@playwright/test').Page) {
  await page.goto('/chats');
  await page.locator('.chat-list-item').first().waitFor();
  const name = await page.locator('.chat-list-item').first().getAttribute('aria-label');
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.locator('.chat-list-item').first().click();
  await page.getByRole('button', { name: 'Archive' }).click();
  await expect(page.locator('.chat-list-item')).toHaveCount(COUNT - 1);
  return name;
}

test.describe('Archived screen (feature 034)', () => {
  test('archiving reveals the pinned Archived row and it opens the screen', async ({ page }) => {
    const name = await archiveFirst(page);
    await expect(page.getByTestId('archived-row')).toBeVisible();
    await expect(page.getByTestId('archived-row')).toHaveText('Archived');

    await page.getByTestId('archived-row').click();
    await expect(page).toHaveURL(/\/archived$/);
    await expect(page.getByTestId('archived-page')).toBeVisible();
    await expect(page.getByTestId('archived-list')).toBeVisible();
    if (name) {
      await expect(page.getByRole('button', { name })).toBeVisible();
    }
  });

  test('the archived list survives a reload and tapping a chat restores it', async ({ page }) => {
    const name = await archiveFirst(page);

    await page.goto('/archived');
    await expect(page.getByTestId('archived-list')).toBeVisible();
    await page.reload();
    await expect(page.getByTestId('archived-list')).toBeVisible();

    if (name) {
      await page.getByRole('button', { name }).click();
      await expect(page).toHaveURL(/\/chat\//);
      await expect(page.getByTestId('message-thread')).toBeVisible();
    }

    await page.getByRole('button', { name: 'Back to chats' }).click();
    await expect(page).toHaveURL(/\/chats$/);
    await expect(page.locator('.chat-list-item')).toHaveCount(COUNT);
    if (name) {
      await expect(page.getByRole('button', { name })).toBeVisible();
    }
    await expect(page.getByTestId('archived-row')).toHaveCount(0);
  });

  test('restoring everything empties the archived screen', async ({ page }) => {
    await archiveFirst(page);
    await page.goto('/archived');
    await expect(page.getByTestId('archived-list')).toBeVisible();
    await page.locator('.archived__row .chat-list-item').first().click();
    await page.goto('/archived');
    await expect(page.getByTestId('archived-empty')).toContainText('No archived chats');
  });

  test('the back action returns to the chats list', async ({ page }) => {
    await archiveFirst(page);
    await page.goto('/archived');
    await page.locator('.navigation-bar__group--leading button').click();
    await expect(page).toHaveURL(/\/chats$/);
    await expect(page.getByTestId('archived-row')).toBeVisible();
  });

  test('the Archived row is hidden in edit mode and while searching', async ({ page }) => {
    await archiveFirst(page);
    await page.goto('/chats');
    await expect(page.getByTestId('archived-row')).toBeVisible();

    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByTestId('archived-row')).toHaveCount(0);
    await page.getByRole('button', { name: 'Done' }).click();

    await page.getByTestId('chat-search').fill('a');
    await expect(page.getByTestId('archived-row')).toHaveCount(0);
  });
});
