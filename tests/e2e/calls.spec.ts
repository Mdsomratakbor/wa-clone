import { test, expect } from '@playwright/test';
import { CALL_SEED } from '../../src/app/features/calls/calls.seed';

test.describe('Calls screen (US1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calls');
  });

  test('renders exactly the seeded calls', async ({ page }) => {
    await expect(page.getByTestId('call-list')).toBeVisible();
    await expect(page.getByTestId('call-list').locator('app-call-list-item')).toHaveCount(
      CALL_SEED.length,
    );
    await expect(
      page.getByRole('button', { name: 'Martin Randolph, outgoing, 10/13/19' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Jamie Franco, missed, 8/20/19' }),
    ).toBeVisible();
    await expect(page.getByText('10/13/19').first()).toBeVisible();
  });

  test('renders chrome: header, filter, tab bar; no FAB', async ({ page }) => {
    await expect(page.getByTestId('navigation-bar')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New call' })).toBeVisible();
    await expect(page.getByTestId('calls-filter')).toBeVisible();
    await expect(page.getByTestId('filter-all')).toBeDisabled();
    await expect(page.getByTestId('filter-missed')).toBeDisabled();
    await expect(page.getByRole('tab', { name: 'Calls' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('tab-bar')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start new chat' })).toHaveCount(0);
    await expect(page.getByTestId('call-info').first()).toBeVisible();
  });

  test('missed calls render the red name colour', async ({ page }) => {
    const missedRow = page.getByRole('button', { name: 'Karen Castillo, missed, 9/30/19' });
    await expect(missedRow).toBeVisible();
    const color = await missedRow.locator('.call-list-item__name').evaluate(
      (el) => getComputedStyle(el).color,
    );
    expect(color).toBe('rgb(255, 59, 48)');
  });

  test('all header and row controls are no-ops', async ({ page }) => {
    const url = new URL(page.url()).pathname;
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('button', { name: 'New call' }).click();
    await page.getByRole('button', { name: 'Martin Randolph, outgoing, 10/13/19' }).click();
    await page.getByRole('button', { name: 'Call info for Martin Randolph' }).click();
    await expect(page).toHaveURL(url);
    await expect(page.getByTestId('call-list')).toBeVisible();
  });

  test('matches the Figma golden render on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/calls');
    await page.getByTestId('call-list').waitFor();
    // Coarse visual-regression guard: the figma-served golden PNG carries the same
    // washed gray/blue overlay artifact as feature 001 and photo avatars (the app
    // renders initials). Measured baseline 2026-09-23: ratio ~0.10 (29524 px); slack 0.15.
    await expect(page).toHaveScreenshot('0-10395-calls.png', { maxDiffPixelRatio: 0.15 });
  });
});

test.describe('Calls navigation (US2)', () => {
  test('Calls tab on /chats navigates to /calls', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('chat-list').waitFor();
    await page.getByRole('tab', { name: 'Calls' }).click();
    await expect(page).toHaveURL(/\/calls$/);
    await expect(page.getByTestId('call-list')).toBeVisible();
  });

  test('Chats tab on /calls navigates back to /chats', async ({ page }) => {
    await page.goto('/calls');
    await page.getByTestId('call-list').waitFor();
    await page.getByRole('tab', { name: 'Chats' }).click();
    await expect(page).toHaveURL(/\/chats$/);
    await expect(page.getByTestId('chat-list')).toBeVisible();
  });
});