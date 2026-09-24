# Tasks: WhatsApp New Chat (Add) Modal (feature 009)

**Input**: Design docs from `specs/009-new-chat-modal/` (spec, plan, research, contracts)

**Prerequisites**: Figma node capture (research "Node inventory" filled, PENDING markers dropped);
owner clarifications resolved (spec Clarifications 1-5, gate G1); plan.md, spec.md,
contracts/ui-contracts.md (required)

**Tests**: Unit + E2E/visual explicitly required (validation targets in spec).

**Organization**: Tasks grouped by user story (US1-US3) + shared-component phase. Runs
sequentially; write-first tests precede each implementation.

**External dependency**: Figma REST (node GET **and** download) is 429-limited until ~2026-09-28
(re-confirmed 2026-09-24, retry-after ≈ 345k s). T001-T004 are the capture gate; everything after
G1 depends on them. No implementation before G1.

## Phase 1: Capture & contracts (BLOCKED until ~09-28)

- [ ] T001 Capture node inventory: `figma_get_figma_data` `0:9072` (+ walk children) depth ≈ 6;
      record into `research.md`; verify shared group `0:9075` against `0:10087`/`0:9778` -
      BLOCKED: Figma 429 (~09-28); retry MCP then Composio
- [ ] T002 Golden `tests/e2e/golden/0-9072-add-modal.png` (node `0:9072`, native 1x) -
      BLOCKED: Figma 429
- [ ] T003 Row glyph SVGs (from per-row icon nodes; export to `tests/e2e/golden`) -
      BLOCKED: Figma 429
- [ ] T004 `contracts/ui-contracts.md`: `Action` row model + `ActionSheetComponent` input/output
      contract + exact geometry/type values from node inventory

**Checkpoint**: G1 — owner approval of Clarifications 1-5. Assets present or explicitly deferred.

---

## Phase 2: Shared component (contract basis for rows 9/10/11)

- [ ] T005 `action-sheet.model.ts`: `Action { id: string; label: string; icon?: string }` (icon ref
      resolved by the sheet; exact color/geometry from T004)
- [ ] T006 Unit `action-sheet.spec.ts` (write-first): renders rows from `Action[]`; emits
      `action(id)`; backdrop tap emits `dismiss`; no hard-coded labels; sheet data-testids
- [ ] T007 `shared/components/action-sheet/{action-sheet.ts,html,scss}`: dimmed backdrop + bottom
      sheet; rows as real `<button>`s; a11y roles/labels; geometry from T004

**Checkpoint**: shared component unit-green in isolation.

---

## Phase 3: Add Modal instance + entry (US1 + US2)

- [ ] T008 `features/new-chat-modal/add-modal.{ts,html,scss}`: 009 rows (labels/order from T001)
      feeding the shared `action-sheet`; `dismiss` -> close
- [ ] T009 `chats-page.ts:105-107`: replace `onFabPressed()` TODO no-op with open-modal logic;
      `chats-page.html`: host the modal atop the routed content (inside shell content area)
- [ ] T010 Unit extension `chats-page.spec.ts` (write-first): FAB press opens sheet; row
      activation emits id; dismiss closes and focus returns to trigger
- [ ] T011 E2E `tests/e2e/add-modal.spec.ts` (write-first, part): US1 FAB opens sheet (backdrop +
      sheet visible); US2 rows labeled and focusable

**Checkpoint**: US1/US2 unit + e2e passing.

---

## Phase 4: US3 - a11y, focus, responsive, golden

- [ ] T012 E2E (part): backdrop tap dismisses; focus returns to FAB; Escape dismisses (if in
      design)
- [ ] T013 Responsive: append `/chats` FAB-modal no-overflow cases (open + close) to
      `tests/e2e/responsive.spec.ts` (all 3 breakpoints)
- [ ] T014 Golden `0-9072-add-modal.png`: open modal in default state; measure baseline diff, set
      `maxDiffPixelRatio = measured + 0.05` (gated on T002)

**Checkpoint**: US1-US3 all passing.

---

## Phase 5: Polish + closure

- [ ] T015 Verify no secrets/credentials in diff; full suite: `npm run build` + unit + `npm run e2e`;
      record visual diff result
- [ ] T016 Update `figma/design-map.md` row 9 to implemented + spec `009`; set spec status to
      Implemented; write session report per Review gate
- [ ] T017 Commit (e.g. `feat(new-chat-modal): implement WhatsApp New Chat (Add) Modal
      (feature 009)`)

---

## Dependencies & Execution Order

- **Capture (T001-T004) -> G1 -> shared component (T005-T007) -> Add Modal + entry (T008-T011) ->
  US3 (T012-T014) -> polish/closure (T015-T017).**
- Write-first tests (T006, T010, T011) are authored before their code and must FAIL before the
  implementation lands.
- Asset-gated tasks (T002/T003/T014) wait on the 429 retry (see plan's retry strategy). No code
  before G1.

## Swap list (places that may already reference the FAB / new-chat flow)

- `chats-page.ts:105-107` `onFabPressed()` — the declared no-op TODO (`F-001: new-chat action
  sheet is a later feature.`) is this feature's entry point; replace at T009.
- Search for other FAB no-op assertions (`fab` in `chats-page`/`responsive`/smoke specs) and update
  at T009 if present.
- Row destinations (new group etc.) explicitly stay out of scope (spec Non-Goals).