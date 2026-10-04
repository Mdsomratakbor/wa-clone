# Feature Specification: Account Settings Subtree (Security · Two-step · Change number · Delete account)

**Feature Branch**: `057-account-settings`

**Created**: 2026-10-04

**Status**: ✅ **Implemented** (T001–T008 done, build green, unit 771/771, 2026-10-04) — G1 capture
still **BLOCKED** (expired Figma token), so every sub-screen value stays PROVISIONAL for the
post-re-auth reconcile. See [Closure](./tasks.md#closure).

**Input**: `figma/design-map.md` row 14 (`0:9371`, uncaptured) + `specs/014-account/` +
`specs/046-inert-control-sweep/disposition.md` (deferral destination "Account & privacy screens").

---

## Premise

`/settings/account` (F-014) renders four rows — `security`, `two-step-verification`,
`change-number`, `delete-account` — each still **inert** per the F-046 disposition table:

> | `settings-security`, `settings-two-step-verification`, `settings-change-number`,
> `settings-delete-account` | Account (4) | Account & privacy screens |

F-046 §"What a later feature must not do": *Do not re-enable a control without wiring it.* This
feature (057) is the recorded destination: make every Account row navigate to a real pushed
sub-screen, and make every control on those screens reach real state **or** be honestly disabled.

## PENDING design inventory

There is **no sub-screen node for any of the four screens**: the design file exposes only the
Account frame `0:9371` (itself uncaptured — expired Figma token, `403`). Chrome/geometry/copy for
all four screens is therefore **PROVISIONAL**, following the established no-node precedent
(F-044 media grid, F-045 in-call, F-048 groups, F-056 camera chrome): built from the `001/013`
token maps, recorded verbatim below for the post-re-auth reconcile, and no node ID invented.

- [ ] Four pushed nav bars (Back + title) — hypothesis: titles `Security`, `Two-step verification`,
      `Change number`, `Delete my account` (PENDING)
- [ ] Per-screen body content (rows/forms) — PENDING
- [ ] Hero treatment: hypothesis — **no hero on sub-screens** (they match the other Settings
      pushed sub-screens, e.g. Chats Settings/Notifications; Account's hero is specific to that
      screen). PROVISIONAL.
- [ ] Golden for each sub-screen — gated at G1

## Clarification (resolved — 2026-10-04)

> Constitution Art. I: ≤3 questions per pass. Answers below are owner-approved and binding.

1. **Functionality depth** — **(a) Honest local flows** (owner, 2026-10-04):
   - **Two-step verification**: persists a real local PIN + **required** recovery email under a
     versioned key; disabling/removing requires re-entering the PIN; Account/Security/Two-step
     reflect state honestly. PIN rule: exactly **6 digits** (WhatsApp's real rule) — PROVISIONAL.
   - **Change number**: edits a **persisted device-number field** (none exists today — verified).
     Current + new number fields with validation.
   - **Delete my account**: **type-to-confirm** flow then wipes all persisted app data and shows a
     deletion screen. Confirmation word `DELETE` (uppercase, exact) — PROVISIONAL hypothesis.
   - **Security**: shows an **honestly-disabled** "Show security notifications" toggle (no
     code-change pipeline ⇒ F-046: a pref with no consumer must not be a live switch) plus a
     **Two-step verification** row that reflects whether two-step is enabled.
2. **Two-step verification** — **(a) Real local PIN** (owner, 2026-10-04). See #1.
3. **Delete my account** — **(a) Confirm + wipe app data** (owner, 2026-10-04). Wipes chats,
   prefs, statuses and the two-step/account keys; confirmation screen is PROVISIONAL brand-style
   (no node exists).

All four screens' chrome/geometry/copy is **PROVISIONAL** (no design node exists; G1 blocked) —
recorded verbatim in §PENDING inventory for the post-re-auth reconcile.

## Functional Requirements (final — clarified 2026-10-04)

- **FR-001**: Settings `/settings/account` "Security" row navigates to `/settings/account/security`;
  Back returns to `/settings/account`. Pushed surface, no tab bar.
- **FR-002**: "Two-step verification" row navigates to `/settings/account/two-step`; Back →
  `/settings/account`.
- **FR-003**: "Change number" row navigates to `/settings/account/change-number`; Back →
  `/settings/account`.
- **FR-004**: "Delete my account" row navigates to `/settings/account/delete`; Back →
  `/settings/account` (pre-confirmation state).
- **FR-005**: Every interactive control on the four screens reaches real state or is honestly
  disabled (F-046) — no row swallows activation.
- **FR-006** (two-step): disabled state shows intro + PIN/confirm-PIN/recovery-email form with an
  email required; enabling persists the 6-digit PIN + email under `wa.account.v1` with the account
  state announced in a live region; enabled state reflects status honestly and offers Change PIN
  and Remove; **remove requires re-entering the PIN** and clears two-step state on match; wrong PIN
  is announced and never clears state. Persistence and reload-normalization are covered by tests.
- **FR-007** (change number): current-number field (prefilled from the persisted device number)
  and new-number field with validation (both non-empty, plausible phone shape, new ≠ current);
  saving persists the device number and announces the change in the live region (the page stays
  put; Back returns to `/settings/account`).
- **FR-008** (delete): a type-to-confirm input (exact uppercase `DELETE` required) gates the danger
  button; confirming wipes persisted chats, prefs, statuses, and the account/two-step keys, then
  swaps to a deletion-confirmation state (brand-style, PROVISIONAL, `role="status"`) with a single
  "Continue" exit to `/chats`; Back is not offered in the deleted state.
- **FR-009**: Accessibility (semantic controls, `aria-label` on icon-only, `role="status"` live
  regions, `autocomplete`/`inputmode` on numeric fields, visible focus, real `disabled` states) and
  **no horizontal overflow** at any breakpoint.

## Non-Goals

- `getUserMedia`, backend calls, SMS/verification: no new dependencies.
- Privacy screen (not in the seed; the design-file hypothesis is the four rows only).
- Auth entry wiring (`/auth` stays a structural placeholder — the device number field default is
  the sample identity only if depth (a) confirms it).
- Changing the four row labels/descriptions (F-054 strings stay verbatim).
- Capturing the missing Figma nodes (G1 blocked; chrome stays PROVISIONAL).

## User Stories

- **US1 (entry)**: From `/settings/account` I tap any row and land on its screen instead of nothing.
- **US2 (screen)**: Each pushed screen has Back + its title, honest content, and no tab bar.
- **US3 (function)**:
  - Two-step: I can set, see and remove a PIN with a recovery email; removal asks me to re-enter it.
  - Change number: I can edit my number with field validation and it persists.
  - Delete account: I can confirm and delete the stored app data.
  - Security: the surfaced option is honest about what the app cannot do.
- **US4 (chroming)**: Back returns one level up everywhere; no horizontal overflow; only tokens used.

## Acceptance Criteria (validation targets)

1. Unit — new per-screen `*.spec.ts`; `account-page.spec.ts` updated: each row navigates (the
   F-046 "still inert" test is **replaced**, not renamed — the deferral is resolved). Persistence,
   validation, refusal/happy paths covered; no sleeps; local storage cleared per suite; full suite
   green with exact count.
2. E2E authored only (Playwright paused 2026-09-26): `tests/e2e/account.spec.ts` walks
   Settings → Account → each sub-screen and the confirmed flows.
3. Responsive: no-overflow cases per screen.
4. `figma/design-map.md` row 14 + `specs/014-account/spec.md` + `specs/046-inert-control-sweep/disposition.md`
   drift notes; `specs/design-gap-audit.md` changelog entry.

## Swap list

- `account-page.ts`: `onRowActivate` routes by row id to the four sub-routes (replaces the no-op).
- `account-page.spec.ts`: replace the inert assertion with navigation assertions.
- `app.routes.ts`: four lazy routes under `settings/account/*`.
- `settings.seed.ts`: no label/description changes (F-054 strings verbatim).
- New persisted model if depth (a): `account.store.ts` (device number, two-step PIN/email,
  `wa.account.v1`) — additive, normalized at load.
- `ChatStore`/`PrefsStore`/`StatusStore`: a wipe-all method only if depth (a) for delete, additive.

## Closing note (deliberately incomplete)

Spec, plan, tasks and contracts will not be finalized until the clarify answers (2026-10-04) are
written into §Clarification above. No code until then.