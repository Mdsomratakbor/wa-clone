# UI Contracts + Quickstart: new group (feature 040)

**Provisional surface** — the design map has no group screen; these contracts follow the
`EditContactPage` + `ContactsPage` precedents and must be re-checked at the quota reset.

## Contracts

| Item | Contract |
| ---- | -------- |
| entries | `chats-page` nav `New Group` → `/new-group`; add-modal `New group` → `/new-group` (modal dismissed first) |
| header | `Back` leading → `/chats`; `New group` title; no trailing action; no tab bar |
| name | `new-group-name` (`aria-label="Group name"`), trimmed, drives Create validity |
| picker | `new-group-contact` rows, one per direct contact, `aria-pressed` toggles, alphabetical |
| create | `new-group-create` disabled until a trimmed name exists; activating creates the group and navigates to `/chat/group-<n>` |
| empty | `new-group-empty` when there are no direct contacts |
| group | `ChatPreview.kind='group'`, `participantIds: readonly string[]` (contact chat ids), id `group-<n>`, `read: true`, empty thread |
| group info | `/contact/group-<n>` renders `contact-group-count` (`1 participant` / `2 participants`) and `contact-participant` rows, and no `contact-row` items |
| unchanged | chat list, chat window, direct contact screen, `New community`, `Broadcast Lists`, seeded goldens |

**Stability**: no seeded render moves; the new screen is reachable only from the two designed entries.

**E2E (authored, not executed — playwright paused)**:

```bash
npx playwright test tests/e2e/new-group.spec.ts --project=chromium-mobile   # when re-enabled
```