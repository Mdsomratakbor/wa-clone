# Feature Specification: WhatsApp Edit Profile

**Feature Branch**: `020-edit-profile`

**Created**: 2026-09-26

**Status**: **In progress — structural scope landed pre-capture (owner directive `2026-09-24`).**
The Settings profile header ("Tap to edit profile" — `settings-profile`) now opens
`/settings/profile`, rendering the Edit Profile pushed screen (Back → `/settings`, title
"Edit Profile", structural Name/About form + Save, no tab bar). Save is a no-op. Exact form
fields, layout, glyphs and golden remain PENDING the Figma capture (~2026-09-28) and are gated
at G1; provisional/hypothesis values in place.

**Input**: `figma/design-map.md` row 20 (`0:10659`) + `specs/020-edit-profile/research.md`

---

## Summary

Edit Profile is a pushed form screen in the settings area. The declared entry is the Settings
profile header — its subtitle literally reads "Tap to edit profile". This feature makes that
header a tappable button and renders a structural form (Name prefilled from `SETTINGS_PROFILE`,
About empty, Save). Persistence and field behaviour are later features / map-external; Save is a
no-op.

## PENDING design inventory (capture on ~2026-09-28)

- [ ] Form field set/labels (Name/About hypothesis) + avatar layout
- [ ] Save/Cancel treatment
- [ ] Nav title ("Edit Profile" PENDING)

## Owner Clarifications (proposed — confirm at G1)

1. **Entry**: Settings profile header tap → `/settings/profile`.
2. **Form**: Name (prefilled "Ani") + About fields; Save no-op.
3. **Title**: "Edit Profile" in the pushed header.

## Functional Requirements

- **FR-001**: Settings profile header tap navigates to `/settings/profile`.
- **FR-002**: `/settings/profile` renders the form screen (title + Name prefilled +
  About + Save), no tab bar.
- **FR-003**: Back returns to `/settings`.
- **FR-004**: Save is a no-op.
- **FR-005**: No horizontal overflow at any breakpoint.

## Non-Goals

- Persistence; avatar editing; About data.

## User Stories

- **US1 (entry)**: On Settings I tap the profile header and land on `/settings/profile`.
- **US2 (screen)**: I see the pushed header (Back + "Edit Profile"), Name prefilled with the
  profile name, an About field and a Save action, no tab bar.
- **US3 (chroming)**: Back returns to Settings; Save is a no-op; no horizontal overflow; matches
  the Figma render within the measured golden threshold.

## Acceptance Criteria (validation targets)

1. Unit — `profile-page.spec.ts` (new); `settings-page.spec.ts` profile tap navigation.
2. E2E `tests/e2e/profile.spec.ts`: US1/US2/US3 (+ golden `0-10659-profile.png` gated).
   `settings.spec.ts` US1 extended (profile is a labelled button).
3. Responsive: no-overflow cases for `/settings/profile`.
4. `figma/design-map.md` row 20 spec → `020` + implemented at closure.

## Closing note (deliberately incomplete)

Until T001 lands, `profile-page` renders a structural form (stable testids/aria-labels) —
replaced at G1 with the captured design.