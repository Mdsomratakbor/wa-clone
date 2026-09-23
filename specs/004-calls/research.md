# Research - Feature 004: WhatsApp Calls Screen

Phase 0 output. Resolves every technical unknown from the Technical Context.

## Decision 1 - Tab-bar order (design-file inconsistency)

The Calls frame (`0:10395`) places its tab bar physically as `Status - Calls - Camera - Chats - Settings` (Calls 2nd, active). The Chats frame (`0:8855`, feature 001) places it as `Settings - Chats - Camera - Calls - Status`. The same shared `TabBar` renders on both screens, so the two frames cannot both be reproduced.

**Approved (Clarification 1, 2026-09-23):** keep the feature-001 order (`Settings - Chats - Camera - Calls - Status`) on every screen. The Calls-frame order is recorded in `data-model.md` as design-file drift. `TabKey`/`TabItem`/`TAB_KEYS` are unchanged.

## Decision 2 - Segmented control state

**Approved (Clarification 2):** the `All | Missed` control is rendered exactly as Figma's default (`All` = active white-on-`#007AFF`, `Missed` = inactive `#007AFF` on white, 1px `rgba(0,122,255,0.756)` radius-8 border) and is **non-actionable** (disabled buttons, `aria-selected` static). No filter behaviour in 004; a later feature may make it interactive and re-enable the segments.

## Decision 3 - Control semantics (no-ops)

**Approved (Clarification 3):** `Edit` (feature 005 scope), `+ new call`, row activation, and info button are no-ops - focusable but with no navigation or state change, mirroring the feature-001 `Broadcast Lists` and feature-003 `Read All` precedent. `Edit` sits **leading** (left, `x16`) on Calls - the opposite of Chats where it is trailing (Clarification 5) - and the trailing slot holds the `+ new call` icon. There is no screen title (Clarification 6); the segmented control occupies the title band.

## Decision 4 - Row geometry

| Element | Local x | Size | Spec |
| ------- | ------- | ---- | ---- |
| Row frame | - | 375x56 | `#FFFFFF`; separators 0.33px `rgba(60,60,67,0.29)` inset to `x68` |
| Avatar | 16 | 40x40 | image (001 initials fallback approved, Clarification 4) |
| Name | 68 | 16px/400 | `#000000`; `#FF3B30` when missed |
| Direction glyph | 67.5 | 15x15 | exported Figma path, `#8E8E93` (identical glyph for all rows) |
| Direction label | 89 | 14px/400 | `outgoing`/`incoming`/`missed`, `#8E8E93` |
| Date | right aligned ~272 | 14px/400 | `#8E8E93` |
| Info button | 337 | 22x22 | `#007AFF` circled "i" (exported Figma path) |

Rows are 56px (vs 68px chat rows) so a dedicated `--wa-call-row-height: 56px` token is added to the design system; nothing else reuses it in 004.

## Decision 5 - NavigationBar extensions

The existing nav bar renders `title` (required) in the centre grid column (1fr auto 1fr). For Calls: no title + a segmented control in the centre + an icon-only trailing action.

- `title` becomes optional (`input<string>('')`); an empty title renders no `<h1>`.
- A `<ng-content select="[data-nav-center]" />` slot lets the page project the segmented control into the title grid column.
- `NavAction` gains optional `icon?: 'new-call'`; the nav template renders the phone-plus `#007AFF` SVG (path exported from Figma `0:10630`) with `aria-label` = the action label.

Chats / Chat-window usage is unaffected (they pass `title` and text actions only).

## Typography (bounds method, from feature 001/002)

| Element | bounds (px) | derived |
| ------- | ----------- | ------- |
| Name | 19px | 16px/400 (`--wa-fs-chat-title` at `--wa-fw-regular`) |
| Direction label / date | 17px | 14px/400 (`--wa-fs-preview`, `--wa-text-secondary`) |
| Segmented `All` / `Missed` | 17px | 13px/500 (new `--wa-fs-control` token) |
| `Edit` | 22px | 17px/400 (`--wa-fs-nav-action`) |

Verified against the golden render; not claimed as exact.

## Dependency audit note

- No new runtime or dev dependencies. Inline SVG glyphs are paths re-exported from the Figma nodes (`0:10402` call glyph, `0:10404` info glyph, `0:10630` new-call glyph) via the local Figma MCP (`figma_download_figma_images`), stored under `tests/e2e/golden/calls-svg/`.
- Playwright golden from the Figma render (scale 1), same pipeline as `0-8855`/`0-8257`/`0-8114`.
- Interaction notes: photo avatars in the render vs initials in-app plus the known washed-overlay artifact mean the calls golden needs a `maxDiffPixelRatio` slack; measured baseline (2026-09-23) is ratio ~0.10 (29524 px), threshold set to 0.15.