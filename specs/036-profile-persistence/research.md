# Design Research + Plan + Tasks + Quickstart: profile persistence (feature 036)

**Source**: gap audit tier A (`specs/design-gap-audit.md`, A3) — a designed form whose Save does
nothing.

## Research summary

- `EditContactPage` (019) is the in-repo precedent for a real form: `#input` template refs feeding
  signal drafts via `(input)`, then a store write in `onSave()` followed by navigation back. Reusing
  that pattern keeps the codebase idiomatic and the a11y attributes unchanged.
- `PrefsStore` already owns user-level, persisted, non-chat state (`prefs`, `chatSort`) under
  `wa.prefs.v1` with tolerant hydration. The profile belongs there rather than in a new store: it is
  a small, user-scoped preference with no chat/thread coupling, and a second store would add a second
  storage key for the same screen pair.
- Envelope: bump to version `3` and keep accepting `1` and `2`, hydrating a missing `profile` from
  the default. `reset()` must clear it too, otherwise tests that reset prefs would leak a profile.
- `SettingsPage` reads `SETTINGS_PROFILE` (a seed constant). It becomes a computed: name from the
  store, subtitle still the design's `Tap to edit profile`. Because the default name is `Ani` — the
  value the design itself shows — seeded/golden renders do not move. The avatar tile stays as-is
  (its glyph is pending capture, so no initials are invented).
- Blank-name rejection: the avatar tile has no initials yet, but a blank name would erase the header
  identity entirely, so `Save` guards on a trimmed name and keeps the previous value.

## Plan

1. `prefs.store.ts`: `ProfileSnapshot`, `DEFAULT_PROFILE`, `profile` signal, `updateProfile()`,
   `reset()`, envelope v3 + tolerant hydrate.
2. `profile-page.ts` / `.html`: drafts + `#input (input)` + `onSave()` persist + navigate.
3. `settings-page.ts`: `profile` computed from the store.
4. Unit: prefs store, profile page, settings page. E2E extended (paused).
5. Drift note (`specs/020`); build + unit green; commits (spec → feat → test).

**Gates**: G1 store + form; G2 build/unit green + e2e authored; G3 close + drift note.

## Tasks

- [x] T001 — Spec set `specs/036-profile-persistence/`
- [x] T002 — PrefsStore profile slice
- [x] T003 — Profile page real form + Settings header wiring
- [x] T004 — Unit tests + authored e2e
- [x] T005 — 020 drift note; build + unit green
- [x] T006 — Commits

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per owner directive
```