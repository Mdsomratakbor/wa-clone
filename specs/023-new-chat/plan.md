# Plan: WhatsApp New Chat Creation (feature 023)

**Input**: `specs/023-new-chat/spec.md` + `specs/023-new-chat/research.md` (original: **Input**: `figma/design-map.md` row 9 (New Chat FAB sheet, node `0:8855`) + `specs/022-messaging-loop`)

**Gate**: G1 needs no capture - row 9 already defines the `New contact` row that this feature wires.

## Approach

1. `ChatStore`: `createConversation`, `contact(chatId)`, id counter (+ reset).
2. `ChatsPage.onAddModalAction`: New contact → dismiss + create + navigate; others no-op.
3. `ChatWindowPage`: header contact = `store.contact(chatId) ?? CHAT_CONTACT`.
4. Specs/unit updates; e2e authored (paused); build + unit validation.
5. Commits (spec → feat → test).

(runs paused); G3 close + drift notes.

## Phases

The approach above is executed in order; each numbered step is one commit-sized unit (docs -> feat -> test).

## Review gates

- **G1**: no-op (no new Figma data needed);
- **G2**: build/unit green + e2e authored (runs paused);
- **G3**: close + drift notes.

## Drift policy

The add-modal `New contact` row stops being a no-op; `New group` and `New community` stay inert. The created conversation is named `New contact`, which is provisional copy.

## Structure

Single project (repo root):

```text
specs/023-new-chat/
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