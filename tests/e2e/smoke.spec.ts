import { test, expect } from '@playwright/test';

test('smoke: Chats route responds', async ({ page }) => {
  const response = await page.request.get('/');
  expect(response.ok()).toBeTruthy();
});