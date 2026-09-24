# Feature Specification: WhatsApp Chat Actions Modal

**Feature Branch**: `010-chat-actions-modal`

**Created**: 2026-09-24

**Status**: **In progress — structural scope landed pre-capture per owner directive
(`2026-09-24`).** Header More-options entry + Chat Actions sheet reusing the shared `action-sheet`
(009) are implemented and green (unit 128/128; e2e 243 passed / 9 skipped). Exact geometry, row
content, glyphs and golden remain PENDING the Figma capture (~2026-09-28) and are gated at G1;
provisional/hypothesis values in place until then.

**Input**: `figma/design-map.md` row 10 (`0:10087`) + `specs/010-chat-actions-modal/research.md`

---

## Summary

The Chat Actions Modal is a bottom sheet on the Chat Window screen presenting per-chat actions.
It is the **second consumer** of the shared `action-sheet` component shipped in feature 009
(`shared/components/action-sheet`); this feature adds a Chat Window entry affordance
(hypothesis: a trailing "More options" glyph in the header) + the Chat Actions row set + open/close
flow. Individual row destinations dispatch to later features (see Non-Goals).

Geometry, palette, row content, and the exact entry glyph are all PENDING the node capture.

## PENDING design inventory (capture on ~2026-09-28)

To be filled from the `0:10087` payload (mirrors 008 research format):

- [ ] Entry affordance: glyph, position in the header (vs Video call / Call), a11y label
- [ ] Frame dims/fills; backdrop dim + behavior (expect parity with the `0:9075` sheet)
- [ ] Sheet width/height/corner radius/surface + handling of status bar & home indicator
- [ ] Grab bar / title / close affordance (if any)
- [ ] Action rows: count; per-row icon tile (size, fill, glyph) + label text/typography/color;
      separators/hairlines; any destructive row
- [ ] Row icon glyph vectors + entry glyph (download to `tests/e2e/golden`)

## Owner Clarifications (proposed — confirm at G1)

1. **Entry affordance**: confirm the Chat Actions Modal opens from a header "More options" (⋮)
   icon button and its exact placement/label. *(Hypothesis: new trailing icon button after Call;
   the header currently has none — treat as unconfirmed.)*
2. **Row content**: the exact Chat Actions rows/order/icons come from the node payload. Rows are
   data-driven (no labels hard-coded in the shared component); the 010 rows are supplied by the
   feature wrapper. *(Hypothesis to verify: per-chat rows like mute / wallpaper / more — treat as
   unconfirmed.)*
3. **Shared component reuse**: `action-sheet` must be consumed unchanged wherever the `0:9075`
   group values match; any deviation (row height, radius…) is drift and needs owner approval.
4. **Dismissal & focus**: backdrop tap / Escape / drag-down; keyboard focus returns to the entry
   trigger on close (same contract as 009).
5. **Row targets**: rows emit their id via the shared `action` output; row-specific actions belong
   to later features — confirm this feature only opens the sheet and emits.

## Functional Requirements

- **FR-001**: Activating the Chat Window "More options" affordance opens the Chat Actions
  bottom sheet (backdrop + sheet over the chat page, inside the shell).
- **FR-002**: The sheet is built from the shared `ActionSheetComponent`, data-driven by the same
  `Action` row model; rows are real, focusable buttons with a testable label per row; no row
  content is hard-coded in the shared component.
- **FR-003**: Dismissal via the design's affordances; focus returns to the trigger; no route change
  while opening/closing.
- **FR-004**: Selecting a row emits its `id` (target flows are out of scope).
- **FR-005**: No horizontal overflow at any breakpoint (same responsive contract as 006/007/008/009).

## Non-Goals (later features)

- Row action destinations (mute, wallpaper, etc.) and their screens.
- Row 11 Settings Modal (`0:9778`) — reuses the shared component, ships as its own feature.
- Any change to the Chats list, tab bar, focused state, or shared shell surfaces beyond the header
  entry affordance.

## User Stories

- **US1 (open)**: As a user in a chat I activate the header More-options affordance and the Chat
  Actions sheet slides up with a dimmed backdrop over the chat content.
- **US2 (rows + content)**: I see the action rows (icon + label) from the design, each focusable
  and emitting its id when activated; the sheet is the shared `action-sheet` component.
- **US3 (dismiss, a11y, responsive, golden)**: backdrop tap / the design's affordance closes the
  sheet and returns focus to the trigger; no horizontal overflow at any breakpoint; the modal
  matches the Figma render within the measured golden threshold.

## Acceptance Criteria (validation targets)

1. Unit — `chat-actions.spec.ts` (new): rows flow from the 010 seed into the sheet; activation
   emits row id; dismiss closes; focus returns to the trigger.
2. Unit — `chat-header.spec.ts` (extension): the More-options affordance renders with a testable
   aria-label and emits on activation; full suite green.
3. E2E `tests/e2e/chat-actions.spec.ts`: US1 open from the header affordance, US2 rows visible &
   labeled, US3 backdrop dismiss + focus return + golden `0-10087-chat-actions.png` with measured
   `maxDiffPixelRatio` (= measured + 0.05; gated on capture).
4. Responsive: appended no-overflow cases at all breakpoints.
5. `figma/design-map.md` row 10 spec → `010` + implemented at closure.

## Swap list

- `src/app/shared/components/chat-header/chat-header.html` (+ `.ts`): add the trailing More-options
  affordance emitting an `actions` output (a11y label + `data-testid`), positioned per the design.
- `src/app/features/chat-window/chat-window-page.ts` (+ `.html`): hold the modal open state, host
  the wrapper, handle dismiss + focus return; `onBack()` unchanged.
- Confirm no existing smoke/unit/e2e asserts the header has exactly two icon buttons (update if
  present).
- `navigation-bar`/`tab-bar`/`app-shell` are untouched.

## Closing note (deliberately incomplete)

Until T001 lands, `chat-actions.seed.ts` provides provisional/hypothesis rows (stable ids, PENDING
labels/glyphs) — a documented placeholder, replaced at G1 with captured content. No exact design
values are claimed anywhere.