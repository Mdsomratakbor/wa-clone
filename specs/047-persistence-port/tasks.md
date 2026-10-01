# F-047 Tasks

Every FR maps to at least one task. Each task is one commit-sized unit. Baseline to beat: **588/588**
unit tests, build green.

## Phase 1: Cover the untested failure paths (before touching anything)

- [ ] **T001** FR-007a — write the two missing failure-path tests against the **current** code
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

- [ ] **T002** FR-001, FR-002, FR-009, FR-012 — add `PersistencePort` + `LocalStorageAdapter`
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

## Phase 3: Point the stores at the port

- [ ] **T003** FR-004, FR-010 — the test double, and the seam proof
  - **Spec**: FR-010, FR-004
  - **Files**: **new** `src/app/core/persistence/in-memory.port.ts`, `*.spec.ts`
  - **Do**: an in-memory `PersistencePort` double. Per `research.md` §7, a **spy is not sufficient** —
    prove (a) a store writes through the port, (b) a fresh store instance hydrates from that payload,
    and (c) `LocalStorageAdapter` still writes the **same key and same bytes** as the pre-port code.
    (c) is the FR-006 regression guard.
  - **Verify**: build; suite green.
  - **Commit**: `feat`.

- [ ] **T004** FR-003, FR-004, FR-005, FR-013 — `ChatStore` onto the port
  - **Spec**: FR-003, FR-004, FR-005, FR-013
  - **Files**: `src/app/core/chat.store.ts`, `chat.store.spec.ts`
  - **Do**: inject `PersistencePort`; delete `readStorage`/`writeStorage`/`clearStorage` (`:58,66,74`);
    route `persist`/`hydrate`/`reset` through it. **Keep** snapshot shape, the `version !== 1` guard,
    and `normalizeChats` in the store (FR-005). `reset()` must still leave the key **removed**
    (FR-013). Update every `new ChatStore()` in the spec to pass a port.
  - **Tests**: the existing 588 keep passing **unchanged**. No expectation edits.
  - **Verify**: build; suite green at 588 **or higher**.
  - **Commit**: `feat`.

- [ ] **T005** FR-003, FR-004, FR-005 — `CallStore` onto the port
  - **Spec**: FR-003, FR-004, FR-005
  - **Files**: `src/app/core/call.store.ts`, `call.store.spec.ts`
  - **Do**: inject the port; delete `readStorage`/`writeStorage` (`:25,33`). **There is no
    `clearStorage` in this store** — it has no `reset()`, because `clearCalls()` writes an empty
    snapshot instead of removing the key (research §3, FR-013). Do not add one.
  - **Verify**: build; suite green. F-045's session-must-not-persist test must still pass (FR-005).
  - **Commit**: `feat`.

- [ ] **T006** FR-003, FR-004, FR-005, FR-013 — `PrefsStore` onto the port
  - **Spec**: FR-003, FR-004, FR-005, FR-013
  - **Files**: `src/app/core/prefs.store.ts`, `prefs.store.spec.ts`
  - **Do**: inject the port; delete `readStorage`/`writeStorage`/`clearStorage` (`:56,64,72`). Keep
    `normalizePrefs`, the v1–v4 ladder, and `PREFS_VERSION = 4` **unchanged** (FR-005). `reset()`
    must still remove the key (FR-013).
  - **Verify**: build; suite green. F-046's removed-key normalization test must still pass.
  - **Commit**: `feat`.

## Phase 4: Closure

- [ ] **T007** FR-003, FR-008, FR-013 — gate evidence
  - **Spec**: FR-003, FR-008, FR-013, G2, G3, G4
  - **Files**: `tasks.md`, `spec.md`, `plan.md`, drift notes
  - **Do**:
    1. `grep -rE '^function (read|write|clear)Storage' src/app/core` returns **nothing** (FR-003).
    2. `git diff --stat` over `src/app/features` and `src/app/shared` is **empty** (FR-008).
    3. One `window.localStorage` reference remains in `core`, inside the adapter (FR-002).
    4. Drift notes in all four artifacts in `plan.md` "Drift Policy".
    5. FR → test traceability table and gate evidence.
  - **Verify**: build; **full** suite green, exact count. Run the suite **twice** — T001 added tests
    that stub `localStorage`, and order-independence is the risk they introduce.
  - **Commit**: `docs(spec)`.

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