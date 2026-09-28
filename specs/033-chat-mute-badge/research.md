# Design Research: WhatsApp Chats — muted badge on chat rows

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

## Canonical artifacts

The plan and the task list that used to live in this file now live in the canonical
Speckit artifacts for this feature:

- `plan.md` - approach, phases, review gates, drift policy
- `tasks.md` - the delivery checklist (this file keeps the research record only)