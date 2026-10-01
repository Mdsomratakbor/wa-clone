# Feature Specification: WhatsApp Persistence (client-side session store)

**Feature Branch**: `024-persistence`

**Created**: 2026-09-26

**Status**: **In progress — implementing (spec-driven).**

**Input**: `specs/022-messaging-loop` + `specs/023-new-chat` (ChatStore non-goals) +
`specs/024-persistence/research.md`

---

## Summary

F-024 makes `ChatStore` durable: conversations, threads, the new-chat id counter and the
message id sequence are snapshotted to `localStorage` on every mutation and hydrated on app
boot. Sent messages, created conversations and read state survive a page reload. Versioned
payload (`v1`) with safe fallback when storage is empty, corrupt, unavailable or
version-mismatched.

## Functional Requirements

- **FR-001** Every mutation (`sendMessage`, `markAllRead`, `openConversation`,
  `createConversation`, `setConversations`, `reset`) writes a snapshot under key
  `wa.chat-store.v1`.
- **FR-002** Snapshot shape `{ version: 1, conversations, threads, messageSequence,
  newChatCounter }`.
- **FR-003** On store construction, hydrate from storage when the payload is present and
  version `1`; any read/parse error, absence or version mismatch → seeded defaults.
- **FR-004** Storage access is failure-tolerant (unavailable/blocked storage never throws).
- **FR-005** `reset()` removes the key and clears counters (tests + fresh state), so the next
  created conversation is again `chat-new-1`.
- **FR-006** No network/backend; persistence is same-origin `localStorage` only.

## Non-Goals

- Backend/cloud sync; migrations beyond version checks (future versions migrate or re-seed);
  per-message delivery state; cross-tab sync; offline queueing.

## User Stories

- **US1 (reload)**: I send a message and tap reload — the thread and my bubble are still there.
- **US2 (new chat)**: I start a conversation with a new contact and reload — the chat window and
  its entry in Chats persist.
- **US3 (read)**: I mark chats read and reload — the ticks stay.

## Acceptance Criteria (validation targets)

1. Unit `chat.store.spec.ts` (extend): mutations persist; a freshly-created store hydrates
   conversations/threads/counters; id counter continues (`chat-new-2`); corrupt/absent/foreign
   version fall back to seed; `reset()` clears storage + counters.
2. E2E `tests/e2e/persistence.spec.ts` (authored, runs paused per owner directive): sent
   message survives `page.reload()`; created conversation survives reload (URL + header + list
   row); Read All survives reload.
3. Build green + unit green (playwright paused).

## Explicit deviations (documented drift)

1. Persistence is plain `localStorage` (no sync, no quota handling beyond try/catch).
2. Version mismatches re-seed rather than migrate (accepted for a client-only prototype).

## Caveat (deliberately incomplete until G1)

Storage writes are synchronous snapshot-replace; no write batching — acceptable for prototype
data size.

## F-047 drift note (2026-10-01)

F-047 replaced the duplicated storage helpers this spec's implementation grew, without changing what
this spec requires. What moved, not what is required:

- Each store here hand-rolled its own `readStorage`/`writeStorage`/`clearStorage` over
  `window.localStorage` — three near-identical copies of the same try/catch. They now live in one
  place: `PersistencePort` (the abstraction) and `LocalStorageAdapter` (the only production code in
  `src/app/core` that touches `window.localStorage`). The duplication this spec implicitly
  documented is what F-047's `research.md` §2 inventoried.
- The try/catch bodies were moved **verbatim**, so "no quota handling beyond try/catch" above is
  still exactly true. No requirement changed.
- Snapshot shape, versioning, and normalization stayed in each store. A version mismatch still
  re-seeds rather than migrates (deviation 2 above), unchanged.
- The one thing this spec could not have anticipated: a synchronous port is **not** directly
  implementable over HTTP — see `specs/047-persistence-port/spec.md` Clarification 1. Not a change
  to this spec; recorded here so a future reader who looks for a network adapter knows the seam is
  synchronous by decision, not by oversight.