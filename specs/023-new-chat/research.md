# Design Research + Plan + Tasks + Quickstart: New Chat Creation (feature 023)

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

## Plan

1. `ChatStore`: `createConversation`, `contact(chatId)`, id counter (+ reset).
2. `ChatsPage.onAddModalAction`: New contact → dismiss + create + navigate; others no-op.
3. `ChatWindowPage`: header contact = `store.contact(chatId) ?? CHAT_CONTACT`.
4. Specs/unit updates; e2e authored (paused); build + unit validation.
5. Commits (spec → feat → test).

**Gates**: G1 no-op (no new Figma data needed); G2 build/unit green + e2e authored
(runs paused); G3 close + drift notes.

## Tasks

- [x] T001 — Spec set `specs/023-new-chat/` (this set)
- [x] T002 — `ChatStore.createConversation` + `contact` + counter/reset
- [x] T003 — `ChatsPage` New contact → create + navigate
- [x] T004 — `ChatWindowPage` store-derived header contact
- [x] T005 — Unit updates (store, chats-page, chat-window-page)
- [x] T006 — E2E `new-chat.spec.ts` authored
- [x] T007 — build green + unit green
- [x] T008 — notes + commits

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per owner directive
```