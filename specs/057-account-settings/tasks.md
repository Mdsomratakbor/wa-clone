# Tasks: Account Settings Subtree (feature 057)

Commit convention: `docs(spec)` → `feat` → `test` → `docs(spec)` closure. Each task is one
commit-sized unit. Playwright is paused by owner directive (2026-09-26): e2e tasks are **authored,
never executed** — marked `[ ]` with the directive date.

## T001 — Spec package (docs: spec)

- [x] `spec.md` (clarified 2026-10-04), `plan.md`, `research.md`, `tasks.md` (this file)
- FRs covered: documentation for all.

## T002 — Account model (feat: account.store)

- [ ] `src/app/core/account.store.ts`: `AccountState { deviceNumber; twoStep }`, key `wa.account.v1`,
      envelope `{ version: 1, ... }`; `normalizeAccount` (twoStep kept only when pin+email strings,
      deviceNumber `''` otherwise); `setDeviceNumber`, `setTwoStep`, `removeTwoStep(pin): boolean`
      (clear only on match, no state change otherwise), `reset()` (remove key + defaults, F-013
      convention). PIN stored plainly with an honest security comment.
- FR-006/FR-007/FR-008 (underpins)

## T003 — StatusStore.reset (feat: status.store)

- [ ] `src/app/core/status.store.ts`: add `reset()` — remove `wa.status-store.v1`, `myStatus`
      → null, counter → 0 (matches ChatStore/PrefsStore reset, contrasts CallStore.clearCalls).
- FR-008 (wipe path)

## T004 — Routes + Account navigation (feat: account routes)

- [ ] `app.routes.ts`: lazy `settings/account/security|two-step|change-number|delete`.
- [ ] `account-page.ts`: `onRowActivate` maps `security`/`two-step-verification`/`change-number`/
      `delete-account` → the four routes (replaces the no-op).
- FR-001/FR-002/FR-003/FR-004/FR-005

## T005 — The four screens (feat: account screens)

- [ ] `security-page.{ts,html,scss}`: Back + "Security"; honestly-disabled "Show security
      notifications" toggle (native disabled, out of tab order, F-046 pattern) + "Two-step
      verification" row → `/settings/account/two-step` with a store-driven status line.
- [ ] `two-step-page.{ts,html,scss}`: disabled ⇄ enabled. Disabled: intro + PIN + confirm PIN +
      recovery email (required), `Set PIN` gated (6 digits, match, `@`); enabled: honest status,
      change PIN, remove requires PIN re-entry (wrong → announced, state untouched). Fine-grained
      `role="status"` announcements.
- [ ] `change-number-page.{ts,html,scss}`: current (prefilled) + new number, gated validation,
      persist + announce + return to `/settings/account`.
- [ ] `delete-account-page.{ts,html,scss}`: type-to-confirm `DELETE` gates the danger button;
      confirm wipes Chat/Prefs/Status/Account stores; deleted state (no nav bar, `role="status"`,
      `Continue` → `/chats`).
- FR-001–FR-009

## T006 — Unit tests (test: account screens + store)

- [ ] `account.store.spec.ts` (persistence, reload normalization, defaults, removeTwoStep mismatch
      no-op) + `status.store.spec.ts` reset case.
- [ ] `account-page.spec.ts`: **replace** the F-046 inert test with four navigation assertions.
- [ ] `security-page.spec.ts`, `two-step-page.spec.ts`, `change-number-page.spec.ts`,
      `delete-account-page.spec.ts`: every FR assertion incl. validation failures, refusal paths,
      announcements, wipe ordering, no tab bars, no horizontal overflow; `localStorage.clear()`
      per suite; no sleeps.
- FR-001 → FR-009 (traceability at closure)

## T007 — E2E authored only (test: e2e)

- [ ] `tests/e2e/account.spec.ts`: Settings → Account → each sub-screen; two-step set/enabled
      state/remove; change-number save; delete type-to-confirm + wipe + Continue.
      **Playwright paused — authored only (directive 2026-09-26), never executed.**

## T008 — Drift notes + closure (docs: spec)

- [ ] `specs/014-account/spec.md` drift note; `specs/046-inert-control-sweep/disposition.md`: four
      rows move from Deferred → Wired (destination resolved); `figma/design-map.md` row 14;
      `specs/design-gap-audit.md` changelog entry.
- [ ] `npm run build` green; full unit suite green, exact count
- [ ] checklist + converge clean