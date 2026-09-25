# Feature Specification: WhatsApp Account

**Feature Branch**: `014-account`

**Created**: 2026-09-24

**Status**: **Implemented — structural scope landed pre-capture (owner directive `2026-09-24`,
validated `2026-09-24`).** The `/settings/account` pushed screen (Back → `/settings`, title
"Account", hero block + Account rows from seed, no tab bar) and the Settings "Account" row
activation (navigate → `/settings/account`; other rows stay no-ops) shipped — build green, unit
156/156, full e2e 306 passed / 21 skipped (0 failures; 21 = gated goldens). Exact geometry, row
list/order, glyphs, hero treatment and golden remain PENDING the Figma capture (~2026-09-28) and
are gated at G1; provisional/hypothesis values in place until then.

**Input**: `figma/design-map.md` row 14 (`0:9371`) + `specs/014-account/research.md`

---

## Summary

Account is the first pushed sub-page off the Settings screen (design-map row 14). Settings'
"Account" row (feature 013, `SETTINGS_ROWS[0]`) currently no-ops; this feature makes it navigate
to `/settings/account`, which renders the Account screen: browser-style pushed surface (no tab
bar) with a hero/illustration block and the Account row set (Security / Two-step verification /
Change number / Delete my account — hypothesis). Account-internal rows stay no-ops (their targets
are not in the design map).

## PENDING design inventory (capture on ~2026-09-28)

- [ ] Hero block topology + glyph + dims/colors
- [ ] Account row list + order + glyphs (hypothesis: Security, Two-step verification, Change
      number, Delete my account)
- [ ] Nav (Back) + status-bar treatment

## Owner Clarifications (proposed — confirm at G1)

1. **Row list/order**: from the node payload; seed-driven, replaced at G1.
2. **Hero block**: structural hypothesis (present in the design); confirm geometry/glyph at G1.
3. **Back destination**: `/settings` (pushed-screen contract, matching starred). Confirm direct
   entry handling at G1.
4. **Tab bar**: absent on Account (pushed surface). Confirm.
5. **Responsive**: no horizontal overflow (contract pattern 006-013).

## Functional Requirements

- **FR-001**: Settings "Account" row navigates to `/settings/account`; the other four Settings
  rows stay no-ops.
- **FR-002**: `/settings/account` renders the Account screen (hero block + rows from `ACCOUNT_ROWS`).
- **FR-003**: Back returns to `/settings`.
- **FR-004**: Account rows are no-ops (targets not in the map).
- **FR-005**: No horizontal overflow at any breakpoint.

## Non-Goals

- Account-internal sub-screens (Security/two-step settings etc.).
- The hero illustration's real asset/glyph (PENDING capture); a structural placeholder is used.
- Edit Profile / Edit Contact / Contact Info / Chats Settings / Notifications / Data & Storage —
  rows 15-20 (Settings rows 2-5 remain no-ops).

## User Stories

- **US1 (entry)**: From Settings I tap "Account" and land on `/settings/account`.
- **US2 (screen)**: I see the Account chrome (Back + title), hero block and the Account rows,
  each focusable/labelled; no tab bar.
- **US3 (chroming)**: Back returns to `/settings`; no horizontal overflow; screen matches the
  Figma render within the measured golden threshold.

## Acceptance Criteria (validation targets)

1. Unit — `account-page.spec.ts`: chrome (Back + title), hero block, rows from seed, Back →
   `/settings`, no tab bar, row no-op. `settings-page.spec.ts`: Account row navigates
   (update the no-op case; others still no-op). Full suite green.
2. E2E `tests/e2e/account.spec.ts`: US1 (Settings → Account), US2, US3 (Back + golden
   `0-9371-account.png` gated). `settings.spec.ts` US2 update (first row now navigates).
3. Responsive: no-overflow cases appended for `/settings/account`.
4. `figma/design-map.md` row 14 spec → `014` + implemented at closure.

## Swap list

- `settings-page.ts`: `onRowActivate` — `account` → navigate, others no-op; `settings-page.spec.ts`
  no-op case updated (Account navigates; pick a non-account row for the no-op assertion).
- `app.routes.ts`: add `/settings/account` lazy route.
- `settings.seed.ts`: `ACCOUNT_PROFILE`-independent — add `ACCOUNT_ROWS` seed (feature local).
- Confirm no tests assert the Settings Account row is inert: `settings.spec.ts` US2 (updated).

## Closing note (deliberately incomplete)

Until T001 lands, `account-page` renders the structural hero block + hypothesis row list (stable
testids/aria-labels) — replaced at G1 with the captured design.