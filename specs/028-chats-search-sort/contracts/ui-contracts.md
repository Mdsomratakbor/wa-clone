# UI Contracts + Quickstart: Chats — search + sort (feature 028)

## Contracts

| Item | Contract |
| ---- | -------- |
| prefs v2 | envelope `{ version: 2, prefs, chatSort }`; v1 accepted (prefs only, chatSort `recent`) |
| api | `chatSort` signal (`'recent'\|'name'\|'unread'`, default `'recent'`); `setChatSort(v)` persists; `reset()` restores + clears storage |
| search | `data-testid="chat-search"` input; filters `contactName`/`preview`, case-insensitive; `chat-search-clear` when non-empty |
| sort | `data-testid="chat-sort"`; options Recent (store order)/Name (alpha)/Unread (unread first, stable); `aria-pressed` active |
| empty | zero conversations → `empty-state` "No chats"; query with no match → `search-empty` "No chats found" |
| modes | search/sort hidden while `editing()`; store never mutated by search/sort |

**Stability**: default Recent = seed/store order; search is per-page state; no store or seed
changes → F-001 golden `0-8855` re-capture is the only verification drift (G1, pending).

**E2E (agree with OLAS pause — authored, not executed yet)**:

```bash
npx playwright test tests/e2e/search-sort.spec.ts --project=chromium-mobile   # when re-enabled
```