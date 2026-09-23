# Tasks: WhatsApp Chat — Chat Window

**Input**: Design docs from `specs/002-chat-window/` (spec, plan, research, data-model, contracts)

**Prerequisites**: owner clarifications resolved (spec Clarifications 1–4); plan.md (required), spec.md (required), research.md, data-model.md, contracts/ui-contracts.md

**Tests**: Unit + E2E/visual explicitly required (Validation Targets in spec).

**Organization**: Tasks grouped by user story (US1–US3) for independent implementation/testing. Tests written first where marked.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 (thread/bubbles), US2 (header/back), US3 (composer)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Seed data, golden asset, and route scaffolding shared by all stories.

- [ ] T001 Create `Message`, `FileInfo`, `ContactHeader` models + `chat-window.seed.ts` in `src/app/features/chat-window/` (exact Figma thread copy from `data-model.md`, incl. date-chip row marker)
- [ ] T002 Capture Figma golden `tests/e2e/golden/0-8257-chat.png` (render of node `0:8257`, 375×812, same pipeline as `0-8855-chats.png`)
- [ ] T003 Confirm wallpaper approximation (Clarification 1) and avatar approach (Clarification 2) resolved; record resolved values in `research.md`

**Checkpoint**: Clarifications resolved; seed compiles; golden present.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The three shared primitives all stories depend on.

**⚠️ CRITICAL**: No user story work may begin until these compile (unit specs included here, per Testability principle).

- [ ] T004 Create `MessageBubble` in `src/app/shared/components/message-bubble/` (per contract: side, fills, time, ticks, wrap, file variant, shadow) + unit spec
- [ ] T005 Create `ChatHeader` in `src/app/shared/components/chat-header/` (back chevron, avatar via `UserAvatar`, name/subtitle, video/call no-op; `@Output() back`) + unit spec
- [ ] T006 Create `Composer` in `src/app/shared/components/composer/` (＋ input emoji camera mic; real input, no placeholder; no-op controls) + unit spec

**Checkpoint**: Shared primitives compile + pass unit tests.

---

## Phase 3: User Story 1 — Read the conversation thread (P1) 🎯 MVP

**Goal**: `/chat/:id` renders the 13-message thread with date chip and wallpaper.

**Independent Test**: `npm test` + `npm run e2e` — thread renders; visual diff vs golden recorded.

### Tests for User Story 1 (write first, ensure they FAIL before implementation)

- [ ] T007 [US1] `ChatWindowPage` unit spec (seed thread order/count, empty → wallpaper-only, route param resolution, avatar fallback)
- [ ] T008 [P] [US1] E2E `tests/e2e/chat-window.spec.ts`: at 375×812 assert header copy, date chip `Fri, Jul 26`, 13 messages with correct side classes, composer; screenshot vs `golden/0-8257-chat.png`

### Implementation for User Story 1

- [ ] T009 [US1] `ChatWindowPage` in `src/app/features/chat-window/chat-window-page.ts` (renders wallpaper layer, `ChatHeader`, thread of `MessageBubble[]` + date chip, `Composer`, `StatusBar`/`HomeIndicator`) + SCSS
- [ ] T010 [P] [US1] Route wiring: `app.routes.ts` — lazy `/chat/:id` → `ChatWindowPage` (FR-008)

**Checkpoint**: thread renders end-to-end; unit + E2E US1 targets pass.

---

## Phase 4: User Story 2 — Chat header + Back (P2)

**Goal**: Header actions render; `Back` navigates to `/chats`.

- [ ] T011 [US2] Integrate `ChatHeader` into `ChatWindowPage`; wire `back` → router `/chats`
- [ ] T012 [P] [US2] E2E: `ChatsPage` row `chat-006` activation navigates to `/chat/chat-006`; `Back` returns to `/chats`
- [ ] T013 [P] [US2] E2E focus test: tab through header icons → visible focus indicator (accessibility default)

**Checkpoint**: US2 passing; keyboard-focus green.

---

## Phase 5: User Story 3 — Composer (P3)

**Goal**: Composer renders per Figma; controls focusable; input accepts typing locally.

- [ ] T014 [US3] Integrate `Composer` into `ChatWindowPage` (no send behaviour; typed text stays local)
- [ ] T015 [P] [US3] E2E focus test: tab through composer controls; type in input → text visible, no send/overflow

**Checkpoint**: US1–US3 all passing; E2E keyboard-focus green.

---

## Phase 6: Responsive drift + polish

**Purpose**: owner-approved breakpoints (plan §Breakpoints); cross-cutting quality.

- [ ] T016 [P] E2E responsive check in `tests/e2e/responsive.spec.ts` (append chat-window case): viewports 800px + 1440px → centered shell (max-width 480px), scrollWidth ≤ clientWidth
- [ ] T017 Verify no secrets/credentials in diff; `npm audit` clean
- [ ] T018 Run full suite: `npm test` + `npm run build` + `npm run e2e`; record visual diff result
- [ ] T019 Update `figma/design-map.md` row 002 → implemented; write session report per Review gate

---

## Dependencies & Execution Order

- **Setup → Foundational → US1 (must pass independently) → US2 → US3 → Polish.**
- US2/US3 depend only on Foundational + US1 shell; can run after the US1 checkpoint.
- Tests marked writable-first (T007–T008, T012–T013, T015–T016) are authored before their implementation task and must FAIL or report the golden-diff baseline before code lands.
- Within each story: models/contracts first, components, integration, then E2E.
- Commit after each task or logical group (Feature → Spec → Task → Impl → Test traceability).

## Implementation Strategy

1. Resolve clarifications → complete Phase 1–2 (foundation) → checkpoint.
2. US1 only → test → demo (MVP: static thread).
3. Add US2 → test; add US3 → test; Polish → validation report.
4. STOP and await approval after each milestone.