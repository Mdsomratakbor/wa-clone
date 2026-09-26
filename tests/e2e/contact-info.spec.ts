import { test, expect } from '@playwright/test';

test.describe('Contact info entry (US1)', () => {
  test('chat header identity tap navigates to /contact/:id', async ({ page }) => {
    await page.goto('/chat/chat-006');
    await page
      .getByRole('button', { name: 'Open contact info' })
      .click();
    await expect(page).toHaveURL(/\/contact\/chat-006$/);
    await page.getByTestId('contact-page').waitFor();
  });
});

test.describe('Contact info screen (US2)', () => {
  test('renders chrome: Back leading, Edit trailing, contact name title, no tab bar', async ({ page }) => {
    await page.goto('/contact/chat-006');
    await page.getByTestId('contact-page').waitFor();
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
    await expect(
      page
        .getByTestId('navigation-bar')
        .getByRole('heading', { name: 'Martha Craig' }),
    ).toBeVisible();
    await expect(
      page.getByTestId('navigation-bar').getByRole('button', { name: 'Edit' }),
    ).toBeVisible();
    await expect(page.getByTestId('tab-bar')).toHaveCount(0);
  });

  test('renders the hero, Messages action and labelled info rows', async ({ page }) => {
    await page.goto('/contact/chat-006');
    await page.getByTestId('contact-page').waitFor();
    await expect(page.getByTestId('contact-hero')).toBeVisible();
    await expect(page.getByText('Martha Craig', { exact: true }).first()).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Messages', exact: true }),
    ).toBeVisible();

    const rows = page.getByTestId('contact-row');
    await expect(rows.first()).toBeVisible();
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);
    for (let i = 0; i < count; i++) {
      const label = (await rows.nth(i).getAttribute('aria-label')) ?? '';
      expect(label.length, 'row has a non-empty aria-label').toBeGreaterThan(0);
    }
  });
});

test.describe('Contact info chroming + visual (US3)', () => {
  test('Back returns to /chat/:id', async ({ page }) => {
    await page.goto('/contact/chat-006');
    await page.getByTestId('contact-page').waitFor();
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/chat\/chat-006$/);
    await page.getByTestId('message-thread').waitFor();
  });

  test.skip(
    'matches the Figma golden render on mobile',
    async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/contact/chat-006');
      await page.getByTestId('contact-page').waitFor();

      await expect(page).toHaveScreenshot('0-9486-contact-info.png', {
        maxDiffPixelRatio: 0.11,
      });
    },
    // Unskip after Figma capture (~2026-09-28). Measure baseline from the failing tight
    // threshold, then set maxDiffPixelRatio = measured + 0.05 (feature 007 practice).
  );
});