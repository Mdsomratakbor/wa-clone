# Data Model & Geometry - Feature 005: Calls Edit

Source of truth: Figma node `0:8597` ("WhatsApp Calls Edit", 375x812), simplified JSON via the local Figma MCP and `figma_get_figma_data`, cross-referenced against feature-004 node `0:10395`.

## Frame composition (top -> bottom by `y`)

| Node | Name | Position (local) | Height | Fill / Effect | Note |
| ---- | ---- | ---------------- | ------ | ------------- | ---- |
| `0:8796` | Bars / Status Bar / iPhone X | y=0 | 44 | `#171717` time | reused from shell |
| `0:8741` | Navigation Bar | y=0 | 88 | `#FFFFFF` + hairline `#A6A6AA` 0.33 | status-bar region overlays top 44 |
| - `0:8743` | `Done` (TEXT) | x16, y54 | 22 | `#007AFF` Semibold 17/22 | **leading** action in edit mode |
| - `0:8744` | `Clear` (TEXT) | x318, y54 | 22 | `#007AFF` Regular 17 right-aligned | **trailing** action in edit mode |
| - `0:8745` | `Tabs` (GROUP) | x112, y52 | 151x28 | border `rgba(0,122,255,0.756)` 1px, radius 8 | identical to 004 `0:10622`; `All` active |
| `0:8598..0:8719` | Call rows x12 | y=88..704 | 56 ea | `#FFFFFF` | see per-row table |
| `0:8753` | Tab Bar (GROUP) | y=729 | 83 | `#F6F6F6` + hairline top + labels; frame physical order Status(x0), Calls(x75, active), Camera(x150), Chats(x225), Settings(x300) | **stays visible in edit mode** (no action bar); app keeps 001 order (004 decision) |
| `0:8817` | Home Indicator | bottom 34 | 34 | - | shell |

No FAB (Calls never has one). No Chat Actions bar (unlike `0:8114`).

## Call row - edit mode deltas

Rows at y = 88 + 56k (k=0..11). Representative row `0:8598` (Jamie Franco, missed, 8/20/19) - all 12 rows share the same structure:

| Element | Node | Local x | Size | Spec |
| ------- | ---- | ------- | ---- | ---- |
| Row frame | `0:8598` (… `0:8719`) | - | 375x56 | `#FFFFFF` |
| **Remove icon** | `0:8606` (… `0:8727`) | 17 | 21x21 | `#FF3B30` circle + white bar (see glyph) - **new in edit mode**; vertical centre y17.5 |
| Avatar | `0:8600` | 47 | 40x40 | shifted from 16 (circle occupies the 16px gutter + gap) |
| Name | `0:8601` | 99 | 19 (16px/400) | shifted from 68; `#000000`; missed -> `#FF3B30` |
| Call glyph | `0:8604` | 98.5 | 15x15 | shifted from 67.5; same template every row, `#8E8E93` |
| Direction label | `0:8602` | 120 | 17 (14px/400) | shifted from 89; `outgoing` / `incoming` / `missed` |
| Date | `0:8603` | ~300-313 (right) | 17 (14px/400) | `#8E8E93`, right-aligned |
| Info button | - | - | - | **absent** in edit mode (no node in `0:8598`; present in 004 rows e.g. `0:10404`) |

Row-start ids (Figma order): `0:8719` (Martin Randolph, outgoing 10/13/19) - `0:8708` (Karen Castillo, outgoing 10/11/19) - `0:8697` (Kieron Dotson, outgoing 10/8/19) - `0:8686` (Karen Castillo, **missed** 9/30/19) - `0:8675` (Zack John, incoming 9/24/19) - `0:8664` (Kieron Dotson, outgoing 9/16/19) - `0:8653` (Kieron Dotson, outgoing 9/15/19) - `0:8642` (Jamie Franco, incoming 9/10/19) - `0:8631` (Martha Craig, incoming 9/6/19) - `0:8620` (Martha Craig, outgoing 9/6/19) - `0:8609` (Maisy Humphrey, outgoing 8/22/19) - `0:8598` (Jamie Franco, **missed** 8/20/19).

Row separators (`0:8730`..`0:8740`): 0.33px `rgba(60,60,67,0.29)` at every boundary, inset to **x99** (004 rows insets x68). The node spans `width 307` (ends x406 - overshoots the 375 frame; a sloppy island edit). Implementation mirrors the content inset: separator from x99 to the row's right edge (overshoot clipped).

## Remove icon glyph (Figma `0:8606`)

Exported via the local Figma MCP -> `tests/e2e/golden/calls-edit-remove-icon.svg`.

```svg
<svg width="21" height="21" viewBox="0 0 21 21" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M10.5 21C16.299 21 21 16.299 21 10.5C21 4.70101 16.299 0 10.5 0C4.70101 0 0 4.70101 0 10.5C0 16.299 4.70101 21 10.5 21Z" fill="#FF3B30"/>
  <path d="M6 11.25H15.5C15.9142 11.25 16.25 10.9142 16.25 10.5C16.25 10.0858 15.9142 9.75 15.5 9.75H6C5.58579 9.75 5.25 10.0858 5.25 10.5C5.25 10.9142 5.58579 11.25 6 11.25Z" fill="white"/>
</svg>
```

Solid `#FF3B30` disc + white horizontal bar -> inlined in `call-list-item.html` (21x21, `aria-hidden` inside a labelled button).

## Working list (CALL_SEED reuse)

The 12 rows are identical to feature-004 `CALL_SEED` (see `specs/004-calls/data-model.md` table). Feature 005 owns a page-level working copy (`items` signal seeded from the `calls` input) mutated only by edit-mode actions:

```ts
type CallDirection = 'incoming' | 'outgoing' | 'missed';   // unchanged
interface CallEntry { id; contactName; direction; date; avatarRef; }  // unchanged
```

## Edit-mode geometry tokens

| Token | Value | Note |
| ----- | ----- | ---- |
| `--wa-remove-size` (or inline) | 21px | red minus diameter |
| Row edit padding-left | 47px | avatar lands at Figma x47 (minus sits at x17, absolute) |

Row edit offsets reproduce Figma: minus left 17 (vertical centre), avatar left 47, name/body start 47+40+12 = 99, direction label effectively 120. No new row-height token (still `--wa-call-row-height` 56px).

## Node -> requirement trace

| Requirement | Primary nodes |
| ----------- | ------------- |
| Nav: `Done` leading / segment centre / `Clear` trailing | `0:8743`, `0:8745` (+`0:8747`/`0:8750`), `0:8744` |
| Row remove circle + shifted content + no info | `0:8606` (and per-row), avatar `0:8600`, name `0:8601`, absent info |
| Separators inset x99 | `0:8730`..`0:8740` |
| Tab bar visible + Calls active, inert switches | `0:8753` (active `0:8783`/`0:8785`) |
| Empty state | no Figma frame - owner-approved placeholder (Clarification 3) |