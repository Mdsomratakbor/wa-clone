# Design Research: WhatsApp Persistence (client-side session store)

**Source**: map-external behaviour slice (future work 2, item 3). Completes the F-022/F-023
non-goals ("persistence across reloads deferred").

## Research summary

- `ChatStore` is the single source of truth; every mutation goes through explicit methods, so
  explicit synchronous snapshot-on-mutate is simpler and more test-friendly than a reactivity
  flush effect (effects from a services need change detection to flush — brittle in unit tests).
- The message sequence + new-chat counter must be part of the snapshot so reloads continue
  unique ids instead of re-seeding from a stale counter (id collisions).
- Angular's `providedIn: 'root'` store is a singleton per module; unit tests already reset
  per-test, so `reset()` must also clear storage to keep suites isolated.

## Canonical artifacts

The plan and the task list that used to live in this file now live in the canonical
Speckit artifacts for this feature:

- `plan.md` - approach, phases, review gates, drift policy
- `tasks.md` - the delivery checklist (this file keeps the research record only)