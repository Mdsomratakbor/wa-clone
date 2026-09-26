import { test, expect } from '@playwright/test';

test.describe('Edit contact entry (US1)', () => {
  test('Contact Info Edit action navigates to /contact/:id/edit', async ({ page }) => {
    await page.goto('/contact/chat-006');
    await page.getByTestId('contact-page').waitFor();
    await page
      .getByTestId('navigation-bar')
      .getByRole('button', { name: 'Edit' })
      .click();
    await expect(page).toHaveURL(/\/contact\/chat-006\/edit$/);
    await page.getByTestId('edit-contact-page').waitFor();
  });
});

test.describe('Edit contact screen (US2)', () => {
  test('renders chrome: Back leading, Edit Contact title, no tab bar', async ({ page }) => {
    await page.goto('/contact/chat-006/edit');
    await page.getByTestId('edit-contact-page').waitFor();
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
    await expect(
      page
        .getByTestId('navigation-bar')
        .getByRole('heading', { name: 'Edit Contact' }),
    ).toBeVisible();
    await expect(page.getByTestId('tab-bar')).toHaveCount(0);
  });

  test('renders Name prefilled, Phone field and Save action', async ({ page }) => {
    await page.goto('/contact/chat-006/edit');
    await page.getByTestId('edit-contact-page').waitFor();
    await expect(page.getByTestId('edit-contact-name')).toHaveValue('Martha Craig');
    await expect(page.getByTestId('edit-contact-phone')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
  });
});

test.describe('Edit contact chroming + visual (US3)', () => {
  test('Back returns to /contact/:id; Save is a no-op', async ({ page }) => {
    await page.goto('/contact/chat-006/edit');
    await page.getByTestId('edit-contact-page').waitFor();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page).toHaveURL(/\/contact\/chat-006\/edit$/);

    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/contact\/chat-006$/);
    await page.getByTestId('contact-page').waitFor();
  });

  test.skip(
    'matches the Figma golden render on mobile',
    async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/contact/chat-006/edit');
      await page.getByTestId('edit-contact-page').waitFor();

      await expect(page).toHaveScreenshot('0-10334-edit-contact.png', {
        maxDiffPixelRatio: 0.11,
      });
    },
    // Unskip after Figma capture (~2026-09-28). Measure baseline from the failing tight
    // threshold, then set maxDiffPixelRatio = measured + 0.05 (feature 007 practice).
  );
});