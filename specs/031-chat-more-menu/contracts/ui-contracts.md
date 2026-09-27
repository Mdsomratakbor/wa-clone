# UI Contracts + Quickstart: Chat — More menu (feature 031)

## Contracts

| Item | Contract |
| ---- | -------- |
| store | `clearMessages(chatId)` (thread `[]`, preview `''`, `read: true`); `deleteConversation(chatId)` (row + thread + `${chatId}:` starred keys removed); both persist; `reset()` restores |
| seed | `CHAT_MORE_ACTIONS` = `[{ id: 'chat-clear', label: 'Clear messages' }, { id: 'chat-delete', label: 'Delete chat' }]` |
| window | `chat-more` closes the parent sheet and opens the submenu; `chat-clear` clears + closes; `chat-delete` deletes + closes + `navigate(['/chats'])`; `chat-wallpaper` unchanged no-op |
| a11y | submenu is the shared `ActionSheet` (dialog + `action-sheet-row` testids); dismiss (backdrop/Escape) restores focus to `[data-testid="chat-header__more"]` |

**Stability**: seeded state unchanged ⇒ `0:8257` / `0-8855` goldens unaffected; new rows appear
only in the submenu.

**E2E (authored, not executed — playwright paused)**:

```bash
npx playwright test tests/e2e/chat-more.spec.ts --project=chromium-mobile   # when re-enabled
```