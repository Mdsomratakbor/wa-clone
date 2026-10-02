# Tasks: Expanding Status Input (053)

**Feature**: `053-status-input-expand` · **Spec**: [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md)

Playwright remains paused by owner directive (2026-09-26): e2e cases below are **authored, never
executed**.

| Task | Work | FR | Status |
|---|---|---|---|
| T001 | `docs(spec)` — spec/plan/tasks; drift notes on the F-049/F-051 single-line-field footprint; design-map row 7; gap-audit changelog | — | [ ] |
| T002 | `compose-page.html` — `<input>` → `rows="1"` `textarea` (`#statusInput`); keep `[value]`, `(input)`, testid, aria-label, placeholder, focus | FR-001, FR-002 | [ ] |
| T003 | `compose-page.ts` — `viewChild('statusInput')` + value-driven growth effect (`min(scrollHeight, 136.8)`, overflow toggle); `onValue` reads `HTMLTextAreaElement` | FR-001, FR-003 | [ ] |
| T004 | `compose-page.scss` — `.compose__type` `min-height: 52px`; field `min-height: 45.6px`, `max-height: 136.8px`, `resize: none`, `overflow-wrap: anywhere`; typography/placement/focus unchanged | FR-001, FR-005 | [ ] |
| T005 | `status-page.scss` — `white-space: pre-wrap` on the shared `__tip-text, __mine-text` rule | FR-004 | [ ] |
| T006 | `compose-page.spec.ts` — textarea exists; wrapping text grows height; cap 136.8px with internal scroll; clear → one line; `\n` preserved in signal + publish; F-051 keys type in and backspace removes a `\n`; photo mode has no field | FR-001, FR-002, FR-003, FR-005 | [ ] |
| T007 | `status-page.spec.ts` — a status containing `\n` renders with `white-space: pre-wrap` | FR-004 | [ ] |
| T008 | E2E authored in `tests/e2e/status-compose.spec.ts` (two-line status grows the field and the feed shows both lines) — **not run** | FR-001, FR-004 | [ ] |
| T009 | G2 + closure: build green, full unit suite green (report exact count), checklist + converge, design-map row 7, gap-audit changelog, drift notes | DoD | [ ] |

## Checkpoint

`/status/compose` (text mode): typing a long status makes the centred field grow to at most three
lines and scroll inside; Enter inserts a line break; publishing keeps the breaks, and the feed shows
the status as composed. Photo mode and the on-screen keyboard are unchanged.

## FR → test traceability

_Completed at closure (T009)._