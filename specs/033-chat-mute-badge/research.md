# Design Research + Plan + Tasks + Quickstart: muted badge on chat rows (feature 033)

**Source**: the mute feature (F-030) is only visible inside the chat window. The list is the
primary surface, so the state needs a list-side reflection.

## Research summary

- `ChatListItem` is the shared row used by `/chats` (and, in future, an Archived view). Adding the
  badge there covers every list surface with one change and keeps `ChatListItem` dumb: it renders
  `chat.muted` and emits nothing new.
- The row head is a name/timestamp flex line; a 14px icon placed before the timestamp matches the
  product (bell to the left of the time) and needs no layout re-flow: the head already reserves
  space via `time` at the end, and the badge is `flex: none` with a 4px gap.
- `aria-hidden` is wrong here — the bell is real information. `role="img"` + `aria-label="Muted"`
  mirrors the F-030 header bell, so the two affordances announce identically.
- Default state: no seeded conversation is muted (`normalizeChats` seeds `muted: false`), so the
  golden chats render (`0-8855`) and the edit-mode golden are untouched.
- Rejected alternatives: unread/archived glyphs (no map support), long-press menu (no affordance
  in the design), badge inside `ChatListItem` title text (would break the captured name/timestamp
  metrics and the row's `aria-label`).

## Plan

1. `ChatListItem` template: conditional bell in the head line; scoped SCSS (`flex: none`, colour
   token reuse, no fixed row height changes).
2. Unit coverage (item + page, incl. reload instance); e2e extended (paused).
3. Drift note (`specs/001`); build + unit validation; commits (spec → feat → test).

**Gates**: G1 default render unchanged; G2 build/unit green + e2e authored; G3 close + drift note.

## Tasks

- [x] T001 — Spec set `specs/033-chat-mute-badge/` (this set)
- [x] T002 — Row badge (template + SCSS)
- [x] T003 — Unit tests + e2e extension
- [x] T004 — 001 drift note; build + unit green
- [x] T005 — Commits

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per owner directive
```