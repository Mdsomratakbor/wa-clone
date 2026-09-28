# Plan: WhatsApp Star Flow (long-press → starred list) (feature 025)

**Input**: `specs/025-starred-flow/spec.md` + `specs/025-starred-flow/research.md` (original: **Input**: `specs/008-starred-messages` (non-goals → now completed) + `ChatStore` (F-022/23/24) +)

**Gate**: G1 needs no capture - completes the 008 starred screen that already exists in the design map.

## Approach

1. `ChatStore`: `starred` signal, `toggleStarred`/`isStarred`/`starredEntries`, snapshot v1
   field, hydrate/reset.
2. `MessageBubble`: hold gesture + `contextmenu` → `star` output; `starred` input + badge.
3. `ChatWindowPage`: `(star)` → store; `[starred]="isStarred(id)"` helper.
4. `StarredPage`: store entries list + row tap → chat; tip preserved for empty.
5. Unit updates; e2e authored (paused); build + unit validation.
6. Drift note in `specs/008-starred-messages/spec.md`; commits (spec → feat → test).

paused); G3 close + drift notes.

## Phases

The approach above is executed in order; each numbered step is one commit-sized unit (docs -> feat -> test).

## Review gates

- **G1**: no-op (no new Figma data needed);
- **G2**: build/unit green + e2e authored (runs paused);
- **G3**: close + drift notes.

## Drift policy

Closes the 008 non-goals (long-press -> starred list) with a drift note in that spec. The star affordance on a bubble is a gesture the design file does not specify.

## Structure

Single project (repo root):

```text
specs/025-starred-flow/
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