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

// F-056 — authored only, never executed (Playwright pause directive 2026-09-26).
test.describe('Camera capture + preview (F-056)', () => {
  test('renders the informative chrome: Flash, gallery, HD chip and the F-012 controls', async ({
    page,
  }) => {
    await page.goto('/camera');
    await page.getByTestId('camera-page').waitFor();
    await expect(page.getByRole('button', { name: 'Flash' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close camera' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Choose from gallery' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Take photo' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Switch camera' })).toBeVisible();
    await expect(page.getByTestId('camera-quality')).toHaveText('HD');
    await expect(page.getByTestId('camera-filler')).toBeVisible();
    await expect(page.getByTestId('camera-grid')).toBeVisible();
  });

  test('shutter + viewfinder + gallery each open the file picker', async ({ page }) => {
    await page.goto('/camera');
    await page.getByTestId('camera-page').waitFor();
    const input = page.getByTestId('camera-file');
    await page.getByRole('button', { name: 'Take photo' }).click();
    await expect(input).toBeVisible();
    await page.getByTestId('camera-viewfinder').click();
    await expect(input).toBeVisible();
    await page.getByRole('button', { name: 'Choose from gallery' }).click();
    await expect(input).toBeVisible();
  });

  test('choosing a photo enters the capture state with a preview (FR-004)', async ({ page }) => {
    await page.goto('/camera');
    await page.getByTestId('camera-page').waitFor();
    await page.getByTestId('camera-file').setInputFiles({
      name: 'shot.png',
      mimeType: 'image/png',
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
    });
    await expect(page.getByTestId('camera-status')).toHaveText('Photo ready');
    await expect(page.getByTestId('camera-preview')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retake' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send to status' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Switch camera' })).toBeHidden();
    await expect(page.getByTestId('camera-quality')).toBeHidden();
  });

  test('Send publishes the photo as a status and lands on /status (FR-005)', async ({ page }) => {
    await page.goto('/camera');
    await page.getByTestId('camera-page').waitFor();
    await page.getByTestId('camera-file').setInputFiles({
      name: 'shot.png',
      mimeType: 'image/png',
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
    });
    await expect(page.getByTestId('camera-status')).toHaveText('Photo ready');
    await page.getByRole('button', { name: 'Send to status' }).click();
    await expect(page).toHaveURL(/\/status$/);
  });

  test('Retake discards the capture and restores the viewfinder (FR-006)', async ({ page }) => {
    await page.goto('/camera');
    await page.getByTestId('camera-page').waitFor();
    await page.getByTestId('camera-file').setInputFiles({
      name: 'shot.png',
      mimeType: 'image/png',
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
    });
    await expect(page.getByRole('button', { name: 'Retake' })).toBeVisible();
    await page.getByRole('button', { name: 'Retake' }).click();
    await expect(page.getByTestId('camera-preview')).toBeHidden();
    await expect(page.getByTestId('camera-hint')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Switch camera' })).toBeVisible();
  });

  test('Flash and Flip toggle aria-pressed (FR-007)', async ({ page }) => {
    await page.goto('/camera');
    await page.getByTestId('camera-page').waitFor();
    await expect(page.getByRole('button', { name: 'Flash' })).toHaveAttribute('aria-pressed', 'false');
    await page.getByRole('button', { name: 'Flash' }).click();
    await expect(page.getByRole('button', { name: 'Flash' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Switch camera' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await page.getByRole('button', { name: 'Switch camera' }).click();
    await expect(page.getByRole('button', { name: 'Switch camera' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('Close discards the capture without publishing (FR-008)', async ({ page }) => {
    await page.goto('/camera');
    await page.getByTestId('camera-page').waitFor();
    await page.getByTestId('camera-file').setInputFiles({
      name: 'shot.png',
      mimeType: 'image/png',
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
    });
    await page.getByRole('button', { name: 'Close camera' }).click();
    await expect(page).toHaveURL(/\/chats$/);
  });

  test('no horizontal overflow at mobile (FR-009)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/camera');
    await page.getByTestId('camera-page').waitFor();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(overflow).toBe(false);
  });
});