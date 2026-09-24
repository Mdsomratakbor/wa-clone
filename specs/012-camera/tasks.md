# Tasks: WhatsApp Camera (feature 012)

- **Gates**: G1 = Figma capture (~09-28) + owner approval; G2 = build/test green; G3 = closure
- tests: `npm test -- --watch=false`, e2e = Playwright on the local `ng serve` (port 4200)

## Design capture — BLOCKED (Figma 429 until ~2026-09-28)

- [ ] T001 — Node inventory: `0:9155` payload captured; topology + control set + colors recorded
- [ ] T002 — Golden export: `tests/e2e/golden/0-9155-camera.png` (native 1x)
- [ ] T003 — Control glyph SVGs exported (per captured control icons)
- [ ] T004 — Owner approval of clarified spec (topology / control set / Close destination)

## Implementation

- [x] T005 — `features/camera/camera-page` scaffold: dark viewport + hypothesis controls
      (Close/Shutter/Flip) + a11y labels + testids
- [x] T006 — `/camera` lazy route registered (app.routes.ts)
- [x] T007 — Camera tab navigation in `chats-page.ts` `onTabSelect` (+ spec update)
- [x] T008 — Camera tab navigation in `calls-page.ts` `onTabSelect` (+ spec update)
- [x] T009 — Camera tab navigation in `status-page.ts` `onTabSelect` (+ spec update)
- [x] T010 — Camera page tab routing (chats/calls/status route away; settings local stub; camera active)
- [x] T011 — Unit: `camera-page.spec.ts` (viewport, controls, labels, Close→`/chats`, tab routes)
- [x] T012 — E2E `tests/e2e/camera.spec.ts`: US1 entry from each top-level page; US2 controls;
      US3 Close + golden `0-9155-camera.png`
- [x] T013 — Responsive: no-overflow cases for `/camera` appended (all breakpoints)
- [ ] T014 — Golden: unskip `0-9155-camera.png`, measure baseline, ship `maxDiffPixelRatio =
      measured + 0.05` — PENDING T002
- [ ] T015 — Capture retro-fit: replace hypothesis controls/geometry with node inventory values
      — PENDING T001/T004

## Closure

- [x] T016 — build + unit + e2e green
- [x] T017 — `figma/design-map.md` row 12 -> implemented + spec `012`; spec/tasks statuses
- [x] T018 — secrets scan clean; working tree clean; commit `feat(camera): implement WhatsApp
      Camera screen (feature 012)`