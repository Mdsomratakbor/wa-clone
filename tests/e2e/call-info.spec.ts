import { test, expect } from '@playwright/test';

// Authored 2026-09-28 for feature 043. NOT EXECUTED: Playwright is paused by
// owner directive of 2026-09-26; this file is written, not run.
//
// PROVISIONAL: the design file has no call-info sheet (G1 blocked, Figma 429,
// reset 2026-10-02 18:38 UTC), so the four action labels and their order are
// agent hypotheses. If the capture disagrees, this file changes with it.

const CALLS = 12;

test.describe('Call info sheet (feature 043)', () => {
  test('the info button opens the sheet with the four actions', async ({ page }) => {
    await page.goto('/calls');
    await page.locator('[data-testid="call-list"] .call-list-item').first().waitFor();

    await page.locator('[data-testid="call-info"]').first().click();
    await expect(page.getByTestId('action-sheet')).toBeVisible();
    await expect(page.getByTestId('action-sheet-row')).toHaveText([
      'Message',
      'Voice call',
      'Video call',
      'Delete',
    ]);
    // The sheet overlays the list; the list keeps all its rows behind it.
    await expect(page.locator('.call-list-item')).toHaveCount(CALLS);
  });

  test('the sheet does not navigate on open and Message opens the chat', async ({ page }) => {
    await page.goto('/calls');
    await page.locator('[data-testid="call-info"]').first().click();
    await expect(page).toHaveURL(/\/calls$/);

    await page.getByRole('button', { name: 'Message' }).click();
    await expect(page).toHaveURL(/\/chat\//);
    await expect(page.getByTestId('message-thread')).toBeVisible();
  });

  test('Delete removes the row and it stays gone after a reload', async ({ page }) => {
    await page.goto('/calls');
    await page.locator('[data-testid="call-info"]').first().click();
    await page.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByTestId('action-sheet')).toHaveCount(0);
    await expect(page.locator('.call-list-item')).toHaveCount(CALLS - 1);

    await page.reload();
    await expect(page.locator('.call-list-item')).toHaveCount(CALLS - 1);
  });

  // F-045 (2026-09-29) replaced this test. It previously asserted that Voice call
  // and Video call "dismiss without changing the list" - true while they were inert,
  // and the reason they were inert. They now start a real call; see
  // calling-flow.spec.ts for that flow.
  test('Voice call and Video call now start a call and leave the list', async ({ page }) => {
    await page.goto('/calls');

    await page.locator('[data-testid="call-info"]').first().click();
    await page.getByRole('button', { name: 'Voice call' }).click();
    await expect(page.getByTestId('in-call-page')).toBeVisible();
    await expect(page).toHaveURL(/\/calls\/active/);
  });

  test('the backdrop and Escape both dismiss the sheet', async ({ page }) => {
    await page.goto('/calls');
    await page.locator('[data-testid="call-info"]').first().click();
    await page.locator('[data-testid="action-sheet-backdrop"]').click();
    await expect(page.getByTestId('action-sheet')).toHaveCount(0);

    await page.locator('[data-testid="call-info"]').first().click();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('action-sheet')).toHaveCount(0);
  });

  test('the sheet is unreachable in edit mode', async ({ page }) => {
    await page.goto('/calls');
    await page.getByRole('button', { name: 'Edit' }).click();

    await expect(page.getByTestId('call-info')).toHaveCount(0);
    await expect(page.getByTestId('action-sheet')).toHaveCount(0);
  });
});
