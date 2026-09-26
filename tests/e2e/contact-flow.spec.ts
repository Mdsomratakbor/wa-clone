import { test, expect } from '@playwright/test';

test.describe('Contact Info wiring (feature 026) - store + persistence', () => {
  test('Messages opens the thread', async ({ page }) => {
    await page.goto('/contact/chat-006');
    await page.getByTestId('contact-page').waitFor();
    await page.getByTestId('contact-messages').click();
    await expect(page).toHaveURL(/\/chat\/chat-006$/);
    await expect(page.getByTestId('message-thread')).toBeVisible();
  });

  test('editing a contact saves and reflects everywhere, including after reload', async ({
    page,
  }) => {
    await page.goto('/contact/chat-006');
    await page.getByRole('button', { name: 'Edit' }).click();

    const name = page.getByTestId('edit-contact-name');
    const phone = page.getByTestId('edit-contact-phone');
    await name.fill('Martha Craig II');
    await phone.fill('+1 555-0100');
    await page.getByTestId('edit-contact-save').click();

    await expect(page).toHaveURL(/\/contact\/chat-006$/);
    await expect(page.getByTestId('contact-name')).toHaveText('Martha Craig II');

    await page.reload();
    await expect(page.getByTestId('contact-name')).toHaveText('Martha Craig II');

    // chat header reflects the rename
    await page.getByTestId('contact-messages').click();
    await expect(page.getByText('Martha Craig II', { exact: true }).first()).toBeVisible();

    // chats list row reflects the rename
    await page.getByRole('button', { name: 'Back to chats' }).click();
    await expect(page.getByRole('button', { name: 'Martha Craig II' })).toBeVisible();
  });

  test('the Starred messages row opens the Starred list', async ({ page }) => {
    await page.goto('/contact/chat-006');
    await page.getByTestId('contact-page').waitFor();
    await page.getByRole('button', { name: 'Starred messages' }).click();
    await expect(page).toHaveURL(/\/starred-messages$/);
    await expect(page.getByTestId('starred-page')).toBeVisible();
  });
});