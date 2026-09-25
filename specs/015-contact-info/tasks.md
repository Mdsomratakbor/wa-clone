# Tasks: WhatsApp Contact Info (feature 015)

- **Gates**: G1 = Figma capture (~09-28) + owner approval; G2 = build/test green; G3 = closure
- tests: `npm test -- --watch=false`, e2e = Playwright on the local `ng serve` (port 4200)

## Design capture — BLOCKED (Figma 429 until ~2026-09-28)

- [ ] T001 — Node inventory: `0:9486` payload captured (hero/rows/action/nav)
- [ ] T002 — Golden export: `tests/e2e/golden/0-9486-contact-info.png` (native 1x)
- [ ] T003 — Hero/action/row glyph SVGs exported
- [ ] T004 — Owner approval of clarified spec (entry / rows / title)

## Implementation

- [x] T005 — `CONTACT_ROWS` seed (hypothesis, G1 data-swap)
- [x] T006 — `features/contact-info/contact-page` scaffold: NavigationBar (Back→`/chat/:id`,
      title = contact name), hero (`contact-hero`/`contact-name`), Messages action
      (`contact-messages`), row list (`contact-list`/`contact-row`), no tab bar
- [x] T007 — `/contact/:id` lazy route (app.routes.ts)
- [x] T008 — ChatHeader identity button (avatar + titles, `chat-header__identity`, aria-label,
      `identity` output); chat-window wires identity → `['/contact', id]`
- [x] T009 — Unit `contact-page.spec.ts`; `chat-header.spec.ts` identity cases;
      `chat-window-page.spec.ts` identity navigation
- [x] T010 — E2E `tests/e2e/contact-info.spec.ts`: US1/US2/US3 (+ golden `0-9486-contact-info.png`);
      `chat-window.spec.ts` focus-tab budget 12 → 13
- [x] T011 — Responsive: no-overflow cases for `/contact/chat-001` appended
- [ ] T012 — Golden: unskip `0-9486-contact-info.png`, measure baseline, ship `maxDiffPixelRatio =
      measured + 0.05` — PENDING T002
- [ ] T013 — Capture retro-fit: replace seed rows/hero/phone from node inventory — PENDING T001/T004

## Closure

- [x] T014 — build + unit + e2e green
- [x] T015 — `figma/design-map.md` row 15 -> implemented + spec `015`; spec/tasks statuses
- [x] T016 — secrets scan clean; working tree clean; commits (spec set / feat / docs)