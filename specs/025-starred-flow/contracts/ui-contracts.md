# UI Contracts + Quickstart: Star Flow (feature 025)

## Contracts

| Item | Contract |
| ---- | -------- |
| star key | `"<chatId>:<messageId>"` in `ChatStore.starred` |
| toggle | `store.toggleStarred(chatId, messageId)` — add/remove, persisted |
| query | `store.isStarred(chatId, messageId): boolean` (reactive) |
| derive | `store.starredEntries(): StarredEntry[]` (`{ chatId, messageId, contactName, text, time }`, dangling refs dropped) |
| bubble | `MessageBubble` `star` output (message id) on 550ms hold or right-click (`contextmenu` `preventDefault`); `starred` input renders `.message-bubble__star` badge |
| window | `(star)` → `store.toggleStarred(chatId, messageId)`; `[starred]="isStarred(id)"` |
| starred page | empty → `#starred-tip` (unchanged); else `ul#starred-list` rows `data-testid="starred-row"` (avatar + name/time + line + star); row tap → `/chat/<id>` |
| persistence | snapshot v1 gains `starred: string[]`; `reset()` clears star state |

**Stability**: default has zero stars → no bubble badges → existing goldens untouched.

**E2E (agree with OLAS pause — authored, not executed yet)**:

```bash
npx playwright test tests/e2e/starred-flow.spec.ts --project=chromium-mobile   # when re-enabled
npm run test:e2e:fast
```