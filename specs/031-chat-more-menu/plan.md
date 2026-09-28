# Plan: WhatsApp Chat — More menu (clear messages / delete chat) (feature 031)

**Input**: `specs/031-chat-more-menu/spec.md` + `specs/031-chat-more-menu/research.md` (original: **Input**: `ChatWindowPage` + `ChatActionsModal` (F-010 sheet, rows Mute / Wallpaper / More) +)

**Gate**: G1 needs no capture for behaviour; the `More` submenu row set is provisional.

## Approach

1. Store: `clearMessages(chatId)`, `deleteConversation(chatId)` (thread + starred cleanup).
2. Seed: `CHAT_MORE_ACTIONS` (`Clear messages`, `Delete chat`).
3. `ChatWindowPage`: `moreOpen` signal, submenu `ActionSheet`, `onChatAction('chat-more')` swaps
   sheets, `onMoreAction` applies + navigates, `onDismissMore()` restores focus.
4. Unit coverage (store + window page); e2e authored (paused).
5. Drift note (`specs/010`); build + unit validation; commits (spec → feat → test).

e2e authored; G3 close + drift note.

## Phases

The approach above is executed in order; each numbered step is one commit-sized unit (docs -> feat -> test).

## Review gates

- **G1**: submenu row set provisional (no capture needed for behavior);
- **G2**: build/unit green + e2e authored;
- **G3**: close + drift note.

## Drift policy

Adds the 010 `Clear messages` / `Delete chat` submenu (drift note in 010). Row labels and the submenu presentation are hypotheses.

## Structure

Single project (repo root):

```text
specs/031-chat-more-menu/
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