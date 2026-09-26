# Design Research + Plan: WhatsApp Data & Storage (feature 018)

**Source**: Figma fileKey `PcGX72lSWkYIk3pL5V8PS3`, node `0:10894` (design-map row 18).

**Capture status**: **BLOCKED — Figma REST API rate-limited (HTTP 429)** until ~2026-09-28.
Everything below the "Declared" lines is hypothesis to be replaced at G1.

## Declared identity (certain)

| Fact | Value |
| ---- | ----- |
| Frame | `0:10894` — "WhatsApp Data and Storage Usage" (row 18) |
| Angular target | `feature/settings` sub-page at `/settings/data-storage` |
| Entry | Settings → Data and Storage row (`data-storage`) |
| Surface | pushed (no tab bar), Back → `/settings` |
| Part of | Settings sub-pages cluster (rows 14–20) |

## Hypothesis to verify (NOT design facts)

- Rows/sections: Storage usage, Media auto-download (Images/Audio/Video/Documents sub-rows),
  Network usage — exact set/order/glyphs PENDING
- Auto-download option-row (chevron vs toggle) treatment

## Capture plan (run once 429 clears — ~2026-09-28)

```powershell
npx -y figma-developer-mcp fetch --file-key PcGX72lSWkYIk3pL5V8PS3 --node-id 0:10894 --depth 6 --format json
```

Extract node inventory (sections/rows/glyphs/nav); export golden
`tests/e2e/golden/0-10894-data-storage.png` + row/section glyph SVGs.

## Plan

1. **Screen**: `DATA_STORAGE_ROWS` seed (hypothesis) + `features/settings/data-storage-page` +
   units.
2. **Entry**: Settings row activation + settings e2e US2 update (no-op probe → Contacts row).
3. **US3**: Back routing + responsive + gated golden (measure baseline, ship measured + 0.05).
4. **Closure**: design-map row 18 -> `018` + implemented; commits (spec/feat/docs).

**Gates**: G1 capture + owner approval; G2 build/unit/e2e green; G3 closure commit.
**Drift**: "Data and Storage" row navigation is spec'd; rows provisional until G1.

## Asset manifest (deferred to Figma 429 retry)

| Asset | Source | Status |
| ----- | ------ | ------ |
| `tests/e2e/golden/0-10894-data-storage.png` | `0:10894` export | **pending — Figma 429 (~09-28)** |
| row/section glyph SVGs | per-node icons | **pending — Figma 429 (~09-28)** |