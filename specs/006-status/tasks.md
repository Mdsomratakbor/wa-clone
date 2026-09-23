# Tasks: WhatsApp Status — Feed

**Input**: Design docs from `specs/006-status/` (spec, plan, research, data-model, contracts)

**Prerequisites**: owner clarifications resolved (spec Clarifications 1-5); plan.md (required),
spec.md (required), research.md, data-model.md, contracts/ui-contracts.md

**Tests**: Unit + E2E/visual explicitly required (validation targets in spec).

**Organization**: Tasks grouped by user story (US1-US3). Runs sequentially (low complexity).

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Golden asset, clarifications, swap list.

- [x] T001 Confirm golden `tests/e2e/golden/0-8498-status.png` (Figma render `0:8498`, rescale to
      375x812) - saved 2026-09-23
- [x] T002 Record clarifications (1-5) in `research.md` / spec Clarifications - done 2026-09-23
- [x] T003 Capture swap list before editing: Chats/Calls unit tests asserting the Status stub
      (from `contracts/ui-contracts.md` "Swap list")

**Checkpoint**: Golden present; clarifications recorded; swap list enumerated.

---

## Phase 2: Route

- [ ] T004 Add `{ path: 'status', loadComponent }` to `src/app/app.routes.ts`

**Checkpoint**: `/status` resolves.

---

## Phase 3: US1 - chrome + feed

- [ ] T005 `status-page.ts`: `activeTab('status')`, `leading=[Privacy]`, `trailing=[]`, no-op
      handlers (`onNavAction`/`onRowActivate`/`onCamera`/`onNote`)
- [ ] T006 `status-page.html`: nav (title `Status`, leading `Privacy`), My Status row (avatar 58 +
      badge, name, subtitle, camera/note circles), tip, tab bar, stub branch for Camera/Settings
- [ ] T007 `status-page.scss`: `#EFEFF4` body; row 76px hairline separators, padding-left 13 / gap 9;
      badge absolute bottom-right; actions 36px `#EDEDFF` circles gap 16; tip 43px margin-top 35px
      padding-left 67px
- [ ] T008 Unit `status-page.spec.ts` (part): chrome + feed render, avatar initials, camera/note
      render, no FAB, Status tab active (written before T005-T007 where marked)

**Checkpoint**: US1 unit passes.

---

## Phase 4: US2 - routing + no-ops

- [ ] T009 Unit `status-page.spec.ts` (part): tab computation order; Chats->`/chats`, Calls->`/calls`,
      Camera/Settings stub, Status stay; Privacy/camera/note/row no-ops
- [ ] T010 Wire `chats-page.onTabSelect` `status` -> navigate `/status` (edit guard first)
- [ ] T011 Wire `calls-page.onTabSelect` `status` -> navigate `/status` (edit guard first)
- [ ] T012 Swap list: remap `chats-page.spec.ts` + `calls-page.spec.ts` Status-stub unit tests to
      `['/status']` navigation (written before T010/T011 where possible)
- [ ] T013 E2E `tests/e2e/status.spec.ts` (part): US2 routing (`/status` <-> `/chats`/`/calls`,
      Camera/Settings stub, Status stays) + no-ops (URL unchanged)

**Checkpoint**: US2 passing.

---

## Phase 5: US3 - a11y, focus, responsive, golden

- [ ] T014 E2E focus: visible ring on `Privacy` + `status-camera` + `status-note` via Tab loop
- [ ] T015 Responsive: `/status` no-overflow case appended to `tests/e2e/responsive.spec.ts`
- [ ] T016 Golden `0-8498-status.png` at 375x812 in default state; measure baseline diff, set
      `maxDiffPixelRatio` accordingly (expect ~0.10-0.12 band like 004/005)

**Checkpoint**: US1-US3 all passing.

---

## Phase 6: Golden + polish + closure

- [x] T017 Verify no secrets/credentials in diff; full suite: `npm run build` + unit + `npm run e2e`;
      record visual diff result
- [x] T018 Update `figma/design-map.md` row 6 to implemented; set spec status to Implemented; write
      session report per Review gate
- [x] T019 Commit (e.g. `feat(status): implement WhatsApp Status feed (feature 006)`)

---

## Dependencies & Execution Order

- **Setup -> Route -> US1 (must pass independently) -> US2 -> US3 -> Golden/Polish -> closure.**
- Write-first tests (T008/T009 plus E2E T013-T016) are authored before their implementation and must
  FAIL or report the golden-diff baseline before code lands.
- Commit after each logical group.

## Swap list (tests to remap - from T003)

- `src/app/features/chat-list/chats-page.spec.ts` - Status-tab stub assertion -> `['/status']`.
- `src/app/features/calls/calls-page.spec.ts` - Status-tab stub test -> `['/status']`.
- E2E `calls-edit.spec.ts` tab-inert test clicks Status while editing (guard) - no change. Verify
  `focus.spec.ts` has no Status-stub assertion.