import { test, expect } from '@playwright/test';

// Authored 2026-10-01 for feature 048. NOT EXECUTED: Playwright is paused by
// owner directive of 2026-09-26; this file is written, not run.
//
// PROVISIONAL: the entry row is design-verified (Contact Info 0:9486), but the
// shared-Groups screen's own chrome - the "Groups" nav title, the row treatment,
// the "No groups" empty-state copy, the absence of a member-count subtitle and
// the conversation-order listing - is an agent hypothesis. G1 is blocked
// (Figma 429, reset 2026-10-02 18:38 UTC).
//
// No group is seeded, so a first run shows the empty state for every contact.
// The populated cases below create a group through New Group first, which is
// the only thing that populates the screen - by owner decision, not by seed.

const CONTACT_ID = 'chat-001';
const CONTACT_NAME = 'Maximillian Jacobson';
const OTHER_NAME = 'Andrew Parker';

async function createGroupWith(page: import('@playwright/test').Page, name: string, who: string) {
  await page.goto('/new-group');
  await page.getByTestId('new-group-name').fill(name);
  await page.getByTestId('new-group-contact').filter({ hasText: who }).click();
  await page.getByTestId('new-group-create').click();
  await expect(page).toHaveURL(/\/chat\/group-\d+$/);
}

test.describe('Shared Groups (feature 048)', () => {
  test('the Contact row opens the shared-Groups screen', async ({ page }) => {
    await page.goto(`/contact/${CONTACT_ID}`);
    await page.getByTestId('contact-page').waitFor();

    await page.getByRole('button', { name: 'Groups' }).click();
    await expect(page).toHaveURL(new RegExp(`/contact/${CONTACT_ID}/groups$`));
    await expect(page.getByTestId('groups-page')).toBeVisible();
  });

  test('a contact in no group gets the empty state', async ({ page }) => {
    await page.goto(`/contact/${CONTACT_ID}/groups`);

    await expect(page.getByTestId('groups-empty')).toContainText('No groups');
    await expect(page.getByTestId('groups-list')).toHaveCount(0);
  });

  test('the nav title is Groups and Back returns to the contact', async ({ page }) => {
    await page.goto(`/contact/${CONTACT_ID}/groups`);
    await expect(page.locator('.navigation-bar__title')).toHaveText('Groups');

    await page.locator('.navigation-bar__group--leading button').click();
    await expect(page).toHaveURL(new RegExp(`/contact/${CONTACT_ID}$`));
    await expect(page.getByTestId('contact-page')).toBeVisible();
  });

  test('a group the contact belongs to is listed and opens its chat', async ({ page }) => {
    await createGroupWith(page, 'Weekend plans', CONTACT_NAME);

    await page.goto(`/contact/${CONTACT_ID}/groups`);
    await expect(page.getByTestId('groups-list')).toBeVisible();
    await expect(page.getByTestId('groups-empty')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Weekend plans' })).toBeVisible();

    await page.getByRole('button', { name: 'Weekend plans' }).click();
    await expect(page).toHaveURL(/\/chat\/group-\d+$/);
    await page.getByTestId('chat-header').waitFor();
    await expect(page.getByTestId('chat-header')).toContainText('Weekend plans');
  });

  test('a group the contact does not belong to is not listed', async ({ page }) => {
    await createGroupWith(page, 'Others only', OTHER_NAME);

    await page.goto(`/contact/${CONTACT_ID}/groups`);
    await expect(page.getByTestId('groups-empty')).toContainText('No groups');
  });

  test('a listed group is reachable and openable by keyboard', async ({ page }) => {
    await createGroupWith(page, 'Weekend plans', CONTACT_NAME);

    await page.goto(`/contact/${CONTACT_ID}/groups`);
    const row = page.getByRole('button', { name: 'Weekend plans' });
    await row.focus();
    await row.press('Enter');

    await expect(page).toHaveURL(/\/chat\/group-\d+$/);
  });
});
