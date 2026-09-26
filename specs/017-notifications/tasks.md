# Tasks: WhatsApp Notifications (feature 017)

- **Gates**: G1 = Figma capture (~09-28) + owner approval; G2 = build/test green; G3 = closure
- tests: `npm test -- --watch=false` or `npx ng test --watch=false --reporters=progress`;
  e2e via `npm run test:e2e:fast` (server reuse), full `npm run e2e` at closure

## Design capture — BLOCKED (Figma 429 until ~2026-09-28)

- [ ] T001 — Node inventory: `0:10758` payload captured (sections/rows/glyphs)
- [ ] T002 — Golden export: `tests/e2e/golden/0-10758-notifications.png` (native 1x)
- [ ] T003 — Row/section glyph SVGs exported
- [ ] T004 — Owner approval of clarified spec (row set / toggles / title)

## Implementation

- [x] T005 — `NOTIFICATIONS_ROWS` seed (hypothesis, G1 data-swap)
- [x] T006 — `features/settings/notifications-page` scaffold: NavigationBar
      (Back→`/settings`, title "Notifications"), row list (`notifications-list` /
      `notifications-row`), no tab bar
- [x] T007 — `/settings/notifications` lazy route (app.routes.ts)
- [x] T008 — Settings "Notifications" row activation → `['/settings/notifications']`
- [x] T009 — Unit `notifications-page.spec.ts`; `settings-page.spec.ts` row activation + no-op
      row updated
- [x] T010 — E2E `tests/e2e/notifications.spec.ts`: US1/US2/US3 (+ golden
      `0-10758-notifications.png`); `settings.spec.ts` US2 updated
- [x] T011 — Responsive: no-overflow cases for `/settings/notifications` appended
- [ ] T012 — Golden: unskip `0-10758-notifications.png`, measure baseline, ship `maxDiffPixelRatio
      = measured + 0.05` — PENDING T002
- [ ] T013 — Capture retro-fit: replace seed rows from node inventory — PENDING T001/T004

## Closure

- [x] T014 — build + unit + e2e green
- [x] T015 — `figma/design-map.md` row 17 -> implemented + spec `017`; spec/tasks statuses
- [x] T016 — secrets scan clean; working tree clean; commits (spec set / feat / docs)