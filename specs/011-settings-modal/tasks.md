# Tasks: WhatsApp Settings Modal (feature 011)

**Input**: Design docs from `specs/011-settings-modal/` (spec, plan, research, contracts)

**Prerequisites**: Figma node capture (`0:9778` — research "Node inventory" filled, PENDING
markers dropped); owner clarifications resolved (spec Clarifications 1-6, gate G1); plan.md,
spec.md, contracts/ui-contracts.md (required)

**Tests**: Unit + E2E/visual explicitly required (validation targets in spec).

**Organization**: Tasks grouped by user story (US1-US3). Runs sequentially; write-first tests
precede each implementation.

**External dependency**: Figma REST (node GET **and** download) is 429-limited until ~2026-09-28
(re-confirmed 2026-09-24, retry-after ≈ 345k s). T001-T004 are the capture gate; everything after
G1 depends on them. Structural implementation approved pre-capture (owner `2026-09-24`; host =
Settings stub).

## Phase 1: Capture & contracts (BLOCKED until ~09-28)

- [ ] T001 Capture node inventory: `npx -y figma-developer-mcp fetch --file-key
      PcGX72lSWkYIk3pL5V8PS3 --node-id 0:9778 --depth 6 --format json` (CLI; fallback: local MCP
      `get_figma_data`); record into `research.md`; verify shared group `0:9075` values match the
      shipped 009 `action-sheet` (any delta = drift) - BLOCKED: Figma 429 (~09-28)
- [ ] T002 Golden `tests/e2e/golden/0-9778-settings-modal.png` (node `0:9778`, native 1x) -
      BLOCKED: Figma 429
- [ ] T003 Glyph SVGs (per-row icons + the entry affordance; export to `tests/e2e/golden`) -
      BLOCKED: Figma 429
- [ ] T004 Confirm the entry affordance (glyph, header position, aria-label) + final row content;
      replace provisional seed in `contracts/ui-contracts.md`

**Checkpoint**: G1 — owner approval of Clarifications 1-6. Assets present or explicitly deferred.

---

## Phase 2: Reuse check + unit (write-first)

- [x] T005 Verify the shared `action-sheet` contract is consumed unchanged; no churn to
      `shared/components/action-sheet/*`
- [x] T006 Unit `settings-modal.spec.ts` (write-first): rows flow through to the sheet; activation
      emits id; `dismiss` closes (FAIL before impl)
- [x] T007 Unit `settings-stub-page.spec.ts` (extension): trigger renders with aria-label +
      `data-testid`; activation opens the sheet; dismiss closes and focus returns to the trigger
      (write-first, FAIL before impl)

**Checkpoint**: unit-green in isolation before entry wiring.

---

## Phase 3: Entry + wiring (US1 + US2)

- [x] T008 `features/settings/settings-modal.*` + `settings.seed.ts`: provisional `SETTINGS_ACTIONS`
      seed feeding the shared `action-sheet`; `dismiss` -> close
- [x] T009 `settings-stub-page.ts/html`: trailing entry trigger + `settingsModalOpen` host +
      handlers + modal block; focus return to the trigger
- [x] T010 E2E `tests/e2e/settings-modal.spec.ts` (write-first, part): US1 trigger opens sheet
      (backdrop + sheet visible); US2 rows labeled and focusable

**Checkpoint**: US1/US2 unit + e2e passing.

---

## Phase 4: US3 - a11y, focus, responsive, golden

- [x] T011 E2E (part): backdrop tap dismisses; focus returns to trigger; Escape dismisses
- [x] T012 Responsive: append `/settings` settings-modal no-overflow cases (open + close) to
      `tests/e2e/responsive.spec.ts` (all 3 breakpoints)
- [ ] T013 Golden `0-9778-settings-modal.png`: open modal in default state; measure baseline diff,
      set `maxDiffPixelRatio = measured + 0.05` (gated on T002) - BLOCKED until capture + G1 rows

**Checkpoint**: US1-US3 all passing.

---

## Phase 5: Polish + closure

- [x] T014 Verify no secrets/credentials in diff; full suite: `npm run build` + unit + `npm run e2e`;
      record visual diff result - build green; unit 139/139; e2e 270 total -> 258 passed / 12 skipped
      (gated goldens: 008 starred, 009 add-modal, 010 chat-actions, 011 settings-modal); visual
      baseline measurement pending T013
- [ ] T015 Update `figma/design-map.md` row 11 to implemented + spec `011`; set spec status to
      Implemented; write session report per Review gate
- [ ] T016 Commit (e.g. `feat(settings-modal): implement WhatsApp Settings Modal (feature 011)`)

---

## Dependencies & Execution Order

- **Capture (T001-T004) -> G1 -> reuse/units (T005-T007) -> entry & wiring (T008-T010) ->
  US3 (T011-T013) -> polish/closure (T014-T016).**
- Write-first tests (T006, T007, T010) are authored before their code and must FAIL before the
  implementation lands.
- Shared `action-sheet` (from 009) is reused, not re-authored; any delta = drift (owner approval).
- Owner authorized starting implementation pre-capture (`2026-09-24`): structural scope
  (T005-T012) is landed and green against provisional/hypothesis values; T001-T003/T013 remain
  capture-gated and the final geometry/content is locked at G1 (capture + owner approval).
- Asset-gated tasks (T002/T003/T013) wait on the 429 retry (see plan's retry strategy).

## Swap list (places that may already reference the settings stub / nav bar)

- `settings-stub-page.html/ts`: add the trailing entry trigger + sheet wiring (host for 011).
- Search for stub-inertness assertions (smoke/unit/e2e) and update.
- Row destinations + the real Settings screen (row 13) explicitly stay out of scope (spec
  Non-Goals).