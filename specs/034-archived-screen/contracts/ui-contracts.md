# UI Contracts + Quickstart: Archived screen (feature 034)

## Contracts

| Item | Contract |
| ---- | -------- |
| store | `unarchiveConversations(ids)` → clears `archived` + persist; `[]` is a no-op; `archivedIds()` drives the screen |
| route | `GET /archived` → `ArchivedPage` (lazy, alongside the other feature routes) |
| screen | `NavigationBar title="Archived"`, leading back action → `/chats`; `data-testid="archived-page"`; rows reuse `ChatListItem`; empty status `No archived chats` (`data-testid="archived-empty"`) |
| restore | row tap → `unarchiveConversations([id])` + `navigate(['/chat', id])` |
| pinned row | `data-testid="archived-row"`, `aria-label="Archived"`, archive-box glyph + label; shown iff `archivedCount() > 0 && !editing() && !searchActive()`; tap → `/archived` |

**Stability**: no archived chats in the default state ⇒ no pinned row ⇒ `0-8855` / `0-10092`
goldens unchanged.

**E2E (authored, not executed — playwright paused)**:

```bash
npx playwright test tests/e2e/archived.spec.ts --project=chromium-mobile   # when re-enabled
```