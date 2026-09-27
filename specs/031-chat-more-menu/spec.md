# Feature Specification: WhatsApp Chat — More menu (clear messages / delete chat)

**Feature Branch**: `031-chat-more-menu`

**Created**: 2026-09-26

**Status**: **In progress — implementing (spec-driven).**

**Input**: `ChatWindowPage` + `ChatActionsModal` (F-010 sheet, rows Mute / Wallpaper / More) +
`ChatStore` + `specs/031-chat-more-menu/research.md`

---

## Summary

F-031 makes the chat "..." **More** row live: it opens a second sheet offering **Clear messages**
and **Delete chat**. Both act on `ChatStore` and persist; deleting the open chat returns to
`/chats`. Wallpaper stays a no-op.

## Functional Requirements

- **FR-001** `ChatStore.clearMessages(chatId)` empties the thread, clears the preview and marks the
  conversation read; persisted (F-024 snapshot).
- **FR-002** `ChatStore.deleteConversation(chatId)` removes the conversation row, its thread and
  its starred keys; persisted; `reset()` restores seeds.
- **FR-003** Activating **More** in the chat actions sheet closes that sheet and opens a submenu
  with exactly two rows: `Clear messages`, `Delete chat` (data-driven, shared `ActionSheet`).
- **FR-004** **Clear messages** empties the open thread (composer stays usable) and closes the
  submenu, returning focus to the More options trigger.
- **FR-005** **Delete chat** removes the conversation, closes the submenu and navigates to
  `/chats`; the row is gone from the list and stays gone after reload.
- **FR-006** Mute (F-030) keeps working; Wallpaper remains a no-op; only one sheet is in the DOM
  at a time (submenu replaces the parent sheet).
- **FR-007** Muted state and starred entries of other conversations are untouched by either action.

## Non-Goals

- Undo snackbar after delete; confirmation dialog; Select messages / Report / Block; Wallpaper
  picker; empty-thread illustration (new surfaces, capture-gated).

## User Stories

- **US1 (clear)**: In a chat I open "..." → More → Clear messages; the thread empties and survives
  a reload.
- **US2 (delete)**: More → Delete chat; I land back on the chats list without that chat, also
  after a reload.

## Acceptance Criteria (validation targets)

1. Unit `chat.store.spec.ts` (extend): clearMessages empties thread + preview, persists; delete
   removes row/thread/starred keys, persists; reset restores.
2. Unit `chat-window-page.spec.ts` (extend): More opens the submenu (parent sheet closed); Clear
   empties the thread + closes; Delete navigates to `/chats` and drops the conversation;
   Wallpaper stays a no-op; other rows unchanged.
3. E2E `tests/e2e/chat-more.spec.ts` (authored, runs paused): clear + reload; delete + reload.
4. Build green + full unit suite green (playwright paused).

## Explicit deviations (documented drift)

1. F-010's "row targets are later features" is superseded for More (see `specs/010` drift note).
2. Submenu replaces the parent sheet instead of stacking (single sheet in DOM; documented).

## Caveat (deliberately incomplete until G1)

The submenu is a data-driven reuse of the existing `ActionSheet` (no new CSS); only its row set
is provisional until capture confirms WhatsApp's More-menu contents.