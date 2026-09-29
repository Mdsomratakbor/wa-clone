import { test, expect } from '@playwright/test';

// Authored 2026-09-29 for feature 045. NOT EXECUTED: Playwright is paused by owner
// directive of 2026-09-26; this file is written, not run.
//
// PROVISIONAL: the design file contains no in-call screen and no contact picker
// (rows 4 and 5 are the Calls list and edit mode only). G1 is blocked *by
// construction* - there is no node to capture, so the 2026-10-02 18:38 UTC quota
// reset does not help. Labels, order and layout here are agent hypotheses
// (specs/045-calling-flow/contracts/ui-contracts.md §2). If a capture ever
// disagrees, this file changes with it.
//
// The state machine and the wiring are NOT provisional: the five entry points
// already existed as rendered controls, and they are what this feature makes real.

const CALLS = 12;

test.describe('Calling flow (feature 045)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calls');
    await page.locator('[data-testid="call-list"] .call-list-item').first().waitFor();
  });

  test('+ new call opens the picker and a contact starts a voice call', async ({ page }) => {
    await page.getByRole('button', { name: 'New call' }).click();
    await expect(page).toHaveURL(/\/calls\/new/);
    await expect(page.getByTestId('call-picker-page')).toBeVisible();

    await page.getByTestId('call-picker-row').first().click();
    await expect(page).toHaveURL(/\/calls\/active/);
    await expect(page.getByTestId('in-call-page')).toBeVisible();
    await expect(page.getByTestId('in-call-kind')).toHaveText('Voice call');
  });

  test('the picker filters, and No results is not a blank screen', async ({ page }) => {
    await page.getByRole('button', { name: 'New call' }).click();

    await page.getByTestId('call-picker-search').fill('martha');
    await expect(page.getByTestId('call-picker-row')).toHaveCount(1);
    await expect(page.getByTestId('call-picker-row').first()).toContainText('Martha Craig');

    await page.getByTestId('call-picker-search').fill('zzzz-no-such-contact');
    await expect(page.getByTestId('call-picker-row')).toHaveCount(0);
    await expect(page.getByTestId('call-picker-empty')).toHaveText('No results');
  });

  test('the in-call screen shows a live duration once connected', async ({ page }) => {
    await page.getByRole('button', { name: 'New call' }).click();
    await page.getByTestId('call-picker-row').first().click();

    // dialing -> ringing -> connected is DIALING_MS + RINGING_MS.
    await expect(page.getByTestId('in-call-duration')).toHaveText('00:00', { timeout: 15_000 });
    await expect(page.getByTestId('in-call-duration')).toHaveAttribute('role', 'timer');
    await expect(page.getByTestId('in-call-duration')).not.toHaveAttribute('aria-live', /.+/);
  });

  test('Mute, Speaker and Video each change real state', async ({ page }) => {
    await page.getByRole('button', { name: 'New call' }).click();
    await page.getByTestId('call-picker-row').first().click();

    for (const [testid, label] of [
      ['in-call-mute', 'Mute'],
      ['in-call-speaker', 'Speaker'],
      ['in-call-video', 'Camera'],
    ] as const) {
      const control = page.getByTestId(testid);
      await expect(control).toHaveAttribute('aria-pressed', 'false');
      await control.click();
      await expect(control).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByRole('button', { name: new RegExp(label) })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    }
  });

  test('hangup records the call in the log and returns to the Calls list', async ({ page }) => {
    await page.getByRole('button', { name: 'New call' }).click();
    await page.getByTestId('call-picker-row').first().click();
    await expect(page.getByTestId('in-call-duration')).toHaveText('00:00', { timeout: 15_000 });

    await page.getByTestId('in-call-hangup').click();

    await expect(page).toHaveURL(/\/calls$/);
    await expect(page.locator('.call-list-item')).toHaveCount(CALLS + 1);
  });

  test('a hung-up call survives a reload', async ({ page }) => {
    await page.getByRole('button', { name: 'New call' }).click();
    await page.getByTestId('call-picker-row').first().click();
    await expect(page.getByTestId('in-call-duration')).toHaveText('00:00', { timeout: 15_000 });
    await page.getByTestId('in-call-hangup').click();
    await expect(page.locator('.call-list-item')).toHaveCount(CALLS + 1);

    await page.reload();
    await expect(page.locator('.call-list-item')).toHaveCount(CALLS + 1);
  });

  test('hanging up during ringing records a missed call', async ({ page }) => {
    await page.getByRole('button', { name: 'New call' }).click();
    await page.getByTestId('call-picker-row').first().click();

    // Hang up before the auto-answer, so the derived outcome is `missed`.
    await expect(page.getByTestId('in-call-duration')).toHaveText('Connecting…');
    await page.getByTestId('in-call-hangup').click();
    await expect(page).toHaveURL(/\/calls$/);
  });

  test('the chat header Call button starts a call and returns to that chat', async ({ page }) => {
    await page.goto('/chat/chat-006');
    await page.getByTestId('message-thread').waitFor();

    await page.getByTestId('chat-header-call').click();
    await expect(page).toHaveURL(/\/calls\/active/);
    await expect(page.getByTestId('in-call-name')).toHaveText('Martha Craig');

    await page.getByTestId('in-call-hangup').click();
    // from=/chat/chat-006, so the call returns to the chat it came from.
    await expect(page).toHaveURL(/\/chat\/chat-006/);
  });

  test('the chat header Video call button starts a video call', async ({ page }) => {
    await page.goto('/chat/chat-006');
    await page.getByTestId('chat-header-video-call').click();

    await expect(page.getByTestId('in-call-kind')).toHaveText('Video call');
  });

  test('a second call is refused while one is live', async ({ page }) => {
    await page.goto('/chat/chat-006');
    await page.getByTestId('chat-header-call').click();
    await expect(page.getByTestId('in-call-name')).toHaveText('Martha Craig');

    await page.getByTestId('in-call-hangup').click();
    await expect(page).toHaveURL(/\/chat\/chat-006/);
  });

  test('the call-info sheet Voice call row starts a real call', async ({ page }) => {
    await page.locator('[data-testid="call-info"]').first().click();
    await page.getByRole('button', { name: 'Voice call' }).click();

    await expect(page).toHaveURL(/\/calls\/active/);
    await expect(page.getByTestId('in-call-page')).toBeVisible();
  });

  test('a deep link to the in-call screen with no call is not a dead end', async ({ page }) => {
    await page.goto('/calls/active');

    await expect(page.getByTestId('in-call-empty')).toBeVisible();
    await expect(page.getByTestId('in-call-hangup')).toHaveCount(0);

    await page.getByTestId('in-call-back-to-calls').click();
    await expect(page).toHaveURL(/\/calls$/);
  });

  test('a hostile from= cannot escape the app', async ({ page }) => {
    await page.goto('/calls/active?from=https%3A%2F%2Fevil.example%2Fsteal');
    await page.getByTestId('in-call-back-to-calls').click();

    await expect(page).toHaveURL(/\/calls$/);
  });

  test('the in-call controls are keyboard reachable', async ({ page }) => {
    await page.getByRole('button', { name: 'New call' }).click();
    await page.getByTestId('call-picker-row').first().click();

    for (const testid of [
      'in-call-mute',
      'in-call-speaker',
      'in-call-video',
      'in-call-hangup',
    ]) {
      await expect(page.getByTestId(testid)).toBeEnabled();
    }
  });
});
