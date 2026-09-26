# Design Research + Plan + Tasks + Quickstart: WhatsApp Edit Profile (feature 020)

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

## Plan

1. **Entry**: Settings profile header `section` → labelled button tap → `['/settings/profile']`.
2. **Screen**: `features/settings/profile-page` (Name prefilled from `SETTINGS_PROFILE` + About +
   Save no-op) + units.
3. **US3**: Back routing + responsive + gated golden (measured + 0.05 at capture).
4. **Closure**: design-map row 20 -> `020` + implemented; commits (spec/feat/docs).

**Gates**: G1 capture + approval; G2 build/unit green (e2e runs paused per owner directive);
G3 closure commit.

## Tasks

- [ ] T001 — Node inventory `0:10659` — PENDING Figma 429 (~09-28)
- [ ] T002 — Golden `0-10659-profile.png` — PENDING
- [ ] T003 — Glyph SVGs — PENDING
- [ ] T004 — Owner approval (fields/title) — PENDING
- [x] T005 — Settings profile header → button tap → `/settings/profile`
- [x] T006 — `features/settings/profile-page` scaffold + `/settings/profile` lazy route
- [x] T007 — Unit `profile-page.spec.ts`; `settings-page.spec.ts` profile tap
- [x] T008 — E2E `tests/e2e/profile.spec.ts` (US1/US2/US3 + gated golden); `settings.spec.ts`
      US1 extended
- [x] T009 — Responsive no-overflow for `/settings/profile`
- [x] T010 — build green + unit green
- [x] T011 — design-map row 20 -> `020` + implemented; commits (spec/feat/docs)

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per directive
```