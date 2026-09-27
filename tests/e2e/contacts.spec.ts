import { test, expect } from '@playwright/test';

test.describe('Contacts screen (US1)', () => {
  test('the Settings Contacts row opens /contacts', async ({ page }) => {
    await page.goto('/settings');
    await page.getByTestId('settings-page').waitFor();
    await page.getByRole('button', { name: 'Contacts' }).click();
    await expect(page).toHaveURL(/\/contacts$/);
    await page.getByTestId('contacts-page').waitFor();
  });

  test('renders chrome: Back leading, Contacts title, search, no tab bar', async ({ page }) => {
    await page.goto('/contacts');
    await page.getByTestId('contacts-page').waitFor();
    await expect(page.getByTestId('navigation-bar')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
    await expect(
      page.getByTestId('navigation-bar').getByRole('heading', { name: 'Contacts' }),
    ).toBeVisible();
    await expect(page.getByTestId('contacts-search')).toBeVisible();
    await expect(page.getByTestId('tab-bar')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Start new chat' })).toHaveCount(0);
  });

  test('lists contacts alphabetically with a labelled row per contact', async ({ page }) => {
    await page.goto('/contacts');
    await page.getByTestId('contacts-list').waitFor();

    const rows = page.getByTestId('contacts-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    const names = await rows.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('aria-label') ?? ''),
    );
    expect(new Set(names).size).toBe(names.length);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
});

test.describe('Contacts search + navigation (US2)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contacts');
    await page.getByTestId('contacts-page').waitFor();
  });

  test('filters by name and restores the list via the clear control', async ({ page }) => {
    await page.getByTestId('contacts-search').fill('kar');
    await expect(page.getByTestId('contacts-row')).toHaveCount(1);
    await expect(page.getByTestId('contacts-row')).toHaveAttribute('aria-label', 'Karen Castillo');

    await page.getByRole('button', { name: 'Clear search' }).click();
    await expect(page.getByTestId('contacts-search')).toHaveValue('');
    expect(await page.getByTestId('contacts-row').count()).toBeGreaterThan(1);
  });

  test('shows the no-results state for a query that matches nothing', async ({ page }) => {
    await page.getByTestId('contacts-search').fill('zzzz');
    await expect(page.getByTestId('contacts-empty')).toHaveText('No results');
  });

  test('a row opens the contact info screen; Back returns to /settings', async ({ page }) => {
    await page.getByTestId('contacts-row').first().click();
    await expect(page).toHaveURL(/\/contact\/chat-\d+$/);
    await page.getByTestId('contact-page').waitFor();

    await page.goto('/contacts');
    await page.getByTestId('contacts-page').waitFor();
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/settings$/);
  });
});
