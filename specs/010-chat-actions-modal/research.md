# Design Research: WhatsApp Chat Actions Modal

**Source**: Figma `WhatsApp UI Screens (Community)`, fileKey `PcGX72lSWkYIk3pL5V8PS3`,
node `0:10087` "WhatsApp Chat Actions" (design-map row 10).

**Capture status**: **BLOCKED — Figma REST API rate-limited (HTTP 429)**. Re-confirmed
`2026-09-24` on all channels (local Figma MCP `get_figma_data` + `download_figma_images`,
Composio `FIGMA_GET_FILE_NODES`); retry-after ≈ 345k s (**~2026-09-28Z**). No node payload is
available yet, so **no geometry/content below is confirmed**. Everything marked `PENDING` must be
extracted from the node payload before the spec is finalized.

## Declared identity (certain, from `figma/design-map.md`)

| Fact | Value |
| ---- | ----- |
| Frame | `0:10087` — "WhatsApp Chat Actions" (row 10) |
| Canvas | `WhatsApp` (node `0:8102`), iPhone-resolution frames |
| Angular target | `shared/components/action-sheet` (component landed in feature 009) |
| Shared component refs | action-sheet group at `0:9075`; reused by row 9 (Add Modal `0:9072`, shipped `2026-09-24`) and row 11 (Settings Modal `0:9778`) |
| Entry point (hypothesis) | Chat Window screen — a trailing "More options" affordance in the header (see hypothesis) |

## Hypothesis to verify at capture (NOT design facts)

The Chat Actions Modal lives on the Chat Window screen (row 2) and opens a bottom sheet from a
header affordance — but neither the trigger glyph nor the row content is assumed. The following
will be confirmed/corrected from the `0:10087` payload:

- the entry affordance: trailing "More options" (⋮-style) icon button in the chat header, its
  position relative to Video call / Call, and its a11y label
- backdrop dim + tap-to-dismiss behavior (expect parity with the 009 sheet)
- sheet: width, height, corner radius, surface color (expect same shared `action-sheet` group
  `0:9075` values as the Add Modal)
- action rows: count, per-row icon tile (size/fill/glyph) + label text/typography/color,
  separators/hairlines
- dismissal affordances (drag down, backdrop tap, Escape) and whether the row set includes a
  cancel/destruct row
- whether the frame stands alone or nests under the Chat Window frame

## Capture plan (run once 429 clears — ~2026-09-28)

1. **Node inventory (deterministic, shell-automatable)** — the local MCP server exposes a CLI
   `fetch` subcommand; no agent tool required:
   ```powershell
   npx -y figma-developer-mcp fetch --file-key PcGX72lSWkYIk3pL5V8PS3 --node-id 0:10087 --depth 6 --format json
   ```
   Re-run with `--node-id` for sub-instances (walk children iteratively) or `--depth` as needed.
   Falls back (same payload): local MCP `figma_get_figma_data` `0:10087`; then Composio
   `FIGMA_GET_FILE_NODES`.
2. Extract (record in this file as "Node inventory", mirroring 008):
   - frame dims/fills; backdrop; sheet geometry; handle; per-row values; text runs + letter
     spacing; separators; the entry affordance glyph + position.
3. Verify the shared group `0:9075` was reused unchanged (diff against the shipped 009 values); any
   deviation → drift register.
4. Downloads (same retry window): golden `tests/e2e/golden/0-10087-chat-actions.png` (native 1x)
   and row glyph SVGs + the entry glyph via `figma_download_figma_images`/Composio
   (`--image-dir=tests/e2e/golden` on the local MCP restricts write targets).
5. Pixel-sampling (node + pngjs) for exact colors/geometry if node payload is ambiguous.

## Entry-point analysis (hypothesis — confirm at capture)

- The Chat Window header (`shared/components/chat-header/chat-header.html`) trails with two icon
  buttons ("Video call, coming soon", "Call, coming soon"); no More/overflow affordance exists
  today. The Chat Actions Modal most plausibly opens from a new trailing "More options" (⋮) icon
  button — **to confirm** against the payload (it may instead re-use an existing glyph or nest).
- Chat Window opens at route `/chat/:id` and the header is shared across the chat-window feature;
  the ⌄ back button already returns to `/chats` (`chat-window-page.ts:30`).

## Decisions (draft — owner-confirm with spec clarifications)

- Reuse the shipped `ActionSheetComponent` unchanged (`shared/components/action-sheet`) — feature
  010 adds only a feature-level wrapper (`features/chat-actions-modal` or within
  `chat-window`) + the header entry affordance + wiring.
- Row items are real buttons w/ testable labels; decorative icons are SVG glyphs (deferred like
  008's chevron) or inline fills.
- Golden = full-frame render at native resolution; e2e gated on capture (same pattern as 007/008/009).

## Drift register

- To be filled from the node inventory once captured. Only owner-flagged drift gets recorded.

## Asset manifest (deferred to Figma 429 retry)

| Asset | Source | Status |
| ----- | ------ | ------ |
| `tests/e2e/golden/0-10087-chat-actions.png` | node `0:10087` export, native | **pending — Figma 429 (~09-28)** |
| icon/glyph SVGs (+ entry glyph) | per-row icon nodes / entry affordance | **pending — Figma 429 (~09-28)** |