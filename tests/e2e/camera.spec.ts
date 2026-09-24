import { test, expect } from '@playwright/test';

test.describe('Camera entry (US1)', () => {
  test('Camera tab on Chats navigates to /camera with the tab active', async ({ page }) => {
    await page.goto('/chats');
    await page.getByTestId('chat-list').waitFor();
    await page.getByRole('tab', { name: 'Camera' }).click();
    await expect(page).toHaveURL(/\/camera$/);
    await expect(page.getByTestId('camera-page')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Camera' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  test('Camera tab on Calls navigates to /camera', async ({ page }) => {
    await page.goto('/calls');
    await page.getByTestId('call-list').waitFor();
    await page.getByRole('tab', { name: 'Camera' }).click();
    await expect(page).toHaveURL(/\/camera$/);
    await expect(page.getByTestId('camera-page')).toBeVisible();
  });

  test('Camera tab on Status navigates to /camera', async ({ page }) => {
    await page.goto('/status');
    await page.getByTestId('status-my').waitFor();
    await page.getByRole('tab', { name: 'Camera' }).click();
    await expect(page).toHaveURL(/\/camera$/);
    await expect(page.getByTestId('camera-page')).toBeVisible();
  });
});

test.describe('Camera screen + controls (US2)', () => {
  test('renders the dark viewport and labelled Close/Shutter/Flip controls', async ({ page }) => {
    await page.goto('/camera');
    await page.getByTestId('camera-page').waitFor();
    await expect(page.getByRole('button', { name: 'Close camera' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Take photo' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Switch camera' })).toBeVisible();
  });
});

test.describe('Camera chroming + visual (US3)', () => {
  test('Close returns to /chats', async ({ page }) => {
    await page.goto('/camera');
    await page.getByTestId('camera-page').waitFor();
    await page.getByRole('button', { name: 'Close camera' }).click();
    await expect(page).toHaveURL(/\/chats$/);
    await page.getByTestId('chat-list').waitFor();
  });

  test.skip(
    'matches the Figma golden render on mobile',
    async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/camera');
      await page.getByTestId('camera-page').waitFor();

      await expect(page).toHaveScreenshot('0-9155-camera.png', {
        maxDiffPixelRatio: 0.11,
      });
    },
    // Unskip after Figma capture (~2026-09-28). Measure baseline from the failing tight
    // threshold, then set maxDiffPixelRatio = measured + 0.05 (feature 007 practice).
  );
});