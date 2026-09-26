# Feature Specification: WhatsApp Settings — overflow sheet navigation

**Feature Branch**: `029-settings-overflow`

**Created**: 2026-09-26

**Status**: **In progress — implementing (spec-driven).**

**Input**: `SettingsPage` / `SettingsModal` (F-011 sheet, `SETTINGS_ACTIONS`) + existing
screens `/settings/notifications` (F-017) and `/settings/data-storage` (F-018)
+ `specs/029-settings-overflow/research.md`

---

## Summary

F-029 wires the Settings "..." overflow sheet rows to the screens that already exist: selecting
**Notifications** dismisses the sheet and routes to `/settings/notifications`; **Storage**
routes to `/settings/data-storage`; **More** remains a no-op (no target screen in the map).

## Functional Requirements

- **FR-001** Selecting `settings-notifications` closes the sheet (focus restored) and routes to
  `/settings/notifications`.
- **FR-002** Selecting `settings-storage` closes the sheet (focus restored) and routes to
  `/settings/data-storage`.
- **FR-003** Selecting `settings-more` keeps the sheet open (no target screen yet).
- **FR-004** Backdrop / Escape dismissal, focus return and single-sheet invariants unchanged
  (F-011).

## Non-Goals

- A "More" target screen; new sheet rows; keyboard/tab-focus traps; F-009-style actions.

## User Stories

- **US1 (notifications)**: From Settings → "…" → Notifications I land on the Notifications
  settings screen.
- **US2 (storage)**: From Settings → "…" → Storage I land on the Data and Storage screen.
- **US3 (more)**: "More" does nothing yet (map-external).

## Acceptance Criteria (validation targets)

1. Unit `settings-page.spec.ts` (update): Notifications row routes + closes the sheet; Storage
  row routes + closes; More keeps the sheet open with no navigation.
2. E2E `tests/e2e/settings-overflow.spec.ts` (authored, runs paused): both rows navigate;
  More no-ops.
3. Build green + unit green (playwright paused).

## Explicit deviations (documented drift)

1. F-011's "selecting a row emits its `id` (target flows out of scope)" is now partially wired
  — Notifications/Storage target existing screens; drift noted in 011 + 013.

## Caveat (deliberately incomplete until G1)

Sheet geometry unchanged (shared `ActionSheet`); no new Figma data required (G1 no-op).