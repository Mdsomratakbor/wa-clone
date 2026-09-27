# Feature Specification: WhatsApp Status — live row targets (Privacy / My Status)

**Feature Branch**: `035-status-wiring`

**Created**: 2026-09-27

**Status**: **In progress — implementing (spec-driven).**

**Input**: `StatusPage` (spec 006) + `/settings` (013) + `/status/compose` (007) +
`specs/035-status-wiring/research.md`

---

## Summary

Two designed controls on the Status screen do nothing: the `Privacy` nav action and the
`My Status` / "Add to my status" row. Both targets already exist in the app, so F-035 wires them —
the Status screen becomes fully navigable, matching the design's intent with no new surface and no
capture dependency.

## Functional Requirements

- **FR-001** Activating the `Privacy` nav action navigates to `/settings`.
- **FR-002** Activating the `My Status` row (row body, avatar or subtitle) navigates to
  `/status/compose`.
- **FR-003** The two existing "add a photo/text" action circles keep navigating to
  `/status/compose`; the row does not swallow those events.
- **FR-004** Tab behaviour, the tip, the header and the seeded feed are unchanged.
- **FR-005** Navigation from the row marks nothing read and mutates no store state.

## Non-Goals

- Publishing a status (tier C, capture-gated: publish affordance + keyboard chrome).
- A Privacy screen, recent-status viewers, or status feeds (not in the design map).
- Contact action circles (the design row is not interactive there).

## User Stories

- **US1**: On Status I tap `Privacy` and land on Settings.
- **US2**: On Status I tap the `My Status` row and land in the status composer.

## Acceptance Criteria (validation targets)

1. Unit `status-page.spec.ts` (update): `Privacy` → `/settings`; row activation (click and
   `keydown.enter`) → `/status/compose`; the action circles still navigate; tip/header unchanged.
2. E2E `tests/e2e/status-wiring.spec.ts` (authored, runs paused): both navigations.
3. Build green + full unit suite green (playwright paused).

## Explicit deviations (documented drift)

1. Spec 006's "Privacy and row stay no-ops" is superseded (drift note in `specs/006`).

## Caveat (deliberately incomplete until G1)

None for behavior — this slice is capture-independent; the design's exact row hit area is already
rendered per spec 006.