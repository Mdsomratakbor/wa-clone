import { test, expect } from '@playwright/test';

test.describe('New Chat Add Modal (US1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chats');
    await page.getByTestId('chat-list').waitFor();
  });

  test('FAB opens the sheet over the chats content', async ({ page }) => {
    await expect(page.getByTestId('action-sheet')).toHaveCount(0);
    await page.getByRole('button', { name: 'Start new chat' }).click();
    await expect(page.getByTestId('action-sheet')).toBeVisible();
    await expect(page.getByTestId('action-sheet-backdrop')).toBeVisible();
    await expect(page.getByTestId('chat-list')).toBeVisible();
  });
});

test.describe('New Chat Add Modal rows (US2)', () => {
  test('renders focusable labelled rows', async ({ page }) => {
    await page.goto('/chats');
    await page.getByRole('button', { name: 'Start new chat' }).click();
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

test.describe('New Chat Add Modal a11y + visual (US3)', () => {
  test('backdrop dismisses the sheet and returns focus to the FAB', async ({ page }) => {
    await page.goto('/chats');
    await page.getByRole('button', { name: 'Start new chat' }).click();
    await expect(page.getByTestId('action-sheet')).toBeVisible();

    await page.getByTestId('action-sheet-backdrop').click({ position: { x: 10, y: 10 } });
    await expect(page.getByTestId('action-sheet')).toHaveCount(0);
    await expect(page.locator('.fab')).toBeFocused();
  });

  test('Escape dismisses the sheet and returns focus to the FAB', async ({ page }) => {
    await page.goto('/chats');
    await page.getByRole('button', { name: 'Start new chat' }).click();
    await expect(page.getByTestId('action-sheet')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('action-sheet')).toHaveCount(0);
    await expect(page.locator('.fab')).toBeFocused();
  });

  test.skip(
    'matches the Figma golden render on mobile',
    async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/chats');
      await page.getByRole('button', { name: 'Start new chat' }).click();
      await expect(page.getByTestId('action-sheet')).toBeVisible();

      await expect(page).toHaveScreenshot('0-9072-add-modal.png', {
        maxDiffPixelRatio: 0.11,
      });
    },
    // Unskip after Figma capture (~2026-09-28). Measure baseline from the failing tight
    // threshold, then set maxDiffPixelRatio = measured + 0.05 (feature 007 practice).
  );
});
