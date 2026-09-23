# Tasks: WhatsApp Status — Compose

**Input**: Design docs from `specs/007-status-compose/` (spec, plan, research, contracts)

**Prerequisites**: owner clarifications resolved (spec Clarifications 1-5); plan.md (required),
spec.md (required), research.md, contracts/ui-contracts.md

**Tests**: Unit + E2E/visual explicitly required (validation targets in spec).

**Organization**: Tasks grouped by user story (US1-US3). Runs sequentially (low complexity).

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Golden asset, vector source, keyboard crop, swap list.

- [x] T001 Confirm golden `tests/e2e/golden/0-9634-status-compose.png` (Figma render `0:9634`,
      375x812 native) - saved 2026-09-23
- [x] T002 Capture `tests/e2e/golden/status-compose-top-actions.svg` (glyph vector source) and
      `status-compose-keyboard.png` (crop 375x291 of band y521-812) - saved 2026-09-23
- [x] T003 Record clarifications (1-5) in `research.md` / spec Clarifications - done 2026-09-23
- [x] T004 Enumerate swap list before editing: StatusPage camera/note no-op unit/e2e assertions
      (from `contracts/ui-contracts.md` "Swap list")

**Checkpoint**: Golden + assets present; clarifications recorded; swap list enumerated.

---

## Phase 2: Route + runtime asset

- [x] T005 Add `{ path: 'status/compose', loadComponent }` to `src/app/app.routes.ts`
- [x] T006 Copy `tests/e2e/golden/status-compose-keyboard.png` -> `public/status-compose-keyboard.png`

**Checkpoint**: `/status/compose` resolves; keyboard asset serves at `/status-compose-keyboard.png`.

---

## Phase 3: US1 - chrome + empty state

- [x] T007 `compose-page.ts`: `onClose` -> navigate `/status`; `onSend`/`onSendAlt` no-ops
- [x] T008 `compose-page.html`: top glyphs (X, text-bar, paper-plane) as labelled buttons; centred
      placeholder `Type a status` + caret; keyboard `<img>` pinned bottom; no tab bar/FAB/title
- [x] T009 `compose-page.scss`: `.compose` `#FF8A8C` full-bleed `overflow:hidden`; top row 16.5px /
      x19; placeholder 38px semibold centred at y211; keyboard absolute `bottom:0; width:100%`
- [x] T010 Unit `compose-page.spec.ts` (part): empty-state render, glyphs, placeholder/caret,
      keyboard src, no tab bar/FAB/title (written before T007-T009 where marked)

**Checkpoint**: US1 unit passes.

---

## Phase 4: US2 - feed entry + swaps

- [x] T011 Unit `compose-page.spec.ts` (part): Close -> `/status`; send-text/send/keyboard/placeholder
      no-navigation
- [x] T012 Wire `status-page.ts` `onCamera`/`onNote` -> navigate `/status/compose`
- [x] T013 Swap list: remap `status-page.spec.ts` camera/note no-op cases to `['/status/compose']`;
      keep Privacy + row no-ops (written before T012 where possible)
- [x] T014 E2E swaps: remap `tests/e2e/status.spec.ts` "camera/note/row are no-ops" case ->
      camera/note navigate `/status/compose`, Privacy/row keep URL

**Checkpoint**: US2 passing (feed entry + back + no-ops verified).

---

## Phase 5: US3 - a11y, focus, responsive, golden

- [x] T015 E2E `tests/e2e/status-compose.spec.ts` (part): US1 (compose chrome) + US2 (feed camera &
      note -> compose, Close back, no-ops) + US3 focus rings on Close/send glyphs
- [x] T016 Responsive: `/status/compose` no-overflow case appended to `tests/e2e/responsive.spec.ts`
- [x] T017 Golden `0-9634-status-compose.png` at 375x812 in default state; measure baseline diff, set
      `maxDiffPixelRatio` accordingly (expect ~0.04-0.08; keyboard band matches by construction)

**Checkpoint**: US1-US3 all passing.

---

## Phase 6: Golden + polish + closure

- [x] T018 Verify no secrets/credentials in diff; full suite: `npm run build` + unit + `npm run e2e`;
      record visual diff result
- [x] T019 Update `figma/design-map.md` row 7 to implemented; set spec status to Implemented; write
      session report per Review gate
- [x] T020 Commit (e.g. `feat(status-compose): implement WhatsApp Status compose (feature 007)`)

---

## Dependencies & Execution Order

- **Setup -> Route/asset -> US1 (must pass independently) -> US2 -> US3 -> Golden/Polish -> closure.**
- Write-first tests (T010/T011 plus E2E T014-T017) are authored before their implementation and must
  FAIL or report the golden-diff baseline before code lands.
- Commit after each logical group.

## Swap list (tests to remap - from T004)

- `src/app/features/status/status-page.spec.ts` - camera/note no-op cases -> `['/status/compose']`
  (Privacy + row stay no-op).
- `tests/e2e/status.spec.ts` - "camera/note/row are no-ops" case -> camera/note navigate; row stays.
- Unchanged: `calls-edit.spec.ts` tab-inert (edit guard), `focus.spec.ts` (buttons still exist),
  feature-006 `Status`-tab navigation tests.
