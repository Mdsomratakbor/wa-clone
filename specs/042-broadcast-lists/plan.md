# Plan: WhatsApp Broadcast Lists (broadcast kind + list screen) (feature 042)

**Input**: `specs/042-broadcast-lists/spec.md` + `specs/042-broadcast-lists/research.md`

**Gate**: G1 **BLOCKED** - the Figma REST API returned `429` (reset 2026-10-02 18:38 UTC) on
2026-09-28. The `/broadcasts` chrome, nav title, empty-state copy and row treatment are
**PROVISIONAL**; the capture tasks stay open in `tasks.md`.

## Approach

1. `chat-list/chat.model.ts`: `ChatKind` gains `'broadcast'`; `ChatPreview` unchanged.
2. `core/chat.store.ts`: `createBroadcast(name, recipientIds)` (blank-name throw, `broadcast-<n>`,
   empty thread, `read: true`, persist, return id), `broadcastRecipients(chatId)`, `broadcasts()`;
   exclude `broadcast` from the Chats list and from `contactConversations()`. `normalizeChats()`
   and snapshot version `1` are untouched, so old snapshots hydrate unchanged.
3. `features/chat-list/broadcasts-page.{ts,html,scss,spec.ts}`: nav bar + `role="status"` empty
   state + `ChatListItem` rows from `broadcasts()`.
4. `app.routes.ts`: lazy `/broadcasts`; `chats-page.ts` routes the `broadcast-lists` nav action.
5. Unit tests for the store (create/throw/persist/resolve/unknown-ids/filtering/normalization) and
   the page (empty state, rows, row activation, Back, no tab bar); e2e spec authored; drift notes
   in 001/003/032; build + unit green.

## Phases

The approach above is executed in order; each numbered step is one commit-sized unit
(docs -> feat -> test).

## Review gates

- **G1**: capture (BLOCKED, 2026-09-28 `429`) - screen chrome, nav title, empty copy, row treatment;
- **G2**: build + unit green, e2e authored, no overflow;
- **G3**: close + drift notes, checklist + converge.

## Drift policy

- **001 Chat list** and **003 Chats edit**: the `Broadcast Lists` nav action stops being a no-op, and
  the Chats list now excludes broadcasts. Drift note in each.
- **032 Chats edit / store actions**: documents the Chats list as `!archived` only; the broadcast
  exclusion is added to that filter. Drift note added.
- **040 New Group**: the `kind` field widens from a two-value union to three; nothing about group
  behaviour changes. Drift note added.

## Structure

Single project (repo root):

```text
specs/042-broadcast-lists/
- spec.md          # requirements (canonical)
- research.md      # code survey + decisions
- plan.md          # this file
- tasks.md         # task list
- contracts/ui-contracts.md
src/app/features/chat-list/chat.model.ts          # ChatKind += 'broadcast'
src/app/core/chat.store.ts                        # createBroadcast/broadcastRecipients/broadcasts + filters
src/app/features/chat-list/broadcasts-page.{ts,html,scss,spec.ts}
src/app/features/chat-list/chats-page.ts          # nav wiring
src/app/app.routes.ts
tests/e2e/broadcasts.spec.ts
```
