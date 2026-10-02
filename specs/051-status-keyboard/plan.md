# Plan: On-Screen Status Keyboard (051)

**Feature**: `051-status-keyboard` · **Spec**: [`spec.md`](./spec.md) · **Created**: 2026-10-02

## Approach

A segmented keyboard is the only honest way to make the compose screen's keyboard band type: the
PNG is a picture of a keyboard, and overlaying invisible buttons on it is an accessibility hazard and
uncaptured geometry (owner-confirmed 2026-10-02). The keyboard is therefore a new feature-local
component that emits characters and intentions to the page, which owns the `value` signal — so the
F-050 "keep both" input sources stay one source. No store, model, clock or route change.

Naming it a *feature-local* component (`features/status/status-keyboard.*`), not a `shared/`
component: the keyboard has one consumer (the status compose screen), so the "reuse first / add a
shared component only for real repetition or behavioural ownership" rule points local.

## Design decisions (traceable to the spec)

| Decision | Where it lives |
|---|---|
| Component `app-status-keyboard` with `value` input + `type`/`backspace`/`send` outputs; page owns `value` | spec FR-007, FR-009 |
| Keys: QWERTY rows + Shift + Backspace + Space + Send; no 123/globe/emoji (would be inert) | FR-001, Non-Goals |
| One-shot shift via internal signal; `aria-pressed` | FR-002, FR-003 |
| Backspace/Send genuinely `disabled` at their empty/blank boundaries | FR-004, FR-006, FR-008 |
| Tokens added to `_tokens.scss`; PROVISIONAL palette recorded in spec | Spec "Implemented" |
| Runtime PNG deleted; golden copy kept for the capture reconcile | Non-Goals |
| Obsolete PNG-based unit tests replaced (spec changed via clarify) | Validation Targets |

## Review gates

- **G1**: BLOCKED (429, reset 2026-10-02 18:38 UTC). Keyboard palette/geometry PROVISIONAL; stored
  as a reconcile task. We do **not** present provisional chrome as design-verified.
- **G2**: `npm run build` green; full unit suite green, exact count reported.
- **G3**: closure commit; drift note in the F-050 spec (owner reversal of the provisional-QWERTY
  decline), design-map row 7 and the gap audit updated.

## Drift policy

- F-050's Non-Goals section and the recorded 2026-10-01 decision ("a provisional QWERTY was
  considered and declined", keyboard = "capture-gated deferral") are **superseded** by the owner's
  2026-10-02 reversal. The F-050 spec gets a drift note; T013 remains visible there as superseded so
  the history is not rewritten.
- The responses to this clarify-session's three questions were written back into `spec.md`
  immediately, before any code.

## Commit order (docs → feat → test)

1. `docs(spec)` — spec/plan/tasks for 051 + drift note in 050.
2. `feat` — tokens, `status-keyboard` component, compose-page integration, PNG deletion.
3. `test` — `status-keyboard.spec.ts` + compose-page.spec updates (conservative: asserted-PNG tests
   updated only because the spec changed through clarify).

## Tasks

See [`tasks.md`](./tasks.md). Each task is one commit-sized unit.