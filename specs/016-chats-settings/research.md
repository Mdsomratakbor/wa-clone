# Design Research: WhatsApp Chats Settings

**Source**: Figma `WhatsApp UI Screens (Community)`, fileKey `PcGX72lSWkYIk3pL5V8PS3`,
node `0:9973` "WhatsApp Chats Settings" (design-map row 16).

**Capture status**: **BLOCKED — Figma REST API rate-limited (HTTP 429)**. No node payload for
`0:9973` yet (release ~2026-09-28). Nothing below is confirmed; everything PENDING is hypothesis
to be replaced at G1 from the node payload.

## Declared identity (certain, from design-map + design-analysis)

| Fact | Value |
| ---- | ----- |
| Frame | `0:9973` — "WhatsApp Chats Settings" (row 16) |
| Angular target | `feature/settings` sub-page (pushed screen at `/settings/chats`) |
| Entry | Settings → Chats Settings row (settings-page) |
| Style of surface | pushed screen (no tab bar), Back → `/settings` |
| Part of | Settings sub-pages cluster (rows 14–20 sibling cluster) |

## Hypothesis to verify at capture (NOT design facts)

- Row set/labels: expect Wallpaper, Font size, Keyboard, Enter key sends, Media visibility —
  exact set/order PENDING
- Row glyphs, chevrons, section headers, wallpaper preview tile
- Nav title/breadcrumb treatment

## Capture plan (run once 429 clears — ~2026-09-28)

```powershell
npx -y figma-developer-mcp fetch --file-key PcGX72lSWkYIk3pL5V8PS3 --node-id 0:9973 --depth 6 --format json
```

Extract "Node inventory" here: frame dims; row list/labels/order; glyphs; nav treatment. Same
retry window: golden `tests/e2e/golden/0-9973-chats-settings.png` + row glyph SVGs.

## Drift register

- Row list/labels provisional (hypothesis above).
- Wallpaper/Font size/Keyboard controls are later settings or map-external; rows are no-ops this
  feature (PENDING confirmation).
- Nav title = "Chats Settings" on the pushed header (PENDING confirmation).

## Asset manifest (deferred to Figma 429 retry)

| Asset | Source | Status |
| ----- | ------ | ------ |
| `tests/e2e/golden/0-9973-chats-settings.png` | node `0:9973` export, native | **pending — Figma 429 (~09-28)** |
| row/Section glyph SVGs | per-node icons | **pending — Figma 429 (~09-28)** |