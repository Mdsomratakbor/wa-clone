# Feature Specification: WhatsApp New Chat (Add) Modal

**Feature Branch**: `009-new-chat-modal`

**Created**: 2026-09-24

**Status**: **Proposed — blocked on Figma node capture.** The frame `0:9072` payload is
unavailable (REST 429 until ~2026-09-28). All visual facts below are **PENDING** and marked
accordingly; nothing is implemented until the node inventory is recorded and clarifications are
approved (gate G1).

**Input**: `figma/design-map.md` row 9 (`0:9072`) + `specs/009-new-chat-modal/research.md`

---

## Summary

The New Chat (Add) Modal is the bottom sheet that opens from the Chats screen's FAB
("Start new chat") and presents actions for starting a new chat. It is the first consumer of a new
**shared `action-sheet` component** that rows 10 (Chat Actions) and 11 (Settings Modal) will
reuse. This feature delivers the shared component + the Add Modal instance + opening/closing
flow; individual row actions dispatch to later features (see Non-Goals).

Geometry, palette, and row content are all PENDING the node capture.

## PENDING design inventory (capture on ~2026-09-28)

To be filled from the `0:9072` / `0:9075` payload (mirrors 008 research format):

- [ ] Frame dims/fills; backdrop dim + behavior
- [ ] Sheet width/height/corner radius/surface + handling of status bar & home indicator
- [ ] Grab bar / title / close affordance (if any)
- [ ] Action rows: count; per-row icon tile (size, fill, glyph) + label text/typography/color;
      separators/hairlines
- [ ] Row icon glyph vectors (download to `tests/e2e/golden`)

## Owner Clarifications (proposed — confirm at G1)

1. **Row content**: the exact Add-modal rows/order/icons come from the node payload. Until then,
   the action-row model is data-driven (no labels hard-coded in the shared component); the 009 rows
   are supplied by the feature wrapper. *(Hypothesis to verify: "New group" / "New contact"-style
   rows — treat as unconfirmed.)*
2. **Entry & presentation**: FAB on Chats opens the modal as an in-frame overlay (backdrop over the
   routed page, inside the shared shell); confirm whether the backdrop dims the status bar or only
   the content area.
3. **Dismissal**: backdrop tap / Escape / drag-down — confirm the design's affordances; keyboard
   focus must return to the FAB (or the trigger) on close.
4. **Row targets**: rows emit their id via the shared `action` output; row-specific navigation
   (e.g. group composition, contacts) belongs to later features — confirm this feature only opens
   the sheet and emits.
5. **Shared component reuse**: `action-sheet` parameterization (title?/rows/cancel?) must fit
   row 10 (Chat Actions) and row 11 (Settings Modal) too — the shared contract is written from the
   `0:9075` group so all three are one component.

## Functional Requirements

- **FR-001**: Pressing the Chats FAB ("Start new chat", `chats-page.ts:105`) opens the Add Modal.
- **FR-002**: The modal renders a dimmed backdrop and the bottom sheet; the sheet rows are real,
  focusable buttons with a testable label per row.
- **FR-003**: Dismissal via the design's affordances; focus returns to the trigger; no route
  change while opening/closing.
- **FR-004**: The sheet is built from the shared `ActionSheetComponent` (`shared/components/
  action-sheet`), data-driven by an `Action` row model; no row content is hard-coded in the shared
  component.
- **FR-005**: Selecting a row emits its `id` (target flows are out of scope).
- **FR-006**: No horizontal overflow at any breakpoint (same responsive contract as 006/007/008).

## Non-Goals (later features)

- Row action destinations (new group, contacts, community) and their screens.
- Row 10 Chat Actions (`0:10087`) and row 11 Settings Modal (`0:9778`) — they reuse the shared
  component but ship as their own features.
- Any change to the Chats list, tab bar, or shared shell surfaces.

## User Stories

- **US1 (open)**: As a user on Chats I press the FAB and the Add Modal slides up with a dimmed
  backdrop over the Chats content.
- **US2 (rows + content)**: I see the action rows (icon + label) from the design, each focusable
  and emitting its id when activated; the sheet is the shared `action-sheet` component.
- **US3 (dismiss, a11y, responsive, golden)**: backdrop tap / the design's affordance closes the
  sheet and returns focus to the FAB; no horizontal overflow at any breakpoint; the modal matches
  the Figma render within the measured golden threshold.

## Acceptance Criteria (validation targets)

1. Unit — `action-sheet.spec.ts`: renders rows from an `Action[]` input, emits `action(id)` on
   activation, emits `dismiss` on backdrop tap; no hard-coded row labels.
2. Unit — `add-modal.spec.ts` + `chats-page.spec.ts` (extension): FAB press opens the sheet;
   row id emits; close callbacks — full suite green.
3. E2E `tests/e2e/add-modal.spec.ts`: US1 open from FAB, US2 rows visible & labeled, US3 backdrop
   dismiss + focus return + golden `0-9072-add-modal.png` with measured `maxDiffPixelRatio`
   (= measured + 0.05; gated on capture).
4. Responsive: appended no-overflow cases at all breakpoints.
5. `figma/design-map.md` row 9 spec → `009` + implemented at closure.

## Swap list

- `chats-page.ts:105-107`: `onFabPressed()` no-op (`F-001: new-chat action sheet is a later
  feature.`) → replaces the TODO comment with modal-open logic.
- Confirm no existing unit/e2e asserts the FAB has no action (smoke spec).
- `navigation-bar`/`tab-bar`/`app-shell` are untouched.