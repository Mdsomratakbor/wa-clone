# UI Contracts + Quickstart: New Chat Creation (feature 023)

## Contracts

| Item | Contract |
| ---- | -------- |
| create | `store.createConversation(name?: string): string` — appends row + empty thread, returns `chat-new-<n>` |
| id | counter starts 0, increments per creation, `reset()` clears it |
| contact | `store.contact(chatId): ContactHeader \| null` — name = contactName, subtitle = `tap here for contact info`, avatarRef passthrough |
| header | window contact = `store.contact(chatId) ?? CHAT_CONTACT` |
| action | New contact row (`id 'new-contact'`) → dismiss sheet + `createConversation()` + navigate `/chat/<id>` |
| no-ops | `new-group`, `new-community` keep the sheet open, no navigation |
| new row | `{ preview: '', timestamp: now, read: true, avatarRef: null }` → renders with placeholder avatar, blank preview, read tick |

**Stability**: ids are deterministic after `reset()` (`chat-new-1` first). The list shows the
new conversation at the END (no recency sort yet).

**E2E (agree with OLAS pause — authored, not executed yet)**:

```bash
npx playwright test tests/e2e/new-chat.spec.ts --project=chromium-mobile   # when re-enabled
npm run test:e2e:fast
```