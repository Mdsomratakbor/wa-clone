# Feature Specification: WhatsApp New Group (group kind + creation screen)

**Feature Branch**: `040-new-group`

**Created**: 2026-09-27

**Status**: **Complete — implemented, build green, unit 385/385 (Playwright runs paused per owner
directive).**

**Input**: design rows 1/3 (`New Group` nav) + 9 (`New group` add-modal entry) + gap audit tier B2 +
`specs/040-new-group/research.md`

---

## Summary

`New Group` is designed twice (row 1/3 nav action, row 9 add-modal entry) and both entries are dead,
and the design map contains no group screen or a group conversation type. B2 therefore needs a model
before a screen: `ChatPreview` gains a `kind` and a `participants` list, `ChatStore` gains
`createGroup`, and a provisional `/new-group` screen collects a name plus participants and opens the
new group chat.

## Functional Requirements

- **FR-001** `ChatPreview` gains optional `kind?: 'direct' | 'group'` and `participants?: string[]`;
  the seed is normalized to `kind: 'direct'` with an empty participant list, and existing persisted
  snapshots hydrate unchanged (snapshot version stays `1`).
- **FR-002** `ChatStore.createGroup(name, participants)` creates a conversation with
  `kind: 'group'`, the trimmed name, the given participant names, an empty thread, `read: true`, and
  an id that cannot collide with direct chats (`group-<n>`, sharing the existing counter); it
  persists and returns the new id.
- **FR-003** A blank group name is refused by the screen (Create stays disabled) so no nameless group
  can be created.
- **FR-004** `/new-group` is a lazy route rendering `NewGroupPage`: `New group` title, leading `Back`
  to `/chats`, no trailing action, no tab bar.
- **FR-005** The screen offers a `Group name` field and a multi-select list of contacts
  (`contactConversations()`), with `aria-pressed` state per row; selection is a Set and toggling is
  order-independent.
- **FR-006** `Create` is disabled until a trimmed name exists; activating it creates the group and
  navigates to `/chat/:id`, where the existing chat window works unchanged.
- **FR-007** The Chats nav action `New Group` and the add-modal action `New group` both dismiss the
  modal where applicable and navigate to `/new-group`.
- **FR-008** `contactConversations()` excludes group conversations, so a group never appears in
  Contacts or in group participant pickers.
- **FR-009** `ChatStore.contact()` reports a group subtitle (`<n> participants`, or `Group` with none)
  instead of the direct-chat `tap here for contact info` hint.
- **FR-010** The new screen is only reachable from the two designed entries, so no seeded render or
  golden changes.

## Non-Goals

- Group avatar, group info screen, participant management, leaving a group, or admin roles.
- Sender name prefixes inside a group thread (the message model has no sender concept).
- A group glyph in the chat list row (provisional; the design map's chat row shows no group icon).
- `New community` and `Broadcast Lists` (separate audit tiers B3 and unranked) stay inert.
- Requiring at least one participant (a name-only group is allowed).

## User Stories

- **US1**: From the Chats nav I tap `New Group`, name the group, pick two people, and land in the new
  group chat.
- **US2**: I tap the FAB, choose `New group`, and get the same screen.
- **US3**: The group I created shows up in Chats, can be messaged, muted, archived and deleted like
  any other chat, and never shows up in Contacts.

## Acceptance Criteria (validation targets)

1. Unit `chat.store.spec.ts`: `createGroup` shape, id uniqueness, persistence across a reload, blank
   name handling at the store level (trim), `contactConversations()` excluding groups, group subtitle.
2. Unit `new-group-page.spec.ts` (new): header, name field, contact list, multi-select toggling,
   Create disabled/enabled, create + navigate, Back, empty state.
3. Unit `chats-page.spec.ts` (update): `New Group` nav and add-modal `New group` both route to
   `/new-group`; `New community` stays inert.
4. E2E `tests/e2e/new-group.spec.ts` (new, authored — runs paused).
5. Build green + full unit suite green (playwright paused).

## Explicit deviations (documented drift)

1. Specs 001/003 (nav `New Group` is a no-op) and 009 (add-modal `New group` is a no-op) are
   superseded (drift notes added).
2. The `/new-group` chrome is provisional — no captured design surface exists for it.

## Caveat (deliberately incomplete until G1)

- Field order (name first vs. participants first), the selection affordance (check mark vs. radio)
  and the Create/Cancel treatment must be re-checked against the design map at the quota reset.
