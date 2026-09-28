# Design Research: WhatsApp New Chat Creation

**Source**: map-external behaviour slice (future work 2, item 2). Reuses design chrome:
New Chat sheet `0:8855` (FAB row 9, feature 009), Chats row `0:8115`, Window `0:8257`,
composer `0:8452`, and the F-022 `ChatStore`.

## Research summary

- The FAB sheet's three rows (`New group` / `New contact` / `New community`) are all no-ops; the
  action-sheet emits the row id into `onAddModalAction` (`chats-page.ts`).
- `ChatStore` already supports arbitrary `chatId` threads (`conversationMessages`/`sendMessage`
  handle any id), so a created conversation needs only a thread entry (`[]`) and a conversation
  row.
- The window header currently uses a static `CHAT_CONTACT`; deriving it from the store keeps
  new conversations consistent without a new param or route data.

## Canonical artifacts

The plan and the task list that used to live in this file now live in the canonical
Speckit artifacts for this feature:

- `plan.md` - approach, phases, review gates, drift policy
- `tasks.md` - the delivery checklist (this file keeps the research record only)