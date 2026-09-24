# Design Research: WhatsApp Settings Modal

**Source**: Figma `WhatsApp UI Screens (Community)`, fileKey `PcGX72lSWkYIk3pL5V8PS3`,
node `0:9778` (design-map row 11; design-analysis groups it with the Add/Chat Actions sheets as a
bottom action sheet over a dimmed overlay).

**Capture status**: **BLOCKED — Figma REST API rate-limited (HTTP 429)**. Re-confirmed
`2026-09-24` on the local Figma MCP (`get_figma_data`); retry-after ≈ 345k s (**~2026-09-28Z**).
No node payload is available yet, so **no geometry/content below is confirmed**. Everything marked
`PENDING` must be extracted from the node payload before the spec is finalized.

## Declared identity (certain, from `figma/design-map.md` + `figma/design-analysis.md`)

| Fact | Value |
| ---- | ----- |
| Frame | `0:9778` — Settings Modal (row 11; labelled "Chats Settings" modal in the analysis) |
| Canvas | `WhatsApp` (node `0:8102`), iPhone-resolution frames |
| Angular target | `shared/components/action-sheet` (component landed in feature 009) |
| Shared component refs | action-sheet group at `0:9075`; consumed by row 9 (Add Modal, shipped), row 10 (Chat Actions, shipped) |
| Entry point (owner-approved host) | Settings screen — currently the stub route `/settings` (`features/starred-messages/settings-stub-page.ts`); the real Settings screen (row 13, `0:9198`) takes over as host later |
| Nearest sibling pattern | 010's chat header "More options" trailing trigger + sheet over routed content |

## Hypothesis to verify at capture (NOT design facts)

The sheet is a third instance of the shared action-sheet group. What is not assumed and must be
confirmed from the `0:9778` payload:

- the entry affordance on the Settings surface (trigger glyph, header position, a11y label) and
  its relationship to the Settings row group (`0:9207`)
- backdrop dim + tap-to-dismiss behavior (expect parity with the `0:9075` sheet)
- sheet: width, height, corner radius, surface color (expect same shared `action-sheet` values)
- action rows: count, per-row icon tile (size/fill/glyph) + label text/typography/color,
  separators/hairlines; any title/close affordance
- dismissal affordances (drag down, backdrop tap, Escape)
- whether the frame stands alone or nests under the Settings frame (`0:9198`)

## Capture plan (run once 429 clears — ~2026-09-28)

1. **Node inventory (deterministic, shell-automatable)** — the local MCP server exposes a CLI
   `fetch` subcommand; no agent tool required:
   ```powershell
   npx -y figma-developer-mcp fetch --file-key PcGX72lSWkYIk3pL5V8PS3 --node-id 0:9778 --depth 6 --format json
   ```
   Falls back (same payload): local MCP `figma_get_figma_data` `0:9778`.
2. Extract (record in this file as "Node inventory", mirroring 008/010).
3. Verify the shared group `0:9075` was reused unchanged (diff against shipped 009 values); any
   deviation → drift register.
4. Downloads (same retry window): golden `tests/e2e/golden/0-9778-settings-modal.png` (native 1x)
   and row glyph SVGs + the entry glyph via `figma_download_figma_images`
   (`--image-dir=tests/e2e/golden` on the local MCP restricts write targets).
5. Pixel-sampling (node + pngjs) for exact colors/geometry if node payload is ambiguous.

## Entry-point analysis (owner-approved host — confirm details at capture)

- The Settings route exists as a stub (`features/starred-messages/settings-stub-page.ts`: nav bar
  "Settings" + "Settings coming soon." paragraph). Per owner decision `2026-09-24`, feature 011
  hosts the modal on this stub with a minimal trailing trigger affordance; the real Settings
  screen (row 13, `0:9198`) becomes the permanent host. Adjacent to 010's chat header trigger
  (⋮-style icon button emitting an output).
- Known stub quirk (out of scope): the stub Back navigates to `/starred-messages` (008 leftover);
  leave unchanged, note for row 13.

## Decisions (draft — owner-confirm with spec clarifications)

- Reuse the shipped `ActionSheetComponent` unchanged — feature 011 adds a feature-level wrapper
  (`features/settings/settings-modal.*`) + the Settings-entry trigger + wiring + a minimal host in
  the stub.
- Row items are real buttons w/ testable labels; decorative icons are SVG glyphs (deferred like
  008's chevron) or inline fills.
- Golden = full-frame render at native resolution; e2e gated on capture (same pattern as
  007/008/009/010).

## Drift register

- To be filled from the node inventory once captured. Only owner-flagged drift gets recorded.

## Asset manifest (deferred to Figma 429 retry)

| Asset | Source | Status |
| ----- | ------ | ------ |
| `tests/e2e/golden/0-9778-settings-modal.png` | node `0:9778` export, native | **pending — Figma 429 (~09-28)** |
| icon/glyph SVGs (+ entry glyph) | per-row icon nodes / entry affordance | **pending — Figma 429 (~09-28)** |