# Tasks + Quickstart: WhatsApp Data & Storage (feature 018)

## Tasks

- **Gates**: G1 = capture (~09-28) + approval; G2 = build/test green; G3 = closure

## Capture — BLOCKED (Figma 429 until ~2026-09-28)

- [ ] T001 — Node inventory `0:10894` (sections/rows/glyphs)
- [ ] T002 — Golden `tests/e2e/golden/0-10894-data-storage.png`
- [ ] T003 — Glyph SVGs exported
- [ ] T004 — Owner approval (row set / title)

## Implementation

- [x] T005 — `DATA_STORAGE_ROWS` seed (hypothesis, G1 data-swap)
- [x] T006 — `features/settings/data-storage-page` scaffold (Back→`/settings`, title
      "Data & Storage", `data-storage-list`/`data-storage-row`, no tab bar)
- [x] T007 — `/settings/data-storage` lazy route
- [x] T008 — Settings "Data and Storage" row activation → `['/settings/data-storage']`
- [x] T009 — Unit `data-storage-page.spec.ts`; `settings-page.spec.ts` no-op probe → Contacts
- [x] T010 — E2E `tests/e2e/data-storage.spec.ts` (US1/US2/US3 + gated golden);
      `settings.spec.ts` US2 updated
- [x] T011 — Responsive no-overflow for `/settings/data-storage`
- [ ] T012 — Golden unskip + baseline (measured + 0.05) — PENDING T002
- [ ] T013 — Capture retro-fit (seed rows from inventory) — PENDING T001/T004

## Closure

- [x] T014 — build green + unit green (183/183); e2e **cases authored** (`data-storage.spec.ts`,
      `settings.spec.ts` US2, responsive) — playwright execution **deferred** by owner directive
      2026-09-26 ("don't run playwright for now")
- [x] T015 — design-map row 18 -> `018` + implemented; spec/tasks statuses
- [x] T016 — tree clean; commits (spec set / feat / docs)

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress
npm run start   # once; playwright reuses it
npm run test:e2e:fast
npx playwright test tests/e2e/data-storage.spec.ts tests/e2e/settings.spec.ts tests/e2e/responsive.spec.ts --project=chromium-mobile
npm run e2e     # closure only
```