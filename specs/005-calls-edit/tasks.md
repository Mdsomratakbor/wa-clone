# Tasks: WhatsApp Calls Edit Mode

**Input**: Design docs from `specs/005-calls-edit/` (spec, plan, research, data-model, contracts)

**Prerequisites**: owner clarifications resolved (spec Clarifications 1-4); plan.md (required), spec.md (required), research.md, data-model.md, contracts/ui-contracts.md

**Tests**: Unit + E2E/visual explicitly required (Validation Targets in spec).

**Organization**: Tasks grouped by user story (US1-US3) for independent implementation/testing. Tests written first where marked.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 (enter/exit edit mode), US2 (remove calls), US3 (chrome stability)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Golden asset, clarifications, swap list.

- [x] T001 Confirm golden `tests/e2e/golden/0-8597-calls-edit.png` (Figma render `FIGMA_DOWNLOAD_FIGMA_IMAGES` of node `0:8597`, scale 1) - already saved 2026-09-23
- [x] T002 Record clarifications (1-4) in `research.md` / spec Clarifications - done 2026-09-23
- [x] T003 Capture swap list before editing: `calls.spec.ts` + `calls-page.spec.ts` assertions treating `Edit` as a no-op (from `contracts/ui-contracts.md` "E2E swap list")

**Checkpoint**: Golden present; clarifications recorded; swap list enumerated.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: nav-bar disabled support + CallListItem edit mode.

- [x] T004 Extend `NavAction` with optional `disabled?: boolean` in `chat-list/chat.model.ts`
- [x] T005 Extend `NavigationBar` template (render `[disabled]`) + scss (`:disabled` `#C7C7CC`) + unit cases (T010)
- [x] T006 Extend `CallListItem`: `editMode` input, `remove` output, red-minus SVG (path from Figma `0:8606`), shifted content, hidden info button + unit cases (T009 written first, FAIL before behaviour)

**Checkpoint**: Extensions compile + unit-tested.

---

## Phase 3: US1 - Enter / exit edit mode (P1)

**Goal**: `Edit` enters edit mode, `Done` exits to the exact 004 state.

**Independent Test**: `npm test` + `npm run e2e` - header flips, minus circles x12, info buttons hidden, then restored.

- [x] T007 `CallsPage`: `editMode` signal, `items` working copy, computed leading/trailing actions, `onNavAction` (`edit`/`done`), header markup (`Done`/`Clear`), empty-state block in template
- [x] T008 E2E `tests/e2e/calls-edit.spec.ts` (part): `/calls` -> `Edit` -> asserts `Done`, `Clear`, 12 `call-remove` circles, 0 info buttons, tab bar present with `Calls` active; `Done` -> restores `Edit`, `+ new call`, info buttons
- [x] T009 Unit `CallListItem` editMode cases + `CallsPage` enter/exit cases (written before T006/T007 where marked)

**Checkpoint**: US1 unit + E2E targets pass.

---

## Phase 4: US2 - Remove call entries (P1)

**Goal**: minus removes one row; `Clear` empties; empty state; guards.

- [x] T010 Unit `NavigationBar` disabled-action case + `CallsPage` removal/clear/empty/no-op/guard cases
- [x] T011 Wire `(remove)` -> `onCallRemove` + `onCallSelected`edit-mode guard in `CallsPage` (T010 written first)
- [x] T012 E2E: minus tap removes exactly one row (count 11); `Clear` empties (count 0); `No calls` empty state + disabled `Clear`; `Done` after removal restores normal mode with the reduced list; row-body tap no-op in edit mode

**Checkpoint**: US2 passing.

---

## Phase 5: US3 - Edit-mode chrome stability (P2)

**Goal**: tabs inert while editing; segmented static; focus; no overflow.

- [x] T013 E2E: while editing, activating `Status`/`Chats`/`Camera`/`Settings` tabs does not navigate or swap the stub (Calls stays active)
- [x] T014 E2E focus: tab ring over `Done`/`Clear` (non-disabled) + minus circles with visible indicators
- [x] T015 Responsive: `/calls` edit-mode no-overflow case appended to `tests/e2e/responsive.spec.ts`

**Checkpoint**: US1-US3 all passing.

---

## Phase 6: Golden + polish + closure

**Purpose**: visual validation, cross-spec remap, record.

- [x] T016 Screenshot `0-8597-calls-edit.png` at 375x812 in default edit state (nothing removed); measure baseline diff, set `maxDiffPixelRatio` accordingly (expect ~0.10 band like 004) — measured 0.11, threshold 0.16
- [x] T017 Swap list execution: update `calls.spec.ts` + `calls-page.spec.ts` (Edit no longer a no-op); re-run full suite
- [x] T018 Verify no secrets/credentials in diff; full suite: `npm run build` + `npm test` + `npm run e2e`; record visual diff result — build green, unit 79/79, e2e 144/144
- [x] T019 Update `figma/design-map.md` row 005; set spec status to Implemented; write session report per Review gate

---

## Dependencies & Execution Order

- **Setup -> Foundational -> US1 (must pass independently) -> US2 -> US3 -> Golden/Polish+Remap.**
- Write-first tests (T009/T010 plus E2E T008/T012-T015) are authored before their implementation and must FAIL or report the golden-diff baseline before code lands.
- Within each story: models/contracts first, components, page integration, then E2E.
- Commit after each task or logical group (Feature -> Spec -> Task -> Impl -> Test traceability).

## Implementation Strategy

1. Resolve clarifications -> complete Phase 1-2 (foundation) -> checkpoint.
2. US1 only -> test -> demo (MVP: the calls list flips into edit mode).
3. Add US2 (removal) -> test; add US3 (chrome stability) -> test; Golden -> validation report.
4. STOP and await approval after each milestone.

## Swap list (feature-004 tests to remap - from T003)

- `tests/e2e/calls.spec.ts` "all header and row controls are no-ops": drop `Edit` from the no-op set (it enters edit mode); keep `+ new call`, row activation, info button no-ops.
- `src/app/features/calls/calls-page.spec.ts` no-ops test: same remap; new edit-mode unit cases supersede it.