# Feature Specification: WhatsApp Call Info Sheet (feature 043)

**Feature Branch**: `043-call-info`

**Created**: 2026-09-28

**Status**: **Implemented** (build green, unit 456/456, e2e authored not run). G1 capture **BLOCKED**
— action labels, order and sheet chrome remain PROVISIONAL, tasks T010–T012 open.

**Input**: gap audit tier B6 + design rows 4/5 (`0:10395`, `0:8597`) + `figma/design-analysis.md` §6.1

## Clarifications

### Session 2026-09-28

The owner answered three scope questions directly.

- Q: How much of B6 should F-043 cover?  A (**owner**): **the call-info sheet only**. Row tap is
  already live from F-038, so B6's remaining surface is `New call` plus the info button. The
  `New call` flow needs a contact picker *and* an in-call screen (timer, mute, hangup), and the
  in-call chrome is the most speculative surface in the app with no design source at all. The sheet
  is small, bounded, and reuses `app-action-sheet`.
- Q: What should the sheet's actions do?  A (**owner**): **wire what has a destination**. `Message`
  opens the contact's chat; `Delete` removes the call entry and persists. `Voice call` / `Video call`
  render but stay inert with a recorded reason, because their destination is the in-call screen that
  this feature does not build. An inert control that is honestly labelled beats a removed row that
  real WhatsApp shows.
- Q: How is the sheet presented?  A (**owner**): **an overlay on `/calls`**, matching the existing
  Add Modal and Chat Actions sheets. No new route, so the URL and Back behaviour are unchanged.

## Summary

Gap audit tier B6 lists `New call`, row tap and call info as the Calls screen's dead controls. Row
tap was fixed in F-038 (a call row opens the contact's chat). That leaves two: the `+ new call`
trailing icon and the per-row `ⓘ` info button, both inert since F-004 approved them as
"focusable, no effect".

F-043 wires the info button. Activating `ⓘ` on a call row opens a bottom action sheet over the
Calls list with the actions real WhatsApp offers for a call: **Message**, **Voice call**,
**Video call**, **Delete**. `Message` and `Delete` work. The two call actions render and are
focusable but inert, carrying the same kind of reason comment the codebase already uses for
deferred work.

The sheet reuses the existing `app-action-sheet` component, so it inherits the overlay, the
`role="dialog"` / `aria-modal` semantics, the backdrop-dismiss and the Escape handler used by the
other three modals. No new shared component is introduced.

## Functional Requirements

- **FR-001** Activating the `ⓘ` info button on a call row opens a call-info action sheet over
  `/calls`, presenting **that row's** call.
- **FR-002** The sheet shows exactly four actions in order: `Message`, `Voice call`, `Video call`,
  `Delete`. Order and wording are provisional (see G1).
- **FR-003** The sheet is dismissible three ways with no side effects: the `Close` backdrop button,
  the `Escape` key, and selecting `Message` (which navigates). Tapping the row itself must not
  dismiss-then-navigate.
- **FR-004** `Message` closes the sheet and navigates to the contact's existing chat via
  `chatIdForContactName()`. When no chat exists for that contact the sheet closes and **stays on
  `/calls`** — same "no match ⇒ stays put" rule F-038 established for row tap.
- **FR-005** `Delete` closes the sheet and removes the call entry through `CallStore.removeCall()`,
  so the removal persists and survives a reload.
- **FR-006** `Voice call` and `Video call` close the sheet and do nothing else. They are rendered
  and focusable, never `disabled`, and never a click-through no-op: activating one is an observable,
  tested no-op.
- **FR-007** The `ⓘ` button is hidden in edit mode (existing `CallListItem` behaviour, unchanged) and
  the sheet cannot be opened while editing, because the row's click handler already returns early
  in edit mode.
- **FR-008** No `new-call` behaviour is added. The trailing `+ new call` action stays inert and its
  reason comment is updated to name this feature and the remaining in-call-screen gap.
- **FR-009** The `CallEntry` model, `CallStore` snapshot shape (`wa.call-store.v1`, version `1`) and
  the 12-row seed are unchanged. Deleting a call is the only mutation.
- **FR-010** Accessibility: the sheet is a labelled `role="dialog"` with `aria-modal`, the opening
  `ⓘ` button keeps its `Call info for {name}` label, and the sheet's actions are real buttons in DOM
  order so keyboard order matches visual order.
- **FR-011** No horizontal overflow at 320px for the sheet, and it overlays rather than resizes the
  Calls list.

## Non-Goals

- The `New call` flow, a contact picker, and the in-call screen (timer, mute, camera, hangup). The
  `Voice call` / `Video call` rows exist and are inert, so the app never shows a control that
  pretends to work.
- Grouping the call log by contact, or a call-history sheet listing every call with a contact.
- Call durations, avatars beyond the existing `UserAvatar` initials fallback, or per-call
  read/delivered state.
- Any change to the Calls segmented control (`All` / `Missed`), which F-004 approved as render-only.

## Review Gates

- **G1 (BLOCKED - Figma)**: the Figma REST API returned `429` (`Retry after 375849s`, quota reset
  **2026-10-02 18:38 UTC**) on 2026-09-28. The design file's 24 screens contain the Calls list and
  edit mode but **no call screen and no call-info sheet**, so the four action labels, their order and
  the sheet chrome are **PROVISIONAL**. Capture tasks stay open in `tasks.md`.
- **G2**: `npm run build` green and the full unit suite green with the exact count reported.
- **G3**: closure commit, drift notes in every superseded spec, checklist + converge clean.

## Figma Reference

- Design rows 4/5, Calls list normal / edit (`0:10395`, `0:8597`) — the `ⓘ` button's position and
  appearance come from there and are already implemented.
- **No Figma node exists for a call-info sheet or a call screen.** No node ID is cited and none is
  invented.

## UNKNOWN / NEEDS CLARIFICATION

- Exact action labels and their order. **Hypothesis** - real WhatsApp shows Message / Voice call /
  Video call / Delete. No capture exists to confirm wording or order.
- Whether the sheet carries a title (the contact name) above the rows, as the Chat Actions sheet
  does. **Hypothesis** - no title, matching the Add Modal, since the row behind it is already the
  contact. Left as a `title` input the design can fill later.
- Whether `Delete` should confirm before removing. **Hypothesis** - no confirmation, matching the
  existing `removeCall()` from edit mode, which deletes immediately.

## Assumptions

- F-038's row-tap behaviour is the model for `Message`: resolve by contact name, no match ⇒ stay put.
- The `CallStore` needs no new method; `removeCall()` already persists.
- Reusing `app-action-sheet` costs nothing in fidelity, because the sheet's own chrome is a
  hypothesis either way.

## Out of Scope Changes

- No edits to `call-list-item`, `calls.model.ts`, `calls.seed.ts` or `call.store.ts` beyond comments.
- No route added.

## Validation Targets

### Unit

- `CallStore`: deleting a call persists across a reload (already covered by F-038; asserted again
  from the sheet's path).
- `CallsPage`: `ⓘ` opens the sheet for the tapped row; the four actions render in order; backdrop,
  Escape and `Message` dismiss; `Message` navigates and marks read; `Message` with no matching chat
  stays put; `Delete` removes the row and it stays removed after a reload; the two call actions are
  no-ops that dismiss and change nothing; the sheet cannot open in edit mode; `+ new call` is still
  inert.

### E2E (authored, not run)

- `tests/e2e/call-info.spec.ts` - open the sheet, activate `Message` and land in the chat, activate
  `Delete` and see the row go, Escape and backdrop dismissal.

## Definition of Done

- [x] Every FR is covered by at least one named unit test
- [x] Persistence, versioning and re-load behaviour are specified (FR-005, FR-009)
- [x] Accessibility is specified (FR-010)
- [x] The inert `Voice call` / `Video call` rows are specified, not hidden (FR-006)
- [x] The blocked G1 gate is recorded, not skipped
- [x] Drift notes are planned for specs 004, 005 and 038

## Drift Note — superseded by 045-calling-flow (2026-09-29)

`specs/045-calling-flow` **supersedes the FR-006 inertness of this feature.** This spec is
otherwise unchanged and still accurate.

- **FR-006** (the `Voice call` / `Video call` rows are rendered, focusable, and deliberately do
  nothing) is **revoked**. Both rows now start a real call against the contact behind the log row,
  via the in-call screen at `/calls/active`.
- **`+ new call`** in `CallsPage` likewise stopped being inert and now opens the contact picker at
  `/calls/new`.
- FR-001, FR-002 (the sheet itself and its four-action order), FR-004 (`Message` opens the chat),
  FR-005 (`Delete`) and the 320px overflow constraint are **unchanged and still verified**. F-045
  briefly broke FR-005 by closing the sheet per-branch instead of on every action; the F-043 test
  caught it and the "close on every action" behaviour was restored.
- The rationale recorded here — that these rows needed an in-call screen that did not exist — was
  correct when written. It stopped being true once F-045 shipped that screen.
- F-045's own clarify pass corrected a counting error carried over from this feature: the inert
  set is **five** controls, not four (two header buttons, two sheet rows, `+ new call`).
