# Plan: Photo Status Preview (052)

**Feature**: `052-status-photo-preview` · **Spec**: [`spec.md`](./spec.md) · **Created**: 2026-10-02

## Approach

A one-file, view-only change: the photo branch of `status-page.html` becomes a dedicated preview
block styled in `status-page.scss`, replacing the 43px band approach. No store, model, route or
token change. The band's shared rule keeps serving text status and the tip; the photo modifier and
strip rule are deleted. Spec FR-005 records the provisional geometry as exact values for the
post-capture reconcile.

## Design decisions (traceable to the spec)

| Decision | Where it lives |
|---|---|
| Photo branch owns a block; band stays for text/tip | FR-001, FR-003 |
| `role="status"` + testids/alt/src preserved on the block | FR-002 |
| Radius 8 / gutter 16 / max-height 280 recorded as provisional targets | FR-005 |
| No interactive affordances on the block (no viewer to promise) | Non-Goals, Assumptions |

## Review gates

- **G1**: BLOCKED (429, reset 2026-10-02 18:38 UTC). Block size PROVISIONAL; reconcile task
  recorded. Reused feed chrome (`0:8498`) remains design-verified.
- **G2**: `npm run build` green; full unit suite green, exact count reported.
- **G3**: closure commit; drift note in the F-050 spec (FR-008 feed presentation superseded),
  design-map row 6, gap audit changelog.

## Drift policy

- F-050 FR-008's feed presentation (the 43px band) is superseded by this feature's block. The F-050
  spec gets the drift note; the rest of F-050 is unaffected.

## Commit order (docs → feat → test)

1. `docs(spec)` — spec/plan/tasks for 052.
2. `feat` — `status-page.html` + `status-page.scss`.
3. `test` — `status-page.spec.ts` photo assertions.

## Tasks

See [`tasks.md`](./tasks.md). Each task is one commit-sized unit.