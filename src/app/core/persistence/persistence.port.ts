/**
 * F-047 FR-001, FR-012. The seam a backend adapter will implement.
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
 */
export abstract class PersistencePort {
  /** Returns the stored payload, or `null` when absent or unreadable. Never throws. */
  abstract read(key: string): string | null;

  /** Stores the payload. Best-effort: an unavailable store is a no-op, not an error. */
  abstract write(key: string, value: string): void;

  /** Removes the key entirely. Distinct from `write` — see F-047 FR-013. */
  abstract remove(key: string): void;
}