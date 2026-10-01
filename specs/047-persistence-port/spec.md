# Feature Specification: Persistence Port (F-047)

**Feature Branch**: `feature/persistence-port`
**Created**: 2026-09-30
**Status**: Clarify pass run 2026-09-30 — three questions asked, **not answered by the owner**;
each resolved to its recommended option by delegation and recorded as such below. Draft pending
`/speckit.plan`.
**Input**: The backend seam identified in `specs/045-calling-flow/research.md` §9, deferred there as
follow-on work. Numbering confirmed by the owner on 2026-09-29: the inert-control sweep took F-046,
this seam is F-047.

## Project Directive

There is no backend. Every store hand-rolls the same `localStorage` try/catch. A port is introduced
so a real backend can be swapped in later **without editing a store**. This feature is a refactor:
it must change no user-visible behaviour, and it must not invent a backend.

## Clarifications

Asked 2026-09-30. **The owner interrupted the question set and directed work to continue without
answering.** Each question is therefore resolved to the option marked recommended, by delegation.
This is recorded prominently rather than folded in silently, because "the owner picked this" and "I
picked this and the owner let me" are different facts and a later reader needs to know which one they
are relying on. Any of the three can be reopened without disturbing the rest of the feature.

1. **Q1 — the port's `read` shape.** Sync or async?
   **Delegated to recommendation: synchronous `read(key): string | null`.**
   A synchronous port cannot be implemented over HTTP without blocking, so the HTTP swap will change
   this signature and touch three `hydrate()` methods. That cost is stated in the port's own doc
   comment rather than left for an adapter author to discover. The alternative — an async `read` —
   would force all three stores to stop hydrating in their constructor, and the app would paint seed
   data before swapping to persisted data on every cold start. A refactor whose purpose is to change
   nothing should not buy a hypothetical future adapter with a visible regression today.

2. **Q2 — does an HTTP adapter ship in this feature?**
   **Delegated to recommendation: no. Port + `LocalStorageAdapter` only.**
   There is no backend, so an HTTP adapter could only be verified against a mock, which proves the
   mock rather than the adapter. The enabling finding — `HttpClient` is framework-provided via
   `@angular/common`, so the later feature needs no dependency exception — is recorded in
   research §5 and in FR-011 so the omission is visibly a decision.

3. **Q3 — preserve or normalize the inconsistent reset semantics?**
   **Delegated to recommendation: preserve each store's current behaviour exactly.**
   `ChatStore.reset()` and `PrefsStore.reset()` remove the storage key; `CallStore.clearCalls()`
   writes an empty snapshot. The port exposes `remove` alongside `write`, so all three keep their
   present semantics and the inconsistency stays visible. Normalizing would be a behaviour change
   disguised as a refactor, which is the thing FR-006 and the closing non-functional rule exist to
   prevent. The divergence is documented in research §3 instead.

### Requirement consequences

- **FR-012** (was NEEDS CLARIFICATION Q1) — the port is synchronous. Its doc comment must state that
  an HTTP adapter cannot implement it and will have to change this signature and the three
  `hydrate()` methods. Silence here is how the next adapter author burns a day discovering it.
- **FR-011** (was NEEDS CLARIFICATION Q2) — **resolved: no HTTP adapter in this feature.** The
  requirement now records *why* it is absent and where the capability is documented, so the omission
  cannot later read as an oversight.
- **FR-013** (new, from Q3) — the port declares `remove` as a distinct operation from `write`, and no
  store's reset semantics change. `ChatStore.reset()` and `PrefsStore.reset()` must still leave
  `localStorage.getItem(key) === null`; `CallStore.clearCalls()` must still leave a serialized empty
  snapshot under its key. Both asserted by name.

## Problem

Three stores each define their own private copy of the same storage helpers:

| Store | Key | `readStorage` | `writeStorage` | `clearStorage` |
| ----- | --- | ------------- | -------------- | --------------- |
| `chat.store.ts` | `wa.chat-store.v1` | `:58` | `:66` | `:74` |
| `call.store.ts` | `wa.call-store.v1` | `:25` | `:33` | *absent* |
| `prefs.store.ts` | `wa.prefs.v1` | `:56` | `:64` | `:72` |

**8 function definitions, one behaviour.** They are byte-identical apart from the store that owns
them. `call.store.ts` has no `clearStorage` at all, because `CallStore` exposes no `reset()` — a
missing case that is invisible until someone adds one and forgets.

The helpers are also *module-level functions*, not injected. `new ChatStore()` in a test reaches
`window.localStorage` directly. There is therefore no seam: a backend would be hand-wired into three
stores, and each store's snapshot logic would have to be re-derived against it.

## Correction to the F-045 research

`specs/045-calling-flow/research.md` §9 states there is "no HTTP client dependency", so "backend
later currently has no seam to land in". The first half is right; the conclusion is not.

`@angular/common/http` **ships inside `@angular/common`**, which is already a dependency
(`package.json`, `^20.1.0`). `provideHttpClient()` and `HttpClient` are framework-provided and need
no npm install. The missing piece is the **abstraction**, not the capability — and that distinction
matters, because it means an HTTP adapter later does not need a dependency exception from the owner.

This is recorded rather than quietly adopted, because the earlier research asserted the opposite and
a reader comparing the two documents should see which is right and why.

## Terminology

- **Port** — the interface a store depends on. Owns nothing but `read` / `write` / `remove` over an
  opaque string payload.
- **Adapter** — an implementation of the port. `LocalStorageAdapter` ships now. An HTTP adapter is
  **out of scope** (see FR-011 and Clarification 2).
- **Store** — `ChatStore` / `CallStore` / `PrefsStore`. Owns snapshot shape, versioning, and
  normalization. These stay in the store: they are domain rules, not transport concerns.

## Requirements

### Functional

- **FR-001** A single injectable persistence port type must exist, declaring exactly three
  operations over an opaque string payload keyed by a string: `read`, `write`, `remove`. It must
  return `void` or a value, never throw on a storage failure — a blocked or unavailable store is a
  normal condition, not an exception.
- **FR-002** A `LocalStorageAdapter` must implement the port. It owns the only remaining reference
  to `window.localStorage` in `src/app/core`, including the try/catch on all three operations.
- **FR-003** All **8** hand-rolled storage helper definitions must be deleted from the three stores.
  No duplicate copy may survive. `grep` for `function readStorage|writeStorage|clearStorage` in
  `src/app/core` must return nothing.
- **FR-004** All three stores must depend on the injected port, not on module-level functions.
  `new ChatStore()` in a test must work only when a port is supplied — the store must not reach for
  `window.localStorage` when one is absent.
- **FR-005** Snapshot shape, versioning, and normalization stay in the store. `JSON.stringify`,
  the `version !== N` guard, `normalizeChats`, `normalizePrefs`, and the prefs version ladder
  (accepting 1–4) are **not** moved into the port or the adapter. The port moves bytes, nothing
  understands them.
- **FR-006** Every existing persistence behaviour must be preserved exactly:
  - a v1 chat snapshot still hydrates; a pre-F-046 prefs v1–v4 snapshot still hydrates and
    still normalizes the five removed pref keys away;
  - a corrupt-JSON payload still leaves defaults intact rather than throwing;
  - a missing payload still leaves defaults intact;
  - a payload at an unknown version is still ignored.
- **FR-007** Storage-unavailable fallback must survive the move. With `localStorage.getItem` or
  `.setItem` throwing, the app must still boot to defaults and must not throw out of a store method.
- **FR-007a** **The two untested failure paths are covered before anything is moved.** Research §7
  found that no store has a storage-unavailable test, and `prefs.store.ts` has no corrupt-JSON test
  — so the 8 functions being consolidated have an entirely untested failure path. Those tests are
  written **against the current implementation first, and must pass before the port lands**. A test
  that fails against today's code is a live defect to report, not an expectation to adjust.
- **FR-008** No component may change. `git diff --stat` over `src/app/features` and
  `src/app/shared` must be empty for this feature.
- **FR-009** The port must be provided at the app root with the `LocalStorageAdapter` as the default,
  so no store needs to list a provider and no test needs one for a happy path.
- **FR-010** The adapter must be swappable in a test with a stub, and **at least one** store test
  must prove it: assert the store writes through a fake port and that a fake port's payload
  hydrates a fresh store instance. This is the acceptance criterion for the seam actually existing.
- **FR-011** **Resolved — no HTTP adapter ships in this feature.** The port and a
  `LocalStorageAdapter` ship; nothing that performs a network call is written. Reason: there is no
  backend, so an HTTP adapter could only be verified against a mock, which tests the mock. The
  capability finding is recorded so this omission is visibly a decision and not an oversight:
  `HttpClient` ships inside `@angular/common`, already a dependency, so **F-048 needs no dependency
  exception**. Research §5 holds the evidence.
- **FR-012** **Resolved — the port is synchronous.** `read(key): string | null`,
  `write(key, value: string): void`, `remove(key: string): void`. The port's own documentation must
  state that an HTTP adapter **cannot** implement a synchronous `read` and will have to change this
  signature together with the three `hydrate()` methods. That cost is stated where the next adapter
  author will read it, not left to be discovered.
- **FR-013** `remove` is a distinct port operation from `write`, and **no store's reset semantics
  change**. `ChatStore.reset()` and `PrefsStore.reset()` must still leave
  `localStorage.getItem(key) === null`; `CallStore.clearCalls()` must still leave a serialized empty
  snapshot under its key. Both asserted by name. The divergence is preserved and documented (research
  §3), not normalized away inside a refactor.

### Non-Functional

- **No new dependencies.** `HttpClient` availability is noted above and deliberately unused.
- **Tokens only** in any styling. Expected: no styling change at all in this feature.
- **Deterministic tests**: no `setTimeout`; no dependence on the real clock; no shared state; no
  test that only passes in file order.
- **Full suite green** before each commit, exact count reported. Baseline to beat: **588/588**.
- **No behaviour change is acceptable.** A refactor that alters a user's stored data, a hydration
  outcome, or an error path is a defect, not a simplification.

## Out of scope

- Any HTTP client, interceptor, base URL, or network call — resolved by Clarification 2 / FR-011.
- Any server, mock server, or recorded fixture of server responses.
- Changing snapshot shapes or bumping any version number.
- Migrating or deleting existing `localStorage` data.
- Normalizing the divergent reset semantics — resolved by Clarification 3 / FR-013.
- The F-046 deferrals (`specs/046-inert-control-sweep/disposition.md`) — unrelated.
- Session persistence for calls. `CallStore` deliberately does not persist the live session
  (F-045 FR-009) and that must stay true.

## Review Gates

- **G1** — Figma: not applicable. No chrome is touched.
- **G2** — `npm run build` green; **full** unit suite green with the exact count reported, and the
  count is **588 or higher**. A lower count means a test was deleted, which requires justification in
  the commit body.
- **G3** — every store depends on the injected port; `grep` proves no duplicate helper survives; the
  port is documented where a future adapter author will look.
- **G4** — **hydration behaviour is byte-for-byte equivalent** before and after, for all five cases
  in FR-006 plus the FR-007 fallback. Each case gets a named test that existed before this feature
  and still passes after it. If a case had no test, that is a gap to fill, not a licence to change
  behaviour.

## Out of Scope Questions for the Owner

None outstanding. The three that were open are answered in "Clarifications" above — by delegation,
not by an explicit ruling, and marked as such.

## Dependencies

- **F-046** (inert control sweep) — closed. Not a blocker, but it is why `PrefsStore` now has only
  two keys, which this feature must not disturb.
- **F-045** research §9 — the seam this feature lands in.
- **F-048+** — whatever ships a real backend and an HTTP adapter.
