# Research - Feature 005: WhatsApp Calls Edit Mode

Phase 0 output. Resolves every technical unknown from the Technical Context.

## Decision 1 - Edit mode is removal, not selection (unlike Chats Edit)

`0:8597` rows carry a solid red `#FF3B30` circle with a white minus (node `0:8606`, "Remove Icon") - not the `#3C3C43` ring used for selection in Chats Edit (`0:8114`). There is no selection chrome (no `aria-checked` state, no per-row check glyph) and **no bottom action bar**. The trailing nav action is `Clear`, not a trash/bulk action.

**Approved (Clarification 1):** tapping the red minus removes that row immediately from the in-memory list; row-body activation is a no-op in edit mode; the info button is hidden in edit mode (no info node exists on `0:8598`) and returns on `Done`.

## Decision 2 - `Clear` semantics

**Approved (Clarification 2):** `Clear` removes all rows. At 0 rows it renders disabled `#C7C7CC` (non-actionable), mirroring the feature-003 disabled action pattern (`[disabled]` + `:disabled` color, `chat-actions-bar.scss`). The shared `NavigationBar`/`NavAction` gains an optional `disabled?: boolean` so `Clear` can be disabled without a page-specific style.

## Decision 3 - Empty state

**Approved (Clarification 3):** an emptied list shows a `No calls` placeholder centred in the list area - mirrors the `No chats` placeholder (`chats-page.html` `data-testid="empty-state"`), same styling pattern and `role="status"`. No Figma frame exists for this state.

## Decision 4 - Tab bar during edit

The design keeps the tab bar visible in edit mode (unlike Chats Edit, which hides it and shows `ChatActionsBar`). Feature-003 blocks tab switches while editing (`chats-page.ts:69` guard) even though the bar was hidden there; the guard exists for mode stability.

**Approved (Clarification 4):** tab activation is inert while `editMode` (extension of the 003 guard to `CallsPage.onTabSelect`). `Done` restores working navigation.

## Decision 5 - Row geometry in edit mode

| Element | Normal (004) | Edit (005) | Delta |
| ------- | ------------ | ---------- | ----- |
| Row frame | 375x56, `#FFFFFF` | same | - |
| Avatar | x16 | x47 | +31 |
| Name | x68 | x99 | +31 |
| Call glyph | x67.5 | x98.5 | +31 |
| Direction label | x89 | x120 | +31 |
| Date | right | right | same |
| Info button | x337, 22x22 | **absent** | removed |
| Remove icon | - | x17, 21x21 | added |

Implementation: `CallListItem` gains `editMode` input; the red minus renders absolutely at left 17 (vertically centred), and the row body's `padding-left` shifts 16 -> 47px (mirrors the `chat-list-item--selectable` pattern). The body's internal flex (12px gap) then lands the name at Figma's 99 and the label at ~120. Separators inset x99 (node overshoot artifact clipped, see `data-model.md`).

## Decision 6 - Nav bar + NavAction extensions

`NavigationBar` already supports optional title, centre content-slot and icon actions (feature 004). For edit mode it needs disabled actions:

- `NavAction` (`src/app/features/chat-list/chat.model.ts`) gains optional `disabled?: boolean`.
- Nav template renders `[disabled]="item.disabled || undefined"`; disabled styling = `#C7C7CC` + `cursor: default` (mirrors `chat-actions-bar.scss`).
- `Done` renders through the same action slot as `Edit` (existing `--wa-fw-regular`); Figma shows `Done` semibold - the feature-003 precedent already shipped `Done` via the regular-weight action slot with an approved golden, so the weight is kept consistent (recorded drift, cosmetic only).

## Typography (unchanged from feature 004)

All row and segmented-control typography is carried over verbatim (name 16px/400, direction/date 14px/400, `All | Missed` 13px/500 `--wa-fs-control`). `Done`/`Clear` use the existing nav-action type (17px/400). No new type tokens.

## Dependency audit note

- No new runtime or dev dependencies. The red-minus glyph is an inline SVG path re-exported from Figma `0:8606` via the local Figma MCP and stored under `tests/e2e/golden/` (`calls-edit-remove-icon.svg`).
- Playwright golden from the Figma render (scale 1): `tests/e2e/golden/0-8597-calls-edit.png` (375x812, saved 2026-09-23).
- Interaction notes: photo avatars in the render vs initials in-app plus the known washed-overlay artifact (feature 001) mean the 005 golden needs a `maxDiffPixelRatio` slack measured during validation (feature-004 baseline was ratio ~0.10 at 0.15 threshold; expect a similar band).
  - **Measured 2026-09-23**: baseline ratio **0.11 (32923 px)**; shipped threshold **0.16** (+0.05 slack, same band as 004).