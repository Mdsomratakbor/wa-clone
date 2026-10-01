# F-047 Implementation Plan

Traceable to `spec.md` (FR-001 – FR-013) and `research.md`. Review gates G1 – G4 are in
`spec.md`; this plan states how each task moves them.

## Approach

Three steps, in this order, and the order is the plan:

1. **Cover the untested failure paths** (FR-007a) against the code as it is today. Two of the eight
   functions being consolidated have no test at their failure branch — the branch that exists
   precisely because storage can be unavailable. Moving code first would move that blindness with it.
2. **Add the port and the localStorage adapter** (FR-001, FR-002, FR-009). No store changes yet.
3. **Point the three stores at the port** (FR-003, FR-004, FR-005, FR-013) and re-run the same
   tests unchanged. Green before and after is the whole proof.

### Why the port is an abstract class, not an `InjectionToken`

An abstract class gives a **compile error** when a store's port dependency is unsatisfied. An
`InjectionToken` with a factory fails at runtime, or silently succeeds with a default. For a seam
whose entire purpose is substitution in tests, a missing port should be a build failure, not a
subtle wrong behaviour. `FR-001`'s observable contract is fixed either way; this is a means.

```ts
// src/app/core/persistence/persistence.port.ts
export abstract class PersistencePort {
  abstract read(key: string): string | null;
  abstract write(key: string, value: string): void;
  abstract remove(key: string): void;
}
```

### Why the store keeps its snapshot logic

`normalizeChats` and `normalizeCalls` exist because of shipped defects (F-042 added `kind`/
`participantIds` with no normalizer; F-045 added `outcome` with none — both would have loaded
`undefined` into the UI). That history is the argument: normalization is a consequence of the *model*
changing, not of where bytes are stored. Moving it behind the port would also make the port
model-aware, and a port that understands envelopes is not a transport.

### Why the root binding lives on the token, not in `app.config.ts`

> **Corrected twice during implementation (F-047 T002 → T004).** This section originally read "Why no
> `app.config.ts` change" and claimed that `providedIn: 'root'` alone lets the root injector satisfy the
> abstract-class dependency. **That was wrong**, and the claim was only ever plausible-looking: Angular's
> injector has no notion of inheritance, and `class LocalStorageAdapter extends PersistencePort` is a
> compile-time relationship the runtime never sees. `providedIn: 'root'` registers exactly one token —
> `LocalStorageAdapter`. The `PersistencePort` token got no binding. Found by writing the test first:
> `ɵNotFound: NG0201: No provider found for PersistencePort`.
>
> The first correction put `{ provide: PersistencePort, useClass: LocalStorageAdapter }` in
> `app.config.ts`. That satisfies FR-009 for the running app and is the obvious fix — and it is wrong
> for this feature. T004 put `ChatStore` on the port and **210 tests failed**: the page specs under
> `src/app/features/**` inject the stores through the component tree and configure a `TestBed` with no
> persistence providers, and **`TestBed` never reads `app.config`**. The two options were to edit 12
> spec files under `features/` (violating FR-008) or to make the port optional with a
> `new LocalStorageAdapter()` default — which deletes the seam, because a store would silently fall
> back to real storage instead of failing.
>
> The resolution is to declare the default on the token itself:
>
> ```ts
> // persistence.port.ts
> @Injectable({ providedIn: 'root', useClass: LocalStorageAdapter })
> export abstract class PersistencePort { /* ... */ }
> ```
>
> This resolves in the app **and** in every `TestBed`, so FR-009's "no test needs one for a happy path"
> and FR-008's empty diff over `features/` hold together. The cost is that the abstraction names one of
> its implementations — paid knowingly, because FR-008 + FR-009 are jointly unsatisfiable without it.
> `app.config.ts` was reverted: one mechanism, not two.
>
> `LocalStorageAdapter` keeps its own `providedIn: 'root'` as well, and the two are not redundant:
> the token's binding is what lets a **store** ask for the seam, while the class's is what lets a test
> ask for the concrete adapter by name (the FR-006 byte-compatibility test needs that).
>
> **This required `extends` → `implements` with an `import type`.** With `extends`, `persistence.port.ts`
> needs the adapter's *value* for `useClass` and the adapter needs the port's *value* to extend —
> a runtime cycle, and a `ReferenceError` at module evaluation because the subclass would be evaluated
> against a `PersistencePort` still in its temporal dead zone. `import type` is erased entirely, so the
> cycle never exists and `implements` keeps the compile-time conformance check.

**No requirement changed.** FR-009 always asked for the port to be provided at the app root with
`LocalStorageAdapter` as the default; the plan simply mispredicted the mechanism twice. Only the means
were wrong. Left uncorrected, the original claim would have read as a decision rather than an error.

## File plan

| File | Change |
| ---- | ------ |
| `src/app/core/persistence/persistence.port.ts` | **new** — `PersistencePort` abstract class **carrying its own root default** (`providedIn: 'root', useClass: LocalStorageAdapter`), plus the HTTP caveat (FR-012) and the FR-008 rationale |
| `src/app/core/persistence/local-storage.adapter.ts` | **new** — `LocalStorageAdapter implements PersistencePort` (via `import type`, to avoid a runtime cycle), `@Injectable({ providedIn: 'root' })`; the only `window.localStorage` reference in `core` (FR-002) |
| `src/app/core/persistence/local-storage.adapter.spec.ts` | **new** — adapter behaviour incl. the throwing-`localStorage` cases, plus FR-009 root resolution (empty `TestBed`) and FR-010 substitution |
| `src/app/core/persistence/in-memory.port.ts` | **new** — test double implementing the port, for proving the seam (FR-010) |
| `src/app/core/chat.store.ts` | inject the port; delete `readStorage`/`writeStorage`/`clearStorage` (`:58,66,74`) (FR-003, FR-004) |
| `src/app/core/call.store.ts` | inject the port; delete `readStorage`/`writeStorage` (`:25,33`) (FR-003, FR-004) |
| `src/app/core/prefs.store.ts` | inject the port; delete `readStorage`/`writeStorage`/`clearStorage` (`:56,64,72`) (FR-003, FR-004) |
| `src/app/core/*.spec.ts` | supply a port at every `new XStore()` site; add the FR-007a gap tests |
| `src/app/features/**`, `src/app/shared/**` | **untouched**, except `calls/calls-page.spec.ts` — one test-harness line plus its import, ratified by Clarification Q4 (FR-008 as amended). No component, template or style changed; the diff is load-bearing: the root binding lives on the token precisely so these spec files need no provider |

`in-memory.port.ts` lives in `src/app/core/persistence/` rather than under a test folder because
Angular's build does not special-case test helpers, and a fake that has to be excluded from the
production bundle by path convention is a fake that eventually ships.

## Risks

1. **The constructor-injection churn is the bulk of the work.** `new ChatStore()` stops compiling
   everywhere. That is FR-004 working as intended, but it touches many spec files and the temptation
   is to make the port optional with a default. Resist: an optional port means a store can silently
   fall back to `window.localStorage`, which is the seam disappearing.
2. **A test count that goes *down*.** G2 forbids it without justification. The only legitimate drop
   is a test whose subject was deleted — nothing is deleted here, so the count must hold or rise
   (FR-007a and the adapter/port specs add tests).
3. **"Green before and after" is easy to fake** by editing a test's expectation to match new code.
   The FR-007a tests are written and committed against the *current* implementation first, so they
   cannot be retrofitted to the port.
4. **`window.localStorage` accessed in a constructor during SSR/build** would throw at module
   evaluation. It already can (`LocalStorageAdapter`'s methods are called from store constructors),
   so behaviour is preserved by construction — but the adapter must not touch `localStorage` at
   *injection* time, only inside the three methods, or the throw moves earlier than it is today.
5. **`prefs.store.spec.ts` has no corrupt-JSON test** (research §7). FR-007a requires writing one
   against current code. If it fails, that is a live defect in `prefs.store.ts:158-163` and gets
   reported, not absorbed.
6. **`extends PersistencePort` reads like a provider binding and is not one** (realised during T002 —
   see the corrected section above). This one earned a risk entry of its own because the failure mode is
   invisible to the compiler: `providedIn: 'root'` compiles, the build is green, and the defect only
   surfaces as `NG0201` in a running app. The general lesson — an abstract class chosen *precisely
   because* it fails loudly when unsatisfied provides no such guarantee for the token that extends it.
7. **An `app.config.ts` binding looks like it satisfies FR-009 and does not** (realised during T004 —
   210 failures). `TestBed` does not read the application config, so a binding that is correct for the
   shipped app is invisible to all 12 page specs under `features/`, which FR-008 forbids editing. Any
   seam a component-level test reaches must be self-provisioning; "it works in the app" is not evidence
   that a test can reach it.
8. **Risk 1 was right about the churn and the spec forbade the fix** (realised during T005). Risk 1
   predicted `new XStore()` would stop compiling everywhere; FR-008's empty-diff clause forbade touching
   the files where that happened. The plan and the spec were in direct disagreement before any code
   existed, and neither was checked against the other. Escalated under Clarification Q4 and resolved by
   amending FR-008 rather than weakening the seam. Worth carrying forward: a plan risk that describes a
   necessary edit and a spec clause that forbids it is a contradiction to settle in `spec.md` **before**
   the task that triggers it, not during.

## Drift Policy

| Superseded | What drifts |
| ---------- | ----------- |
| `specs/024-persistence/spec.md` | its hand-rolled-helpers description becomes a port + adapter. It is the spec that documented the duplication F-047 removes, so it must say where the duplication went |
| `specs/045-calling-flow/research.md` §9 | its "no HTTP client dependency, so no seam to land in" conclusion is corrected — the seam was missing, not the capability (research §5) |
| `specs/046-inert-control-sweep/research.md` §3 | cites `chat.store.ts:60,68,76`, `call.store.ts:16,24`, `prefs.store.ts:59,67,75` — line numbers move when those helpers are deleted |
| `specs/046-inert-control-sweep/tasks.md` FR→test table | cites `prefs.store.spec.ts` v4-normalization tests; names are stable, so no edit expected — verified at closure rather than assumed |

No earlier spec's requirements are edited to change what they require. Each note records where the
implementation moved.