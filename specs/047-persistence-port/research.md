# F-047 Research — Persistence Port

Evidence gathered 2026-09-30, before `/speckit.clarify`. Every citation is a line read from the
working tree, not from memory or from a prior document.

## 1. The duplication, exactly

`grep -c '^function (read|write|clear)Storage' src/app/core/*.ts` → **8**.

| Store | Key | `readStorage` | `writeStorage` | `clearStorage` |
| ----- | --- | ------------- | -------------- | --------------- |
| `chat.store.ts` | `wa.chat-store.v1` (`:9`) | `:58` | `:66` | `:74` |
| `call.store.ts` | `wa.call-store.v1` (`:14`) | `:25` | `:33` | — |
| `prefs.store.ts` | `wa.prefs.v1` (`:40`) | `:56` | `:64` | `:72` |

Every body is the same:

```ts
try { return window.localStorage.getItem(key); } catch { return null; }
try { window.localStorage.setItem(key, value); } catch { /* best-effort */ }
try { window.localStorage.removeItem(key); } catch { /* ignore */ }
```

Two findings worth more than the duplication itself:

1. **`call.store.ts` has no `clearStorage`.** `ChatStore.reset()` (`:417`) and `PrefsStore.reset()`
   (`:134`) both need it; `CallStore` has no `reset()` at all. So the "3 copies of each helper" claim
   is really 3 + 3 + 2. The asymmetry is invisible until someone adds `CallStore.reset()`, copies
   the two helpers that exist, and misses the third.
2. **They are module-level functions, not injected.** `new ChatStore()` in
   `chat.store.spec.ts` reaches `window.localStorage` through the module. There is no constructor
   parameter to substitute, so the seam does not exist — this is the actual problem, not the
   duplication.

## 2. What the store must keep

Persistence-adjacent logic that is **domain, not transport**, and therefore stays put:

| Concern | Location |
| ------- | -------- |
| Envelope shape (`version` + payload) | `chat.store.ts:433`, `call.store.ts:174`, `prefs.store.ts:143` |
| Version guard | `chat.store.ts:455`, `call.store.ts:190`, `prefs.store.ts:171` |
| Normalization | `normalizeChats` (chat), `normalizeCalls` (call), `normalizePrefs` (prefs, added by F-046) |
| Version ladder (prefs accepts 1–4) | `prefs.store.ts:171` |

`normalizeChats` and `normalizeCalls` exist because of real defects: F-042 shipped `kind`/
`participantIds` without a normalizer, and F-045 shipped `outcome` without one. Both would have
loaded `undefined` into the UI. That history is the argument for keeping normalization in the
store: it is a consequence of the *model* changing, not of where the bytes are stored.

## 3. The two inconsistent reset semantics

This is a real inconsistency, found while reading, and it is the reason Clarification 3 exists.

| Store | Method | Effect on stored data |
| ----- | ------ | --------------------- |
| `ChatStore` | `reset()` (`:417`) | `clearStorage(PERSISTENCE_KEY)` — **removes the key** |
| `PrefsStore` | `reset()` (`:134`) | `clearStorage(PREFS_KEY)` — **removes the key** |
| `CallStore` | `clearCalls()` (`:81`) | `this.calls.set([]); this.persist();` — **writes an empty snapshot** |

`CallStore` is the odd one out: it leaves a serialized `{version: 1, calls: [], nextCallSeq: N}`
behind instead of removing the key. Observationally equivalent to a user, and both hydrate to
"empty", so no test can distinguish them today.

It matters at the port boundary, because a backend has no "remove a key" operation. The HTTP
equivalent of `clearStorage` is `DELETE`, and of `clearCalls` is `PUT` with an empty list. A port
that only exposed `write` would force `clearCalls`'s semantics onto the other two stores; a port
that exposes `remove` (`FR-001`) preserves all three. The recommendation is to expose `remove` and
**preserve each store's current behaviour exactly**, but that is a decision, not a detail.

## 4. The sync/async problem, stated precisely

`localStorage.getItem` is synchronous. `HttpClient.get` is not.

**A synchronous port cannot be implemented over HTTP without blocking the UI thread.** Fetch is
async by specification; there is no synchronous XHR in any modern browser. So if the port is
`read(key): string | null`, a backend swap requires either:

- blocking (unacceptable), or
- the port changing shape later — which means every store's `hydrate()` changes later, which means
  F-047 does not actually deliver the seam it exists to create.

**But an async port has a real cost today.** All three stores hydrate in their constructor:

- `chat.store.ts` — `hydrate()` called from the constructor
- `call.store.ts` — `hydrate()` from the constructor
- `prefs.store.ts:105-107` — `constructor() { this.hydrate(); }`

If `read` returns a `Promise`, the constructor cannot `await`. State arrives after the first render,
so the app paints **seed data** — 12 chats, 12 calls, default prefs — and then swaps to persisted
data. That is a visible flash on every cold start, and for `PrefsStore` it means a saved
"Enter key sends: off" briefly renders as on.

A third option exists and is worth putting to the owner: a **synchronous port now, with the shape
documented as the thing an HTTP adapter must not implement** — i.e. accept that the HTTP swap will
change the port's read shape and touch three `hydrate()` methods then. That is honest about the cost
and keeps this feature behaviour-free, which is what a refactor should be.

F-045 §9 assumed the seam was free. It is not free, and the spec leaves it as **Clarification 1**
rather than picking silently.

## 5. No new dependency is needed — correcting F-045

`specs/045-calling-flow/research.md` §9: "`package.json` has no HTTP client dependency" and
therefore "backend later currently has no seam to land in".

Verified against the working tree:

```
node_modules/@angular/common/http  →  exists (index.d.ts, testing/)
package.json dependencies          →  "@angular/common": "^20.1.0"
```

`HttpClient` and `provideHttpClient()` ship **inside** `@angular/common`. An HTTP adapter needs no
npm install and no owner exception to the no-new-dependencies rule.

The research's conclusion — that the stores would have to be hand-wired — is still right. The
reason is the missing abstraction, not a missing library. The distinction is why FR-011 can
recommend *deferring* the HTTP adapter without also recommending a dependency request later.

## 6. Provider wiring

All three stores are `@Injectable({ providedIn: 'root' })`, and none currently lists a provider for
anything. If the port is an abstract class or an injection token, the three stores gain a
constructor dependency. Consequences:

- `new ChatStore()` in specs (used throughout `chat.store.spec.ts`, `call.store.spec.ts`,
  `prefs.store.spec.ts`) stops compiling. That is the point — FR-004 — but it means the existing
  persistence tests must be given a port, and the churn is the bulk of this feature's work.
- `providedIn: 'root'` on the `LocalStorageAdapter` satisfies FR-009 without touching
  `app.config.ts` or any component. A `useClass`/`useExisting` provider is only needed if the port
  is an abstract class rather than an `InjectionToken` with an explicit factory.

Abstract class vs `InjectionToken`: the abstract class gives a compile error when a store's port
dependency is unsatisfied, which is the safer default for a seam whose whole job is to be
substituted in tests. Recorded as a plan decision, not a spec question — it is a means, and FR-001
already fixes the observable contract.

## 7. Test strategy — and two coverage gaps found while writing this

G4 names five hydration cases that must be named, and each must already have a test. Checked
against the working tree, and **two of the five do not**:

| Case | Covered today? | Where |
| ---- | -------------- | ----- |
| chat v1 snapshot | yes | `chat.store.spec.ts:623` |
| chat corrupt JSON | yes | `chat.store.spec.ts:163` |
| chat unknown version | yes | `chat.store.spec.ts:177` (`version: 99`) |
| prefs v1–v4 ladder | yes | `prefs.store.spec.ts:62,136,177,189` |
| prefs removed-key normalization (F-046) | yes | `prefs.store.spec.ts:75` |
| prefs `reset()` clears the key | yes | `prefs.store.spec.ts:43` |
| call v1 `outcome` normalization (F-045) | yes | `call.store.spec.ts:91` |
| call corrupt JSON | yes | `call.store.spec.ts:62` |
| **prefs corrupt JSON** | **NO** | — |
| **storage-unavailable (any store)** | **NO** | — |

Two gaps, both material to this feature specifically:

1. **`prefs.store.ts:158-163` has an untested `catch` around `JSON.parse`.** Chat and Call both
   guard this; Prefs does not. A corrupt prefs payload is the one case where a user would silently
   lose their settings, and nothing asserts it degrades to defaults.
2. **No store has a storage-unavailable test.** Not one spec makes `localStorage.getItem` or
   `.setItem` throw. The 8 functions this feature exists to consolidate are, at the failure path,
   **completely untested** — and that failure path is the entire reason they are written defensively.
   Private mode, a full quota, a blocked third-party context, and a `file://` origin all reach it.

So the order is: **write these tests first, against the current implementation, and watch them pass.**
If a test fails against today's code, that is a live defect to report, not something to encode. This
is the same discipline F-045 applied to its snapshot test (`call.store.ts:41-44` — the v1 test was
written before the normalizer, and caught the `outcome: undefined` bug).

**New tests beyond the gaps:**

- A fake in-memory port proving (a) a store writes through it, (b) a fresh store instance hydrates
  from its payload, (c) `LocalStorageAdapter` still produces the same key and the same bytes as
  before — the last is the regression guard for FR-006.
- A spy port is **not** sufficient for G4. Asserting `port.write` was called proves the seam exists;
  it does not prove the snapshot is still the same shape and still round-trips.

## 8. Correction to §7 as first written

This file originally claimed all five G4 cases "must already have a test before this feature starts.
Verified present" and then listed them. That verification was done by reading test *names* for
keywords, which is how the two missing cases got past it — there is no `prefs` test with "corrupt"
in the name, and no test anywhere with a `localStorage` throw in it, so a keyword search cannot
surface either absence. The table above replaces the claim. Recorded rather than fixed quietly,
because a research document that overstates its own coverage is worse than one that admits a gap.
