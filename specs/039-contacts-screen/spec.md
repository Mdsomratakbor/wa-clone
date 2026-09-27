# Feature Specification: WhatsApp Contacts screen (Settings → Contacts)

**Feature Branch**: `039-contacts-screen`

**Created**: 2026-09-27

**Status**: **In progress — implementing (spec-driven).**

**Input**: design row 13 (`Contacts` row) + gap audit tier B1 + `ContactPage` (015) +
`specs/039-contacts-screen/research.md`

---

## Summary

Row 13's `Contacts` row is the last dead row on the Settings screen, and the design map contains no
Contacts screen, so this is audit tier B1: a real screen with provisional chrome. Contacts are
derived from the conversation model (each distinct contact name in `ChatStore`), listed
alphabetically, searchable, and each row opens the existing contact-info screen.

## Functional Requirements

- **FR-001** `SettingsPage` row `contacts` navigates to `/contacts`.
- **FR-002** `/contacts` is a lazy route rendering `ContactsPage` (spec 039): `Back` leading action
  to `/settings`, `Contacts` title, no trailing action, no tab bar.
- **FR-003** `ChatStore.contactConversations()` returns the distinct conversations (deduped by
  `contactName`, first occurrence wins) sorted alphabetically by name.
- **FR-004** The list renders one row per derived contact: a 40px avatar and the contact name, with
  a labelled, focusable, keyboard-activatable row (`role="button"`, `Enter`/`Space`).
- **FR-005** Row activation navigates to the contact-info screen (`/contact/:id`) for that
  conversation; it does not mark anything read or mutate the store.
- **FR-006** A `Search contacts` field filters by name (case-insensitive substring) and a clear
  control resets the query; filtering never mutates the store.
- **FR-007** When there are no contacts, or the query matches nothing, an empty state is rendered
  (`No contacts` / `No results`).
- **FR-008** No horizontal overflow at any breakpoint; long names ellipsize.
- **FR-009** The screen adds no store writes, so no golden or seeded render elsewhere moves.

## Non-Goals

- `New contact` / `New group` entries, the alphabetical index rail, and the letter headers (the real
  app has them; the design map has no Contacts screen, so they would be unanchored inventions).
- Editing a contact from the list (the contact-info screen owns that, spec 019).
- Grouping, favourites, or a contacts *store* separate from `ChatStore` (audit B2 will need
  participants, not a second contact list).
- Sorting stability, pagination, or per-contact unread state.

## User Stories

- **US1**: From Settings I tap `Contacts` and see everyone I have a chat with, alphabetically.
- **US2**: I search `kar` and the list narrows to Karen; clearing the field restores the list.
- **US3**: I tap a contact and land on their contact-info screen.

## Acceptance Criteria (validation targets)

1. Unit `chat.store.spec.ts`: `contactConversations()` dedupes by name, keeps the first
   conversation, sorts alphabetically, and reflects deletions.
2. Unit `contacts-page.spec.ts` (new): header, one row per contact in alphabetical order, search
   filter, clear, empty + no-results states, row click/Enter → `/contact/:id`, no tab bar.
3. Unit `settings-page.spec.ts` (update): the `Contacts` row navigates to `/contacts`.
4. E2E `tests/e2e/contacts.spec.ts` (new, authored — runs paused): Settings → Contacts, search,
   row → contact info.
5. Build green + full unit suite green (playwright paused).

## Explicit deviations (documented drift)

1. Spec 013's "remaining row target (Contacts) is a later feature" is superseded (drift note in
   `specs/013`).
2. The list chrome (search field, row metrics, empty-state copy) is provisional and is **not** a
   captured design surface.

## Caveat (deliberately incomplete until G1)

- Exact spacing, copy and the presence/absence of a search field must be re-checked against the
  design map at the quota reset; the search field follows the `chats-page` precedent (F-028) rather
  than a measured screen.
