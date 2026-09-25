# Tasks: WhatsApp Chats Settings (feature 016)

- **Gates**: G1 = Figma capture (~09-28) + owner approval; G2 = build/test green; G3 = closure
- tests: `npm test -- --watch=false`, e2e = Playwright on the local `ng serve` (port 4200)

## Design capture — BLOCKED (Figma 429 until ~2026-09-28)

- [ ] T001 — Node inventory: `0:9973` payload captured (rows/order/labels/glyphs)
- [ ] T002 — Golden export: `tests/e2e/golden/0-9973-chats-settings.png` (native 1x)
- [ ] T003 — Row/section glyph SVGs exported
- [ ] T004 — Owner approval of clarified spec (row set / title)

## Implementation

- [x] T005 — `CHATS_SETTINGS_ROWS` seed (hypothesis, G1 data-swap)
- [x] T006 — `features/settings/chats-settings-page` scaffold: NavigationBar
      (Back→`/settings`, title "Chats Settings"), row list (`chats-settings-list` /
      `chats-settings-row`), no tab bar
- [x] T007 — `/settings/chats` lazy route (app.routes.ts)
- [x] T008 — Settings "Chats Settings" row activation → `['/settings/chats']`
- [x] T009 — Unit `chats-settings-page.spec.ts`; `settings-page.spec.ts` row activation + no-op
      row updated
- [x] T010 — E2E `tests/e2e/chats-settings.spec.ts`: US1/US2/US3 (+ golden
      `0-9973-chats-settings.png`); `settings.spec.ts` US2 updated
- [x] T011 — Responsive: no-overflow cases for `/settings/chats` appended
- [ ] T012 — Golden: unskip `0-9973-chats-settings.png`, measure baseline, ship `maxDiffPixelRatio
      = measured + 0.05` — PENDING T002
- [ ] T013 — Capture retro-fit: replace seed rows from node inventory — PENDING T001/T004

## Closure

- [x] T014 — build + unit + e2e green
- [x] T015 — `figma/design-map.md` row 16 -> implemented + spec `016`; spec/tasks statuses
- [x] T016 — secrets scan clean; working tree clean; commits (spec set / feat / docs)
- [x] T017 — e2e loop optimized: `npm run test:e2e:fast` (mobile project, ~23s) + server reuse
      (playwright `webServer.reuseExistingServer`) + `test:e2e:responsive` gate; documented in
      quickstart