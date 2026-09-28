# Feature Specification: WhatsApp New Group (group kind + creation screen)

**Feature Branch**: `040-new-group`

**Created**: 2026-09-27

**Status**: **Complete — implemented, build green, unit 385/385 (Playwright runs paused per owner
directive).**

**Input**: design rows 1/3 (`New Group` nav) + 9 (`New group` add-modal entry) + gap audit tier B2 +
`specs/040-new-group/research.md`

## Clarifications

### Session 2026-09-27

- Q: Should `ChatStore.createGroup` refuse a blank name itself, so no code path can create a nameless group? → A: Store refuses blank names (throws on an empty trimmed name; the page keeps its disabled Create button).
- Q: What should happen when someone taps a group's name in the chat header, which today opens the single-contact screen? → A: Make the contact screen group-aware: a group id shows the group name, a participant list, and back navigation instead of the single-contact rows.
- Q: What should the group subtitle say, given the spec's template currently renders the awkward `1 participants`? → A: Singular for one: `1 participant` / `3 participants` (`Group` when there are none).
- Q: Should group participants stay a snapshot of names, or resolve live from the contacts so renames propagate? → A: Derive names from contacts — store participant chat ids and resolve names on read, so renames propagate and deleted contacts drop out.
- Q: I added `ChatStore.groupParticipants()` while implementing, but no requirement covers it; should it be specced and used, or removed? → A: Spec it as FR-002b and use it for the group subtitle and the group-aware contact screen.

---

## Summary

`New Group` is designed twice (row 1/3 nav action, row 9 add-modal entry) and both entries are dead,
and the design map contains no group screen or a group conversation type. B2 therefore needs a model
before a screen: `ChatPreview` gains a `kind` and a `participants` list, `ChatStore` gains
`createGroup`, and a provisional `/new-group` screen collects a name plus participants and opens the
new group chat.

## Functional Requirements

- **FR-001** `ChatPreview` gains optional `kind?: 'direct' | 'group'` and
  `participantIds?: readonly string[]` (contact chat ids, resolved to names on read — clarified
  2026-09-27); the seed is normalized to `kind: 'direct'` with no participants, and existing
  persisted snapshots hydrate unchanged (snapshot version stays `1`).
- **FR-002** `ChatStore.createGroup(name, participantIds)` creates a conversation with
  `kind: 'group'`, the trimmed name, the given participant chat ids, an empty thread, `read: true`,
  and an id that cannot collide with direct chats (`group-<n>`, sharing the existing counter); it
  persists and returns the new id.
- **FR-002a** `createGroup` throws when the trimmed name is empty, so the invariant holds for every
  caller and not only the screen (clarified 2026-09-27).
- **FR-002b** `ChatStore.groupParticipants(chatId)` resolves the stored ids to current contact names
  on every read, skipping ids whose contact no longer exists, so renames propagate and deleted
  contacts drop out (clarified 2026-09-27).
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
- **FR-009** `ChatStore.contact()` reports a group subtitle — `1 participant`, `3 participants`, or
  `Group` when there are none — instead of the direct-chat `tap here for contact info` hint
  (clarified 2026-09-27).
- **FR-011** `/contact/:id` is group-aware (clarified 2026-09-27): when the id belongs to a group it
  shows the group name and a read-only participant list, and omits the single-contact rows
  (`phone`, `Media`, `Groups`, `Block`, `Report`) that make no sense for a group. Direct chats are
  unchanged.
- **FR-010** The new screen is only reachable from the two designed entries, so no seeded render or
  golden changes.
- **FR-012** `ChatStore.conversationKind(chatId)` reports `group`/`direct` for a chat id, so callers
  branch on the kind without re-reading the conversation list.

## Non-Goals

- Group avatar, group info *screen* (a read-only participant list on the contact screen is in
  scope, per FR-011), adding or removing participants after creation, leaving a group, or admin
  roles.
- Sender name prefixes inside a group thread (the message model has no sender concept).
- A group glyph in the chat list row (provisional; the design map's chat row shows no group icon).
- `New community` and `Broadcast Lists` (separate audit tiers B3 and unranked) stay inert.
- Requiring at least one participant (a name-only group is allowed).
- A contacts directory beyond the people you already have a chat with, so a group can only include
  people already in `contactConversations()`.

## User Stories

- **US1**: From the Chats nav I tap `New Group`, name the group, pick two people, and land in the new
  group chat.
- **US2**: I tap the FAB, choose `New group`, and get the same screen.
- **US3**: The group I created shows up in Chats, can be messaged, muted, archived and deleted like
  any other chat, and never shows up in Contacts.

## Acceptance Criteria (validation targets)

1. Unit `chat.store.spec.ts`: `createGroup` shape, id uniqueness, blank-name throw, persistence
   across a reload, `groupParticipants()` rename/delete resolution, `contactConversations()`
   excluding groups, group subtitle singular/plural/empty.
2. Unit `new-group-page.spec.ts` (new): header, name field, contact list, multi-select toggling,
   Create disabled/enabled, create + navigate, Back, empty state, groups never offered.
3. Unit `chats-page.spec.ts` (update): `New Group` nav and add-modal `New group` both route to
   `/new-group`; `Broadcast Lists` and `New community` stay inert.
4. Unit `contact-page.spec.ts` (update): group name, participant count, participant list, no
   single-contact rows for a group, direct chats unchanged.
5. E2E `tests/e2e/new-group.spec.ts` (new, authored — runs paused).
6. Build green + full unit suite green (390/390 as of the clarification pass).

## Explicit deviations (documented drift)

1. Specs 001/003 (nav `New Group` is a no-op) and 009 (add-modal `New group` is a no-op) are
   superseded (drift notes added).
2. The `/new-group` chrome is provisional — no captured design surface exists for it.
3. Spec 015/026 assumed `/contact/:id` is single-contact only; F-040 extends it for group ids
   (FR-011, clarified 2026-09-27). Direct-chat rendering is untouched.

## Caveat (deliberately incomplete until G1)

- Field order (name first vs. participants first), the selection affordance (check mark vs. radio)
  and the Create/Cancel treatment must be re-checked against the design map at the quota reset.
