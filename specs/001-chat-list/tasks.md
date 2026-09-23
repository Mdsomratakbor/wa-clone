# Tasks: WhatsApp Chats — Chat List

**Input**: Design docs from `specs/001-chat-list/` (spec, plan, research, data-model, contracts)

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/ui-contracts.md

**Tests**: Unit + E2E/visual explicitly required (Validation Targets in spec).

**Organization**: Tasks grouped by user story (US1–US3) for independent implementation/testing. Tests written first where marked.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 (list), US2 (tabs), US3 (header actions/FAB)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Tokens, models, and test scaffolding shared by all stories.

- [x] T001 Create SCSS design tokens in `src/app/core/tokens/_tokens.scss` (colors, typography, spacing, effects, breakpoints per `figma/design-analysis.md §6.4` + plan) + import in `src/styles.scss`
- [x] T002 Create models + seed data in `src/app/features/chat-list/`: `chat.model.ts` (`ChatPreview`, `TabItem`, `TabKey`) and `chat-list.seed.ts` (9 rows, exact Figma strings from `data-model.md`)
- [x] T003 Verify Playwright scaffold: `tests/e2e/` dir + `0-8855-chats.png` golden present; `npm run e2e` runs a trivial smoke test

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared primitives required by all user stories.

**⚠️ CRITICAL**: No user story work may begin until these compile (unit tests for shared components included here, per Testability principle).

- [x] T004 Create `UserAvatar` in `src/app/shared/components/avatar/` (inputs `src`/`name`/`size`; initials fallback; `role="img"` + `aria-label`) + unit spec
- [x] T005 Create `ChatListItem` in `src/app/shared/components/chat-list-item/` (per contract; name 16/600, preview+time 14/400 #8E8E93, hairline separator; `@Output() selected`) + unit spec
- [x] T006 Create `StatusBar` + `HomeIndicator` in `src/app/core/layout/` (static `9:41`, iOS style) — no spec needed (opaque static markup)

**Checkpoint**: Shared primitives compile + pass unit tests.

---

## Phase 3: User Story 1 — Browse my chat list (P1) 🎯 MVP

**Goal**: The Chats screen renders the 9-row list with nav bar, tab bar, FAB, empty-state placeholder.

**Independent Test**: `npm test` + `npm run e2e` — 9 rows visible at 375px; visual diff vs golden recorded.

### Tests for User Story 1 (write first, ensure they FAIL before implementation)

- [x] T007 [US1] `NavigationBar` unit spec in `src/app/shared/components/navigation-bar/` (title/actions render, focus)
- [x] T008 [US1] `Fab` unit spec in `src/app/shared/components/fab/`
- [x] T009 [US1] `ChatsPage` unit spec in `src/app/features/chat-list/` (row count = 9; empty input → empty-state placeholder; not render unsafe content)
- [x] T010 [P] [US1] E2E spec `tests/e2e/chats.spec.ts`: at 375×812 assert 9 rows, `Chats` title, `Edit`, `Broadcast Lists`, `New Group`, 5 tab labels, FAB present; screenshot compared to `tests/e2e/golden/0-8855-chats.png`

### Implementation for User Story 1

- [x] T011 [US1] `NavigationBar` component (contract) in `src/app/shared/components/navigation-bar/`
- [x] T012 [US1] `Fab` component (contract) in `src/app/shared/components/fab/`
- [x] T013 [US1] `ChatsPage` in `src/app/features/chat-list/chats-page.ts` (consumes seed, renders `ChatListItem[]`, empty-state placeholder, echoes `selected`) + SCSS
- [x] T014 [US1] Wire router: `app.routes.ts` — `/` redirect→ `chats`; lazy-load `ChatsPage` (FR-008)
- [x] T015 [US1] `app-shell` layout in `src/app/core/layout/` hosting StatusBar + router outlet (mobile first)

**Checkpoint**: Chats page renders end-to-end; unit + E2E US1 targets pass.

---

## Phase 4: User Story 2 — Top-level navigation (P2)

**Goal**: 5-item tab bar with active-state toggling; non-chats tabs show "coming soon" stub (FR-010).

- [x] T016 [US2] `TabBar` unit spec (active toggle, aria-selected, roving tabindex)
- [x] T017 [US2] `TabBar` component in `src/app/shared/components/tab-bar/` (per contract; `items`, `activeKey`, `@Output() select`; active `#007AFF`, inactive `#545458`)
- [x] T018 [US2] Integrate `TabBar` into `ChatsPage` + "coming soon" stub for non-chats selection (no routing)

**Checkpoint**: Tab switching updates active state; stub renders. Unit spec passes.

---

## Phase 5: User Story 3 — Header actions (P3)

**Goal**: `Edit`/`Broadcast Lists`/`New Group` render + keyboard focus affordance (no navigation wiring in 001).

- [x] T019 [P] [US3] E2E focus test: tab through nav actions → visible focus indicator (accessibility default)
- [x] T020 [US3] Wire nav-bar actions into `ChatsPage` (FR-003, per contract) + confirm FAB pressed affordance

**Checkpoint**: US1–US3 all passing; E2E keyboard-focus green.

---

## Phase 6: Responsive drift + polish

**Purpose**: Owner-approved breakpoints (plan §Breakpoints); cross-cutting quality.

- [x] T021 [P] E2E responsive check in `tests/e2e/responsive.spec.ts`: viewports 800px + 1440px → centered shell (max-width 480px), scrollWidth ≤ clientWidth (no horizontal overflow)
- [x] T022 Verify no secrets/credentials in diff; `npm audit` clean for new dev-dep (Security principle)
- [x] T023 Run full suite: `npm test` + `npm run build` + `npm run e2e`; record visual diff result
- [x] T024 Update `figma/design-map.md` row 001 → status implemented; write session report per Review gate

---

## Dependencies & Execution Order

- **Setup → Foundational → US1 (must pass independently) → US2 → US3 → Polish.**
- US2/US3 depend only on Foundational + US1 shell; can run after US1 checkpoint.
- Tests marked writable-first (T007–T010, T016, T019, T021) are authored before their implementation task and must FAIL or report the golden-diff baseline before code lands.
- Within each story: models/contracts first, components, integration, then E2E.
- Commit after each task or logical group (Feature → Spec → Task → Impl → Test traceability).

## Implementation Strategy

1. Complete Phase 1–2 (foundation) → checkpoint.
2. US1 only → test → demo (MVP: static Chats screen).
3. Add US2 → test; add US3 → test; Polish → validation report.
4. STOP and await approval after each milestone.