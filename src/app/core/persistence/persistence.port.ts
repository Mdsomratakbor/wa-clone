import { Injectable } from '@angular/core';
import { LocalStorageAdapter } from './local-storage.adapter';

/**
 * F-047 FR-001, FR-009, FR-012. The seam a backend adapter will implement.
 *
 * An abstract class rather than an `InjectionToken` on purpose: a store with an
 * unsatisfied port dependency then fails to **compile** rather than silently
 * defaulting at runtime. For a seam whose whole job is substitution in tests,
 * a missing port should be a build error, not a quiet wrong behaviour.
 *
 * The payload is an opaque string. Nothing here knows what a snapshot looks like
 * — versioning, normalization and envelope shape stay in the store, because they
 * are consequences of the model changing (F-042 added `kind` with no normalizer,
 * F-045 added `outcome` with none), not of where the bytes are kept.
 *
 * ## Read this before writing an HTTP adapter
 *
 * `read` is **synchronous**, and it cannot stay that way. `localStorage` is
 * synchronous; there is no synchronous XHR in any modern browser, so an HTTP
 * adapter cannot implement this method without blocking the UI thread. Shipping
 * that adapter means changing `read` to return a `Promise` — and that in turn
 * means all three stores can no longer hydrate in their constructor, so the app
 * paints seed data and then swaps to persisted data on every cold start.
 *
 * That trade was declined deliberately (F-047 Clarification 1, resolved by
 * delegation rather than ratified): a refactor whose purpose is to change
 * nothing should not buy a hypothetical future adapter with a visible regression
 * today. The cost is recorded here rather than left to be discovered by whoever
 * writes the adapter.
 *
 * `HttpClient` needs no npm install when that happens — it ships inside
 * `@angular/common`, already a dependency. The missing piece was always this
 * abstraction, not the capability. See `specs/047-persistence-port/research.md`
 * §5.
 *
 * ## Why the default binding lives here
 *
 * `@Injectable({ providedIn: 'root', useClass: LocalStorageAdapter })` on the *abstract token* is not
 * an arbitrary style choice — it is what makes FR-008 satisfiable at all, and getting it wrong is the
 * single largest cost of this feature.
 *
 * FR-008 requires `git diff --stat` over `src/app/features` and `src/app/shared` to be **empty**, and
 * ~210 page specs under `src/app/features/**` inject these stores through the component tree. Every
 * one of them configures a `TestBed` with no persistence providers. A binding declared in
 * `app.config.ts` is invisible to all of them: `TestBed` does not read the application config. So with
 * an `app.config.ts`-only binding, the choice was between violating FR-008 across 12 spec files, or
 * shipping an `optional` port parameter with a `new LocalStorageAdapter()` default — which would delete
 * the seam, because a store would silently fall back to real storage instead of failing.
 *
 * Declaring the default on the token itself resolves it in both places at once, and it keeps the
 * failure mode honest: an unsatisfied port is still a compile error, because the binding ships with
 * the port rather than being assembled by each caller.
 *
 * The cost is that the abstraction names one of its implementations. That is a real trade and it is
 * paid knowingly: FR-009 ("provided at the app root with `LocalStorageAdapter` as the default") and
 * FR-008 (no changes under `features/`) are jointly unsatisfiable without it. The alternative —
 * `app.config.ts` plus 12 edited spec files — was rejected as the larger violation.
 *
 * ## The import cycle this has to avoid
 *
 * `LocalStorageAdapter implements PersistencePort`, and this file imports `LocalStorageAdapter` at
 * runtime for `useClass`. A runtime cycle would be a `ReferenceError` at module evaluation, because
 * the subclass would be evaluated against a `PersistencePort` still in its temporal dead zone. So the
 * adapter's reference to the port is `import type`, which TypeScript erases completely — the port
 * file imports the adapter's value, the adapter imports only the port's type, and there is no cycle.
 * `implements` preserves the compile-time conformance check that `extends` would have given.
 */
@Injectable({ providedIn: 'root', useClass: LocalStorageAdapter })
export abstract class PersistencePort {
  /** Returns the stored payload, or `null` when absent or unreadable. Never throws. */
  abstract read(key: string): string | null;

  /** Stores the payload. Best-effort: an unavailable store is a no-op, not an error. */
  abstract write(key: string, value: string): void;

  /** Removes the key entirely. Distinct from `write` — see F-047 FR-013. */
  abstract remove(key: string): void;
}