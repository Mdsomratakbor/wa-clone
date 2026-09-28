# Plan: WhatsApp Persistence (client-side session store) (feature 024)

**Input**: `specs/024-persistence/spec.md` + `specs/024-persistence/research.md` (original: **Input**: `specs/022-messaging-loop` + `specs/023-new-chat` (ChatStore non-goals) +)

**Gate**: G1 needs no capture - no visible change; persistence is storage behaviour only.

## Approach

1. `ChatStore`: `PERSISTENCE_KEY`, `hydrate()` in constructor, `persist()` on each mutation,
   `reset()` clears storage; move `messageSequence` onto the instance.
2. Unit `chat.store.spec.ts`: persistence + hydration + fallback + counter-continuity tests.
3. E2E `persistence.spec.ts` authored (paused).
4. Build + unit validation; commits (spec → feat → test).

paused); G3 close + drift notes.

## Phases

The approach above is executed in order; each numbered step is one commit-sized unit (docs -> feat -> test).

## Review gates

- **G1**: no-op (no new Figma data needed);
- **G2**: build/unit green + e2e authored (runs paused);
- **G3**: close + drift notes.

## Drift policy

Adds a storage key and hydrate/persist to `ChatStore`; no spec drift, no rendered change. A corrupt or partial payload falls back to the seed rather than throwing.

## Structure

Single project (repo root):

```text
specs/024-persistence/
- spec.md          # requirements (canonical)
- research.md      # Phase 0 research + assumptions
- plan.md          # this file (Phase 1)
- tasks.md         # Phase 2 task list
- contracts/ui-contracts.md
src/app/core/        # stores (ChatStore, PrefsStore, CallStore)
src/app/features/    # one folder per screen
src/app/shared/components/  # nav bar, list item, action sheet, toggles
tests/e2e/           # playwright specs (authored; runs paused)
```