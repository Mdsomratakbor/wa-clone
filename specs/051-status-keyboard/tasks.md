# Tasks: On-Screen Status Keyboard (051)

**Feature**: `051-status-keyboard` · **Spec**: [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md)

Playwright remains paused by owner directive (2026-09-26): e2e cases below are **authored, never
executed**.

| Task | Work | FR | Status |
|---|---|---|---|
| T001 | `docs(spec)` — spec/plan/tasks; drift note in `specs/050-photo-status/spec.md` (non-goal superseded), design-map row 7, gap audit changelog | — | [ ] |
| T002 | Add keyboard palette tokens to `_tokens.scss` (`keyboard-bg #17181C`, `keycap #3A3A3C`, `keycap-special #2C2C2E`, `key-text #FFFFFF`) | — | [ ] |
| T003 | New `status-keyboard` component (ts/html/scss): rows, shift (one-shot, `aria-pressed`), backspace, space, send; every key a real button; `data-testid`s; no wall-clock/store access | FR-001…FR-009 | [ ] |
| T004 | Compose page integration: `[value]` + type/backspace/send wiring into the existing `value` source and `onSend`; keyboard rendered in text mode only; runtime PNG removed from `public/` | FR-001, FR-004, FR-006, FR-007 | [ ] |
| T005 | `status-keyboard.spec.ts` — letters emit correct case, one-shot shift, backspace disabled at empty, space, send disabled at blank, labels + testids | FR-002…FR-008 | [ ] |
| T006 | `compose-page.spec.ts` — replace the two PNG-keyboard tests: single-source typing (key → field, field → key state), keyboard Send = publish+navigate; keep photo-mode absence test | FR-001, FR-006, FR-007 | [ ] |
| T007 | E2E authored in `tests/e2e/status-compose.spec.ts` (tap a key, field shows it, Send publishes) — **not run** | FR-002, FR-006 | [ ] |
| T008 | G2 + closure: build green, full unit suite green (report exact count), checklist + converge, reconcile task recorded for the post-capture pass | DoD | [ ] |

## Checkpoint

`/status/compose` (text mode): a dark segmented keyboard sits at the screen bottom; tapping `h`
types an uppercase-`H`-less `h` into the field unless shift is on; `Send` on the keyboard and the top
bar both publish; photo mode shows no keyboard.

## FR → test traceability

_Completed at closure (T008)._