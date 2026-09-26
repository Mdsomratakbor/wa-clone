# Feature Specification: WhatsApp Star Flow (long-press → starred list)

**Feature Branch**: `025-starred-flow`

**Created**: 2026-09-26

**Status**: **In progress — implementing (spec-driven).**

**Input**: `specs/008-starred-messages` (non-goals → now completed) + `ChatStore` (F-022/23/24) +
`figma/design-map.md` row 8 (node `0:8820`, empty-state tip only — populated list is
map-external) + `specs/025-starred-flow/research.md`

---

## Summary

F-025 completes feature 008's deferred non-goals: a message in a chat window can be **starred**
by long-press (or right-click) and **unstarred** the same way; starred messages are tracked by
`ChatStore` (persisted), shown with a small accent star on their bubble, and rendered as a list
on the Starred Messages screen (tip stays for the empty state). Tapping a starred row opens its
chat.

## Functional Requirements

- **FR-001** `MessageBubble` exposes a `star` output (message id) fired on long-press
  (≥550ms hold) or right-click (`contextmenu` prevented); hold ends/cancels clear the timer.
- **FR-002** `ChatStore.toggleStarred(chatId, messageId)` flips `starred`
  (`"<chatId>:<messageId>"` keys); `isStarred(chatId, messageId)` queries; both reactive.
- **FR-003** Starred badges render on starred bubbles (`[starred]` input) — accent star glyph;
  nothing renders by default (no golden impact).
- **FR-004** `ChatStore.starredEntries()` derives `{ chatId, messageId, contactName, text,
  time }`; dangling refs (message gone) are dropped.
- **FR-005** Starred Messages screen: empty → existing **tip** unchanged; non-empty →
  **list rows** (avatar + contact/time + message line + star), row tap navigates to
  `/chat/<chatId>` (Back still → `/settings`).
- **FR-006** `starred` participates in persistence (snapshot v1 `starred`, hydrate, `reset()`
  clears).

## Non-Goals

- Star via the chat "More" sheets; multi-select; removing a starred message from the thread;
  grouping starred by chat; reordering.

## User Stories

- **US1 (star)**: I can hold (or right-click) a message; it gets a star; the bubble shows the
  badge; holding again removes it.
- **US2 (find)**: Starred Messages shows my starred messages; tapping one opens its chat.

## Acceptance Criteria (validation targets)

1. Unit `chat.store.spec.ts` (extend): toggle add/remove + `isStarred`; `starredEntries`
   derivation (+ dangling-drop); persisted across reload; `reset()` clears.
2. Unit `message-bubble.spec.ts` (extend): right-click emits id + prevents default; 550ms hold
   emits once, quick taps do not; badge on `starred` input.
3. Unit `chat-window-page.spec.ts` (extend): hold a bubble → store starred + badge appears;
   hold again → unstar.
4. Unit `starred-page.spec.ts` (extend): empty tip default; populated list rows + tap → chat;
   Back → `/settings` retained.
5. E2E `tests/e2e/starred-flow.spec.ts` (authored, runs paused): long-press → badge → remains
   after reload → visible in Starred list → row opens chat → right-click unstars; empty tip
   when none.
6. Build green + unit green (playwright paused).

## Explicit deviations (documented drift)

1. Populated list layout is map-external (Figma shows only the empty state).
2. Long-press (no visible selection UI) is the "tap and hold to star" tip promise — sufficient
   for the star loop; WhatsApp's richer context menu is deferred.
3. Star glyph placeholder pending Figma capture.

## Caveat (deliberately incomplete until G1)

Star badge + row glyph are inline-SVG approximations (capture rows `0:8820`, `0:8257`, `0:8260`).