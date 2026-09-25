# Tasks: WhatsApp Account (feature 014)

- **Gates**: G1 = Figma capture (~09-28) + owner approval; G2 = build/test green; G3 = closure
- tests: `npm test -- --watch=false`, e2e = Playwright on the local `ng serve` (port 4200)

## Design capture — BLOCKED (Figma 429 until ~2026-09-28)

- [ ] T001 — Node inventory: `0:9371` payload captured (row list/order, hero geometry)
- [ ] T002 — Golden export: `tests/e2e/golden/0-9371-account.png` (native 1x)
- [ ] T003 — Hero/row glyph SVGs exported
- [ ] T004 — Owner approval of clarified spec (rows / hero)

## Implementation

- [x] T005 — `ACCOUNT_ROWS` seed (hypothesis, G1 data-swap)
- [x] T006 — `features/settings/account-page` scaffold: NavigationBar (Back→`/settings`, title
      "Account"), hero block (`account-hero`), row list (`account-list`/`account-row`), no tab bar
- [x] T007 — `/settings/account` lazy route (app.routes.ts)
- [x] T008 — Settings "Account" row activation → navigate; other Settings rows stay no-op
- [x] T009 — Unit `account-page.spec.ts` (chrome/hero/rows/Back/no tab bar/row no-op);
      `settings-page.spec.ts` Account-row case updated
- [x] T010 — E2E `tests/e2e/account.spec.ts`: US1 (Settings→Account), US2 (screen), US3 (Back +
      golden `0-9371-account.png`); `settings.spec.ts` US2 update
- [x] T011 — Responsive: no-overflow cases for `/settings/account` appended
- [ ] T012 — Golden: unskip `0-9371-account.png`, measure baseline, ship `maxDiffPixelRatio =
      measured + 0.05` — PENDING T002
- [ ] T013 — Capture retro-fit: replace seed rows/hero from node inventory — PENDING T001/T004

## Closure

- [x] T014 — build + unit + e2e green
- [x] T015 — `figma/design-map.md` row 14 -> implemented + spec `014`; spec/tasks statuses
- [x] T016 — secrets scan clean; working tree clean; commits (spec set / feat / docs)