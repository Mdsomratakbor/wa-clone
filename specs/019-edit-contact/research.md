# Design Research + Plan: WhatsApp Edit Contact (feature 019)

**Source**: Figma fileKey `PcGX72lSWkYIk3pL5V8PS3`, node `0:10334` (design-map row 19).

**Capture status**: **BLOCKED — Figma REST API rate-limited (HTTP 429)** until ~2026-09-28.
Everything below "Declared" is hypothesis to be replaced at G1.

## Declared identity (certain)

| Fact | Value |
| ---- | ----- |
| Frame | `0:10334` — "WhatsApp Edit Contact" (row 19) |
| Angular target | `feature/contact-info` form at `/contact/:id/edit` |
| Part of | Contact Info sibling cluster (rows 15/19); interactions empty in design file → entry is a declared hypothesis |
| Surface | pushed (no tab bar), Back → `/contact/:id` |

## Hypothesis to verify (NOT design facts)

- Entry: "Edit" action in Contact Info pushed header (vs an Edit row/badge)
- Form fields: Name (prefilled) + Phone; Save layout; avatar/glyph edit affordance
- Nav title wording

## Capture plan (run once 429 clears — ~2026-09-28)

```powershell
npx -y figma-developer-mcp fetch --file-key PcGX72lSWkYIk3pL5V8PS3 --node-id 0:10334 --depth 6 --format json
```

Extract node inventory (fields/buttons/glyphs/nav); export golden
`tests/e2e/golden/0-10334-edit-contact.png` + glyph SVGs.

## Plan

1. **Screen**: `features/contact-info/edit-contact-page` (form: Name prefilled from `CHAT_SEED`,
   Phone, Save no-op) + units.
2. **Entry**: Contact Info NavigationBar trailing "Edit" action → `['/contact', id, 'edit']`.
3. **US3**: Back routing + responsive + gated golden (measure baseline, ship measured + 0.05).
4. **Closure**: design-map row 19 -> `019` + implemented; commits (spec/feat/docs).

**Gates**: G1 capture + owner approval; G2 build/unit green (+ e2e when owner permits runs);
G3 closure commit.
**Drift**: Edit entry is a declared hypothesis (design has no interactions); form fields
provisional until G1.

## Asset manifest (deferred to Figma 429 retry)

| Asset | Source | Status |
| ----- | ------ | ------ |
| `tests/e2e/golden/0-10334-edit-contact.png` | `0:10334` export | **pending — Figma 429 (~09-28)** |
| form/glyph SVGs | per-node icons | **pending — Figma 429 (~09-28)** |