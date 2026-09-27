# Feature Specification: WhatsApp Chats — muted badge on chat rows

**Feature Branch**: `033-chat-mute-badge`

**Created**: 2026-09-26

**Status**: **In progress — implementing (spec-driven).**

**Input**: `ChatListItem` (shared row, specs 001/003) + `ChatStore.isMuted` (F-030) +
`specs/033-chat-mute-badge/research.md`

---

## Summary

F-030 mutes a conversation and shows a bell in the chat header, but the list row looks identical to
an unmuted one — the state is invisible exactly where users scan. F-033 renders the same
masked-bell affordance on the chat list row (left of the timestamp, as in the product), so a
muted chat is identifiable at a glance and stays identifiable after a reload.

## Functional Requirements

- **FR-001** A chat list row renders a masked-bell badge
  (`data-testid="chat-mute-badge-{chatId}"`, `aria-label="Muted"`, `role="img"`) **only** when
  `chat.muted` is true.
- **FR-002** Unmuted rows render no badge (default state is byte-identical to today).
- **FR-003** The badge is decorative w.r.t. layout: it must not change the row height, the avatar
  size, or the timestamp/preview geometry.
- **FR-004** The badge appears in edit mode too (selection circle unaffected) and in every sort
  order.
- **FR-005** Muting from the chat window's "..." sheet is reflected in the list immediately, and
  after a reload.
- **FR-006** Clearing/archiving/deleting a muted chat removes its badge along with the row.

## Non-Goals

- Unread/archived badges on rows (new glyphs without capture support).
- Long-press / swipe row gestures (no design affordance in the map; deliberately not invented).
- Mute in the edit-mode bar (F-032 scope; bar copy is captured).

## User Stories

- **US1**: I mute a chat, go back to the list and can see which chat is muted.
- **US2**: I reload the app and the muted badge is still there.

## Acceptance Criteria (validation targets)

1. Unit `chat-list-item.spec.ts` (extend): badge present when `muted: true`, absent otherwise, and
   unique per chat id.
2. Unit `chats-page.spec.ts` (extend): a muted conversation shows exactly one badge; unmuting
   removes it; a fresh page instance (reload) still shows it.
3. E2E `tests/e2e/chat-mute.spec.ts` (extend, runs paused): mute in `/chat/:id` → badge on the list
   row; persists across reload; unmute clears it.
4. Build green + full unit suite green (playwright paused).

## Explicit deviations (documented drift)

1. Spec 001's row anatomy gains an optional badge (drift noted in `specs/001`); it is off in the
   default state, so the golden `0-8855` is unaffected.

## Caveat (deliberately incomplete until G1)

Badge glyph, size and colour reuse the F-030 header bell; the map's chat row has no muted variant,
so exact metrics stay provisional until capture.