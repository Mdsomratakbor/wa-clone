# Plan: WhatsApp New Chat (Add) Modal (feature 009)

**Input**: `specs/009-new-chat-modal/{spec,research}.md`

**Gate**: Figma 429 clears (~2026-09-28) → node payload capture → owner approval of spec
Clarifications (incl. the row-content hypothesis) → write-first tests → implementation.

## External dependency: Figma 429 (hard blocker, not just assets)

- Unlike 008 (where only *downloads* were 429 and node geometry was usable), the **node GET is
  429 too**. Confirmed 2026-09-24 on the local MCP (`get_figma_data`) and Composio
  (`FIGMA_GET_FILE_NODES`): retry-after ≈ 345k s ≈ **~2026-09-28**.
- The frame `0:9072` correctness (sheet geometry, row content, colors, glyphs) is unknowable
  without the payload; the spec set is intentionally drafted at the *structure* level and marks all
  visual facts PENDING. No implementation before capture + owner approval.
- Strategy (proven 007/008): retry MCP then Composio on/after the retry date; whichever clears
  first wins; download golden + glyphs into `tests/e2e/golden`.

## Scope

- New shared `ActionSheetComponent` (`shared/components/action-sheet`) — the componentized basis
  for rows 9 (this feature), 10, and 11.
- Add Modal wiring: Chats FAB (`chats-page.ts:105` `onFabPressed` no-op) opens the sheet; rows are
  data-driven; selection emits/calls back (row targets are later features — see spec).
- Shared shell unchanged; modal overlays the routed page inside `app-shell` content.

## Approach

- Represent rows as a small model (`action-sheet.model.ts`: `id`, `label`, optional `icon`) with
  content supplied by the consumer (`features/new-chat-modal/add-modal.ts` feeds the 009 rows;
  rows 10/11 feed theirs later).
- Backdrop + sheet: page-local overlay markup inside the modal wrapper; E2E-detectable
  (`data-testid`); a11y (focus trap/dismiss) in scope.
- Geometry/typography/colors: from the node inventory once captured (research.md), same
  measurement pipeline as 007/008.

## Phases

1. **Capture** (deferred ~09-28): node inventory `0:9072`/`0:9075`; golden `0-9072-add-modal.png`;
   glyph SVGs. Fill research.md "Node inventory"; drop PENDING markers.
2. **Contracts**: `Action` row model + `ActionSheetComponent` inputs (`title?`, `actions`,
   output `action`/`dismiss`); unit tests written first.
3. **Modal**: `AddModal` wrapper + FAB wiring on Chats; open/close/dismiss behaviors; backdrop.
4. **US3**: a11y + focus + responsive (no-overflow at 3 breakpoints) + golden
   `0-9072-add-modal.png` (measure baseline, `maxDiffPixelRatio = measured + 0.05`).
5. **Closure**: design-map row 9 -> `009` + implemented; spec/tasks statuses; session report;
   commit `feat(new-chat-modal): implement WhatsApp New Chat (Add) Modal (feature 009)`.

## Review gates

- **G1**: node inventory recorded + owner approval of Clarifications (row content, entry/presentation
  decisions). No implementation before G1.
- **G2**: build + unit + e2e (incl. golden) green; baseline recorded; drift register updated.
- **G3**: closure commit + traceability (design-map/spec/tasks).

## Drift policy

Reuse the shared shell and existing components without modifying shared surfaces. Only
owner-flagged drift enters the register. The Add Modal sheet is a *new* shared component, so its
visual contract (modal frame, radii, spacing) is written from the design and reused unchanged for
rows 10/11.