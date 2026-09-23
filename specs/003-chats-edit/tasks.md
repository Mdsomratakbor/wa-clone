# Tasks: WhatsApp Chat List — Edit Mode

**Input**: Design docs from `specs/003-chats-edit/` (spec, plan, research, data-model, contracts)

**Prerequisites**: owner clarifications resolved (spec Clarifications 1–7); plan.md (required), spec.md (required), research.md, data-model.md, contracts/ui-contracts.md

**Tests**: Unit + E2E/visual explicitly required (Validation Targets in spec).

**Organization**: Tasks grouped by user story (US1–US3) for independent implementation/testing. Tests written first where marked.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 (mode entry/exit), US2 (selection), US3 (actions)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Golden asset, model/state scaffolding.

- [ ] T001 Capture Figma golden `tests/e2e/golden/0-8114-chats-edit.png` (render of node `0:8114`, 375×812, same pipeline as `0-8855`/`0-8257`)
- [ ] T002 Confirm clarifications (1–7) resolved and recorded in `research.md` / spec Clarifications

**Checkpoint**: Golden present; clarifications recorded.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The two primitives all stories depend on.

- [ ] T003 Create `ChatActionsBar` in `src/app/shared/components/chat-actions-bar/` (per contract: toolbar role, Archive/Read All/Delete order, disabled+gray at 0, accent/red at ≥1, outputs) + unit spec (T005 written alongside; FAIL before behaviour)
- [ ] T004 Extend `ChatListItem` (inputs `selectMode`, `checked`; circle SVG; checkbox semantics; padding shift) + extend its unit spec

**Checkpoint**: Both primitives compile + pass unit tests.

---

## Phase 3: User Story 1 — Edit mode entry/exit (P1)

**Goal**: `Edit` ↔ `Done` toggles circles + action bar, hiding FAB/tab bar.

**Independent Test**: `npm test` + `npm run e2e` — toggle transitions; visual diff vs golden recorded.

### Tests for User Story 1 (write first, ensure they FAIL before implementation)

- [ ] T005 [US1] `ChatsPage` unit spec additions (enter: Done + circles + bar, no FAB/tab; exit: 001 restored; selection cleared on both)
- [ ] T006 [P] [US1] E2E `tests/e2e/chats-edit.spec.ts`: at 375×812 `/` → `Edit` asserts `Done`, per-row circles, `chat-actions` bar, FAB/tab hidden; `Done` restores; screenshot vs `golden/0-8114-chats-edit.png`
- [ ] T007 [P] [US1] Update `tests/e2e/focus.spec.ts` FAB/nav test order (exit edit before FAB/row clicks) to keep green

### Implementation for User Story 1

- [ ] T008 [US1] `ChatsPage` edit state: `editing` signal, trailing `Edit`↔`Done`, view conditionals (bar vs tab/FAB)

**Checkpoint**: US1 unit + E2E targets pass.

---

## Phase 4: User Story 2 — Selection (P1)

**Goal**: per-row checkbox semantics + circle visuals toggle correctly.

- [ ] T009 [US2] Integrate `selectMode`/`checked` into `ChatsPage` rows + `selected: Set<id>`; row activation toggles in edit mode (no navigation)
- [ ] T010 [P] [US2] `ChatListItem` spec: circle present in selectMode, `aria-checked` reflects input, single emission on activate
- [ ] T011 [P] [US2] E2E: toggle via row and via circle; assert `aria-checked`; circle gets `select-circle--checked`

**Checkpoint**: US2 passing.

---

## Phase 5: User Story 3 — Actions (P2)

**Goal**: Delete/Archive remove selections; Read All no-op; empty state.

- [ ] T012 [US3] `ChatActionsBar` unit spec: disabled/emits at 0, enabled/colored + emits at ≥1
- [ ] T013 [US3] `ChatsPage` actions: `items` working copy; `onDelete`/`onArchive` remove selected + clear; `onReadAll` no-op; empty → `No chats`
- [ ] T014 [P] [US3] E2E: Archive 1 / Delete 2 rows; Read All no-op; all-deleted → `No chats`
- [ ] T015 [P] [US3] E2E focus: tab rings on circles + bar buttons
- [ ] T016 [P] Responsive overflow check for edit mode appended to `tests/e2e/responsive.spec.ts`

**Checkpoint**: US1–US3 all passing.

---

## Phase 6: Polish + closure

- [ ] T017 Verify no secrets/credentials in diff; `npm audit` clean
- [ ] T018 Run full suite: `npm test` + `npm run build` + `npm run e2e`; record visual diff result
- [ ] T019 Update `figma/design-map.md` row 003 → implemented; write session report per Review gate

---

## Dependencies & Execution Order

- **Setup → Foundational → US1 (must pass independently) → US2 → US3 → Polish.**
- Write-first tests (T005–T007, T010–T011, T012, T014–T016) are authored before their implementation and must FAIL or report the golden-diff baseline before code lands.
- Within each story: models/contracts first, components, integration, then E2E.
- Commit after each task or logical group (Feature → Spec → Task → Impl → Test traceability).

## Implementation Strategy

1. Resolve clarifications → complete Phase 1–2 (foundation) → checkpoint.
2. US1 only → test → demo (MVP: edit mode renders + toggles).
3. Add US2 → test; add US3 → test; Polish → validation report.
4. STOP and await approval after each milestone.