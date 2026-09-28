# Design Research: WhatsApp New Group (group kind + creation screen)

**Source**: gap audit tier B2 — `New Group` (rows 1/3) and `New group` (row 9) are two designed
entries for a flow whose screen and data model do not exist yet.

## Research summary

- Model first: a group is a conversation, so it is modelled as an additive `ChatPreview` pair
  (`kind`, `participants`) rather than a parallel collection. The existing additive-field pattern
  (`muted ?? false`, `archived ?? false`, `normalizeChats`) is followed, and the snapshot version
  stays `1` because old payloads simply lack the optional keys. Bumping the version would needlessly
  invalidate users' persisted chats.
- Ids: `createConversation` uses `chat-new-<n>` with a private counter that is persisted. Groups use
  `group-<n>` from the *same* counter, so an id can never be both, and one counter field stays in the
  snapshot.
- `read: true` and an empty preview mirror `createConversation`: a freshly created thread is not
  unread, matching F-023's behaviour.
- Contacts exclusion (FR-008) is the subtle one: `contactConversations()` was added in F-039 as "the
  distinct people I have chats with". Once groups exist, a group would leak into Contacts *and* into
  the group participant picker (a group as a group member). Filtering `kind !== 'group'` in the store
  fixes both call sites at once, which is why the filter lives there and not in the page.
- Clarification pass (2026-09-27) changed the model once: participants are stored as contact chat
  ids (`participantIds`) and resolved by `groupParticipants()` on read. Names were the first cut, but
  that froze a snapshot — renaming a contact would have left the old name inside every group. Storing
  ids also makes "a deleted contact drops out of the group" fall out of the same lookup.
- The contact-info screen (F-015) had no group story: tapping a group name landed on the
  single-contact screen with an empty phone row and Block/Report. `conversationKind()` lets that
  screen branch once, instead of every future caller re-deriving the kind.
- Group subtitle (FR-009): `contact()` already centralises the header subtitle, so one branch there
  covers the chat header, contact-info header and starred rows. Zero-participant groups read `Group`
  rather than `0 participants`, and the count is pluralised (`1 participant`).
- Screen placement: `features/new-group/` — a top-level creation flow like `new-chat-modal`, not a
  sub-surface of contacts.
- Chrome follows the repo: `StarredPage`/`ContactsPage` list rows, `EditContactPage`/`ProfilePage`
  field + save button, `NavigationBar` with a leading `Back`. `aria-pressed` on toggle rows matches
  the multi-select semantics better than `aria-checked` without a `listbox` role.
- Create is a disabled-until-valid button rather than a silent no-op, which makes the validation
  observable and keeps the a11y contract honest.
- No seeded render moves: the screen is reachable only from the two designed entries and the seeded
  chat list is unchanged.

## Canonical artifacts

The plan and the task list that used to live in this file now live in the canonical
Speckit artifacts for this feature:

- `plan.md` - approach, phases, review gates, drift policy
- `tasks.md` - the delivery checklist (this file keeps the research record only)