# UI Contracts + Quickstart: contacts screen (feature 039)

**Provisional surface** — the design map has no Contacts screen; these contracts follow the
`StarredPage` + `ChatsPage` precedents and must be re-checked at the quota reset.

## Contracts

| Item | Contract |
| ---- | -------- |
| entry | `settings-row[Contacts]` → `navigate(['/contacts'])` |
| header | `Back` leading → `/settings`; `Contacts` title; no trailing action; no tab bar |
| list | `contacts-list` → one `contacts-row` per `contactConversations()` entry, alphabetical, avatar 40 + name |
| search | `contacts-search` (`aria-label="Search contacts"`) filters by name; `contacts-search-clear` resets |
| row | `contacts-row` click / `Enter` / `Space` → `navigate(['/contact', chatId])`; `aria-label` = contact name |
| empty | `contacts-empty` renders `No contacts` (list empty) or `No results` (query with no match) |

**Stability**: no store writes ⇒ seeded/goldens unaffected.

**E2E (authored, not executed — playwright paused)**:

```bash
npx playwright test tests/e2e/contacts.spec.ts --project=chromium-mobile   # when re-enabled
```