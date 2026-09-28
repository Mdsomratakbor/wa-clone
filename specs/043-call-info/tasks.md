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

- [ ] T001 - `spec.md` + `research.md` + `plan.md` + `tasks.md`; scope recorded from the owner's
      three answers
- [ ] T002 - `call-info-modal.{ts,html,scss}`: the four actions in order, `Escape` host listener,
      re-emitting `action` / `dismiss` (FR-002, FR-003, FR-010)
- [ ] T003 - `call-info-modal.spec.ts`: action set and order, Escape dismiss (FR-002, FR-003)
- [ ] T004 - `calls-page.ts`: `infoCall` signal, `onCallInfo` opens, `onSheetAction` dispatches,
      `onSheetDismiss` closes, `openChatFor` extracted from `onCallSelected` (FR-001, FR-003,
      FR-004, FR-005, FR-006, FR-007)
- [ ] T005 - `calls-page.html`: render the modal under an `@if (infoCall())` guard (FR-001, FR-011)
- [ ] T006 - `calls-page.spec.ts`: opens for the tapped row only, four actions in order, three
      dismissals, `Message` navigates + marks read, `Message` with no chat stays put, `Delete`
      removes and persists, the two call actions are observable no-ops, unreachable in edit mode,
      `+ new call` still inert, no overflow (FR-001 … FR-011)
- [ ] T007 - `call.store.ts` comment recording that `removeCall()` needed no change (FR-005, FR-009)
- [ ] T008 - `tests/e2e/call-info.spec.ts` authored, not run
- [ ] T009 - Drift notes in 004, 005, 038; design-map row 4; gap audit B6; closure

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
