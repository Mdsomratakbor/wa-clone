# UI Contracts + Quickstart: call log (feature 038)

## Contracts

| Item | Contract |
| ---- | -------- |
| store | `CallStore.calls()` seeded from `CALL_SEED`; `removeCall(id)`; `clearCalls()`; `wa.call-store.v1` v1 |
| list | `call-list` renders the store's entries in seed order; `empty-state` when the log is empty |
| clear | nav `Clear` (edit mode) → `clearCalls()`; stays disabled when empty |
| remove | `call-remove` in edit mode → `removeCall(id)`, persisted |
| row tap | `call-list-item` activation → `navigate(['/chat', chatId])` for a conversation with the same `contactName`; no match → no-op |
| unchanged | filter row (`calls-filter`, `filter-missed` disabled), tab bar, nav titles, `New call` no-op, `call-info` no-op |

**Stability**: identical first-run seed ⇒ `0-8649-calls` and the edit-mode goldens unaffected.

**E2E (authored, not executed — playwright paused)**:

```bash
npx playwright test tests/e2e/calls.spec.ts --project=chromium-mobile   # when re-enabled
```