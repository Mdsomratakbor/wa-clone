# Design Research: WhatsApp Contacts screen (Settings → Contacts)

**Source**: gap audit tier B1 — design row 13's `Contacts` row is the last dead row on Settings, and
the design map has no Contacts screen, so the chrome is provisional by definition.

## Research summary

- Contact source: `ChatStore.conversations()`. Every conversation already carries `contactName` and
  `avatarRef`, so a contact list is a projection of the chat model — no second store, no seed file,
  and no way for the two lists to disagree. A new-chat conversation (F-023) therefore appears in
  Contacts immediately, which is the desired behaviour.
- Derivation lives in the store (`contactConversations()`) rather than the page because B2 (New
  Group) will need the same participant source, and a store method is unit-testable without a
  component. It returns `ChatPreview[]` (the store's own model) rather than introducing a new
  `ContactListEntry` type across the core/features boundary.
- Dedup rule: first occurrence wins, so the oldest conversation for a name supplies the avatar and
  the id used by `/contact/:id`. Sorting is `localeCompare` on the name.
- Screen location: a new `features/contacts/` area rather than `features/contact-info/`, because this
  is a top-level Settings destination, not a sub-surface of contact info.
- Markup follows `StarredPage` (a pushed list with no tab bar, `role="button"` rows, `Enter`
  activation, `:focus-visible` ring, 40px avatar, `--wa-*` tokens) and the search field follows
  `ChatsPage` (`type="search"`, magnifier glyph, `data-testid="*-search"` + a clear control). Both
  precedents already exist in the repo, so the provisional chrome is idiomatic rather than novel.
- Navigation target: `/contact/:id` (spec 015) is the designed contact-info screen, so this slice
  adds a destination rather than another surface.
- Golden safety: nothing in the seeded state changes — the new screen is only reachable from the
  Settings `Contacts` row, and no store write occurs.
- Two empty states (no contacts at all vs. a query with no match) share one element whose copy
  differs, so a single `contacts-empty` testid covers both while the text stays assertable.

## Canonical artifacts

The plan and the task list that used to live in this file now live in the canonical
Speckit artifacts for this feature:

- `plan.md` - approach, phases, review gates, drift policy
- `tasks.md` - the delivery checklist (this file keeps the research record only)