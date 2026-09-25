# Design Research: WhatsApp Settings

**Source**: Figma `WhatsApp UI Screens (Community)`, fileKey `PcGX72lSWkYIk3pL5V8PS3`,
node `0:9198` "WhatsApp Settings" (design-map row 13).

**Capture status**: **BLOCKED — Figma REST API rate-limited (HTTP 429)**. No node payload for
`0:9198` yet (release ~2026-09-28, re-confirmed 2026-09-24, retry-after ≈ 345k s). No geometry/
content below is confirmed; everything flagged PENDING must come from the node payload.

## Declared identity (certain, from `figma/design-map.md` + design-analysis)

| Fact | Value |
| ---- | ----- |
| Frame | `0:9198` — "WhatsApp Settings" |
| Angular target | `feature/settings` (replaces the current `settings-stub-page` at `/settings`) |
| Role | First tab in the shared tab bar (`settings · chats · camera · calls · status`); the Settings tab today is a local stub on the other tab pages |
| Related frames | Account `0:9371`, Chats Settings `0:9973`, Notifications `0:10758`, Data & Storage `0:10894`, Edit Profile `0:10659` = rows 14-20 = **later features** (row activation no-op) |
| Modal | Settings Modal `0:9778` (feature 011) is already hosted on the Settings entry (owner-approved); the real screen takes over the host |

## Hypothesis to verify at capture (NOT design facts)

- Settings header row: avatar + name (community file bares the profile name "Ani") + chevron;
  sizes/colors; subtitle(s)
- The full row list and order (expect Account, Chats Settings, Notifications, Data and Storage,
  and Contacts/avatar/"Cleared"-style extra rows); row glyphs; divider style
- Nav-bar treatment (Back chevron vs tab-only entry; title "Settings")
- Precisely where the Settings Modal (`0:9778`) is reachable from — hypothesis today: a
  "Settings options" (⋮) trigger in the settings surface top-right (carried over from 011)
- Tab bar presence on the Settings screen (assumed: yes, active Settings — same as siblings)

## Capture plan (run once 429 clears — ~2026-09-28)

```powershell
npx -y figma-developer-mcp fetch --file-key PcGX72lSWkYIk3pL5V8PS3 --node-id 0:9198 --depth 6 --format json
```

Extract into this file ("Node inventory", mirroring 008/010): frame dims/fills; profile header
geometry/text; row list + glyphs + order; nav treatment; modal entry placement. Same retry window:
golden `tests/e2e/golden/0-9198-settings.png` + row/chevron/avatar SVGs.

## Entry-point analysis (certain)

- `/settings` today mounts `features/starred-messages/settings-stub-page` ("Settings coming soon",
  Back → `/starred-messages`, 011 Settings Modal trigger, no tab bar).
- `starred-page` Back → `/settings` (must keep).
- Swap: route `settings` to the new `features/settings/settings-page`; delete the stub; keep
  `data-testid="settings-page"` and `settings-options` (011 contract) intact.

## Decisions (draft — owner-confirm at G1)

- Profile header + row list render from a data seed (`SETTINGS_PROFILE`, `SETTINGS_ROWS`) so G1
  only edits data, not markup.
- Settings tab navigation on the new page mirrors camera-page: chats/calls/camera/status route,
  settings = no-op; tab bar visible, Settings active.
- Rows activation = no-op (rows 14-20 later). Golden gated on capture (pattern 007-012).

## Drift register

- `data-testid="settings-page"` + `settings-options` preserved from the stub host so 011 and
  existing e2e contracts stay stable; the page content itself is the (expected) Settings screen.
- "Settings coming soon" stub text is intentionally removed — the real screen replaces it
  (drift-flagged, spec'd).
- Provisional: profile name/subtitle, exact row list/order, modal trigger placement, glyphs,
  avatar rendering → G1.

## Asset manifest (deferred to Figma 429 retry)

| Asset | Source | Status |
| ----- | ------ | ------ |
| `tests/e2e/golden/0-9198-settings.png` | node `0:9198` export, native | **pending — Figma 429 (~09-28)** |
| row/chevron/avatar glyph SVGs | per-row icon nodes | **pending — Figma 429 (~09-28)** |