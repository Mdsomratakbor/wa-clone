# Tasks: Informative Profile (055)

**Feature**: `055-profile-informative` · **Spec**: [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md)

Playwright remains paused by owner directive (2026-09-26): e2e cases below are **authored, never
executed**.

| Task | Work | FR | Status |
|---|---|---|---|
| T001 | `docs(spec)` — spec/plan/tasks for 055; drift notes 013 & 020; design-map rows 13 & 20 | — | [ ] |
| T002 | `settings-page.ts` — `profile` computed gains `about`; `settings-page.html` — `@if (profile().about)` line reusing `.settings__row-description` | FR-001 | [ ] |
| T003 | `profile-page.html/scss` — `.profile__hint` under Name and About inputs; SCSS class (13px, secondary, caption margin) | FR-002 | [ ] |
| T004 | Unit tests: header default (no About line, `aria-label` unchanged) + updated profile shows About line with token styling; profile page shows both hints with token styling | FR-001, FR-002, FR-003 | [ ] |
| T005 | E2E authored in `tests/e2e/settings.spec.ts` / `profile.spec.ts` (header shows About when set; Edit Profile shows the Name hint) — **not run** | FR-001, FR-002 | [ ] |
| T006 | G2 + closure: build green, full unit suite green (exact count), drift notes 013 & 020, design-map rows 13 & 20, gap-audit changelog, checklist + converge | DoD | [ ] |

## Checkpoint

`/settings`: the profile header keeps "Tap to edit profile" and shows the user's About text below it
when set; `/settings/profile` shows a hint under each of the Name and About fields, both in the
F-054 secondary-control style. Routes, labels, inputs and Save are unchanged.

## FR → test traceability

_Completed at closure (T006)._

## Blocked (recorded, not skipped)

- **G1 capture** — expired Figma OAuth token (`403 Token expired`, 2026-10-03). Rows 13 and 20
  remain unfetchable; the F-054 strings recover here too after re-auth.