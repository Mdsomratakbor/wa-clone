# Plan: WhatsApp Chats — search + sort (feature 028)

**Input**: `specs/028-chats-search-sort/spec.md` + `specs/028-chats-search-sort/research.md` (original: **Input**: `ChatsPage` (chat-list feature) + `PrefsStore` (F-027) + backlog "chat-list)

**Gate**: Golden re-capture is blocked (Figma 429 + playwright pause) because the Chats chrome gains a search bar and a sort segment.

## Approach

1. `PrefsStore` v2 `chatSort` + `setChatSort` + tolerant hydrate + units.
2. `ChatsPage`: `searchQuery`, `visibleItems`, `onSearchInput`/`clearSearch`/`onSort`, sort
   segment + search bar template/SCSS (hidden while editing).
3. Unit coverage; e2e authored (paused); build + unit validation.
4. Drift note in `specs/001-chat-list`; commits (spec → feat → test).

green + e2e authored; G3 close + drift note.

## Phases

The approach above is executed in order; each numbered step is one commit-sized unit (docs -> feat -> test).

## Review gates

- **G1**: golden re-capture pending Figma/playwright unblock (chrome is new);
- **G2**: build/unit green + e2e authored;
- **G3**: close + drift note.

## Drift policy

Adds chrome to a 001 screen, recorded as a drift note in `specs/001-chat-list`. Sort order and the clear-search affordance are provisional until capture; seeded rows are unchanged.

## Structure

Single project (repo root):

```text
specs/028-chats-search-sort/
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