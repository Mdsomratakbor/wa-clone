import { test, expect } from '@playwright/test';

test.describe('New group (US1/US2)', () => {
  test('the Chats nav action opens /new-group', async ({ page }) => {
    await page.goto('/chats');
    await page.getByTestId('chats-page').waitFor();
    await page.getByRole('button', { name: 'New Group' }).click();
    await expect(page).toHaveURL(/\/new-group$/);
    await page.getByTestId('new-group-page').waitFor();
  });

  test('the add-modal New group action opens /new-group', async ({ page }) => {
    await page.goto('/chats');
    await page.getByTestId('chats-page').waitFor();
    await page.getByRole('button', { name: 'Start new chat' }).click();
    await page.getByTestId('action-sheet').waitFor();
    await page.getByTestId('action-sheet-row').filter({ hasText: 'New group' }).click();
    await expect(page).toHaveURL(/\/new-group$/);
    await expect(page.getByTestId('action-sheet')).toHaveCount(0);
  });

  test('renders chrome: Back leading, New group title, no tab bar', async ({ page }) => {
    await page.goto('/new-group');
    await page.getByTestId('new-group-page').waitFor();
    await expect(page.getByTestId('navigation-bar')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
    await expect(
      page.getByTestId('navigation-bar').getByRole('heading', { name: 'New group' }),
    ).toBeVisible();
    await expect(page.getByTestId('new-group-name')).toBeVisible();
    await expect(page.getByTestId('tab-bar')).toHaveCount(0);
  });

  test('Create is disabled until a name is typed', async ({ page }) => {
    await page.goto('/new-group');
    await page.getByTestId('new-group-create').waitFor();
    await expect(page.getByTestId('new-group-create')).toBeDisabled();
    await page.getByTestId('new-group-name').fill('Weekend plans');
    await expect(page.getByTestId('new-group-create')).toBeEnabled();
  });

  test('toggles participants and creates the group, opening the group chat', async ({ page }) => {
    await page.goto('/new-group');
    await page.getByTestId('new-group-name').fill('Weekend plans');
    const rows = page.getByTestId('new-group-contact');
    await expect(rows.first()).toBeVisible();
    await rows.nth(0).click();
    await rows.nth(1).click();
    await expect(rows.nth(0)).toHaveAttribute('aria-pressed', 'true');
    await expect(rows.nth(1)).toHaveAttribute('aria-pressed', 'true');
    await rows.nth(0).click();
    await expect(rows.nth(0)).toHaveAttribute('aria-pressed', 'false');

    await page.getByTestId('new-group-create').click();
    await expect(page).toHaveURL(/\/chat\/group-\d+$/);
    await page.getByTestId('chat-header').waitFor();
    await expect(page.getByTestId('chat-header')).toContainText('Weekend plans');
  });

  test('Back returns to /chats', async ({ page }) => {
    await page.goto('/new-group');
    await page.getByTestId('new-group-page').waitFor();
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/chats$/);
  });

  test('a group contact screen lists participants instead of contact rows', async ({ page }) => {
    await page.goto('/new-group');
    await page.getByTestId('new-group-name').fill('Weekend plans');
    const rows = page.getByTestId('new-group-contact');
    await rows.nth(0).click();
    await rows.nth(1).click();
    await page.getByTestId('new-group-create').click();
    await expect(page).toHaveURL(/\/chat\/group-\d+$/);

    await page.getByTestId('chat-header__identity').click();
    await expect(page).toHaveURL(/\/contact\/group-\d+$/);
    await expect(page.getByTestId('contact-group-count')).toHaveText('2 participants');
    await expect(page.getByTestId('contact-participant')).toHaveCount(2);
    await expect(page.getByTestId('contact-row')).toHaveCount(0);
  });
});
