# UI Contracts + Quickstart: Messaging Loop (feature 022)

## Contracts

| Item | Contract |
| ---- | -------- |
| store | `ChatStore` (root, signals), `src/app/core/chat.store.ts` |
| composer input | `.composer__input`, `aria-label "Message"`, role toolbar (`Message composer`) |
| send | button `aria-label "Send message"`, rendered iff draft non-empty (replaces Mic) |
| mic | button `aria-label "Record audio"`, rendered iff draft empty |
| enter | `keydown.enter` on input triggers send when draft non-empty |
| message | appended `Message { id: msg-*, sender: 'outgoing', text, time: HH:MM, file: null }` |
| preview | conversation `preview = text`, `timestamp = send time`, `read = true` |
| read tick | `.chat-list-item__ticks`, `data-testid="read-tick-<chat.id>"`, rendered iff `read` |
| open→read | entering `/chat/:id` marks that conversation read |
| read all | edit-mode "Read All" → all conversations `read: true` |
| scroll | thread scrolls to bottom when message list changes |

**Stability**: `ChatStore.reset()` restores seed state (used by unit tests; keeps suites
isolated). Conversation list is store-driven — `ChatsPage` no longer takes a `conversations`
input.

**E2E (agree with OLAS pause — authored, not executed yet)**:

```bash
npx playwright test tests/e2e/messaging.spec.ts --project=chromium-mobile   # when re-enabled
npm run test:e2e:fast
```