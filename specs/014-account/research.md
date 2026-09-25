# Design Research: WhatsApp Account

**Source**: Figma `WhatsApp UI Screens (Community)`, fileKey `PcGX72lSWkYIk3pL5V8PS3`,
node `0:9371` "WhatsApp Account" (design-map row 14).

**Capture status**: **BLOCKED — Figma REST API rate-limited (HTTP 429)**. No node payload for
`0:9371` yet (release ~2026-09-28, re-confirmed 2026-09-24, retry-after ≈ 345k s). No geometry/
content below is confirmed; everything flagged PENDING must come from the node payload.

## Declared identity (certain, from design-map + design-analysis)

| Fact | Value |
| ---- | ----- |
| Frame | `0:9371` — "WhatsApp Account" (row 14) |
| Angular target | `feature/settings/account` (new pushed sub-screen at `/settings/account`) |
| Entry | Settings screen row **Account** (feature 013's `SETTINGS_ROWS[0]`) — first activated row |
| Style of surface | pushed screen (no tab bar), Back → `/settings` (pattern: chat window, starred) |
| Related rows | Edit Contact `0:10334`, Edit Profile `0:10659`, Contact Info `0:9486` etc. = later |

## Hypothesis to verify at capture (NOT design facts)

- Headline/hero block (the design shows a camera-style illustration near the title) — topology,
  dims, colors
- Row list + order within the Account screen (expect Security, Two-step verification, Change
  number, Delete my account — near-certain from the WhatsApp account surface), row glyphs,
  dividers, text colors
- Nav treatment (Back chevron + title "Account"), status bar

## Capture plan (run once 429 clears — ~2026-09-28)

```powershell
npx -y figma-developer-mcp fetch --file-key PcGX72lSWkYIk3pL5V8PS3 --node-id 0:9371 --depth 6 --format json
```

Extract into this file ("Node inventory", mirroring 008/010/013): frame dims/fills; hero block
geometry/glyph; row list/order/glyphs; nav treatment. Same retry window: golden
`tests/e2e/golden/0-9371-account.png` + hero/row glyph SVGs.

## Entry-point analysis (certain)

- `settings-page.onRowActivate` currently no-ops for all rows; this feature activates the Account
  row → `router.navigate(['/settings/account'])`, leaves the other four rows as no-ops (rows 15-20
  later).
- `settings.spec.ts` US2 currently asserts the first row is a no-op — swap list item.

## Decisions (draft — owner-confirm at G1)

- Account screen = pushed surface: `NavigationBar` (Back → `/settings`, title "Account") + hero
  block + row list from seed (`ACCOUNT_ROWS`), no tab bar. Row activation within Account stays
  no-op (their sub-screens are not in the map).
- Golden gated on capture (pattern 007-013).

## Drift register

- Hero/illustration block is a structural hypothesis (present in the design, geometry PENDING).
- Row list/order/glyphs provisional → G1 data-swap.
- No tab bar on the pushed surface (matches starred/chat-window pattern; PENDING confirmation).

## Asset manifest (deferred to Figma 429 retry)

| Asset | Source | Status |
| ----- | ------ | ------ |
| `tests/e2e/golden/0-9371-account.png` | node `0:9371` export, native | **pending — Figma 429 (~09-28)** |
| hero/row glyph SVGs | per-node icons | **pending — Figma 429 (~09-28)** |