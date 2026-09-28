# Plan: WhatsApp Messaging Loop (feature 022)

**Input**: `specs/022-messaging-loop/spec.md` + `specs/022-messaging-loop/research.md` (original: **Input**: `figma/design-map.md` (reusable chrome rows 002, 007, 017) + `specs/022-messaging-loop/research.md`)

**Gate**: G1 needs no capture - the slice reuses design-map chrome rows 002 / 007 / 017. Store behaviour is new but not visible chrome, so no quota dependency.

## Approach

1. `ChatStore` (signals: `conversations`, `threads`; `sendMessage`, `markAllRead`,
   `openConversation`, `setConversations`, `reset`).
2. `Composer` draft + `(send)` output, mic↔Send swap, Enter-to-send.
3. `ChatWindowPage` → store messages + `onSend`, scroll-to-latest, open→read.
4. `ChatListItem` read tick; `ChatsPage` conversations from store.
5. Specs/unit updates; e2e authored (paused); build + unit validation.
6. Commit (spec → feat → docs).

authored (runs paused); G3 close + drift notes.

## Phases

The approach above is executed in order; each numbered step is one commit-sized unit (docs -> feat -> test).

## Review gates

- **G1**: no-op (no new Figma data needed — map-external);
- **G2**: build/unit green + e2e authored (runs paused);
- **G3**: close + drift notes.

## Drift policy

No new design row: the loop makes the 002 composer/window and the 001 read tick functional. Seed values stay owner-approved constants; nothing in the seeded render moves.

## Structure

Single project (repo root):

```text
specs/022-messaging-loop/
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