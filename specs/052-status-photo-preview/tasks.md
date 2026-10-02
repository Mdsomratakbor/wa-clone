# Tasks: Photo Status Preview (052)

**Feature**: `052-status-photo-preview` · **Spec**: [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md)

Playwright remains paused by owner directive (2026-09-26): e2e cases below are **authored, never
executed**.

| Task | Work | FR | Status |
|---|---|---|---|
| T001 | `docs(spec)` — spec/plan/tasks for 052 | — | [x] `ce5c196` |
| T002 | `status-page.html` — photo branch renders a preview block; text/tip branches untouched | FR-001, FR-002, FR-003 | [x] `391b246` |
| T003 | `status-page.scss` — block styles (radius 8, gutters 16, max-height 280, cover); delete `__mine--photo` + strip `__mine-photo`; keep shared band rule for text/tip | FR-001, FR-003, FR-005 | [x] `391b246` |
| T004 | `status-page.spec.ts` — block computed style (radius/cap/width), semantics preserved, band modifier gone, text/tip unchanged | FR-001, FR-002, FR-003 | [x] `4f32f4d` |
| T005 | E2E authored in `tests/e2e/status.spec.ts` (photo shows as a block after publish) — **not run** | FR-001 | [x] `4f32f4d` — authored, not executed (Playwright pause 2026-09-26) |
| T006 | G2 + closure: build green, full unit suite green (report exact count), checklist + converge, reconcile task recorded | DoD | [x] closure commit — build green, **702/702** |

## Checkpoint

Publish a photo: the feed shows a rounded preview block of the actual image, full feed width, not a
43px smear; a text status and the empty tip look exactly as before.

## FR → test traceability

- **FR-001** — `status-page.spec.ts` "renders a published photo as a rounded preview block, not the
  band" (computed radius 8px, gutters 16px, max-height 280px, `object-fit: cover`, full row width).
- **FR-002** — same test plus "renders a published photo and not the text region (FR-008)":
  `role="status"`, `data-testid="status-mine"`/`status-mine-photo`, `src`, `alt="Status photo"`.
- **FR-003** — "renders a published photo as a rounded preview block…" asserts the band modifier
  classes are gone; text-status and tip rendering covered by the existing 049/050 tests ("the
  published status replaces the tip…", "renders the tip…").
- **FR-004** — no store/model/route/token collision: no store spec change in this feature; subtitle
  and alt unchanged (existing "the My Status subtitle shows the provisional photo label" and the
  `alt` assertion still pass untouched).
- **FR-005** — geometry asserted against the literal PROVISIONAL values in the same test.
- **E2E (authored, not run)** — `status.spec.ts` "a published photo renders as a rounded preview
  block, not the text band", and `status-compose.spec.ts` (F-050 flow) now asserts the block styles.