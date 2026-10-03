# Tasks: Informative Profile (055)

**Feature**: `055-profile-informative` · **Spec**: [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md)

Playwright remains paused by owner directive (2026-09-26): e2e cases below are **authored, never
executed**.

| Task | Work | FR | Status |
|---|---|---|---|
| T001 | `docs(spec)` — spec/plan/tasks for 055; drift notes 013 & 020; design-map rows 13 & 20 | — | [x] `8c07c53` |
| T002 | `settings-page.ts` — `profile` computed gains `about`; `settings-page.html` — `@if (profile().about)` line reusing `.settings__row-description` | FR-001 | [x] `1411e96` |
| T003 | `profile-page.html/scss` — `.profile__hint` under Name and About inputs; SCSS class (13px, secondary, caption margin) | FR-002 | [x] `1411e96` |
| T004 | Unit tests: header default (no About line, `aria-label` unchanged) + updated profile shows About line with token styling; profile page shows both hints with token styling | FR-001, FR-002, FR-003 | [x] `7cc44d3` |
| T005 | E2E authored in `tests/e2e/settings.spec.ts` / `profile.spec.ts` (header shows About when set; Edit Profile shows the Name hint) — **not run** | FR-001, FR-002 | [x] `7cc44d3` — authored, not executed (Playwright pause 2026-09-26) |
| T006 | G2 + closure: build green, full unit suite green (**718/718**), drift notes 013 & 020, design-map rows 13 & 20, gap-audit changelog, checklist + converge | DoD | [x] closure commit — build green, **718/718** |

## Checkpoint

`/settings`: the profile header keeps "Tap to edit profile" and shows the user's About text below it
when set; `/settings/profile` shows a hint under each of the Name and About fields, both in the
F-054 secondary-control style. Routes, labels, inputs and Save are unchanged.

## FR → test traceability

- **FR-001** — `settings-page.spec.ts` "F-055: the header keeps the hint and hides the About line
  when unset" (default `about: ''` renders no `settings-about`, subtitle intact, `aria-label`
  `Edit profile` unchanged) and "F-055: the header shows the About text beneath the hint when set"
  (`updateProfile('Anita', 'Building things')` → line matches, subtitle still "Tap to edit
  profile", `getComputedStyle` `13px` / `rgb(142, 142, 147)`).
- **FR-002** — `profile-page.spec.ts` "F-055: each field shows its hint caption under the input"
  (both `.profile__hint` strings literal, same computed styling; inputs keep `aria-label`
  `Name`/`About`).
- **FR-003** — the same suite asserts the inputs' `aria-label`s and the header's `aria-label`;
  routes/store/Save assertions from F-036 remain green unchanged (no store/model/route contract
  touched).
- **FR-004** — drift notes in specs 013 and 020, design-map rows 13 and 20, gap-audit changelog
  entry (see below); no invented node ID.
- **E2E (authored, not run)** — `settings.spec.ts` "the profile header shows the About text under
  the hint once set (F-055)"; `profile.spec.ts` "both fields show their hint captions (F-055)".

## Blocked (recorded, not skipped)

- **G1 capture** — expired Figma OAuth token (`403 Token expired`, 2026-10-03). Rows 13 and 20
  remain unfetchable; the F-054 strings recover here too after re-auth.