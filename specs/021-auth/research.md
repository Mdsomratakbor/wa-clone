# Design Research: WhatsApp Authorization

**Source**: Figma fileKey `PcGX72lSWkYIk3pL5V8PS3`, node `0:11030` (design-map row 21).

**Capture status**: **BLOCKED — Figma REST API rate-limited (HTTP 429)** until ~2026-09-28.

## Declared identity (certain)

| Fact | Value |
| ---- | ----- |
| Frame | `0:11030` — "WhatsApp Authorization" (row 21, last) |
| Angular target | `feature/auth` at `/auth` (cold-start surface) |
| Design notes | "Phone number/keyboard confirmation"; "numeric keyboard form (phone confirmation)" |
| Interactions | none in design file → entry/flow is PENDING |

## Hypothesis to verify (NOT design facts)

- Title/brand, country + phone region labels
- Keypad geometry + digits layout + backspace glyph
- Continue/Cancel treatment and default-flow entry

## Capture plan (run once 429 clears — ~2026-09-28)

```powershell
npx -y figma-developer-mcp fetch --file-key PcGX72lSWkYIk3pL5V8PS3 --node-id 0:11030 --depth 6 --format json
```

Extract node inventory; export golden `tests/e2e/golden/0-11030-auth.png` + glyph SVGs.

## Canonical artifacts

The plan and the task list that used to live in this file now live in the canonical
Speckit artifacts for this feature:

- `plan.md` - approach, phases, review gates, drift policy
- `tasks.md` - the delivery checklist (this file keeps the research record only)