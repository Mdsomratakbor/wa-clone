# Feature Specification: WhatsApp New Chat Creation

**Feature Branch**: `023-new-chat`

**Created**: 2026-09-26

**Status**: **In progress — implementing (spec-driven).**

**Input**: `figma/design-map.md` row 9 (New Chat FAB sheet, node `0:8855`) + `specs/022-messaging-loop`
(`ChatStore`) + `specs/023-new-chat/research.md`

---

## Summary

F-023 makes the FAB "New Chat" sheet's **New contact** row functional: it creates a fresh
conversation through `ChatStore` and deep-links into its empty thread where the composer
already works (F-022). The new conversation appears in the Chats list, updates preview/read on
send, and its header derives the contact from the store. **New group** and **New community**
remain no-ops (later features).

## Functional Requirements

- **FR-001** `ChatStore.createConversation(name?)` appends `{ id: 'chat-new-<n>',
  contactName: name | 'New contact', preview: '', timestamp: now, avatarRef: null, read: true }`
  and seeds an empty thread for it (id counter increments; `reset()` clears it).
- **FR-002** `ChatStore.contact(chatId)` resolves a `ContactHeader` (`name`, subtitle
  `tap here for contact info`) from the conversation, or `null` for unknown ids.
- **FR-003** `ChatWindowPage` header contact is store-derived (`store.contact(chatId) ??
  CHAT_CONTACT`); unknown ids still fall back to the static contact.
- **FR-004** Selecting **New contact** in the FAB sheet dismisses the sheet, creates the
  conversation and navigates to `/chat/<new-id>`; the thread renders empty (wallpaper only)
  and the composer is functional (send → bubble + list preview/read).
- **FR-005** **New group** / **New community** remain no-ops: sheet stays open, no navigation
  (F-009 targets are later features).
- **FR-006** Repeated creations yield unique ids (`chat-new-1`, `chat-new-2`, …).

## Non-Goals

- Contact name entry UI / contact picker; groups/communities; persistence; contact header
  subtitle per-contact (stays the standard hint); unread count state.

## User Stories

- **US1 (start)**: From Chats I open the `+` FAB and choose **New contact**; I land on an empty
  chat with that name in the header.
- **US2 (compose)**: I send a message; the bubble appends and, back in Chats, the new
  conversation shows my preview + read tick.

## Acceptance Criteria (validation targets)

1. Unit `chat.store.spec.ts` (extend): createConversation adds conversation + empty thread,
   returns unique ids, custom name, send/contact lookup works, `reset()` clears counter.
2. Unit `chats-page.spec.ts` (extend): New contact → sheet closes + navigates to
   `/chat/chat-new-1`; New group keeps the sheet open and does not navigate.
3. Unit `chat-window-page.spec.ts` (extend): created conversation renders its name in the
   header with an empty thread.
4. E2E `tests/e2e/new-chat.spec.ts` (authored, runs paused per owner directive): FAB → New
   contact → empty chat → send → back shows preview + read tick; second creation → `chat-new-2`.
5. Build green + unit green (playwright paused).

## Explicit deviations (documented drift)

1. The new conversation is created immediately on choosing **New contact** with the
   placeholder name/avatar — a name-entry UI is deferred (Non-Goals).
2. New chat rows insert at the END of the list (no timestamp/recency sort — sorting is the
   chat-list ordering slice).

## Caveat (deliberately incomplete until G1)

Placeholder glyph/name; avatar placeholder uses the existing initial-based `UserAvatar`.