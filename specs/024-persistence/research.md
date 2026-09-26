# Design Research + Plan + Tasks + Quickstart: Persistence (feature 024)

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

## Plan

1. `ChatStore`: `PERSISTENCE_KEY`, `hydrate()` in constructor, `persist()` on each mutation,
   `reset()` clears storage; move `messageSequence` onto the instance.
2. Unit `chat.store.spec.ts`: persistence + hydration + fallback + counter-continuity tests.
3. E2E `persistence.spec.ts` authored (paused).
4. Build + unit validation; commits (spec → feat → test).

**Gates**: G1 no-op (no new Figma data needed); G2 build/unit green + e2e authored (runs
paused); G3 close + drift notes.

## Tasks

- [x] T001 — Spec set `specs/024-persistence/` (this set)
- [x] T002 — `ChatStore` persistence (key, hydrate, persist, reset-clears)
- [x] T003 — Unit specs (hydration, fallback, counter continuity)
- [x] T004 — E2E `persistence.spec.ts` authored
- [x] T005 — build green + unit green
- [x] T006 — notes + commits

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per owner directive
```