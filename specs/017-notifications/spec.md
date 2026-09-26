# Feature Specification: WhatsApp Notifications

**Feature Branch**: `017-notifications`

**Created**: 2026-09-24

**Status**: **In progress — structural scope landed pre-capture (owner directive `2026-09-24`).**
The Settings "Notifications" row now opens `/settings/notifications`, which renders the
Notifications pushed screen (Back → `/settings`, title "Notifications", seeded hypothesis rows,
no tab bar). All inner rows are no-ops this feature. Exact rows, sections, glyphs and golden
remain PENDING the Figma capture (~2026-09-28) and are gated at G1; provisional/hypothesis values
in place.

**Input**: `figma/design-map.md` row 17 (`0:10758`) + `specs/017-notifications/research.md`

---

## Summary

Notifications is a pushed Settings sub-page reached from the Settings "Notifications" row. This
feature wires that row and renders the screen with a seeded row list (hypothesis: Sound, Vibrate,
Popup notification, Light, Show previews). Sounds/vibration/popup controls are later features /
map-external; rows are no-ops here.

## PENDING design inventory (capture on ~2026-09-28)

- [ ] Section/row set + labels + glyphs + grouping
- [ ] Toggle-row treatment
- [ ] Nav title confirmation

## Owner Clarifications (proposed — confirm at G1)

1. **Entry**: Settings → Notifications row → `/settings/notifications`.
2. **Rows**: hypothesis list replaced from the payload at G1.
3. **Title**: "Notifications" in the pushed header (PENDING).

## Functional Requirements

- **FR-001**: Settings "Notifications" row navigates to `/settings/notifications`.
- **FR-002**: `/settings/notifications` renders the Notifications screen (title + rows from
  `NOTIFICATIONS_ROWS` seed), no tab bar.
- **FR-003**: Back returns to `/settings`.
- **FR-004**: All rows are no-ops (later features / map-external).
- **FR-005**: No horizontal overflow at any breakpoint.

## Non-Goals

- Actual sound/vibrate/popup toggle behavior; scheduler/preview; badge controls.

## User Stories

- **US1 (entry)**: On Settings I tap Notifications and land on `/settings/notifications`.
- **US2 (screen)**: I see the pushed header (Back + "Notifications"), labelled rows, no tab bar.
- **US3 (chroming)**: Back returns to `/settings`; rows are no-ops; no horizontal overflow;
  screen matches the Figma render within the measured golden threshold.

## Acceptance Criteria (validation targets)

1. Unit — `notifications-page.spec.ts` (new): chrome, rows from seed, Back → `/settings`, no tab
   bar, no-ops. `settings-page.spec.ts` row activation update; no-op probe moves to a later row.
2. E2E `tests/e2e/notifications.spec.ts`: US1/US2/US3 (+ golden `0-10758-notifications.png`
   gated). `settings.spec.ts` US2 updated.
3. Responsive: no-overflow cases for `/settings/notifications`.
4. `figma/design-map.md` row 17 spec → `017` + implemented at closure.

## Closing note (deliberately incomplete)

Until T001 lands, `notifications-page` renders structural rows (stable testids/aria-labels) —
replaced at G1 with the captured design.