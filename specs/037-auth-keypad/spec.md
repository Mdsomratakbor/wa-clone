# Feature Specification: WhatsApp Authorization — working keypad and Continue

**Feature Branch**: `037-auth-keypad`

**Created**: 2026-09-27

**Status**: **In progress — implementing (spec-driven).**

**Input**: `AuthPage` (spec 021) + `specs/037-auth-keypad/research.md`

---

## Summary

The Authorization screen renders the design completely (title, country/phone region, numeric keypad,
Continue) but all three handlers are no-ops: tapping digits does nothing and Continue never leaves
the screen. F-037 makes the screen real — keypad entry fills the phone region, backspace edits it,
and Continue enters the app once the number is long enough. The seeded (empty) render is unchanged.

## Functional Requirements

- **FR-001** Keypad digits append to the phone number in order; the phone region renders the entered
  digits and is an `aria-live="polite"` region.
- **FR-002** Input is capped at 15 digits (E.164 without `+`); extra key presses are ignored.
- **FR-003** `Delete digit` removes the last digit and is a no-op when the number is empty.
- **FR-004** `Continue` with fewer than 7 digits does not navigate and renders an inline error
  (`auth-error`, `role="status"`) reading `Enter your phone number to continue.`
- **FR-005** `Continue` with 7+ digits navigates to `/chats` (the app's default entry), so the
  verification step is the only invented behaviour beyond the design.
- **FR-006** Any keypad edit clears the error immediately.
- **FR-007** The default `/` → `/chats` entry is unchanged (spec 021 FR-005), so the shipped feature
  set stays reachable without passing through Authorization.
- **FR-008** The seeded render (empty phone, no error) is byte-identical to spec 021, so
  `0-11030-auth.png` is unaffected.

## Non-Goals

- OTP/verification code entry, resend timers, or a real network call (the design has no verify row).
- A country picker: the design shows the provisional `No country selected`, so the field stays
  map-external and the digits are country-less.
- Storing the entered number or a session identity.
- Making `/auth` the app's entry route.

## User Stories

- **US1**: I type my number on the keypad and see it appear in the phone region.
- **US2**: I press Continue with a too-short number and get an inline error instead of leaving the
  screen.
- **US3**: I enter a full number and Continue takes me into the app.

## Acceptance Criteria (validation targets)

1. Unit `auth-page.spec.ts` (update): digits append in order, cap at 15, backspace, error on short
   Continue, no navigation on short Continue, navigation to `/chats` on a valid number, error clears
   on edit, seeded render unchanged.
2. E2E `tests/e2e/auth.spec.ts` (update): keypad entry, error state, valid entry → `/chats`.
3. Build green + full unit suite green (playwright paused).

## Explicit deviations (documented drift)

1. Spec 021's "all controls are no-ops (no keypad state)" is superseded (drift note in `specs/021`).
2. A new `error` design token is added to `core/tokens/_tokens.scss` for the inline message.

## Caveat (deliberately incomplete until G1)

- The design's exact invalid-number copy and error placement are map-external; the wording above is
  an iOS-conventional choice to be re-checked at the quota reset.
