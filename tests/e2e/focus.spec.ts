import { test, expect } from '@playwright/test';

test.describe('Keyboard focus & interactions (US3)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('chat-list').waitFor();
  });

  test('nav actions are reachable and show a visible focus indicator', async ({ page }) => {
    await page.keyboard.press('Tab');
    const first = await page.evaluate(() => document.activeElement?.textContent?.trim());
    expect(['Broadcast Lists', 'New Group', 'Edit']).toContain(first);

    let sawFocusRing = false;
    for (let i = 0; i < 4; i++) {
      const focused = page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el.tagName !== 'BUTTON') return false;
        return getComputedStyle(el).boxShadow !== 'none';
      });
      if (await focused) {
        sawFocusRing = true;
        break;
      }
      await page.keyboard.press('Tab');
    }
    expect(sawFocusRing, 'a focused button exposes a visible focus indicator').toBe(true);
  });

  test('FAB and nav actions can be activated without errors', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));

    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('button', { name: 'Broadcast Lists' }).click();
    await page.getByRole('button', { name: 'New Group' }).click();
    await page.getByRole('button', { name: 'Start new chat' }).click();
    await page.getByRole('button', { name: 'Maximillian Jacobson' }).click();

    expect(pageErrors).toEqual([]);
    await expect(page).toHaveURL(/\/chat\/chat-001/);
  });
});