# UI Contracts + Quickstart: Chats edit-mode store actions (feature 032)

## Contracts

| Item | Contract |
| ---- | -------- |
| model | `ChatPreview.archived?: boolean` (additive; `normalizeChats` sets `false`) |
| store | `archiveConversations(ids)` → `archived: true` + persist; `deleteConversations(ids)` → row + thread + `${id}:` starred cleanup + persist; both no-op on `[]`; `reset()` restores |
| list | `ChatsPage.items` effect filters `archived` ⇒ list, search and unread sort all exclude archived |
| edit mode | `Archive` → `archiveConversations`, `Delete` → `deleteConversations`; selection clears; edit mode stays active; no local list mutation |
| unchanged | `Read All` → `markAllRead`; `Done` exits edit mode; captured bar copy/placeholder unchanged |

**Stability**: no seeded chat is archived ⇒ `0:8855` / `0-10092` goldens unaffected; rows only
disappear after an explicit action.

**E2E (authored, not executed — playwright paused)**:

```bash
npx playwright test tests/e2e/chats-edit.spec.ts --project=chromium-mobile   # when re-enabled
```