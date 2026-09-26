# UI Contracts + Quickstart: Contact Info — live wiring (feature 026)

## Contracts

| Item | Contract |
| ---- | -------- |
| model | `ChatPreview.phone?: string` (additive) |
| update | `store.updateContact(chatId, name, phone?)` — trims name, blank → keep old, sets phone, persists |
| read | `store.contactName(chatId)` (`'Contact'` fallback) / `store.contactPhone(chatId)` (`''`) |
| contact page | title + hero name from store; `Messages` → `openConversation` + `/chat/<id>`; `contact-starred` row → `/starred-messages`; media/groups rows no-op |
| edit page | Name/Phone prefilled from store; Save → `updateContact` + `/contact/<id>` |
| reflection | renames propagate to list row, chat header, starred entries (all store-derived) |

**Stability**: seeds carry no phone (`undefined`); nothing renders new UI on default data →
existing goldens untouched.

**E2E (agree with OLAS pause — authored, not executed yet)**:

```bash
npx playwright test tests/e2e/contact-flow.spec.ts --project=chromium-mobile   # when re-enabled
npm run test:e2e:fast
```