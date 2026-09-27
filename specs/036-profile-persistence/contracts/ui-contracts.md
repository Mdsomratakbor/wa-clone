# UI Contracts + Quickstart: profile persistence (feature 036)

## Contracts

| Item | Contract |
| ---- | -------- |
| store | `PrefsStore.profile()` → `{ name, about }`; `updateProfile(name, about)`; default `{ name: 'Ani', about: '' }`; envelope `wa.prefs.v1` version `3` (v1/v2 hydrate) |
| form | `profile-name` / `profile-about` remain editable; drafts update on `input` |
| save | `profile-save` → `updateProfile(draftName, draftAbout)` → `navigate(['/settings'])`; blank name ignored |
| back | `profile-page` leading `Back` → `/settings`, drafts discarded |
| settings | `settings-name` renders the stored name; subtitle stays `Tap to edit profile`; the avatar tile is untouched (its glyph is pending capture) |

**Stability**: defaults unchanged ⇒ `0-9135-settings` / profile goldens unaffected.

**E2E (authored, not executed — playwright paused)**:

```bash
npx playwright test tests/e2e/profile.spec.ts --project=chromium-mobile   # when re-enabled
```