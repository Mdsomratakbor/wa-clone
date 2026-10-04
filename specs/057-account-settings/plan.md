# Plan: Account Settings Subtree (feature 057)

**Scope**: Resolve the F-046 deferral — the four `/settings/account` rows (Security,
Two-step verification, Change number, Delete my account) get real pushed screens with honest local
flows, per the owner clarify answers (2026-10-04, spec §Clarification). One feature, one commit
series: `docs(spec)` → `feat` → `test` → `docs(spec)` closure. Playwright stays paused
(2026-09-26): e2e authored only.

## Approach (traceable to the spec)

1. **Model**: new `AccountStore` (`src/app/core/account.store.ts`, key `wa.account.v1`, additive)
   holding `deviceNumber: string` and `twoStep: { pin, email } | null`. Normalization at load
   (`normalizeAccount`): a non-string device number → `''`; a twoStep block is kept only when both
   `pin` and `email` are strings, else dropped — the F-042/F-045 protection against rendering
   `undefined`. `removeTwoStep(pin)` clears only on a match and announces nothing itself. PIN is
   stored plainly (demo-local; there is no hashing dependency — recorded in research) with a comment
   declaring it is not security-grade.
2. **Wipe support**: `StatusStore.reset()` is the only missing store reset — added following the
   established reset convention (remove the key, restore defaults; contrast `CallStore.clearCalls()`).
   `ChatStore.reset()` and `PrefsStore.reset()` already exist (F-013). Delete-account orchestrates
   the four stores, not a new cross-store coupling.
3. **Routing**: four lazy routes under `settings/account/*` (`security`, `two-step`,
   `change-number`, `delete`), pushed-surface contract (no tab bar). `account-page.ts` `onRowActivate`
   maps row id → route — the F-046 "still inert" test in `account-page.spec.ts` is **replaced** with
   navigation assertions.
4. **Screens** (`src/app/features/settings/`):
   - `security-page` — honestly-disabled "Show security notifications" toggle (T 组件 `disabled` +
     out-of-tab-order, the F-046 notifications-page pattern) + a "Two-step verification" chevron row
     whose status line reflects the store state.
   - `two-step-page` — disabled ⇄ enabled states. Disabled: intro, 6-digit PIN + confirm + recovery
     email (required), `Set PIN` gated on validation (exactly 6 digits, match, email contains `@`).
     Enabled: honest status block, Change PIN (re-uses the form), Remove (requires re-entering the
     PIN; wrong PIN announced, state untouched). All announcements through `role="status"`.
   - `change-number-page` — current (prefilled) + new number, gated validation, persists via
     `setDeviceNumber`, announces, Back to `/settings/account`.
   - `delete-account-page` — type-to-confirm `DELETE` gates the danger button; confirm wipes
     `ChatStore`/`PrefsStore`/`StatusStore`/`AccountStore`, then swaps to a deleted state
     (`role="status"`, no nav bar — Back honestly unavailable) with a single `Continue` to `/chats`.
5. **Tests**: per-screen specs; `account.store.spec.ts` (persistence, defaults, normalization,
   remove mismatch no-op); `status.store.spec.ts` reset case; `account-page.spec.ts` navigation
   replacement; e2e authored extensions in `tests/e2e/account.spec.ts`; no-overflow cases.
6. **Docs**: drift notes in `specs/014-account/spec.md` + `specs/046-inert-control-sweep/disposition.md`
   (four rows move from Deferred → Wired/resolved), `figma/design-map.md` row 14, gap-audit
   changelog.

## Review gates

- **G1 (capture)** — **BLOCKED**: expired Figma token (`403`). All four screens have **no node**
  in the design file (`0:9371` uncaptured); every value is PROVISIONAL, recorded in the spec for
  the post-re-auth reconcile. No node ID is invented; goldens stay skipped.
- **G2 (plan**) — this plan + spec §Clarification; proceed after spec/plan/tasks are self-consistent.
- **G3 (review)** — build green, full unit suite green with exact count (735 prior), drift notes
  landed, e2e authored-only, closure commits in order.

## Drift policy

Spec 014's hypothesis rows (labels/descriptions) are **unchanged** (F-054 strings verbatim); only
their activation is added. If implementation reveals a requirement is wrong (e.g., email
validation conflicts with the cannot-invent rule), **stop** and run a clarify pass — never silently
change the contract. PROVISIONAL copy may not be presented as design-verified.