# Tasks: WhatsApp Starred Messages (feature 008)

**Input**: Design docs from `specs/008-starred-messages/` (spec, plan, research, contracts)

**Prerequisites**: owner clarifications resolved (spec Clarifications 1-5); plan.md (required),
spec.md (required), research.md, contracts/ui-contracts.md

**Tests**: Unit + E2E/visual explicitly required (validation targets in spec).

**Organization**: Tasks grouped by user story (US1-US3). Runs sequentially (low complexity).

**External dependency**: Figma REST download + user token are 429-limited (~4.4 days, retry from
~2026-09-28). Assets (T001-T003) are deferred and gate only the tasks that consume them.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Golden asset, chevron vector, avatar raster + runtime crop.

- [ ] T001 Capture golden `tests/e2e/golden/0-8820-starred-messages.png` (node `0:8820`, 375x812
      native) - BLOCKED: Figma 429 until ~09-28 (retry MCP + Composio)
- [ ] T002 Capture `tests/e2e/golden/starred-messages-back-chevron.svg` (node `0:8825`, vector) -
      BLOCKED: Figma 429
- [ ] T003 Capture `tests/e2e/golden/starred-messages-avatar.png` (node `0:8852`, raster) and copy
      to `public/starred-messages-avatar.png` - BLOCKED: Figma 429

**Checkpoint**: Assets present or explicitly deferred with retry date recorded.

---

## Phase 2: Route + chrome (US1)

- [x] T004 Add `{ path: 'starred-messages', loadComponent: StarredPage }` to `src/app/app.routes.ts`
- [x] T005 Unit `starred-page.spec.ts` (write-first): nav bar present, title "Starred Messages",
      leading Back action labelled "Settings"; no tab bar/FAB; Back click -> navigate `['/settings']`
- [x] T006 `starred-page.ts`: lazy component injecting Router; `onBack()` -> navigate `/settings`
- [x] T007 `starred-page.html`: `app-navigation-bar` with `[title]="'Starred Messages'"`
      `[leading]="[{ id: 'back', label: 'Settings', icon: 'back' }]"` and `(action)="onBack()"`
- [x] T008 `starred-page.scss`: surface flat `#EFEFF4` full height; no extra chrome
- [x] T009 E2E `tests/e2e/starred.spec.ts` (write-first, part): `/starred-messages` renders nav bar
      (Back + title), body area; no tab bar/FAB/title-stub

**Checkpoint**: US1 unit + e2e passing (golden excluded).

---

## Phase 3: Settings stub (Clarification 1 recommended default)

- [x] T010 Add `{ path: 'settings', loadComponent: SettingsStubPage }` route
- [x] T011 `settings-stub-page`: nav bar "Settings" + placeholder body; Back -> `/starred-messages`
- [x] T012 Unit `settings-stub-page.spec.ts`: title "Settings", placeholder body, Back navigation
- [x] T013 E2E: `/settings` reachable from `/starred-messages` Back; stub Back returns
      `/starred-messages`

**Checkpoint**: back flow real and covered.

---

## Phase 4: US2 - empty-state tip

- [x] T014 Tip markup: avatar (plain decorative `<img src="/starred-messages-avatar.png" alt=""
      aria-hidden>` size 132, per Clarification 3 + FR-005) + header "No Starred Messages" +
      helper copy (real text)
- [x] T015 `starred-page.scss`: tip block geometry from research.md (outer x24 y336 327x230;
      avatar centred; header 16px semibold rgba(60,60,67,0.6); helper 14px regular rgba(60,60,67,0.6)
      centred, two-line wrap) - absolute tip at page body top 248px (= design y336 - status 44 -
      nav 44), left 50% translateX(-50%), width 327px
- [x] T016 Unit (part): tip renders header + helper copy verbatim; avatar has alt=""

**Checkpoint**: US2 unit passes.

---

## Phase 5: US3 - a11y, focus, responsive, golden

- [x] T017 E2E `starred.spec.ts` (part): focus ring on Back (Tab loop); helper copy visible
- [x] T018 Responsive: append `/starred-messages` + `/settings` no-overflow cases to
      `tests/e2e/responsive.spec.ts`
- [ ] T019 Chevevron glyph: land exact path from `starred-messages-back-chevron.svg` in the shared
      `app-navigation-bar` `back` affordance (after T002 capture) - TEMP SVG chevron in place now;
      swap exact path once T002 captured
- [ ] T020 Golden `0-8820-starred-messages.png` at 375x812 in default state; measure baseline diff,
      set `maxDiffPixelRatio = measured + 0.05` (expect small — chrome matches 004/005/006) -
      BLOCKED: golden test `.skip`'d until capture (~09-28)

**Checkpoint**: US1-US3 all passing.

---

## Phase 6: Golden + polish + closure

- [x] T021 Verify no secrets/credentials in diff; full suite: `npm run build` + unit + `npm run e2e`;
      record visual diff result - build green; unit 103/103; e2e 213 total -> 210 passed / 3 skipped
      (gated goldens); visual baseline measurement pending T020
- [x] T022 Update `figma/design-map.md` row 8 to implemented + spec `008`; set spec status to
      Implemented; write session report per Review gate
- [ ] T023 Commit (e.g. `feat(starred-messages): implement WhatsApp Starred Messages empty state
      (feature 008)`)

---

## Dependencies & Execution Order

- **Setup -> Route/chrome (US1) -> Settings stub (gate Clarification 1) -> Tip (US2) -> US3 ->**
  **Golden/Polish -> closure.**
- Write-first tests (T005, T009, T016-T018) are authored before their implementation and must FAIL
  or report the golden-diff baseline before code lands.
- Asset-gated tasks (T002/T003/T019/T020) wait on the Figma 429 retry; T001-T003 record the deferral
  and the plan's retry strategy. No implementation before G1 (owner approval of Clarifications 1-5).
- Commit after each logical group.

## Swap list (tests that may assert the starred/starred-messages route)

- None currently — no prior feature references a starred route or screen. Confirm nothing asserts
  `/starred*` in the wildcard-to-Chats fallback before landing the route (smoke spec).