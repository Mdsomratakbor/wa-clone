import { test, expect } from '@playwright/test';
import { CALL_SEED } from '../../src/app/features/calls/calls.seed';

const COUNT = CALL_SEED.length;

test.describe('Calls edit mode (feature 005)', () => {
  test('enters edit mode: Done + Clear, minus circles, no info, tab bar stays', async ({ page }) => {
    await page.goto('/calls');
    await page.getByRole('button', { name: 'Edit' }).click();

    await expect(page.getByRole('button', { name: 'Done' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'New call' })).toHaveCount(0);
    await expect(page.getByTestId('call-remove')).toHaveCount(COUNT);
    await expect(page.getByTestId('call-info')).toHaveCount(0);
    await expect(page.getByTestId('calls-filter')).toBeVisible();
    await expect(page.getByTestId('filter-all')).toBeDisabled();
    await expect(page.getByTestId('filter-missed')).toBeDisabled();
    await expect(page.getByTestId('tab-bar')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Calls' })).toHaveAttribute('aria-selected', 'true');
  });

  test('Done restores the 004 chrome with info buttons', async ({ page }) => {
    await page.goto('/calls');
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('button', { name: 'Done' }).click();

    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New call' })).toBeVisible();
    await expect(page.getByTestId('call-remove')).toHaveCount(0);
    await expect(page.getByTestId('call-info')).toHaveCount(COUNT);
  });

  test('tab switches are inert while editing', async ({ page }) => {
    await page.goto('/calls');
    await page.getByRole('button', { name: 'Edit' }).click();

    await page.getByRole('tab', { name: 'Status' }).click();
    await page.getByRole('tab', { name: 'Chats' }).click();

    await expect(page).toHaveURL(/\/calls$/);
    await expect(page.getByTestId('call-list')).toBeVisible();
    await expect(page.getByTestId('tab-stub')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Done' })).toBeVisible();
  });

  test('row activation is a no-op in edit mode', async ({ page }) => {
    await page.goto('/calls');
    await page.getByRole('button', { name: 'Edit' }).click();

    await page.getByRole('button', { name: 'Martin Randolph, outgoing, 10/13/19' }).click();

    await expect(page).toHaveURL(/\/calls$/);
    await expect(page.getByRole('button', { name: 'Done' })).toBeVisible();
    await expect(page.getByTestId('call-remove')).toHaveCount(COUNT);
  });

  test('the minus removes exactly one call', async ({ page }) => {
    await page.goto('/calls');
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByTestId('call-remove').first().click();

    await expect(page.getByTestId('call-remove')).toHaveCount(COUNT - 1);
    await expect(
      page.getByRole('button', { name: 'Martin Randolph, outgoing, 10/13/19' }),
    ).toHaveCount(0);
    await expect(page.getByTestId('call-info')).toHaveCount(0);
  });

  test('Clear empties the list and disables Clear', async ({ page }) => {
    await page.goto('/calls');
    await page.getByRole('button', { name: 'Edit' }).click();

    await page.getByRole('button', { name: 'Clear' }).click();

    await expect(page.getByTestId('call-remove')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Clear' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Done' })).toBeVisible();
  });

  test('an emptied list shows the No calls placeholder', async ({ page }) => {
    await page.goto('/calls');
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('button', { name: 'Clear' }).click();

    await expect(page.getByTestId('empty-state')).toContainText('No calls');

    await page.getByRole('button', { name: 'Done' }).click();
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByTestId('empty-state')).toContainText('No calls');
  });

  test('focusable remove circles show a visible focus indicator', async ({ page }) => {
    await page.goto('/calls');
    await page.getByRole('button', { name: 'Edit' }).click();

    let sawCircleRing = false;
    for (let i = 0; i < 18; i++) {
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const ring = getComputedStyle(el).boxShadow !== 'none';
        const isCircle = el.closest('[data-testid="call-remove"]') !== null;
        return { ring, isCircle };
      });
      if (info && info.isCircle && info.ring) sawCircleRing = true;
      await page.keyboard.press('Tab');
    }
    expect(sawCircleRing, 'a remove circle exposes a visible focus ring').toBe(true);
  });

  test('matches the Figma golden render in edit mode on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/calls');
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByTestId('call-remove').first().waitFor();

    // Coarse visual-regression guard; structural assertions above are the fidelity source.
    // Same washed gray/blue overlay artifact + photo-avatar drift as feature 004.
    // Measured baseline 2026-09-23: ratio ~0.11 (32923 px); slack 0.16.
    await expect(page).toHaveScreenshot('0-8597-calls-edit.png', { maxDiffPixelRatio: 0.16 });
  });
});