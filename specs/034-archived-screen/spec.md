# Feature Specification: WhatsApp Archived chats screen

**Feature Branch**: `034-archived-screen`

**Created**: 2026-09-26

**Status**: **In progress — implementing (spec-driven).**

**Input**: `ChatStore.archivedIds` (F-032) + `ChatListItem` + `NavigationBar` +
`specs/034-archived-screen/research.md`

---

## Summary

F-032 can archive a chat, but there is nowhere to see or undo it — spec 003 kept the archived view
out of scope and that gap has now bitten. F-034 closes the loop with a real **Archived** screen at
`/archived`, entered from a pinned **Archived** row at the top of the chats list (exactly where
the product puts it, and conditional, so the default render is unchanged). Tapping an archived
chat unarchives it and opens the thread.

## Functional Requirements

- **FR-001** `ChatStore.unarchiveConversations(ids)` clears the flag on exactly those
  conversations and persists; `reset()` unaffected.
- **FR-002** Route `/archived` renders a list screen: `NavigationBar` titled `Archived` with a
  back action to `/chats`, and one `ChatListItem` per archived conversation (muted badges, ticks
  and previews included, since the shared row is reused).
- **FR-003** Tapping an archived row unarchives that conversation and navigates to `/chat/:id`
  (restore-on-open, as in the product).
- **FR-004** The screen shows a `No archived chats` empty state when the store has no archived
  conversations.
- **FR-005** The chats list renders a pinned **Archived** row (`data-testid="archived-row"`,
  `aria-label="Archived"`) **only** when at least one conversation is archived; tapping it
  navigates to `/archived`.
- **FR-006** The pinned row is hidden in edit mode and while a search is active (search results
  are chats only), and it disappears once the last archived chat is restored or deleted.
- **FR-007** Archived state is unchanged by the new screen beyond explicit restore, and both
  directions survive a reload.

## Non-Goals

- Bulk unarchive / "Unarchive all" bar; swipe gestures; archive entry in the nav overflow
  (the overflow copy is captured and the pinned row is the product's own pattern instead).
- Archived-thread read/preview updates; count badges on the pinned row.

## User Stories

- **US1**: I archive two chats; a pinned **Archived** row appears and lists exactly those two.
- **US2**: I tap an archived chat; it reappears in the chats list and its thread opens.
- **US3**: After restoring everything, the pinned row is gone again.

## Acceptance Criteria (validation targets)

1. Unit `chat.store.spec.ts` (extend): unarchive clears exactly the given ids, persists, empty
   selection is a no-op.
2. Unit `archived-page.spec.ts` (new): rows render from `archivedIds`, back action navigates,
   tap unarchives + navigates to the chat, empty state renders.
3. Unit `chats-page.spec.ts` (extend): pinned row only with archived chats, navigates, hidden in
   edit mode / during search, gone after restore.
4. E2E `tests/e2e/archived.spec.ts` (authored, runs paused): archive → row appears → open
   `/archived` → restore → row gone; persistence across reload.
5. Build green + full unit suite green (playwright paused).

## Explicit deviations (documented drift)

1. Specs 003/032's "archived view out of scope" is superseded — the view now exists (drift notes
   in `specs/003` and `specs/032`).
2. The pinned row and the screen's visual treatment are provisional (no map support yet).

## Caveat (deliberately incomplete until G1)

Pinned-row metrics and the archived screen styling stay provisional until capture; behavior,
persistence and route are complete.