# Design Research + Plan + Tasks + Quickstart: Archived screen (feature 034)

**Source**: F-032 shipped archiving as a flag with no destination — an incomplete loop. This slice
finishes it, reusing only components and store state that already exist.

## Research summary

- **Entry point.** Options were (a) a row in the chats nav overflow, (b) a link from the edit bar,
  (c) a pinned row above the list. (a) mutates captured copy (Broadcast Lists / New Group) and
  needs a re-capture we cannot do yet; (b) mixes a destination into selection actions; (c) is the
  product's own pattern, self-discovering, and **conditional** — with no archived chats the
  chats render is byte-identical, so goldens are untouched.
- **List surface.** Reusing `ChatListItem` gives archived rows the exact same geometry as the
  chats list (avatar, name, preview, timestamp, read ticks, F-033 mute badge) for free, and keeps
  a future archived-threads view consistent.
- **Restore semantics.** Real WhatsApp unarchives when the chat is opened. Restoring on open means
  the user never lands on a chat that then has to be re-found, and the count naturally drains to
  zero. Bulk unarchive is unnecessary for the same reason.
- **Gating.** The pinned row hides during search (search results are chats, not containers) and in
  edit mode (selection acts on chats). Both reuse signals that already exist on the page.
- **Empty state.** The screen keeps a `No archived chats` status line mirroring the chats list's
  `No chats` placeholder rather than inventing artwork.

## Plan

1. Store: `unarchiveConversations(ids)`.
2. `ArchivedPage` (ts/html/scss) + `/archived` route; nav back → `/chats`; tap → unarchive +
   `/chat/:id`.
3. `ChatsPage`: pinned row gated on `!editing() && !searchActive() && archivedCount() > 0`.
4. Unit coverage (store, archived page, chats page); e2e authored (paused).
5. Drift notes (`specs/001`, `003`, `032`); build + unit validation; commits (spec → feat → test).

**Gates**: G1 default render unchanged; G2 build/unit green + e2e authored; G3 close + drift notes.

## Tasks

- [x] T001 — Spec set `specs/034-archived-screen/` (this set)
- [x] T002 — Store unarchive
- [x] T003 — ArchivedPage + route
- [x] T004 — ChatsPage pinned row
- [x] T005 — Unit tests + authored e2e
- [x] T006 — Drift notes; build + unit green
- [x] T007 — Commits

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per owner directive
```