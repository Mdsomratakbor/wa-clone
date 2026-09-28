# Design Research: WhatsApp Edit Profile

**Source**: Figma fileKey `PcGX72lSWkYIk3pL5V8PS3`, node `0:10659` (design-map row 20).

**Capture status**: **BLOCKED — Figma REST API rate-limited (HTTP 429)** until ~2026-09-28.
Hypothesis below is replaced at G1.

## Declared identity (certain)

| Fact | Value |
| ---- | ----- |
| Frame | `0:10659` — "WhatsApp Edit Profile" (row 20) |
| Angular target | `feature/settings/profile` at `/settings/profile` |
| Entry | Settings profile header tap — subtitle is literally "Tap to edit profile" |
| Surface | pushed (no tab bar), Back → `/settings` |

## Hypothesis to verify (NOT design facts)

- Form fields: Name (prefilled) + About; avatar/layout; Save treatment
- Nav title wording ("Edit Profile")

## Capture plan (run once 429 clears — ~2026-09-28)

```powershell
npx -y figma-developer-mcp fetch --file-key PcGX72lSWkYIk3pL5V8PS3 --node-id 0:10659 --depth 6 --format json
```

Extract node inventory; export golden `tests/e2e/golden/0-10659-profile.png` + glyph SVGs.

## Canonical artifacts

The plan and the task list that used to live in this file now live in the canonical
Speckit artifacts for this feature:

- `plan.md` - approach, phases, review gates, drift policy
- `tasks.md` - the delivery checklist (this file keeps the research record only)