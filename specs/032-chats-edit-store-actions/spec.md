# Feature Specification: WhatsApp Chats — edit-mode Archive / Delete backed by the store

**Feature Branch**: `032-chats-edit-store-actions`

**Created**: 2026-09-26

**Status**: **In progress — implementing (spec-driven).**

**Input**: `ChatsPage` edit mode (spec 003) + `ChatStore` (F-022–F-031) +
`specs/032-chats-edit-store-actions/research.md`

---

## Summary

Spec 003 shipped Archive/Delete as **in-memory list mutations only**: rows vanished but nothing
was stored, so a reload brought every chat back — and Archive silently *deleted* rather than
archived. F-032 makes both actions store-backed and persisted: **Delete** removes the conversations
for good, **Archive** flags them (kept in the store, hidden from the list) so the model stays
honest while the archived view remains out of scope.

## Functional Requirements

- **FR-001** `ChatPreview.archived?: boolean`; `ChatStore.normalizeChats` seeds `archived: false`.
- **FR-002** `ChatStore.archiveConversations(ids)` sets `archived: true` on exactly those
  conversations and persists; the rows leave the chats list; `reset()` restores them.
- **FR-003** `ChatStore.deleteConversations(ids)` removes the rows, their threads and their
  starred keys; persists; `reset()` restores the seeds.
- **FR-004** Chats list hides archived conversations (list, search and unread sort all), and an
  archived chat is not reachable by name search.
- **FR-005** Edit-mode **Archive** / **Delete** call the store (no local list mutation); the
  selection clears and edit mode stays active either way.
- **FR-006** `Read All` is unchanged (`markAllRead`, F-022).
- **FR-007** Both actions survive a reload: archived/deleted chats do not come back.
- **FR-008** Deleting every conversation still shows the existing "No chats" placeholder state.

## Non-Goals

- ~~An **Archived** screen / navigation entry~~ — **resolved by F-034** (`/archived` route + a
  pinned Archived row; tapping a chat there restores it).
- Undo after delete/archive; swipe-to-archive; long-press context menu.

## User Stories

- **US1 (delete)**: In edit mode I select two chats and press Delete; they are gone after a reload.
- **US2 (archive)**: I press Archive; the rows leave the list and stay gone after a reload, while
  the rest of the list and selection behave normally.

## Acceptance Criteria (validation targets)

1. Unit `chat.store.spec.ts` (extend): archive/delete (single + bulk), persistence across reload,
   starred cleanup, reset restores.
2. Unit `chats-page.spec.ts` (update): Archive hides exactly the selection and survives a new page
   instance; Delete likewise; archived chats never match search; `Read All` unchanged.
3. E2E `tests/e2e/chats-edit.spec.ts` (update, runs paused): Archive + Delete persistence across
   reload; archived chat absent from search.
4. Build green + full unit suite green (playwright paused).

## Explicit deviations (documented drift)

1. Spec 003's "in-memory list" semantics (and its "focusable no-op Read All" note) are superseded
   by the F-024 persistence principle — drift noted in `specs/003`.
2. Archive no longer deletes: the conversation is retained in the store with `archived: true`.

## Caveat (deliberately incomplete until G1)

Archive has no destination screen yet; the flag is the honest placeholder until an Archived view
is capturable.