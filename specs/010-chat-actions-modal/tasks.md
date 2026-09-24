# Tasks: WhatsApp Chat Actions Modal (feature 010)

**Input**: Design docs from `specs/010-chat-actions-modal/` (spec, plan, research, contracts)

**Prerequisites**: Figma node capture (`0:10087` — research "Node inventory" filled, PENDING
markers dropped); owner clarifications resolved (spec Clarifications 1-5, gate G1); plan.md,
spec.md, contracts/ui-contracts.md (required)

**Tests**: Unit + E2E/visual explicitly required (validation targets in spec).

**Organization**: Tasks grouped by user story (US1-US3) + shared-component-reuse check. Runs
sequentially; write-first tests precede each implementation.

**External dependency**: Figma REST (node GET **and** download) is 429-limited until ~2026-09-28
(re-confirmed 2026-09-24, retry-after ≈ 345k s). T001-T004 are the capture gate; everything after
G1 depends on them. Structural implementation may start pre-capture only with owner approval.

## Phase 1: Capture & contracts (BLOCKED until ~09-28)

- [ ] T001 Capture node inventory: `npx -y figma-developer-mcp fetch --file-key
      PcGX72lSWkYIk3pL5V8PS3 --node-id 0:10087 --depth 6 --format json` (CLI; fallback: local MCP
      `get_figma_data`, then Composio `FIGMA_GET_FILE_NODES`); record into `research.md`; verify
      shared group `0:9075` values match the shipped 009 `action-sheet` (any delta = drift) -
      BLOCKED: Figma 429 (~09-28); retry MCP then Composio
- [ ] T002 Golden `tests/e2e/golden/0-10087-chat-actions.png` (node `0:10087`, native 1x) -
      BLOCKED: Figma 429
- [ ] T003 Glyph SVGs (per-row icons + the entry affordance; export to `tests/e2e/golden`) -
      BLOCKED: Figma 429
- [ ] T004 Confirm the entry affordance (glyph, header position, aria-label) + final row content;
      replace provisional seed in `contracts/ui-contracts.md`

**Checkpoint**: G1 — owner approval of Clarifications 1-5. Assets present or explicitly deferred.

---

## Phase 2: Reuse check + unit (write-first)

- [ ] T005 Verify the shared `action-sheet` contract is consumed unchanged; no churn to
      `shared/components/action-sheet/*`
- [ ] T006 Unit `chat-header.spec.ts` (extension): More-options affordance renders with
      aria-label + `data-testid`; activation emits `actions` (write-first, FAIL before impl)
- [ ] T007 Unit `chat-window-page.spec.ts` (extension): trigger opens sheet; row activation emits
      id; dismiss closes and focus returns to the trigger (write-first, FAIL before impl)

**Checkpoint**: unit-green in isolation before entry wiring.

---

## Phase 3: Entry + wiring (US1 + US2)

- [ ] T008 `chat-header.html/ts`: trailing More-options icon button + `actions` output (glyph/label
      provisional until T004; a11y label + `data-testid`)
- [ ] T009 `features/chat-window/chat-actions.*`: provisional `CHAT_ACTIONS` seed feeding the shared
      `action-sheet`; `dismiss` -> close
- [ ] T010 `chat-window-page.ts/html`: `chatActionsOpen` host + handlers + modal block; focus
      return to the trigger
- [ ] T011 E2E `tests/e2e/chat-actions.spec.ts` (write-first, part): US1 trigger opens sheet
      (backdrop + sheet visible); US2 rows labeled and focusable

**Checkpoint**: US1/US2 unit + e2e passing.

---

## Phase 4: US3 - a11y, focus, responsive, golden

- [ ] T012 E2E (part): backdrop tap dismisses; focus returns to trigger; Escape dismisses
- [ ] T013 Responsive: append `/chat/chat-001` chat-actions no-overflow cases (open + close) to
      `tests/e2e/responsive.spec.ts` (all 3 breakpoints)
- [ ] T014 Golden `0-10087-chat-actions.png`: open modal in default state; measure baseline diff,
      set `maxDiffPixelRatio = measured + 0.05` (gated on T002) - BLOCKED until capture + G1 rows

**Checkpoint**: US1-US3 all passing.

---

## Phase 5: Polish + closure

- [ ] T015 Verify no secrets/credentials in diff; full suite: `npm run build` + unit + `npm run e2e`;
      record visual diff result
- [ ] T016 Update `figma/design-map.md` row 10 to implemented + spec `010`; set spec status to
      Implemented; write session report per Review gate
- [ ] T017 Commit (e.g. `feat(chat-actions-modal): implement WhatsApp Chat Actions Modal
      (feature 010)`)

---

## Dependencies & Execution Order

- **Capture (T001-T004) -> G1 -> reuse/units (T005-T007) -> entry & wiring (T008-T011) ->
  US3 (T012-T014) -> polish/closure (T015-T017).**
- Write-first tests (T006, T007, T011) are authored before their code and must FAIL before the
  implementation lands.
- Shared `action-sheet` (from 009) is reused, not re-authored; any delta = drift (owner approval).
- Asset-gated tasks (T002/T003/T014) wait on the 429 retry (see plan's retry strategy).

## Swap list (places that may already reference the chat header / chat window)

- `chat-header.html` trail: add More-options after the Call button (provisional position).
- Search for header-button-count assertions (smoke/unit/e2e) and update.
- Row destinations (mute, wallpaper, etc.) explicitly stay out of scope (spec Non-Goals).