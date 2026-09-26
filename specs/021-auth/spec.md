# Feature Specification: WhatsApp Authorization

**Feature Branch**: `021-auth`

**Created**: 2026-09-26

**Status**: **In progress — structural scope landed pre-capture (owner directive `2026-09-24`).**
`/auth` renders the Authorization cold-start screen (structural title/phone region + numeric
keypad + Continue, no tab bar). No route entry is wired: Authorization is a cold-start surface
and the design file has no interaction wiring; the default `**` → `/chats` flow is intentionally
unchanged so the shipped feature set stays reachable. Keypad/title/labels, exact layout and
golden remain PENDING the Figma capture (~2026-09-28) and are gated at G1.

**Input**: `figma/design-map.md` row 21 (`0:11030`) + `specs/021-auth/research.md`

---

## Summary

Authorization is the phone-number/keyboard confirmation surface (design-analysis row 9/21). This
feature lands the structural screen at `/auth`: brand title, country + phone region, numeric
keypad (1–9, 0, backspace), and a Continue action — all read-only/no-op (no keypad state
persistence). Wiring it as the actual cold-start entry is deferred: there is no flow in the
design file and re-routing the default would detach every reachable feature.

## PENDING design inventory (capture on ~2026-09-28)

- [ ] Title/brand + country + phone field labels and layout
- [ ] Keypad geometry, digit styling, backspace glyph
- [ ] Continue/Cancel treatment; entry wiring into the app flow

## Owner Clarifications (proposed — confirm at G1)

1. **Route**: `/auth` cold-start screen; default flow unchanged (entry PENDING).
2. **Keypad**: digits 1–9/0 + backspace + Continue; no-op state this feature.
3. **Title/labels**: hypothesis wording replaced from payload.

## Functional Requirements

- **FR-001**: `/auth` renders the Authorization screen (title, phone region, keypad, Continue).
- **FR-002**: No tab bar, no navigation bar.
- **FR-003**: All controls are no-ops (no keypad state).
- **FR-004**: No horizontal overflow at any breakpoint.
- **FR-005**: Default `**` → `/chats` flow unchanged (Authorization not wired as entry yet).

## Non-Goals

- Keypad input state/editing; phone verification; code entry; flow wiring.

## User Stories

- **US1 (route)**: `/auth` renders the cold-start Authorization screen.
- **US2 (screen)**: I see the brand title, number region and a 1–9/0/backspace keypad with a
  Continue action, no tab bar.
- **US3 (chroming)**: Continue is a no-op; no horizontal overflow; matches the Figma render
  within the measured golden threshold.

## Acceptance Criteria (validation targets)

1. Unit — `auth-page.spec.ts` (new): chrome/title, 12-key keypad, Continue no-op, no tab bar.
2. E2E `tests/e2e/auth.spec.ts`: US1/US2/US3 (+ golden `0-11030-auth.png` gated).
3. Responsive: no-overflow cases for `/auth`.
4. `figma/design-map.md` row 21 spec → `021` + implemented at closure.

## Closing note (deliberately incomplete)

Until T001 lands, `auth-page` renders the structural keypad (stable testids/aria-labels) —
replaced at G1 with the captured design. Entry wiring decision (default flow change) is gated on
capture + owner approval.