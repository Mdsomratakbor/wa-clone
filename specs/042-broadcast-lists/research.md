# Research: WhatsApp Broadcast Lists (broadcast kind + list screen)

**Feature**: `042-broadcast-lists`  •  **Design rows**: 1/3 (`Broadcast Lists` nav action)

**Source**: gap audit tier B3 - the Chats nav action `Broadcast Lists` renders but
`onNavAction()` falls through with an "F-001/003: later feature" comment.

## What the code already gives us

`Broadcast Lists` is a real `NavAction` in `chats-page.ts:106` (`leadingActions`, alongside
`New Group`), rendered by the shared `navigation-bar` and asserted in
`navigation-bar.spec.ts:44` (`['Broadcast Lists', 'New Group', 'Edit']`). So the entry point is
already designed, already visible, and already has a regression test protecting its label.

F-040 (`040-new-group`) laid down exactly the model this feature needs:

- `ChatPreview.kind?: 'direct' | 'group'` with `normalizeChats()` defaulting to `direct`;
- `ChatPreview.participantIds?: readonly string[]` - for a group these are the participants;
- `ChatStore.createGroup(name, participantIds)` with a trimmed-name guard, `group-<n>` ids, an
  empty thread, `read: true`, persist, and the shared `newChatCounter`;
- `ChatStore.groupParticipants(chatId)` resolving ids to current contact names on read;
- `ChatStore.conversationKind(chatId)`.

A broadcast is the same shape with different semantics: a named list of recipients, one-way
messages. Reusing `kind` + `participantIds` avoids a parallel concept and a second
participant-resolution helper.

## Decisions and their basis

| Decision | Basis | Confidence |
| -------- | ----- | ---------- |
| `kind: 'broadcast'`, not a `isBroadcast` flag | one enum, one filter, `conversationKind()` already returns it | follows F-040 |
| Reuse `participantIds` for recipients | identical storage need; no second field | follows F-040 |
| `broadcast-<n>` on the shared counter | collision-free vs direct ids and `group-<n>` | follows F-040 |
| Excluded from the Chats list | real WhatsApp: a broadcast is not a peer conversation | agent default (owner dismissed the question) |
| Not in `contactConversations()` | a broadcast is not a contact | follows F-040 FR-008 |
| Shipped empty, no seed | an invented broadcast name/copy would have no design source | agent default |
| `createBroadcast` with no UI caller | model-first so the create feature is additive; a form now would be unspecifiable chrome | agent default |
| Plain last-message preview on rows, no recipient count | `ChatListItem` already renders it; fewer invented values | hypothesis |

## Store change shape

```ts
createBroadcast(name: string, recipientIds: readonly string[] = []): string
broadcastRecipients(chatId: string): string[]
broadcasts(): readonly ChatPreview[]
```

`broadcasts()` is deliberately **not** archived-filtered: `archived` is a Chats-list concept
(F-032) and broadcasts are not in that list, so the field is never set for them. Filtering it would
be an invariant nothing can satisfy.

## Risk

- The Chats list filter is `!chat.archived`; adding a second exclusion is easy to get subtly wrong
  and would hide a direct chat. The store test must assert direct **and** group chats still render.
- `contactConversations()` currently excludes `group` and de-dupes by `contactName`; adding
  `broadcast` to the exclusion is the same one-line change, but the de-dupe map in
  `broadcastRecipients()` must not accidentally reuse it.
- The `/broadcasts` screen has no design node, so nothing about its chrome is verifiable until the
  quota resets on **2026-10-02 18:38 UTC**.
