# Design Research: WhatsApp Notifications

**Source**: Figma `WhatsApp UI Screens (Community)`, fileKey `PcGX72lSWkYIk3pL5V8PS3`,
node `0:10758` "WhatsApp Notifications" (design-map row 17).

**Capture status**: **BLOCKED — Figma REST API rate-limited (HTTP 429)**. No node payload for
`0:10758` yet (release ~2026-09-28). Nothing below is confirmed; everything PENDING is hypothesis
to be replaced at G1 from the node payload.

## Declared identity (certain, from design-map + design-analysis)

| Fact | Value |
| ---- | ----- |
| Frame | `0:10758` — "WhatsApp Notifications" (row 17) |
| Angular target | `feature/settings` sub-page (pushed screen at `/settings/notifications`) |
| Entry | Settings → Notifications row (settings-page) |
| Style of surface | pushed screen (no tab bar), Back → `/settings` |
| Part of | Settings sub-pages cluster (rows 14–20) |

## Hypothesis to verify at capture (NOT design facts)

- Row set/labels + grouping (expect Message notifications / Group notifications sections with
  Sound, Vibrate, Popup notification, Light; Show previews) — exact set/order/glyphs PENDING
- Toggle-style rows vs chevron rows (toggles are map-external controls)

## Capture plan (run once 429 clears — ~2026-09-28)

```powershell
npx -y figma-developer-mcp fetch --file-key PcGX72lSWkYIk3pL5V8PS3 --node-id 0:10758 --depth 6 --format json
```

Extract "Node inventory" here: sections/rows/labels/order/glyphs; nav treatment. Same retry
window: golden `tests/e2e/golden/0-10758-notifications.png` + row/section glyph SVGs.

## Drift register

- Row list/labels provisional (hypothesis above).
- Toggle rows rendered as chevron rows (no-op) until capture defines them.
- Nav title = "Notifications" on the pushed header (PENDING confirmation).

## Asset manifest (deferred to Figma 429 retry)

| Asset | Source | Status |
| ----- | ------ | ------ |
| `tests/e2e/golden/0-10758-notifications.png` | node `0:10758` export, native | **pending — Figma 429 (~09-28)** |
| row/section glyph SVGs | per-node icons | **pending — Figma 429 (~09-28)** |