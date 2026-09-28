# Feature Specification: WhatsApp Broadcast Lists (broadcast kind + list screen)

**Feature Branch**: `042-broadcast-lists`

**Created**: 2026-09-28

**Status**: **Implemented** (build green, unit 440/440, e2e authored not run). G1 capture **BLOCKED**
— screen chrome remains PROVISIONAL, tasks T011–T013 open.

**Input**: design row 1/3 (`Broadcast Lists` nav action) + gap audit tier B3 +
`specs/042-broadcast-lists/research.md`

## Clarifications

### Session 2026-09-28

The owner was asked three scope questions and the prompt was dismissed with "continue", so the
agent-proposed defaults below were adopted. They are recorded here because they are reversible
decisions, not derived facts - each one is marked with the basis it rests on. **Reverse any of them
and the spec changes with it.**

**Owner ratification (2026-09-28, post-implementation)**: the three answers below were put back to
the owner explicitly as "agent defaults" once the feature was built, and all three were confirmed
unchanged — *keep the nav action live with no create form*, *keep broadcasts out of Chats and
unseeded*, *keep the nav title / empty copy / row treatment provisional*. The implementation shipped
as recorded; no code change resulted from the ratification.

- Q: How much of Broadcast Lists should F-042 cover?  A (**agent default, owner-ratified**): **list + entry only** -
  model, `/broadcasts` screen, nav wiring. Creating a broadcast is deferred, because the create
  form's chrome cannot be specified without a capture and a half-built form is worse than none.
  Basis: conservative under a blocked capture gate.
- Q: Should a broadcast appear in the main Chats list?  A (**agent default, owner-ratified**):
  **no** - broadcasts are excluded from Chats and live only in `/broadcasts`, matching real
  WhatsApp, where a broadcast is not a peer conversation.
- Q: Should the broadcast list ship with seeded data?  A (**agent default, owner-ratified**):
  **no seed** - the screen ships the real WhatsApp empty state, so nothing is invented without a
  design source.
- Q: Should the provisional chrome wait for the capture?  A (**owner, 2026-09-28**): **yes** -
  leave the nav title `Broadcast lists`, the `No broadcasts` copy and the row treatment
  PROVISIONAL until the quota resets on 2026-10-02, rather than guessing the pushed screen's title
  to match the nav action label.

### Session 2 - 2026-09-28 (discovery during implementation)

The FR-001 v1-snapshot test failed and exposed a real defect rather than a wrong expectation:
`hydrate()` did `conversations.set(snapshot.conversations)` with no normalization, so a snapshot
written before F-040 loaded with `kind === undefined`. Every read site compensates with
`(chat.kind ?? 'direct')`, which is why it was invisible — but the load path and the seed path
disagreed about the shape of a stored chat.

- Q: How is a legacy snapshot normalized?  A (**agent decision, no owner prompt**): fill
  `kind`/`participantIds` only, via a new private `hydrateDefaults()` helper, and leave the
  persisted `read`/`muted`/`archived` flags exactly as stored. `normalizeChats()` is **not** reused
  there: it forces those three flags `false`, which is right for a fresh seed and would silently
  wipe user state on every reload (unread chats reappearing, archives and mutes vanishing).
  Basis: FR-001 says snapshots "hydrate unchanged", and unreading every chat is not unchanged.
  This is a defect fix inside FR-001's stated scope, not a contract change; the snapshot version
  stays `1` and no migration is added. Flagged here rather than edited silently, per the drift rule.

## Summary

Row 1/3 of the design puts a `Broadcast Lists` action in the Chats nav, and it has been a dead
control since F-001: `onNavAction` falls through with a "later feature" comment. Gap audit tier B3
calls for a broadcast list screen, and as with F-040 the design file contains **no** broadcast
screen, so the model comes first and the chrome is provisional.

A broadcast is a one-way conversation: a named list of recipients, no replies. That maps onto the
`kind` field F-040 introduced rather than a parallel concept - `ChatKind` gains `'broadcast'` and
the existing `participantIds` field carries the recipient list, the same way it carries group
participants. `ChatStore.createBroadcast(name, recipientIds)` mirrors `createGroup` (trimmed-name
guard, collision-free id, empty thread, `read: true`, persist, return id).

## Functional Requirements

- **FR-001** `ChatKind` becomes `'direct' | 'group' | 'broadcast'`; `ChatPreview.kind` stays
  optional, `normalizeChats()` still defaults to `'direct'`, and existing persisted snapshots
  (version `1`) hydrate unchanged — filling `kind`/`participantIds` defaults only, never
  re-forcing the persisted `read`/`muted`/`archived` flags (see Clarifications, session 2).
- **FR-002** `ChatStore.createBroadcast(name, recipientIds)` creates a conversation with
  `kind: 'broadcast'`, the trimmed name, the given recipient chat ids, an empty thread,
  `read: true`, and an id that cannot collide with direct chats or groups (`broadcast-<n>`,
  continuing the same counter); it persists and returns the new id.
- **FR-002a** `createBroadcast` throws when the trimmed name is empty, so the invariant holds for
  every caller and not only a future screen (same rule as F-040 FR-002a).
- **FR-002b** `ChatStore.broadcastRecipients(chatId)` resolves the stored recipient ids to current
  contact names on every read, skipping ids whose contact no longer exists, so renames propagate
  and deleted contacts drop out (mirrors F-040 FR-002b).
- **FR-003** Broadcast conversations are excluded from the Chats list, which already filters
  `archived`; the exclusion is by `kind`, not by a new field.
- **FR-004** `ChatStore.broadcasts()` returns the broadcast conversations in insertion order (the
  same order the Chats list uses), with no archived filter - archiving is a Chats-list concern.
- **FR-005** `/broadcasts` is a lazy route rendering `BroadcastsPage`: nav title `Broadcast lists`,
  leading `Back` to `/chats`, no trailing action, no tab bar.
- **FR-006** The screen shows a `role="status"` empty state (`No broadcasts`) when
  `broadcasts()` is empty, and otherwise one row per broadcast using the existing
  `ChatListItem` so a row looks exactly like a Chats row.
- **FR-007** Activating a broadcast row opens `/chat/:id` through the existing chat window,
  unchanged, and marks the conversation read.
- **FR-008** The Chats nav action `Broadcast Lists` navigates to `/broadcasts`.
- **FR-009** `conversationKind()` returns `'broadcast'` for a broadcast, and the chat header renders
  the broadcast name like a group name; the chat window needs no branch of its own.
- **FR-010** A broadcast is **not** selectable in a group/contact participant picker:
  `contactConversations()` continues to exclude `group` and additionally excludes `broadcast`.
- **FR-011** No horizontal overflow at any breakpoint for the empty state or a list of rows, and
  the empty state's text is readable at 320px.
- **FR-012** The feature adds no seeded broadcasts, so `broadcasts()` is empty until a broadcast
  exists; the empty state is therefore the default shipped state, and it is a testable one.

## Non-Goals

- Creating, editing, deleting or muting a broadcast list, and the recipients screen. The
  `createBroadcast` store method exists (FR-002) but has **no UI caller** in this feature - that is
  deliberate, so the model is ready for the create feature without shipping a form whose chrome
  cannot be specified.
- The broadcast action sheet (real WhatsApp offers Message / Delete / Mark all as read).
- Wallpaper (B4, blocked), call screen (B6), and the remaining tier-B/C work.
- Any change to how a group or a direct chat behaves.
- Pinning, verified badges, or per-recipient read state.

## Review Gates

- **G1 (BLOCKED - Figma)**: the Figma REST API returned `429` (`Retry after 375849s`, quota reset
  **2026-10-02 18:38 UTC**) on 2026-09-28, so the `/broadcasts` chrome, the nav title, the empty
  state copy, and the row treatment are **PROVISIONAL**. Capture tasks stay open in `tasks.md`.
- **G2**: `npm run build` green and the full unit suite green with the exact count reported.
- **G3**: closure commit, drift notes in every superseded spec, checklist + converge clean.

## Figma Reference

- Design rows 1/3, Chats nav action `Broadcast Lists` (the entry point is design-verified; the
  screen it opens is not in the design file).
- **No Figma node exists for a broadcast screen.** No node ID is cited for it and none is invented.

## UNKNOWN / NEEDS CLARIFICATION

- Nav title: `Broadcast lists` (sentence case) vs `Broadcast Lists` (matching the nav action's
  label). **Hypothesis** - the nav action label is captured, the pushed screen's title is not.
- Empty-state copy: `No broadcasts`. **Hypothesis** - no design source.
- Whether a broadcast row shows a recipient count (`12 participants`) or the plain last-message
  preview. **Hypothesis**; F-042 ships the plain preview because `ChatListItem` already renders it.
- Whether the nav gains a `New broadcast` action once creation lands. Deferred with the create
  feature.
- Whether a broadcast can be archived or deleted, and from which screen. Deferred.

## User Stories

- As a user, I tap `Broadcast Lists` in Chats and get a list of my broadcasts; each row looks and
  opens like a normal conversation, and a broadcast I have created never clutters my main Chats
  list (FR-003..FR-009).

## Acceptance Criteria

- AC-01 Tapping `Broadcast Lists` opens `/broadcasts`; the other nav actions are unaffected.
- AC-02 The screen renders `Broadcast lists` with a `Back` leading action and no tab bar.
- AC-03 With no broadcasts the screen shows the `No broadcasts` status text.
- AC-04 A broadcast row renders with `ChatListItem` and opens `/chat/:id`; the conversation is
  marked read.
- AC-05 A broadcast is absent from the Chats list while direct and group chats remain.
- AC-06 `createBroadcast` creates, persists and returns a `broadcast-<n>` id; a blank name throws.
- AC-07 `broadcastRecipients()` resolves current names and drops unknown ids.
- AC-08 A v1 snapshot written before F-042 hydrates with every chat as `direct`/`group` and no
  broadcast.
- AC-09 `contactConversations()` excludes broadcasts.
- AC-10 No horizontal overflow at any breakpoint.
- AC-11 Build green; full unit suite green with the exact count reported.
- AC-12 Playwright spec updated (authored, **not executed** - paused by owner directive 2026-09-26).

## Quality Checklist

- [x] FRs are numbered, unambiguous and each maps to ≥1 task in `tasks.md`
- [x] Every FR is implementable and testable without inventing a design value
- [x] The Figma reference cites only API-returned node IDs; the missing screen cites none
- [x] Unknowns are marked UNKNOWN / PROVISIONAL rather than guessed
- [x] Persistence, versioning and re-load behaviour are specified (FR-001, FR-002, FR-002a)
- [x] Accessibility: `role="status"` empty state, semantic list, keyboard-reachable rows
- [x] The store method ships without a UI caller on purpose, and the spec says so (Non-Goals)
- [x] The blocked G1 gate is recorded, not skipped
