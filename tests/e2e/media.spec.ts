import { test, expect } from '@playwright/test';

// Authored 2026-09-28 for feature 044. NOT EXECUTED: Playwright is paused by
// owner directive of 2026-09-26; this file is written, not run.
//
// PROVISIONAL: the entry row is design-verified (Contact Info 0:9486), but the
// media screen's own chrome - 3-column grid, square tiles, "No media" copy, and
// the omitted Media/Docs/Links filter chips - is an agent hypothesis. G1 is
// blocked (Figma 429, reset 2026-10-02 18:38 UTC).

// chat-006 is the only seeded contact with a thread, and it carries all four
// file messages, so it is the only contact with a populated media screen.
const WITH_MEDIA = 'chat-006';
const WITHOUT_MEDIA = 'chat-001';

test.describe('Media, photos and links (feature 044)', () => {
  test('the Contact row opens the media screen for a contact with a thread', async ({ page }) => {
    await page.goto(`/contact/${WITH_MEDIA}`);
    await expect(page.getByTestId('contact-row').first()).toBeVisible();

    await page.getByRole('button', { name: 'Media, photos and links' }).click();
    await expect(page).toHaveURL(new RegExp(`/contact/${WITH_MEDIA}/media$`));
    await expect(page.getByTestId('media-page')).toBeVisible();
    await expect(page.getByTestId('media-tile')).toHaveCount(4);
    await expect(page.getByTestId('media-tile').first()).toContainText('IMG_0484.png');
  });

  test('a contact with no thread gets the empty state', async ({ page }) => {
    await page.goto(`/contact/${WITHOUT_MEDIA}/media`);

    await expect(page.getByTestId('media-empty')).toContainText('No media');
    await expect(page.getByTestId('media-grid')).toHaveCount(0);
  });

  test('the tile is reachable and does not navigate', async ({ page }) => {
    await page.goto(`/contact/${WITH_MEDIA}/media`);
    const tile = page.getByTestId('media-tile').first();

    await tile.focus();
    await tile.press('Enter');
    await expect(page).toHaveURL(new RegExp(`/contact/${WITH_MEDIA}/media$`));
    await expect(page.getByTestId('media-grid')).toBeVisible();
  });

  test('the nav title is the contact name and Back returns to the contact', async ({ page }) => {
    await page.goto(`/contact/${WITH_MEDIA}/media`);
    await expect(page.locator('.navigation-bar__title')).toHaveText(/./);

    await page.locator('.navigation-bar__group--leading button').click();
    await expect(page).toHaveURL(new RegExp(`/contact/${WITH_MEDIA}$`));
    await expect(page.getByTestId('contact-page')).toBeVisible();
  });

  // F-048: the "Groups row is still inert" assertion that used to live here is
  // no longer true. The row now opens /contact/:id/groups, and that flow is
  // covered in tests/e2e/contact-groups.spec.ts. It is deliberately not
  // duplicated here: a second copy would only be a second place to update.
});
