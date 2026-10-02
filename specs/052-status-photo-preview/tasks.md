# Tasks: Photo Status Preview (052)

**Feature**: `052-status-photo-preview` · **Spec**: [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md)

Playwright remains paused by owner directive (2026-09-26): e2e cases below are **authored, never
executed**.

| Task | Work | FR | Status |
|---|---|---|---|
| T001 | `docs(spec)` — spec/plan/tasks for 052 | — | [ ] |
| T002 | `status-page.html` — photo branch renders a preview block; text/tip branches untouched | FR-001, FR-002, FR-003 | [ ] |
| T003 | `status-page.scss` — block styles (radius 8, gutters 16, max-height 280, cover); delete `__mine--photo` + strip `__mine-photo`; keep shared band rule for text/tip | FR-001, FR-003, FR-005 | [ ] |
| T004 | `status-page.spec.ts` — block computed style (radius/cap/width), semantics preserved, band modifier gone, text/tip unchanged | FR-001, FR-002, FR-003 | [ ] |
| T005 | E2E authored in `tests/e2e/status.spec.ts` (photo shows as a block after publish) — **not run** | FR-001 | [ ] |
| T006 | G2 + closure: build green, full unit suite green (report exact count), checklist + converge, reconcile task recorded | DoD | [ ] |

## Checkpoint

Publish a photo: the feed shows a rounded preview block of the actual image, full feed width, not a
43px smear; a text status and the empty tip look exactly as before.

## FR → test traceability

_Completed at closure (T006)._