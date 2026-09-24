# Design Research: WhatsApp New Chat (Add) Modal

**Source**: Figma `WhatsApp UI Screens (Community)`, fileKey `PcGX72lSWkYIk3pL5V8PS3`,
node `0:9072` "WhatsApp Add Modal" (design-map row 9).

**Capture status**: **BLOCKED — Figma REST API rate-limited (HTTP 429)**. Re-confirmed
`2026-09-24` on all channels (local Figma MCP `get_figma_data` + `download_figma_images`,
Composio `FIGMA_GET_FILE_NODES`); retry-after ≈ 345k s (**~2026-09-28Z**). No node payload is
available yet, so **no geometry/content below is confirmed**. Everything marked `PENDING` must be
extracted from the node payload before the spec is implemented.

## Declared identity (certain, from `figma/design-map.md`)

| Fact | Value |
| ---- | ----- |
| Frame | `0:9072` — "WhatsApp Add Modal" (row 9) |
| Canvas | `WhatsApp` (node `0:8102`), iPhone-resolution frames |
| Angular target | `shared/components/action-sheet` (+ feature-level Add Modal wiring) |
| Shared component refs | action-sheet group at `0:9075`, reused by row 10 (Chat Actions `0:10087`) and row 11 (Settings Modal `0:9778`) |
| Entry point | Chats screen FAB "Start new chat" — `chats-page.ts:105` `onFabPressed()` currently no-ops (`F-001: new-chat action sheet is a later feature.`) |

## Hypothesis to verify at capture (NOT design facts)

The community file is a 24-screen WhatsApp-like spec. A plausible Add-modal shape (bottom sheet
with action rows) is **not assumed**; the following will be confirmed/corrected from the payload:

- backdrop dim + tap-to-dismiss behavior
- sheet: width, height, corner radius, surface color
- grab bar / handle and any title or close glyph
- action rows: count, per-row icon tile (size/fill/glyph) + label text/typography/color,
  separators/hairlines
- dismissal affordances (drag down, backdrop tap, Escape)
- whether the framè is standalone or the sheet nests under the Chats frame

## Capture plan (run once 429 clears — ~2026-09-28)

1. **Node inventory (deterministic, shell-automatable)** — the local MCP server exposes a CLI
   `fetch` subcommand; no agent tool required:
   ```powershell
   npx -y figma-developer-mcp fetch --file-key PcGX72lSWkYIk3pL5V8PS3 --node-id 0:9072 --depth 6 --format json
   ```
   Re-run with `--node-id` for sub-instances (walk children iteratively) or `--depth` as needed.
   Falls back (same payload): local MCP `figma_get_figma_data` `0:9072`; then Composio
   `FIGMA_GET_FILE_NODES`.
2. Extract (record in this file as "Node inventory", mirroring 008):
   - frame dims/fills; backdrop; sheet geometry; handle; per-row values; text runs + letter
     spacing; separators.
3. Verify the shared group `0:9075` against rows 10/11 frames (`0:10087`, `0:9778`) so the shared
   `action-sheet` contract is componentized once, reused three times.
4. Downloads (same retry window): golden `tests/e2e/golden/0-9072-add-modal.png` (native 1x) and
   row glyph SVGs via `figma_download_figma_images`/Composio `FIGMA_DOWNLOAD_FIGMA_IMAGES`
   (`--image-dir=tests/e2e/golden` on the local MCP restricts write targets).
5. Pixel-sampling (node + pngjs) for exact colors/geometry if node payload is ambiguous.

## Entry-point analysis (certain)

- Chats screen FAB → `chats-page.ts:105` `onFabPressed()`; today a no-op awaiting F-001. Swap =
  open the Add Modal. Tab bar is hidden when the FAB shows (`chats-page.html:29-33`), so the modal
  overlays the Chats screen on top of the shell (`app-shell` = status bar + content + home
  indicator).
- Likely presentation: a modal overlay rendered above the routed page (no new route needed), with
  backdrop covering the content area — **to confirm** whether the design dims the status bar too.

## Decisions (draft — owner-confirm with spec clarifications)

- Build once: shared `ActionSheetComponent` (`shared/components/action-sheet`) + a
  `data`-driven `Action` row model; reuse for rows 9/10/11.
- Row items are real buttons w/ testable labels; decorative icons are SVGs (vector captures
  deferred like 008's chevron) or inline glyph fills.
- Golden = full-frame render at native resolution; e2e gated on capture (same pattern as 008/007).

## Drift register

- To be filled from the node inventory once captured. Only owner-flagged drift gets recorded.

## Asset manifest (deferred to Figma 429 retry)

| Asset | Source | Status |
| ----- | ------ | ------ |
| `tests/e2e/golden/0-9072-add-modal.png` | node `0:9072` export, native | **pending — Figma 429 (~09-28)** |
| icon/glyph SVGs | per-row icon nodes | **pending — Figma 429 (~09-28)** |