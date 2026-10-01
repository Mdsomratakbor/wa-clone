# F-047 Tasks

Every FR maps to at least one task. Each task is one commit-sized unit. Baseline to beat: **588/588**
unit tests, build green.

## Phase 1: Cover the untested failure paths (before touching anything)

- [x] **T001** FR-007a — write the two missing failure-path tests against the **current** code
  - **Commit**: `142ef06`. **Verified**: written and passing against the *unmodified* stores; suite
    **598/598** across three randomized runs (no order dependence).
  - **Spec**: FR-007a, FR-006, FR-007; research §7
  - **Files**: `src/app/core/prefs.store.spec.ts` (new corrupt-JSON test),
    `src/app/core/chat.store.spec.ts` / `call.store.spec.ts` / `prefs.store.spec.ts`
    (new storage-unavailable tests)
  - **Do**:
    1. `prefs` corrupt-JSON: write `not json{` to `PREFS_KEY`, construct the store, assert defaults
       survive and nothing throws. Verified absent today (`research.md` §7) — `prefs.store.ts:158-163`
       has an untested `catch`.
    2. Storage-unavailable, per store: stub `localStorage.setItem` and `.getItem` to throw, assert the
       store still constructs to defaults and that `set`/`toggle`/`persist` do not throw. No store has
       this test today, so the 8 helpers' entire failure branch is uncovered.
    3. Use `spyOn` + a fake throwing implementation; restore in `afterEach`. No `window.localStorage`
       monkey-patching that leaks into other specs.
  - **Verify**: these tests run against the **unmodified** stores and pass. If one fails, that is a
    live defect — report it, do not adjust the expectation. Then run the suite **twice** to confirm
    no order dependence.
  - **Commit**: `test`.

## Phase 2: The port and its adapter (no store changes yet)

- [x] **T002** FR-001, FR-002, FR-009, FR-012 — add `PersistencePort` + `LocalStorageAdapter`
  - **Commit**: `5281b97` (port + adapter), plus the T002 follow-up below. **Verified**: build green,
    **607/607** twice.
  - **Spec**: FR-001, FR-002, FR-009, FR-012; plan "Approach"
  - **Files**: **new** `src/app/core/persistence/persistence.port.ts`,
    **new** `src/app/core/persistence/local-storage.adapter.ts`
  - **Do**:
    - `PersistencePort` as an **abstract class** with `read(key): string | null`,
      `write(key, value): void`, `remove(key): void`.
    - The port's doc comment **must** state that an HTTP adapter cannot implement a synchronous `read`
      and will have to change this signature plus the three `hydrate()` methods (FR-012). This is the
      single most expensive thing to leave undocumented.
    - `LocalStorageAdapter`: `@Injectable({ providedIn: 'root' })`, the three methods with the
      **existing** try/catch bodies moved verbatim. Must not touch `localStorage` at injection time,
      only inside the methods (plan risk 4).
  - **Tests**: `local-storage.adapter.spec.ts` — round-trip, `remove` clears, and the throwing
    `getItem`/`setItem` cases return `null` / no-op without throwing.
  - **Verify**: build; suite green with the count **unchanged at 588** plus the new adapter tests.
  - **Commit**: `feat`.
  - **Follow-up, same task (FR-009 was not actually met by `5281b97`)**: the FR-009 binding test was
    written **first** and failed with `ɵNotFound: NG0201: No provider found for PersistencePort`. The
    cause: Angular's injector has no notion of inheritance, so `extends PersistencePort` registers no
    binding for the abstract token and `providedIn: 'root'` binds only the concrete class. The first fix
    (`app.config.ts`) was then found **also insufficient** during T004 — see the T004 note. The final
    resolution is the binding on the token itself, which needs `extends` → `implements` with an
    `import type` to avoid a runtime cycle. `plan.md` has been corrected with the full evidence trail
    rather than quietly left to mislead.

## Phase 3: Point the stores at the port

- [x] **T003** FR-010 — the in-memory port double
  - **Commit**: (this commit). **Verified**: build green, **613/613** (+6 double-contract tests).
  - **Spec**: FR-010
  - **Files**: **new** `src/app/core/persistence/in-memory.port.ts`, `*.spec.ts`
  - **Do**: an in-memory `PersistencePort` double, plus a spec proving the double itself honours the
    port contract. Per `research.md` §7, a **spy is not sufficient** — a spy asserts that a call
    happened, not that the bytes round-trip, so it cannot catch a store that writes a payload a fresh
    instance cannot read back.
  - **Verify**: build; suite green.
  - **Commit**: `feat`.
  - **Reordered during implementation — see the note below.** The store-level seam proof (FR-010's
    acceptance criterion) was originally assigned here, but it cannot be written in this task: a store
    is not on the port until T004. That is a dependency inversion in the task plan, not a discovery
    about the code. The proof moved to T004 rather than being written against something that does not
    exist yet. No requirement was dropped — FR-010 still gets its assertion, from `chat.store.spec.ts`.

- [x] **T004** FR-003, FR-004, FR-005, FR-010, FR-013 — `ChatStore` onto the port
  - **Commit**: (this commit). **Verified**: build green, **620/620**. `chat.store.ts` no longer
    references `localStorage`; its three helpers are gone. All pre-existing expectations unchanged.
  - **The T002 `app.config.ts` fix was wrong, and this task is what proved it.** Putting a store on the
    port turned **210 tests red** across 12 page specs under `src/app/features/**`. They inject the
    stores through the component tree with a bare `TestBed`, and `TestBed` never reads `app.config` —
    so a binding that is entirely correct for the shipped app is invisible to them. The options were to
    edit 12 spec files (violating FR-008, whose diff over `features/` must be **empty**) or make the
    port optional (which deletes the seam: a store would silently fall back to real storage). Resolved
    by moving the default onto the token itself — `@Injectable({ providedIn: 'root', useClass:
    LocalStorageAdapter })` on `PersistencePort` — which satisfies FR-009 and FR-008 together. This
    required `LocalStorageAdapter extends PersistencePort` → `implements PersistencePort` via an
    `import type`, because the port now needs the adapter's *value* for `useClass` while the adapter
    needs the port only as a *type*; with `extends` the cycle is real and dies with a `ReferenceError`
    at module evaluation. `app.config.ts` was reverted: one mechanism, not two.
  - **Two of my own new assertions were wrong and were corrected, not bent to fit.** An identity claim
    (`TestBed.inject(PersistencePort)` === `TestBed.inject(LocalStorageAdapter)`) failed — `useClass`
    builds a separate instance, and both are stateless so it does not matter; the test now asserts the
    thing that *is* true and matters, that the override both resolves and takes effect. A counter test
    asserting one distinct `chat-new-*` id failed because hydration correctly carries the first
    session's id; the real property is that ids do not *collide*, now asserted as
    `['chat-new-1', 'chat-new-2']`.
  - **Spec**: FR-003, FR-004, FR-005, FR-010, FR-013
  - **Files**: `src/app/core/chat.store.ts`, `chat.store.spec.ts`
  - **Do**: inject `PersistencePort`; delete `readStorage`/`writeStorage`/`clearStorage` (`:58,66,74`);
    route `persist`/`hydrate`/`reset` through it. **Keep** snapshot shape, the `version !== 1` guard,
    and `normalizeChats` in the store (FR-005). `reset()` must still leave the key **removed**
    (FR-013). Update every `new ChatStore()` in the spec to pass a port.
  - **Tests**: the existing 588 keep passing **unchanged**. No expectation edits. **Plus the FR-010 seam
    proof, moved here from T003**: with an `InMemoryPersistencePort`, assert (a) a store action writes
    the snapshot through the port, and (b) a payload already in the port hydrates a **fresh** store
    instance. (b) is the assertion a spy cannot make. Also re-assert the FR-006 byte/key guard from
    T002 to show the port and the adapter agree.
  - **Verify**: build; suite green at 588 **or higher**.
  - **Commit**: `feat`.

- [x] **T005** FR-003, FR-004, FR-005 — `CallStore` onto the port
  - **Commit**: (this commit). **Verified**: build green, **620/620**. `CallStore`'s two helpers are
    gone; it has no `reset()` and none was added. `clearCalls()` still writes an empty snapshot.
  - **This task is where FR-004 and FR-008 turned out to be jointly unsatisfiable.**
    `src/app/features/calls/calls-page.spec.ts:327` did `new CallStore()`, so the mandatory port
    parameter was a build failure. Escalated rather than worked around, and **owner-answered**
    (2026-10-01, Clarification Q4): amend FR-008 to exempt `*.spec.ts` files, keep the port mandatory.
    `spec.md` FR-008 now retains its component/template/style prohibition and carries the superseded
    wording as visible history rather than quietly reinterpreting it. One file changed under
    `features/`: the import plus the one call site, using the **real** adapter, since that reload
    asserts a delete survived to storage and must read the `localStorage` the page wrote through.
    The rejected alternative was an optional `storage: PersistencePort = new LocalStorageAdapter()`
    default — free in the diff, but it would route a bare `new CallStore()` to real `localStorage`,
    which is the trap `plan.md` risk 1 names, and would forfeit FR-004's compile-time guarantee.
  - **Spec**: FR-003, FR-004, FR-005
  - **Files**: `src/app/core/call.store.ts`, `call.store.spec.ts`
  - **Do**: inject the port; delete `readStorage`/`writeStorage` (`:25,33`). **There is no
    `clearStorage` in this store** — it has no `reset()`, because `clearCalls()` writes an empty
    snapshot instead of removing the key (research §3, FR-013). Do not add one.
  - **Verify**: build; suite green. F-045's session-must-not-persist test must still pass (FR-005).
  - **Commit**: `feat`.

- [x] **T006** FR-003, FR-004, FR-005, FR-013 — `PrefsStore` onto the port
  - **Commit**: (this commit). **Verified**: build green, **620/620**. No helper functions remain
    in `src/app/core` (grep returned 0). `reset()` still removes the key; the v1–v4 normalization and
    `PREFS_VERSION = 4` are unchanged.
  - **No spec-file changes under `features/` were needed** for PrefsStore, which matches the amended
    FR-008. The only `features/` edit in the feature remains the single call site in
    `calls/calls-page.spec.ts`, ratified by Clarification Q4.
  - **Spec**: FR-003, FR-004, FR-005, FR-013
  - **Files**: `src/app/core/prefs.store.ts`, `prefs.store.spec.ts`
  - **Do**: inject the port; delete `readStorage`/`writeStorage`/`clearStorage` (`:56,64,72`). Keep
    `normalizePrefs`, the v1–v4 ladder, and `PREFS_VERSION = 4` **unchanged** (FR-005). `reset()`
    must still remove the key (FR-013).
  - **Verify**: build; suite green. F-046's removed-key normalization test must still pass.
  - **Commit**: `feat`.

## Phase 4: Closure

- [x] **T007** FR-003, FR-008, FR-013 — gate evidence
  - **Commit**: (this commit). **Verified**: build green; **full suite green twice** —
    **620/620** both runs (randomized order; T001's `localStorage` stubs are the order-independence
    risk, and two clean runs say they are contained). Baseline was 588/588 at `6796e42`; +32 tests.
  - **Do** (as originally planned):
    1. `grep -rE '^function (read|write|clear)Storage' src/app/core` returns **nothing** (FR-003).
    2. `git diff --stat` over `src/app/features` and `src/app/shared` contains **no non-`.spec.ts`
       file**, and every `*.spec.ts` entry is a ratified test-harness fix listed by file and line
       (FR-008 **as amended by Clarification Q4**; the original "must be empty" wording would not be
       satisfiable — see the spec's superseded-wording block).
    3. One `window.localStorage` reference remains in `core`, inside the adapter (FR-002).
    4. Drift notes in all four artifacts in `plan.md` "Drift Policy".
    5. FR → test traceability table and gate evidence.
  - **Verify**: build; **full** suite green, exact count. Run the suite **twice** — T001 added tests
    that stub `localStorage`, and order-independence is the risk they introduce.
  - **Commit**: `docs(spec)`.

  - **Gate evidence**

| Gate | Requirement | Evidence | Result |
| ---- | ----------- | -------- | ------ |
| G2 / FR-003 | no duplicate helper survives | `Select-String '^function (read\|write\|clear)Storage' src/app/core/*.ts` → **0 matches** (was 8) | pass |
| FR-003 | stores reach storage only via the port | `Select-String 'window.localStorage' src/app/core/*.store.ts` → **0 matches**; the only production reference in `core` is `persistence/local-storage.adapter.ts` (FR-002) | pass |
| FR-008 (as amended, Q4) | no component/template/style change | `git diff --stat 6796e42 HEAD -- src/app/features src/app/shared` → exactly one file, `calls/calls-page.spec.ts` (+6/-1): one import + one call site, ratified by Clarification Q4. **No non-spec file changed.** | pass with the ratified exemption |
| FR-001 / FR-009 | the port resolves as the root default | `local-storage.adapter.spec.ts` "resolves PersistencePort with no provider declared anywhere in the test" — empty `TestBed`, no `appConfig` | pass |
| FR-010 | the seam exists and is substitutable | `chat.store.spec.ts` "F-047 FR-010" — 5 tests: writes through the port, fresh instance hydrates, id counter survives, port/adapter byte agreement, `reset()` removes. Plus `local-storage.adapter.spec.ts` "FR-010: the root default does not obstruct substitution" | pass |
| FR-012 | sync-port HTTP caveat is documented | `persistence.port.ts` doc comment ("Read this before writing an HTTP adapter"), and the FR-008/import-cycle rationale below it | pass |
| FR-013 | reset semantics unchanged, per store | `chat.store.spec.ts` "reset removes the key rather than writing an empty snapshot"; `call.store.ts` `clearCalls()` comment; existing F-045/F-046 key assertions still pass | pass |
| G4 / FR-006 | no behaviour change | Every pre-existing expectation passed **unchanged** through T004–T006; T001's failure-path tests were committed against the *pre-port* code and still pass through the seam | pass |
| G3 | every store depends on the injected port | `ChatStore`, `CallStore`, `PrefsStore` each take `PersistencePort` in the constructor; no optional/default parameter anywhere | pass |
| G1 | Figma | N/A — no chrome touched | n/a |

  - **FR → test traceability**

| FR | Test |
| -- | ---- |
| FR-001 | `local-storage.adapter.spec.ts` (whole suite) |
| FR-002 | `local-storage.adapter.spec.ts` "unavailable storage" (3 tests) — the only `window.localStorage` in `core` |
| FR-003 | T004/T005/T006 diffs + the 0-match greps above |
| FR-004 | `chat.store.spec.ts`, `call.store.spec.ts`, `prefs.store.spec.ts` construct stores with an explicit port |
| FR-005 | F-045's pre-v1 `outcome` snapshot test; F-046's removed-key and v4-normalization tests — all unchanged and passing |
| FR-006 | `local-storage.adapter.spec.ts` "FR-006" key/bytes guard; `chat.store.spec.ts` "port and LocalStorageAdapter agree on key and bytes" |
| FR-007a | `chat.store.spec.ts` / `call.store.spec.ts` / `prefs.store.spec.ts` storage-unavailable tests + `prefs.store.spec.ts` corrupt-JSON test (10 tests, T001) |
| FR-008 | the `git diff --stat` row above |
| FR-009 | `local-storage.adapter.spec.ts` "resolves PersistencePort with no provider declared anywhere in the test" |
| FR-010 | the 5 `chat.store.spec.ts` FR-010 tests + the 2 adapter-substitution tests + `in-memory.port.spec.ts` (6 double-contract tests) |
| FR-011 | no HTTP adapter exists; capability finding recorded in `research.md` §5 and FR-011 |
| FR-012 | `persistence.port.ts` doc comment |
| FR-013 | `chat.store.spec.ts` FR-010 reset test; `call.store.ts`/`prefs.store.ts` reset comments; existing key assertions |

  - **Not shipped because no spec authorized it:** an HTTP adapter (FR-011), any snapshot/version
    change (out of scope), normalizing `CallStore.clearCalls()` (FR-013 keeps the divergence), any
    component/template/style change (FR-008).
  - **E2E:** no e2e spec changed and none run — this feature moves no user-visible behaviour, and
    Playwright is paused by directive 2026-09-26.

## Explicitly not in these tasks

- An HTTP adapter (Clarification 2 / FR-011). `HttpClient` is framework-provided, so the later
  feature needs no dependency exception — recorded in `research.md` §5 so the omission reads as a
  decision.
- Normalizing `CallStore.clearCalls()` to remove the key (Clarification 3 / FR-013).
- Any snapshot shape, version number, or migration change.
- Persisting the live call session.
- Any component, template, or style change.

## Blocked

- **None.** No Figma gate applies (G1 N/A), no owner input is outstanding, and Playwright remains
  paused by directive 2026-09-26 — this feature touches no e2e-covered behaviour, so no e2e spec
  changes and none is run.