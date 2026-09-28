import { test, expect } from '@playwright/test';

// Authored 2026-09-28 for feature 042. NOT EXECUTED: Playwright is paused by
// owner directive of 2026-09-26; this file is written, not run.
//
// PROVISIONAL: the screen chrome, nav title "Broadcast lists" and the "No
// broadcasts" copy are agent defaults. G1 is blocked (Figma 429, reset
// 2026-10-02 18:38 UTC), so nothing here is design-verified yet.

async function seedBroadcast(page: import('@playwright/test').Page, name: string) {
  await page.goto('/chats');
  await page.evaluate((broadcastName) => {
    const key = 'wa.chat-store.v1';
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      throw new Error('no chat store snapshot to seed into');
    }
    const snapshot = JSON.parse(raw);
    snapshot.conversations.push({
      id: 'broadcast-e2e',
      contactName: broadcastName,
      preview: '',
      timestamp: '09:00',
      read: true,
      muted: false,
      archived: false,
      kind: 'broadcast',
      participantIds: [],
    });
    window.localStorage.setItem(key, JSON.stringify(snapshot));
  }, name);
}

test.describe('Broadcast lists screen (feature 042)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chats');
    await page.locator('.chat-list-item').first().waitFor();
    await seedBroadcast(page, 'All hands');
  });

  test('the Broadcast Lists action opens the screen and the empty state is reachable', async ({
    page,
  }) => {
    await page.getByTestId('chat-search').fill('a');
    await page.getByTestId('chat-search').press('Escape');
    await page.getByRole('button', { name: 'Broadcast Lists' }).click();

    await expect(page).toHaveURL(/\/broadcasts$/);
    await expect(page.getByTestId('broadcasts-page')).toBeVisible();
    await expect(page.getByTestId('broadcasts-list')).toBeVisible();
    await expect(page.getByTestId('broadcasts-list').locator('.chat-list-item')).toHaveCount(1);
    await expect(page.getByTestId('broadcasts-list')).toContainText('All hands');
  });

  test('a broadcast is not listed in the chats list', async ({ page }) => {
    await page.goto('/chats');
    await expect(page.locator('.chat-list-item').filter({ hasText: 'All hands' })).toHaveCount(0);
  });

  test('opening a broadcast navigates to the chat and Back returns to the list', async ({ page }) => {
    await page.goto('/broadcasts');
    await page.locator('.broadcasts__row .chat-list-item').first().click();

    await expect(page).toHaveURL(/\/chat\/broadcast-e2e$/);
    await expect(page.getByTestId('message-thread')).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/broadcasts$/);

    await page.locator('.navigation-bar__group--leading button').click();
    await expect(page).toHaveURL(/\/chats$/);
  });

  test('the screen survives a reload', async ({ page }) => {
    await page.goto('/broadcasts');
    await expect(page.getByTestId('broadcasts-list').locator('.chat-list-item')).toHaveCount(1);
    await page.reload();
    await expect(page.getByTestId('broadcasts-list').locator('.chat-list-item')).toHaveCount(1);
  });

  test('with no broadcasts the empty state is announced', async ({ page }) => {
    await page.evaluate(() => {
      const key = 'wa.chat-store.v1';
      const snapshot = JSON.parse(window.localStorage.getItem(key) ?? '{}');
      snapshot.conversations = snapshot.conversations.filter(
        (chat: { kind?: string }) => chat.kind !== 'broadcast',
      );
      window.localStorage.setItem(key, JSON.stringify(snapshot));
    });
    await page.goto('/broadcasts');
    await expect(page.getByTestId('broadcasts-empty')).toContainText('No broadcasts');
    await expect(page.getByTestId('broadcasts-list')).toHaveCount(0);
  });
});
