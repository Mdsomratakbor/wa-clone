# Tasks: WhatsApp Calls Screen

**Input**: Design docs from `specs/004-calls/` (spec, plan, research, data-model, contracts)

**Prerequisites**: owner clarifications resolved (spec Clarifications 1-6); plan.md (required), spec.md (required), research.md, data-model.md, contracts/ui-contracts.md

**Tests**: Unit + E2E/visual explicitly required (Validation Targets in spec).

**Organization**: Tasks grouped by user story (US1-US3) for independent implementation/testing. Tests written first where marked.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 (Calls list renders), US2 (chrome + navigation), US3 (static controls)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Golden asset, shared model/geometry scaffolding.

- [ ] T001 Confirm golden `tests/e2e/golden/0-10395-calls.png` (Figma render `FIGMA_DOWNLOAD_FIGMA_IMAGES` of node `0:10395`, scale 1) - already saved 2026-09-23
- [ ] T002 Record clarifications (1-6) in `research.md` / spec Clarifications - done 2026-09-23

**Checkpoint**: Golden present; clarifications recorded.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: model + seed + shared tokens + nav-bar extension.

- [ ] T003 Add `--wa-call-row-height: 56px` + `--wa-fs-control: 13px` to `_tokens.scss`
- [ ] T004 Create `features/calls/calls.model.ts` (`CallDirection`, `CallEntry`, direction label map) + `calls.seed.ts` (12 rows per data-model)
- [ ] T005 Extend `NavAction` with optional `icon?: 'new-call'` in `chat-list/chat.model.ts`
- [ ] T006 Extend `NavigationBar`: optional `title`, `[data-nav-center]` slot, icon-only action rendering (phone-plus `#007AFF`, path from Figma `0:10630`) + extend its unit spec (T008)

**Checkpoint**: Primitives compile + unit-tested.

---

## Phase 3: US1 - Calls list (P1)

**Goal**: the seeded 12-row list with correct row rendering.

**Independent Test**: `npm test` + `npm run e2e` - 12 rows with exact strings, direction labels, missed red names.

- [ ] T007 Create `CallListItem` in `src/app/shared/components/call-list-item/` (avatar 40, name/date line, glyph+direction line, info button; missed class; `role="button"`; emits `selected`/`info` with `stopPropagation` on info) + unit spec (T009 written first, FAIL before behaviour)
- [ ] T010 E2E `tests/e2e/calls.spec.ts`: `/calls` asserts 12 rows (names `Martin Randolph`...`Jamie Franco`, dates, direction labels), no FAB

**Checkpoint**: US1 unit + E2E targets pass.

---

## Phase 4: US2 - Chrome + navigation (P1)

**Goal**: `/calls` route, active `Calls` tab, `chats`<->`calls` tab navigation, stub for other tabs.

- [ ] T011 Create `CallsPage` (header via nav-bar with centre-slot segmented control; list; tab bar active `calls`; `Chats` tab -> `/chats`; other tabs -> stub) + route in `app.routes.ts` + unit spec (T013)
- [ ] T012 Wire `ChatsPage` `Calls` tab -> `router.navigate(['/calls'])`; other tabs unchanged
- [ ] T014 E2E: on `/chats` activate `Calls` tab -> URL `/calls`; on `/calls` activate `Chats` tab -> URL `/chats`

**Checkpoint**: US2 passing.

---

## Phase 5: US3 - Static controls (P2)

**Goal**: header renders `Edit` + static segmented control + `+ new call`; all controls no-op.

- [ ] T015 Segmented control markup + styles (static, `All` active, disabled buttons) projected via `[data-nav-center]`
- [ ] T016 E2E: assert header elements (`Edit`, `filter-all` active, `filter-missed`, `new-call` button); activate each + rows + info -> no URL change / no state change
- [ ] T017 E2E focus: tab ring order over nav actions, segments (disabled - skipped), rows, info buttons ; append to `tests/e2e/focus.spec.ts`
- [ ] T018 Responsive overflow check for `/calls` appended to `tests/e2e/responsive.spec.ts`

**Checkpoint**: US1-US3 all passing.

---

## Phase 6: Golden + polish + closure

**Purpose**: visual validation and record.

- [ ] T019 Screenshot `0-10395-calls.png` at 375x812 with documented `maxDiffPixelRatio`; record baseline + drift
- [ ] T020 Verify no secrets/credentials in diff; `npm audit` clean
- [ ] T021 Run full suite: `npm run build` + `npm test` + `npm run e2e`; record visual diff result
- [ ] T022 Update `figma/design-map.md` row 004; set spec status to Implemented; write session report per Review gate

---

## Dependencies & Execution Order

- **Setup -> Foundational -> US1 (must pass independently) -> US2 -> US3 -> Golden/Polish.**
- Write-first tests (T009, T013 plus E2E T010/T014/T016-T018) are authored before their implementation and must FAIL or report the golden-diff baseline before code lands.
- Within each story: models/contracts first, components, integration, then E2E.
- Commit after each task or logical group (Feature -> Spec -> Task -> Impl -> Test traceability).

## Implementation Strategy

1. Resolve clarifications -> complete Phase 1-2 (foundation) -> checkpoint.
2. US1 only -> test -> demo (MVP: the static calls list renders).
3. Add US2 (navigation) -> test; add US3 (static controls) -> test; Golden -> validation report.
4. STOP and await approval after each milestone.