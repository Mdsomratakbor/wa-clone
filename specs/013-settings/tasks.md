# Tasks: WhatsApp Settings (feature 013)

- **Gates**: G1 = Figma capture (~09-28) + owner approval; G2 = build/test green; G3 = closure
- tests: `npm test -- --watch=false`, e2e = Playwright on the local `ng serve` (port 4200)

## Design capture — BLOCKED (Figma 429 until ~2026-09-28)

- [ ] T001 — Node inventory: `0:9198` payload captured (profile header, row list/order, 011 entry)
- [ ] T002 — Golden export: `tests/e2e/golden/0-9198-settings.png` (native 1x)
- [ ] T003 — Row/chevron/avatar glyph SVGs exported
- [ ] T004 — Owner approval of clarified spec (profile / rows / 011 entry / Back)

## Implementation

- [x] T005 — `settings.seed.ts`: `SETTINGS_PROFILE` + `SETTINGS_ROWS` (hypothesis, G1 data-swap)
- [x] T006 — `features/settings/settings-page` scaffold: NavigationBar (Back→`/starred-messages`,
      title "Settings"), profile header, options trigger (`settings-options`), row list
      (`settings-list`/`settings-row`), `data-testid="settings-page"` preserved
- [x] T007 — Tab bar: Settings active; Chats/Camera/Calls/Status tabs route away
- [x] T008 — 011 Settings Modal re-hosted on the real screen (open/dismiss/focus-return contract)
- [x] T009 — Route swap `/settings` -> `settings-page`; delete `settings-stub-page.*`
- [x] T010 — Unit `settings-page.spec.ts` (replaces stub spec; carries 011 behavior tests 1:1)
- [x] T011 — E2E `tests/e2e/settings.spec.ts`: US1 chrome/profile/rows; US2 routing + Back;
      US3 golden `0-9198-settings.png`
- [x] T012 — Regression: `starred.spec.ts` 'coming soon' assertion updated; responsive re-label
      + no-overflow case confirmed (kept `settings-page` testid)
- [ ] T013 — Golden: unskip `0-9198-settings.png`, measure baseline, ship `maxDiffPixelRatio =
      measured + 0.05` — PENDING T002
- [ ] T014 — Capture retro-fit: replace seed profile/rows + trigger placement from node inventory
      — PENDING T001/T004

## Closure

- [x] T015 — build + unit + e2e green
- [x] T016 — `figma/design-map.md` row 13 -> implemented + spec `013`; spec/tasks statuses
- [x] T017 — secrets scan clean; working tree clean; commits (spec set / feat / docs)