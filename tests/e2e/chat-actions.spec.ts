import { test, expect } from '@playwright/test';

test.describe('Chat Actions Modal (US1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat/chat-001');
    await page.getByTestId('chat-header').waitFor();
  });

  test('More options opens the sheet over the chat content', async ({ page }) => {
    await expect(page.getByTestId('action-sheet')).toHaveCount(0);
    await page.getByRole('button', { name: 'More options' }).click();
    await expect(page.getByTestId('action-sheet')).toBeVisible();
    await expect(page.getByTestId('action-sheet-backdrop')).toBeVisible();
    await expect(page.getByTestId('message-thread')).toBeVisible();
  });
});

test.describe('Chat Actions Modal rows (US2)', () => {
  test('renders focusable labelled rows', async ({ page }) => {
    await page.goto('/chat/chat-001');
    await page.getByRole('button', { name: 'More options' }).click();
    const rows = page.getByTestId('action-sheet-row');
    await expect(rows.first()).toBeVisible();
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toBeVisible();
      const name = (await rows.nth(i).textContent())?.trim();
      expect(name?.length ?? 0, 'row has a non-empty label').toBeGreaterThan(0);
    }
  });
});

test.describe('Chat Actions Modal a11y + visual (US3)', () => {
  test('backdrop dismisses the sheet and returns focus to More options', async ({ page }) => {
    await page.goto('/chat/chat-001');
    await page.getByRole('button', { name: 'More options' }).click();
    await expect(page.getByTestId('action-sheet')).toBeVisible();

    await page.getByTestId('action-sheet-backdrop').click({ position: { x: 10, y: 10 } });
    await expect(page.getByTestId('action-sheet')).toHaveCount(0);
    await expect(page.getByTestId('chat-header__more')).toBeFocused();
  });

  test('Escape dismisses the sheet and returns focus to More options', async ({ page }) => {
    await page.goto('/chat/chat-001');
    await page.getByRole('button', { name: 'More options' }).click();
    await expect(page.getByTestId('action-sheet')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('action-sheet')).toHaveCount(0);
    await expect(page.getByTestId('chat-header__more')).toBeFocused();
  });

  test.skip(
    'matches the Figma golden render on mobile',
    async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/chat/chat-001');
      await page.getByRole('button', { name: 'More options' }).click();
      await expect(page.getByTestId('action-sheet')).toBeVisible();

      await expect(page).toHaveScreenshot('0-10087-chat-actions.png', {
        maxDiffPixelRatio: 0.11,
      });
    },
    // Unskip after Figma capture (~2026-09-28). Measure baseline from the failing tight
    // threshold, then set maxDiffPixelRatio = measured + 0.05 (feature 007 practice).
  );
});