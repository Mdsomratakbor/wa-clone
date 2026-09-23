# Research — Feature 003: WhatsApp Chat List — Edit Mode

Phase 0 output. Resolves every technical unknown from the Technical Context.

## Decision 1 — Edit-mode entry & exit

**Established (2026-09-23):** the feature-001 trailing action `Edit` (already wired as `NavAction { id: 'edit' }`) enters edit mode; a trailing `Done` exits it. The Figma frame shows only the edit state (`Done` and selection circles already rendered), so transit is implementation-defined using the existing action slot. No route change — edit mode is a `signal<boolean>` on `ChatsPage`.

## Decision 2 — Selection circle visual states

**Approved (Clarification 2, 2026-09-23):** Figma `Select Icon` (`0:8125..0:8211`) is a 21px image with a 1.5px stroke in `#3C3C43` at 42% opacity — the idle ring. The selected state has no Figma source; owner approved the iOS-standard **solid `#007AFF` ring with a white check**, drawn as inline SVG (no raster asset).

## Decision 3 — Row layout in edit mode

**Decision:** the circle occupies the row's 16px gutter (Figma offset: ring `x404` vs frame `x387` → 17px; row content starts at avatar `x442` → 55px). Implementation shifts the row's content padding from `16px` to `55px` while the circle is absolutely centred in the gutter. This preserves the 001 rows (avatar 48px, name/preview/time) unchanged and reproduces the Figma off-set geometry without forking `ChatListItem`.

## Decision 4 — Action semantics (in-memory)

**Approved (Clarification 4):** `ChatsPage` maintains a working copy of `CHAT_SEED`. `Delete` and `Archive` both remove the selected ids from that copy and clear the selection (they are visually indistinguishable in-list; the archived view, undo, and confirmations are out of scope). `Read All` is a **control-only no-op** — feature 001 renders no read/unread indicator (the Figma `Read` groups `0:8121` etc. were not implemented), so there is no state for it to act on.

## Decision 5 — Enabled/disabled bar styling

**Approved (Clarification 5):** at `0` selected all three labels render `#C7C7CC` (matches Figma) and the buttons are `disabled` (not focusable/actionable). At `≥1` selected they become actionable and recoloured: `Archive`/`Read All` `#007AFF`, `Delete` `#FF3B30` (system red — iOS standard; not in Figma). Recorded drift.

## Decision 6 — Chat Actions bar geometry

**Established (Clarification 7):** Figma bar `0:8220` is 83px tall at y`-2220` but spans to the frame bottom (`-2137`), where the sibling `HomeIndicator` (`0:8254`, 34px) overlays its lower region — identical to the feature-002 composer reasoning. The visible band is therefore `83 − 34 = 49px`, equal to `--wa-tab-bar-height`; the bar substitutes the tab bar without disturbing the shell. Its drop-shadow (`effect1` `#A6A6AA` at y`-0.33`) maps to the existing `--wa-nav-hairline` effect token.

## Typography (bounds method, from feature 001/002)

| Element | bounds (px) | derived |
| ------- | ----------- | ------- |
| Chat Actions labels `Archive / Read All / Delete` | 20px | 17px/400 (`--wa-fs-nav-action`) |
| Nav `Done` | 22px | 17px/400 `#007AFF` (existing nav action style) |

Verified against the golden render; not claimed as exact.

## Dependency audit note

- No new runtime or dev dependencies. Inline SVG for the check/circle; Playwright golden from the Figma render (`FIGMA_DOWNLOAD_FIGMA_IMAGES`, scale 1), same pipeline as `0-8855`/`0-8257`.
- Interaction spec mirrors iOS conventions (tap row toggles, check-on-accent) because Figma defines no interaction.