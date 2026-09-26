# Design Research + Plan + Tasks + Quickstart: Settings — overflow sheet navigation
# (feature 029)

**Source**: remaining no-op handlers with existing target screens. Wireable rows: the settings
"..." sheet (`SETTINGS_ACTIONS` = Notifications / Storage / More) points at `/settings/notifications` and
`/settings/data-storage` which already exist (F-017/F-018). No capture dependency.

## Research summary

- `SettingsPage.onSettingsAction(id)` is a no-op today; the sheet stays open on any row select
  (unit test "keeps the sheet open when a row is activated"). The Notifications and Storage
  rows duplicate the same targets as the main Settings list rows, which already route.
- Routing on select requires dismissing first (focus returns to the trigger), then `navigate`,
  matching the add-modal (F-023) pattern. "More" has no screen → keep the open-sheet no-op.

## Plan

1. Wire `onSettingsAction` (notifications/storage dismiss+route; more no-op).
2. Update spec: replace the all-no-op row test with per-row expectations.
3. E2E authored (paused); drift notes (011/013); build + unit validation.
4. Commits (spec → feat → test).

**Gates**: G1 no-op; G2 build/unit green + e2e authored; G3 close + drift notes.

## Tasks

- [x] T001 — Spec set `specs/029-settings-overflow/` (this set)
- [x] T002 — Wire `onSettingsAction`
- [x] T003 — Spec update + authored e2e
- [x] T004 — 011/013 drift notes; build + unit green
- [x] T005 — Commits

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per owner directive
```