import { test, expect } from '@playwright/test';

// F-041 font size. Authored but NOT executed: Playwright is paused by owner
// directive 2026-09-26. The picker chrome, the step labels and the scale
// multipliers are PROVISIONAL until the G1 Figma capture clears.

async function fontSizeOf(page: import('@playwright/test').Page, selector: string) {
  return page.locator(selector).first().evaluate((el) => getComputedStyle(el).fontSize);
}

test.describe('Font size (US1)', () => {
  test('the Chats Settings Font size row opens the picker', async ({ page }) => {
    await page.goto('/settings/chats');
    await page.getByTestId('chats-settings-page').waitFor();
    await page.getByTestId('chats-settings-row').filter({ hasText: 'Font size' }).click();
    await expect(page).toHaveURL(/\/settings\/chats\/font-size$/);
    await page.getByTestId('font-size-page').waitFor();
  });

  test('renders chrome: Back leading, Font size title, four options, no tab bar', async ({ page }) => {
    await page.goto('/settings/chats/font-size');
    await page.getByTestId('font-size-page').waitFor();
    await expect(page.getByTestId('navigation-bar')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
    await expect(
      page.getByTestId('navigation-bar').getByRole('heading', { name: 'Font size' }),
    ).toBeVisible();
    await expect(page.getByRole('radiogroup', { name: 'Font size' })).toBeVisible();
    await expect(page.getByTestId('font-size-option')).toHaveCount(4);
    await expect(page.getByRole('radio', { name: 'Default' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(page.getByTestId('tab-bar')).toHaveCount(0);
  });

  test('choosing a step checks it and rescales the chat list', async ({ page }) => {
    await page.goto('/chats');
    await page.getByTestId('chats-page').waitFor();
    const before = await fontSizeOf(page, '.chat-list-item__preview');

    await page.goto('/settings/chats/font-size');
    await page.getByTestId('font-size-options').waitFor();
    await page.getByRole('radio', { name: 'Extra large' }).click();
    await expect(page.getByRole('radio', { name: 'Extra large' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(page.getByRole('radio', { name: 'Default' })).toHaveAttribute(
      'aria-checked',
      'false',
    );

    await page.goto('/chats');
    await page.getByTestId('chats-page').waitFor();
    expect(await fontSizeOf(page, '.chat-list-item__preview')).not.toBe(before);
  });

  test('the choice survives a reload and the chat window resizes too', async ({ page }) => {
    await page.goto('/settings/chats/font-size');
    await page.getByTestId('font-size-options').waitFor();
    await page.getByRole('radio', { name: 'Large' }).click();

    await page.reload();
    await page.getByTestId('font-size-options').waitFor();
    await expect(page.getByRole('radio', { name: 'Large' })).toHaveAttribute(
      'aria-checked',
      'true',
    );

    await page.goto('/chat/chat-006');
    await page.getByTestId('message-thread').waitFor();
    await expect(page.locator('.chat-window')).toHaveAttribute('data-font-scale', 'large');
  });

  test('nav chrome is not rescaled', async ({ page }) => {
    await page.goto('/settings/chats/font-size');
    await page.getByTestId('font-size-options').waitFor();
    await page.getByRole('radio', { name: 'Small' }).click();

    await page.goto('/chats');
    await page.getByTestId('chats-page').waitFor();
    const navTitle = await fontSizeOf(page, '.navigation-bar__title');
    await page.goto('/settings/chats/font-size');
    await page.getByTestId('font-size-options').waitFor();
    expect(await fontSizeOf(page, '.navigation-bar__title')).toBe(navTitle);
  });

  test('no horizontal overflow at extra large (FR-013)', async ({ page }) => {
    await page.goto('/settings/chats/font-size');
    await page.getByTestId('font-size-options').waitFor();
    await page.getByRole('radio', { name: 'Extra large' }).click();

    for (const path of ['/chats', '/chat/chat-006', '/archived']) {
      await page.goto(path);
      await expect
        .poll(async () =>
          page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
        )
        .toBeLessThanOrEqual(0);
    }
  });
});
