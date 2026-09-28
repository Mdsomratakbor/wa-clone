# Tasks: Call Info Sheet (feature 043)

**Input**: `specs/043-call-info/plan.md`, `specs/043-call-info/spec.md`,
`specs/043-call-info/research.md`

- **Gates**: G1 = capture BLOCKED (Figma `429`, reset 2026-10-02 18:38 UTC) — action labels, order
  and sheet chrome PROVISIONAL. G2 = build + unit green, e2e authored not run. G3 = closure + drift
  notes in 004, 005, 038.
- **Tests**: `npx ng test --watch=false --reporters=progress` green before each commit; output goes
  to `logs/` (gitignored). Playwright specs are authored but **not executed** (paused by owner
  directive 2026-09-26).
- **Baseline**: 440/440 entering this feature.

## Implementation

- [x] T001 - `spec.md` + `research.md` + `plan.md` + `tasks.md` + `contracts/ui-contracts.md`;
      scope recorded from the owner's three answers
- [x] T002 - `call-info-modal.{ts,html,scss}`: the four actions in order, `Escape` host listener,
      re-emitting `action` / `dismiss` (FR-002, FR-003, FR-010)
- [x] T003 - `call-info-modal.spec.ts`: action set and order, dialog semantics, title, Escape and
      backdrop dismiss, no row disabled (FR-002, FR-003, FR-006, FR-010)
- [x] T004 - `calls-page.ts`: `infoCall` signal, `onCallInfo` opens, `onSheetAction` dispatches,
      `onSheetDismiss` closes, `openChatFor` extracted from `onCallSelected`, `onCallRemove` gated on
      no open sheet (FR-001, FR-003 … FR-007)
- [x] T005 - `calls-page.html`: render the modal under an `@if (infoCall() !== null)` guard (FR-001,
      FR-011)
- [x] T006 - `calls-page.spec.ts`: opens for the tapped row only, four actions in order, three
      dismissals, `Message` navigates, `Message` with no chat stays put, `Delete` removes and
      persists, the two call actions are observable no-ops, unreachable in edit mode, `+ new call`
      still inert, no overflow (FR-001 … FR-011)
- [x] T007 - `call.store.ts` comment recording that `removeCall()` needed no change (FR-005, FR-009)
- [x] T008 - `tests/e2e/call-info.spec.ts` authored, not run
- [x] T009 - Drift notes in 004, 005, 038; design-map row 4; gap audit B6; closure

## Capture - BLOCKED (Figma 429, reset 2026-10-02 18:38 UTC)

- [ ] T010 - Confirm from a capture whether a call-info sheet or call screen exists in the file at
      all, and record the node id (or record that there is none) in `research.md`
- [ ] T011 - Reconcile the four action labels, their order, the sheet title and the `Delete`
      confirmation question; replace the hypotheses in `spec.md` if the design differs
- [ ] T012 - Golden for the open sheet (blocked twice over: capture + Playwright pause)

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per owner directive
```

## Notes

- `[ ]` T010–T012 are capture-gated and stay open until the quota resets.
- `Voice call` / `Video call` render and are focusable but inert (FR-006). They are an intentional
  part of the design, not an oversight — a removed row would be less faithful than an honest no-op.
- The Escape `HostListener` is added in the wrapper, not hoisted into `ActionSheet`, because three
  shipped features already mount that component and changing it is out of scope here.
- No route, no store method, no model field, no seed change.

## Closure - FR to test traceability

| FR | Test |
|----|------|
| FR-001 | `the info button opens the sheet and does not navigate` |
| FR-002 | `the sheet shows the four actions in order`, `renders the four actions in order` |
| FR-003 | `the backdrop and Escape both dismiss without side effects`, `emits dismiss on backdrop activation`, `emits dismiss on Escape` |
| FR-004 | `Message opens the chat for the tapped row`, `Message closes the sheet but stays put when the contact has no chat` |
| FR-005 | `Delete removes that row only and it stays removed` |
| FR-006 | `Voice call and Video call dismiss the sheet and change nothing`, `does not disable the call actions` |
| FR-007 | `the sheet cannot be opened while editing` |
| FR-008 | `new call is still inert while the sheet is in scope` |
| FR-009 | `Delete removes that row only and it stays removed` (snapshot version unchanged — reload assertion) |
| FR-010 | `presents a labelled modal dialog`, `renders no title unless one is given` |
| FR-011 | `the list keeps 12 rows and no horizontal overflow at 320px` |

**Result**: `npm run build` green; unit **456/456** (baseline 440, +16). E2E authored, not run.
Commits: `46c322a` docs, `e4062e9` feat, `117f9be` test.

Two tests in the first run were wrong rather than the code, and were corrected rather than deleted —
the "stays put" case had asserted a navigation that the seed legitimately performs, and the edit-mode
case queried for minus circles without entering edit mode. Both are recorded in the `test(043)`
commit body.
