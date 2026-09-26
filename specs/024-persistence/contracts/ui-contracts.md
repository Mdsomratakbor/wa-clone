# UI Contracts + Quickstart: Persistence (feature 024)

## Contracts

| Item | Contract |
| ---- | -------- |
| key | `PERSISTENCE_KEY = 'wa.chat-store.v1'` (exported) |
| snapshot | `{ version: 1, conversations, threads, messageSequence, newChatCounter }` |
| write | every store mutation calls `persist()` (sync, try/catch swallowed) |
| read | `hydrate()` in constructor; invalid/absent/foreign-version → seed |
| reset | clears key + counters + seed (removes `chat-new-*` rows) |
| counters | message sequence + new-chat counter survive reload (unique ids continue) |

**Stability**: all prior contracts (F-022 `sendMessage`, F-023 `createConversation`) unchanged —
persistence is additive.

**E2E (agree with OLAS pause — authored, not executed yet)**:

```bash
npx playwright test tests/e2e/persistence.spec.ts --project=chromium-mobile   # when re-enabled
npm run test:e2e:fast
```