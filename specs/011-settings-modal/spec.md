# Feature Specification: WhatsApp Settings Modal

**Feature Branch**: `011-settings-modal`

**Created**: 2026-09-24

**Status**: **In progress — structural scope landed pre-capture per owner directive
(`2026-09-24`).** Settings entry trigger + Settings sheet reusing the shared `action-sheet` (009)
hosted on the Settings stub are implemented and green (unit 139/139; e2e 270 total -> 258 passed /
12 skipped). Exact geometry, row content, glyphs and golden remain PENDING the Figma capture
(~2026-09-28) and are gated at G1; provisional/hypothesis values in place until then. The real
Settings screen (row 13, `0:9198`) takes over the host later.

**Input**: `figma/design-map.md` row 11 (`0:9778`) + `specs/011-settings-modal/research.md`

---

## Summary

The Settings Modal (labelled "Chats Settings" in the design analysis) is a bottom sheet opened
from the Settings surface. It is the **third consumer** of the shared `action-sheet` component
shipped in feature 009. This feature adds a Settings entry trigger + the Settings sheet's row set +
open/close flow on the existing `/settings` stub (owner-approved host; row 13 replaces the stub
with the real screen without changing this feature's contract). Individual row destinations
dispatch to later features (see Non-Goals).

Geometry, palette, row content, and the exact entry glyph are all PENDING the node capture.

## PENDING design inventory (capture on ~2026-09-28)

To be filled from the `0:9778` payload (mirrors 008 research format):

- [ ] Entry affordance: glyph, position on the Settings surface, a11y label
- [ ] Frame dims/fills; backdrop dim + behavior (expect parity with the `0:9075` sheet)
- [ ] Sheet width/height/corner radius/surface + handling of status bar & home indicator
- [ ] Grab bar / title / close affordance (if any)
- [ ] Action rows: count; per-row icon tile (size, fill, glyph) + label text/typography/color;
      separators/hairlines; any destructive row
- [ ] Row icon glyph vectors + entry glyph (download to `tests/e2e/golden`)

## Owner Clarifications (proposed — confirm at G1)

1. **Host**: Owner approved hosting on the Settings stub (`2026-09-24`); confirm at capture that
   the design really triggers the sheet from the Settings surface (the sheet is grouped as
   "Chats Settings" near Add/Chat Actions) and capture the exact affordance.
2. **Entry affordance**: hypothesis — a trailing icon trigger in the Settings nav bar emitting a
   sheet-open event (mirrors 010's chat-header More options). Confirm glyph/label.
3. **Row content**: exact rows/order/icons come from the node payload; rows stay data-driven (no
   labels hard-coded in the shared component); the 011 rows are supplied by the feature wrapper.
   *(Hypothesis: settings-flavored rows such as Notifications / Storage / More — unconfirmed.)*
4. **Shared component reuse**: `action-sheet` consumed unchanged wherever the `0:9075` values
   match; any deviation = drift (owner approval).
5. **Dismissal & focus**: backdrop tap / Escape / drag-down; focus returns to the entry trigger on
   close (same contract as 009/010).
6. **Row targets**: rows emit their id via the shared `action` output; row-specific flows belong
   to later features (incl. the real Settings screen, row 13) — confirm this feature only opens
   the sheet and emits.

## Functional Requirements

- **FR-001**: Activating the Settings entry trigger opens the Settings bottom sheet (backdrop +
  sheet over the Settings page, inside the shell).
- **FR-002**: The sheet is built from the shared `ActionSheetComponent`, data-driven by the same
  `Action` row model; rows are real, focusable buttons with a testable label per row; no row
  content is hard-coded in the shared component.
- **FR-003**: Dismissal via the design's affordances; focus returns to the trigger; no route
  change while opening/closing.
- **FR-004**: Selecting a row emits its `id` (target flows are out of scope).
- **FR-005**: No horizontal overflow at any breakpoint (same responsive contract as 006-010).

## Non-Goals (later features)

- Row action destinations and their screens.
- The real Settings screen (row 13, `0:9198`) and its sub-pages (Account, Chats Settings,
  Notifications, Data & Storage, Contact Info, Edit Profile) — row 13 replaces the stub host.
- Any change to the Chats list, tab bar, focused state, or shared shell surfaces beyond the
  Settings entry trigger.

## User Stories

- **US1 (open)**: As a user on Settings I activate the entry trigger and the Settings sheet slides
  up with a dimmed backdrop over the Settings content.
- **US2 (rows + content)**: I see the action rows (icon + label) from the design, each focusable
  and emitting its id when activated; the sheet is the shared `action-sheet` component.
- **US3 (dismiss, a11y, responsive, golden)**: backdrop tap / the design's affordance closes the
  sheet and returns focus to the trigger; no horizontal overflow at any breakpoint; the modal
  matches the Figma render within the measured golden threshold.

## Acceptance Criteria (validation targets)

1. Unit — `settings-modal.spec.ts` (new): rows flow from the 011 seed into the sheet; activation
   emits row id; dismiss closes.
2. Unit — `settings-stub-page.spec.ts` (extension): the entry trigger renders with a testable
   aria-label and opens the sheet; dismiss closes and focus returns to the trigger; full suite
   green.
3. E2E `tests/e2e/settings-modal.spec.ts`: US1 open from the Settings trigger, US2 rows visible &
   labeled, US3 backdrop dismiss + focus return + golden `0-9778-settings-modal.png` with measured
   `maxDiffPixelRatio` (= measured + 0.05; gated on capture).
4. Responsive: appended no-overflow cases at all breakpoints.
5. `figma/design-map.md` row 11 spec → `011` + implemented at closure.

## Swap list

- `features/starred-messages/settings-stub-page.{ts,html}`: add the trailing entry trigger + sheet
  open/dismiss/focus wiring (stub hosts feature 011 until row 13).
- New `features/settings/settings-modal.*` + `settings.seed.ts` (feature wrapper; row 13 reuses).
- Confirm no smoke/unit/e2e asserts the settings stub is fully inert (responsive/stub specs);
  update if present.
- `navigation-bar`/`tab-bar`/`app-shell` are untouched.

## Closing note (deliberately incomplete)

Until T001 lands, `settings.seed.ts` provides provisional/hypothesis rows (stable ids, PENDING
labels/glyphs) — a documented placeholder, replaced at G1 with captured content. No exact design
values are claimed anywhere.