# Tasks + Quickstart: WhatsApp Edit Contact (feature 019)

## Tasks

- **Gates**: G1 = capture (~09-28) + approval; G2 = build/unit green; G3 = closure

## Capture — BLOCKED (Figma 429 until ~2026-09-28)

- [ ] T001 — Node inventory `0:10334` (fields/buttons/glyphs/nav)
- [ ] T002 — Golden `tests/e2e/golden/0-10334-edit-contact.png`
- [ ] T003 — Glyph SVGs exported
- [ ] T004 — Owner approval (entry / fields / title)

## Implementation

- [x] T005 — `features/contact-info/edit-contact-page` scaffold (Back→`/contact/:id`, title
      "Edit Contact", Name prefilled + Phone + Save, no tab bar)
- [x] T006 — `/contact/:id/edit` lazy route
- [x] T007 — Contact Info NavigationBar trailing "Edit" action → `['/contact', id, 'edit']`
      (declared hypothesis; design file has no interaction wiring)
- [x] T008 — Unit `edit-contact-page.spec.ts`; `contact-page.spec.ts` Edit action navigation
- [x] T009 — E2E `tests/e2e/edit-contact.spec.ts` (US1/US2/US3 + gated golden);
      `contact-info.spec.ts` US2 extended
- [x] T010 — Responsive no-overflow for `/contact/chat-001/edit`
- [ ] T011 — Golden unskip + baseline (measured + 0.05) — PENDING T002
- [ ] T012 — Capture retro-fit (form fields from inventory) — PENDING T001/T004

## Closure

- [x] T013 — build green + unit green (**190/190**)
- [x] T014 — design-map row 19 -> `019` + implemented; spec/tasks statuses
- [x] T015 — tree clean; commits (spec set / feat / docs)
- [ ] T016 — e2e execution — **deferred** by owner directive 2026-09-26 (playwright runs paused)

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # unit (eyese) — playwright paused per directive
```