import { test, expect } from '@playwright/test';

test.describe('Chats search + sort (feature 028) - persisted sort preference', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('search narrows the list and clear restores it', async ({ page }) => {
    const search = page.getByTestId('chat-search');
    await search.fill('martha');
    await expect(page.getByRole('button', { name: 'Martha Craig' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Andrew Parker' })).not.toBeVisible();

    await page.getByTestId('chat-search-clear').click();
    await expect(page.getByRole('button', { name: 'Andrew Parker' })).toBeVisible();
  });

  test('a no-match query shows the search empty state', async ({ page }) => {
    await page.getByTestId('chat-search').fill('zzz-not-a-contact');
    await expect(page.getByTestId('search-empty')).toBeVisible();
  });

  test('a filtered chat still opens its thread', async ({ page }) => {
    await page.getByTestId('chat-search').fill('martha');
    await page.getByRole('button', { name: 'Martha Craig' }).click();
    await expect(page).toHaveURL(/\/chat\/chat-006$/);
    await expect(page.getByTestId('message-thread')).toBeVisible();
  });

  test('Name sort re-orders the list alphabetically', async ({ page }) => {
    await page.getByTestId('chat-sort-option').getByText('Name').click();
    const first = page.locator('.chat-list-item').first();
    await expect(first).toHaveAttribute('aria-label', 'Andrew Parker');
  });

  test('the sort choice persists across reload', async ({ page }) => {
    await page.getByTestId('chat-sort-option').getByText('Unread').click();
    await page.reload();
    await expect(page.getByTestId('chat-sort-option').getByText('Unread')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});