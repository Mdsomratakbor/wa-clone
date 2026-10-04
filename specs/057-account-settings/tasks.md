# Tasks: Account Settings Subtree (feature 057)

Commit convention: `docs(spec)` → `feat` → `test` → `docs(spec)` closure. Each task is one
commit-sized unit. Playwright is paused by owner directive (2026-09-26): e2e tasks are **authored,
never executed** — marked `[ ]` with the directive date.

## T001 — Spec package (docs: spec)

- [x] `spec.md` (clarified 2026-10-04), `plan.md`, `research.md`, `tasks.md` (this file)
- FRs covered: documentation for all.

## T002 — Account model (feat: account.store)

- [x] `src/app/core/account.store.ts`: `AccountState { deviceNumber; twoStep }`, key `wa.account.v1`,
      envelope `{ version: 1, ... }`; `normalizeAccount` (twoStep kept only when pin+email strings,
      deviceNumber `''` otherwise); `setDeviceNumber`, `setTwoStep`, `removeTwoStep(pin): boolean`
      (clear only on match, no state change otherwise), `reset()` (remove key + defaults, F-013
      convention). PIN stored plainly with an honest security comment.
- FR-006/FR-007/FR-008 (underpins)

## T003 — StatusStore.reset (feat: status.store)

- [x] `src/app/core/status.store.ts`: add `reset()` — remove `wa.status-store.v1`, `myStatus`
      → null, counter → 0 (matches ChatStore/PrefsStore reset, contrasts CallStore.clearCalls).
- FR-008 (wipe path)

## T004 — Routes + Account navigation (feat: account routes)

- [x] `app.routes.ts`: lazy `settings/account/security|two-step|change-number|delete`.
- [x] `account-page.ts`: `onRowActivate` maps `security`/`two-step-verification`/`change-number`/
      `delete-account` → the four routes (replaces the no-op).
- FR-001/FR-002/FR-003/FR-004/FR-005

## T005 — The four screens (feat: account screens)

- [x] `security-page.{ts,html,scss}`: Back + "Security"; honestly-disabled "Show security
      notifications" toggle (native disabled, out of tab order, F-046 pattern) + "Two-step
      verification" row → `/settings/account/two-step` with a store-driven status line.
- [x] `two-step-page.{ts,html,scss}`: disabled ⇄ enabled. Disabled: intro + PIN + confirm PIN +
      recovery email (required), `Set PIN` gated (6 digits, match, `@`); enabled: honest status,
      change PIN, remove requires PIN re-entry (wrong → announced, state untouched). Fine-grained
      `role="status"` announcements.
- [x] `change-number-page.{ts,html,scss}`: current (prefilled) + new number, gated validation,
      persist + announce (page stays put).
- [x] `delete-account-page.{ts,html,scss}`: type-to-confirm `DELETE` gates the danger button;
      confirm wipes Chat/Prefs/Status/Account stores; deleted state (no nav bar, `role="status"`,
      `Continue` → `/chats`).
- FR-001–FR-009

## T006 — Unit tests (test: account screens + store)

- [x] `account.store.spec.ts` (persistence, reload normalization, defaults, removeTwoStep mismatch
      no-op) + `status.store.spec.ts` reset case.
- [x] `account-page.spec.ts`: **replace** the F-046 inert test with four navigation assertions.
- [x] `security-page.spec.ts`, `two-step-page.spec.ts`, `change-number-page.spec.ts`,
      `delete-account-page.spec.ts`: every FR assertion incl. validation failures, refusal paths,
      announcements, wipe ordering, no tab bars; `localStorage.clear()` per suite; no sleeps.
- FR-001 → FR-009 (traceability in closure section)

## T007 — E2E authored only (test: e2e)

- [ ] `tests/e2e/account.spec.ts`: per-row navigation + Back; Security disabled toggle + status;
      two-step set/enabled state/remove; change-number save; delete type-to-confirm + wipe +
      Continue; no tab bar + no overflow.
      **Playwright paused — authored only (directive 2026-09-26), never executed.**

## T008 — Drift notes + closure (docs: spec)

- [x] `specs/014-account/spec.md` drift note; `specs/046-inert-control-sweep/disposition.md`: four
      rows move from Deferred → Wired (destination resolved); `figma/design-map.md` row 14;
      `specs/design-gap-audit.md` changelog entry.
- [x] `npm run build` green; full unit suite green (**771/771**)
- [x] checklist + converge clean

## Checkpoint

`/settings/account` rows Security / Two-step verification / Change number / Delete my account now
open real pushed sub-screens. Two-step persists a 6-digit PIN + required recovery email
(`wa.account.v1`) and requires the PIN to remove it; Change number edits a persisted device number;
Delete my account type-to-confirms `DELETE` then wipes chats/prefs/statuses/account and shows a
deleted state with `Continue` to `/chats`; Security honestly disables the no-consumer toggle and
shows a store-driven two-step status. Row labels/descriptions unchanged (F-054 strings verbatim),
hero unchanged, no tab bars, no new dependency.

## FR → test traceability

- **FR-001** - `account-page.spec.ts` "navigates to each sub-screen when its row is activated" +
  `security-page.spec.ts` (two-step row + Back).
- **FR-002** - `two-step-page.spec.ts` header/Back tests; `security-page.spec.ts` two-step row.
- **FR-003** - `change-number-page.spec.ts` (Back + prefill).
- **FR-004** - `delete-account-page.spec.ts` header/Back pre-confirmation.
- **FR-005** - `security-page.spec.ts` honestly-disabled toggle; every interactive control is
  asserted wired or genuinely disabled across the four specs.
- **FR-006** - `account.store.spec.ts` (persist/reload/normalize/refuse/remove-mismatch) +
  `two-step-page.spec.ts` (gating, enable, change, wrong-PIN refusal, correct-PIN remove,
  announcements).
- **FR-007** - `change-number-page.spec.ts` (gating, prefill, persist + announce, form reset).
- **FR-008** - `delete-account-page.spec.ts` (gating, full Wipe on confirm, deleted state without
  nav bar, Continue, no wipe while incomplete) + `status.store.spec.ts` reset case.
- **FR-009** - `role="status"` live regions asserted in two-step/change-number/delete specs;
  `aria-label`s and inputs' `aria-label`/`autocomplete`/`inputmode` asserted; no-overflow and
  no-tab-bar e2e authored cases.
- **E2E (authored, not run)** - `tests/e2e/account.spec.ts` "Account sub-screens (F-057)" block.

## Blocked (recorded, not skipped)

- **G1 capture** - expired Figma OAuth token (`403`, 2026-10-03). No sub-screen node exists in the
  design file; all PROVISIONAL values (6-digit rule, email rule, `DELETE` word, phone shape,
  chrome/copy) go through the post-re-auth reconcile with the 051–056 pending values. Goldens stay
  skipped; no node ID is invented.