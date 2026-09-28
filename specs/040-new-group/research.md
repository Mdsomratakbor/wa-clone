# Design Research + Plan + Tasks + Quickstart: new group (feature 040)

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

## Plan

1. `chat.model.ts`: `ChatKind`, `kind`, `participants`; `normalizeChats` fills the defaults.
2. `chat.store.ts`: `createGroup`, group filter in `contactConversations()`, group subtitle in
   `contact()`.
3. `features/new-group/new-group-page.{ts,html,scss}` + spec.
4. Route `/new-group`; chats-page nav + add-modal wiring.
5. E2E authored (paused); drift notes 001/003/009; build + unit green; commits (spec → feat → test).

**Gates**: G1 model + screen + entries; G2 build/unit green + e2e authored; G3 close + drift notes.

## Tasks

- [x] T001 — Spec set `specs/040-new-group/`
- [x] T002 — Model + `createGroup` + contacts filter + group subtitle
- [x] T003 — `NewGroupPage` (name, multi-select, create)
- [x] T004 — Route + Chats nav / add-modal wiring
- [x] T005 — Unit tests + authored e2e
- [x] T006 — Drift notes 001/003/009; build + unit green
- [x] T007 — Commits
- [x] T008 — `/speckit.clarify` pass (5 questions) + code alignment: blank-name throw, pluralised
  subtitle, group-aware contact screen, `participantIds` resolved live, `groupParticipants()`
  specced (FR-002b), `conversationKind()` (FR-012) — unit 390/390

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per owner directive
```