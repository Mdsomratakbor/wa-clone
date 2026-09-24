# Design Research: WhatsApp Camera

**Source**: Figma `WhatsApp UI Screens (Community)`, fileKey `PcGX72lSWkYIk3pL5V8PS3`,
node `0:9155` "WhatsApp Camera" (design-map row 12).

**Capture status**: **BLOCKED — Figma REST API rate-limited (HTTP 429)**. Re-confirmed
`2026-09-24` on the local Figma MCP (`get_figma_data`); retry-after ≈ 345k s (**~2026-09-28Z**).
No node payload is available yet, so **no geometry/content below is confirmed**. Everything marked
`PENDING` must be extracted from the node payload before the spec is finalized.

## Declared identity (certain, from `figma/design-map.md` + `figma/design-analysis.md`)

| Fact | Value |
| ---- | ----- |
| Frame | `0:9155` — "WhatsApp Camera" (row 12) |
| Canvas | `WhatsApp` (node `0:8102`), iPhone-resolution frames |
| Angular target | `feature/camera` (new top-level screen + `/camera` route) |
| Role | Fifth tab in the shared tab bar (`settings · chats · camera · calls · status`); today all three tab-bearing pages (chats/calls/status) show a local "Camera — coming soon" stub and never navigate |
| Neighbour surfaces | Status feed camera circle (`status-camera`) opens the status composer (F-007, shipped) — separate from the Camera tab | 

## Hypothesis to verify at capture (NOT design facts)

The analysis describes a "Camera viewport with controls". What is not assumed and must be
confirmed from the `0:9155` payload:

- viewport: dark full-bleed area; overlay chrome (if any) — top/bottom bars or overlaid controls
- controls: shutter/capture, camera flip/reverse, flash, close/cancel, capture-send CTA; their
  sizes, glyphs, positions
- whether the tab bar is visible on the Camera screen or the frame is immersive (full-screen)
- status bar / home indicator treatment on the dark surface
- any top-level title/header (unlikely) and the "done/send" flow after capture

## Capture plan (run once 429 clears — ~2026-09-28)

1. **Node inventory (deterministic, shell-automatable)** — the local MCP server exposes a CLI
   `fetch` subcommand; no agent tool required:
   ```powershell
   npx -y figma-developer-mcp fetch --file-key PcGX72lSWkYIk3pL5V8PS3 --node-id 0:9155 --depth 6 --format json
   ```
   Falls back (same payload): local MCP `figma_get_figma_data` `0:9155`.
2. Extract (record in this file as "Node inventory", mirroring 008/010).
3. Downloads (same retry window): golden `tests/e2e/golden/0-9155-camera.png` (native 1x) and
   control glyph SVGs via `figma_download_figma_images` (`--image-dir=tests/e2e/golden`).
4. Pixel-sampling (node + pngjs) for exact colors/geometry if node payload is ambiguous.

## Entry-point analysis (certain — tab wiring)

- All tab-bearing top-level pages route their named tabs (`calls`, `status`, `chats`) but leave
  `camera` as a local stub:
  - `chats-page.ts` `onTabSelect`: handles `/calls`, `/status`; camera falls to `activeTab.set`.
  - `calls-page.ts` `onTabSelect`: handles `/chats`, `/status`; camera falls to `activeTab.set`.
  - `status-page.ts` `onTabSelect`: handles `/chats`, `/calls`; camera falls to `activeTab.set`.
- Swap: add a `camera` branch → `navigate(['/camera'])` in all three; the Camera screen mounts the
  shared tab bar with the Camera tab active and routes the other four tabs.

## Decisions (draft — owner-confirm with spec clarifications)

- Build the Camera screen as a top-level `/camera` route inside the shared shell (status bar +
  content + home indicator), with the tab bar visible and the Camera tab active (hypothesis —
  immersive Chrome is PENDING the payload). Any deviation at G1 = drift.
- Structural controls (hypothesis): Close (returns to `/chats`), shutter, camera flip — all real,
  a11y-labelled buttons; no capture/send flow (Non-Goal).
- Golden = full-frame render at native resolution; e2e gated on capture (pattern 007-011).

## Drift register

- To be filled from the node inventory once captured. Only owner-flagged drift gets recorded.
- Provisional (pre-capture) decisions that become drift candidates at G1: tab bar visibility on
  the Camera screen; exact control set (Close/Shutter/Flip hypothesis).

## Asset manifest (deferred to Figma 429 retry)

| Asset | Source | Status |
| ----- | ------ | ------ |
| `tests/e2e/golden/0-9155-camera.png` | node `0:9155` export, native | **pending — Figma 429 (~09-28)** |
| control glyph SVGs | per-control icon nodes | **pending — Figma 429 (~09-28)** |