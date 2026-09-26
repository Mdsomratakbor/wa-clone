# Feature Specification: WhatsApp Messaging Loop

**Feature Branch**: `022-messaging-loop`

**Created**: 2026-09-26

**Status**: **In progress — implementing (spec-driven).**

**Input**: `figma/design-map.md` (reusable chrome rows 002, 007, 017) + `specs/022-messaging-loop/research.md`

---

## Summary

F-022 makes the composer functional: typing reveals a Send affordance, Enter/Send appends an
outgoing message to the thread, the conversation preview + timestamp update, and the chat's
read state flips. It introduces **`ChatStore`** (`src/app/core/chat.store.ts`) — the shared
signal-based app store that becomes the foundation for every remaining behavior slice (persist,
star, settings toggles, new-chat, ...). Client-side only, in-memory, session-scoped (no
localStorage yet: persistence is a later slice).

## Functional Requirements

- **FR-001** `Composer` holds a draft signal; sets it from the text input.
- **FR-002** When the draft is non-empty the mic control is replaced by a Send button
  (`aria-label "Send message"`); empty → mic (`"Record audio"`).
- **FR-003** Send (button or Enter) emits the trimmed text, clears the draft, and focuses... the
  input stays focused/value cleared.
- **FR-004** `ChatStore.sendMessage(chatId, text)` appends an `outgoing` `Message`
  (`id` `msg-*`, `time` HH:MM now, `file: null`) to that chat's thread and updates the matching
  conversation `preview`/`timestamp`/`read`.
- **FR-005** Blank/whitespace drafts are dropped (no empty bubbles).
- **FR-006** Opening a conversation marks it read; **Read All** (edit action bar, feature 003)
  marks every conversation read → read ticks render.
- **FR-007** The thread auto-scrolls to the latest message when it changes.
- **FR-008** `ChatsPage` conversations are store-driven (no local `input` seed).
- **FR-009** No horizontal overflow after send on any breakpoint.

## Non-Goals

- Persistence across reloads; incoming/real messages; media send; per-id contact mapping
  (header stays `CHAT_CONTACT`); message editing/deleting.
- Explicit deviation: F-003 "Read All is a no-op" is **upgraded to functional**
  (mark-all-read) — documented in `specs/003-chats-edit` drift notes and this set.

## User Stories

- **US1 (compose)**: On a chat window I type text; the mic becomes Send; pressing Enter or Send
  clears the box and appends my message.
- **US2 (thread)**: My sent message appears as the last outgoing bubble with `HH:MM` time.
- **US3 (list reflects)**: Back in Chats, the conversation shows my text as the preview with the
  send time and a read tick; entering a chat or Read All marks everything read.

## Acceptance Criteria (validation targets)

1. Unit `chat.store.spec.ts` (new): send appends + updates conversation; blank dropped;
   mark-all-read; open-conversation marks read; reset isolates tests.
2. Unit `composer.spec.ts` (extend): mic↔send swap, Enter click, draft cleared, no-op on blank.
3. Unit `chat-window-page.spec.ts` (extend): send appends bubble via button + Enter, input
   cleared.
4. Unit `chat-list-item.spec.ts` (extend): read tick rendered only when `read` is true.
5. Unit `chats-page.spec.ts` (update): store-driven empty state; Read All marks all read.
6. E2E `tests/e2e/messaging.spec.ts` (authored, runs paused per owner directive): compose→send;
   Enter; preview+read tick after back; Read All ticks.
7. Build green + unit green (playwright paused).

## Explicit deviations (documented drift)

1. F-003 `Read All` no-op → functional mark-all-read (behavior, not layout).
2. Header contact is static (`CHAT_CONTACT`) for every id — per-id contact mapping deferred.
3. Store is in-memory/reset-per-test; persistence deferred to the persistence slice.
4. Preview shows raw sent text (no "You:" prefix) pending Figma glyph evidence at capture.

## Caveat (deliberately incomplete until G1)

Read-tick glyph is an inline SVG approximation; exact glyph deferred to Figma capture
(`0:8855`/`0:8257` rows).