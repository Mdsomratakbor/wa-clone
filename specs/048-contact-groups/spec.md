# Feature Specification: WhatsApp Shared Groups (feature 048)

**Feature Branch**: `048-contact-groups`

**Created**: 2026-10-01

**Status**: **Implemented** (build green, unit 635/635; G1 capture still BLOCKED — see Review Gates)

**Input**: design row 15 (`0:9486`, Contact Info) + gap audit tier B8

## Clarifications

### Session 2026-10-01

The owner answered three scope questions directly.

- Q: `CHAT_SEED` contains nine direct chats and **zero** group conversations, so a derived
  shared-groups list is empty for every contact until a group is built at runtime. What is the
  shipped default — seed the membership, or derive only?
  A (**owner**): **derive only, no seed.** `participantIds` is already real membership data, so the
  derivation invents nothing; but declaring *who* is in *which* group would be inventing the social
  graph, which the F-044 clarification explicitly refused to do. The empty state is therefore the
  honest first-run default — exactly how a fresh install behaves — and it becomes populated the
  moment a group is created through the live F-040 New Group screen.
- Q: No Figma node exists for a shared-Groups screen, so its chrome has no design source. Build the
  screen, or hold the row disabled until the capture gate clears?
  A (**owner**): **build provisional chrome.** Follow the F-044 precedent: compose from existing
  tokens and existing shared components, and label the chrome PROVISIONAL rather than presenting it
  as design-verified. Holding the row disabled ships nothing and leaves a designed row inert.
- Q: What happens when a shared group row is activated?
  A (**owner**): **navigate to `/chat/<groupId>`.** The group chat already exists in the store, so
  this is real navigation to real data — unlike F-044's media tiles, which were an observable no-op
  only because no viewer exists in this design.

## Summary

Gap audit tier B8 is the `Groups` row on the Contact info screen, seeded but inert since F-015 and
explicitly deferred as a non-goal by F-044. F-048 wires that row to a pushed `/contact/:id/groups`
screen listing the groups that a given contact belongs to.

The list is derived at read time from `ChatStore`: a conversation is a shared group when its `kind`
is `group` **and** its `participantIds` contains the contact's conversation id. No model field, no
seed, no snapshot change, and no new persisted key — `participantIds` is populated by the live
F-040 New Group flow, so the screen reflects groups the user actually built.

As with B7, the **entry row is design-verified** (`0:9486`) and the sub-screen's own chrome is not:
the design file's 24 frames contain no shared-Groups screen, so the nav title, the row treatment and
the empty-state copy are PROVISIONAL under a blocked capture gate.

## Functional Requirements

- **FR-001** Activating the `Groups` row on `/contact/:id` navigates to `/contact/:id/groups`.
- **FR-002** `ChatStore.contactGroups(chatId)` returns every conversation whose `kind` is `group`
  **and** whose `participantIds` contains `chatId`, in the store's existing conversation order.
- **FR-003** A **broadcast** is never returned, even though `createBroadcast()` populates
  `participantIds` with recipient ids. The `kind === 'group'` test is load-bearing, not decorative.
- **FR-004** The accessor is a pure read-time derivation: no new model field, no seed change, no
  snapshot shape change, and nothing persisted. Nothing here belongs in the versioned snapshot.
- **FR-005** The screen renders each shared group through the existing shared `chat-list-item`
  component, **unchanged**. No shared component is edited for this feature. Hosting it implies
  honouring the font scale — `chat-list-item` does not read it itself, so the page applies
  `data-font-scale` as `chats-page` and `broadcasts-page` do (added at the analyze pass, see
  `tasks.md`).
- **FR-006** A contact in no group shows an empty state in a `role="status"` live region, not an
  empty list. This is the **default shipped state for all nine seeded contacts** (see Clarifications).
- **FR-007** Activating a row navigates to `/chat/<groupId>` — the real group conversation, which
  therefore renders its participant list rather than a contact row list.
- **FR-008** `Back` returns to `/contact/:id`, preserving the contact.
- **FR-009** Rows are keyboard reachable and their accessible name is the group's name. The nav
  title is the literal `Groups`, marked PROVISIONAL (see UNKNOWN).
- **FR-010** An unknown or malformed contact id yields an empty list rather than throwing, matching
  the store's existing `?? []` and `find`-then-default fallbacks.
- **FR-011** No horizontal overflow at 320px; the list reuses the chat list's responsive track.
- **FR-012** The screen is read-only: no create control, no add/remove member, no leave-group, and
  no settings overflow.

## Non-Goals

- **Seeding groups or group membership** — an owner decision, recorded above, not an omission.
- A **member-count subtitle** ("4 participants"). The store can compute it, but no shared component
  renders one, and adding a variant to `chat-list-item` for a provisional screen is a new component
  for a screen with no design source. Deferred to the capture gate.
- Creating a group from this screen, or jumping to New Group. F-040 owns creation.
- Editing membership, leaving a group, or mutating `participantIds` from the Groups screen.
- The `Groups` row for **group** or **broadcast** contacts, whose row list is replaced by a
  participant list. Unchanged by this feature — see the FR-007 note in `044-media-screen`.
- Any broadcast-recipient or other-contact list. `contactGroups` answers exactly one question.

## Review Gates

- **G1 (BLOCKED - Figma)**: the Figma REST API returned `429` (`Retry after 375849s`, quota reset
  **2026-10-02 18:38 UTC**) on 2026-09-28. The **entry row is design-verified** via `0:9486`; the
  shared-Groups screen's own chrome — nav title, row treatment, empty-state copy, and the absence of
  a member count — is **PROVISIONAL**. Capture tasks stay open in `tasks.md`.
- **G2**: `npm run build` green and the full unit suite green with the exact count reported.
- **G3**: closure commit, drift notes in every superseded spec, checklist + converge clean.

## Figma Reference

- Design row 15, Contact Info (`0:9486`) — supplies the `Groups` row's label, position and chevron,
  already implemented by F-015.
- **No Figma node exists for a shared-Groups screen.** No node ID is cited and none is invented.

## UNKNOWN / NEEDS CLARIFICATION

- Nav bar title. **Hypothesis** - the literal `Groups`. F-044 used the contact's live name because a
  media grid is unambiguously that contact's; a group list is a category, not a per-contact artefact.
  Unconfirmed.
- What a row shows. **Hypothesis** - `chat-list-item` unchanged, so name + timestamp with the
  preview gated by `showPreviews` (F-046 FR-006). Real WhatsApp shows a member count here instead.
  Unconfirmed, and the reason the member count is a non-goal rather than a build item.
- Ordering. **Hypothesis** - the store's existing conversation order. No sort control exists, and
  alphabetical/recency ordering would be invented.
- Empty-state copy. **Hypothesis** - "No groups". Real WhatsApp's wording is unconfirmed.

## Assumptions

- `participantIds` holds conversation ids of **direct** chats. Verified: F-040 passes selected
  contact ids from the contacts list into `createGroup()`, and `resolveContactNames()` resolves those
  ids back to names via the conversations array.
- The live F-040 New Group screen is the mechanism that makes this screen non-empty, so no seed is
  needed for the feature to be genuinely useful.
- `contactGroups()` belongs in the store rather than the page: it crosses the whole conversations
  array, unlike F-044's single-thread derivation, and is therefore worth testing directly.

## Out of Scope Changes

- **No edits to shared components.** `chat-list-item` and `navigation-bar` are consumed as-is.
- `chat.store.ts` gains exactly one pure accessor (plus its spec tests). No field, no seed, no
  persistence change — consistent with the F-047 port migration already landed.
- `contact-page.ts` gains one branch in `onRowActivate`, and the existing comment asserting that
  `contact-groups` stays inert is **replaced** because it becomes false. Nothing else on the Contact
  screen moves.
- `contact-info.seed.ts` is unchanged — the row already exists.

## Validation Targets

### Unit

- `ChatStore.contactGroups`: returns a group that contains the contact; excludes a group that does
  not; **excludes a broadcast containing the contact** (FR-003, the case that would otherwise pass
  silently); excludes direct conversations; returns `[]` for an unknown id; does not mutate the
  conversations array or persist anything; returns the store's conversation order.
- `GroupsPage`: lists one row per shared group; the empty state renders in a `role="status"` region
  for a contact in no group; the title is `Groups`; `Back` returns to `/contact/:id`; activating a
  row navigates to `/chat/<groupId>`; an unknown id shows the empty state rather than throwing.
- `ContactPage`: the `contact-groups` row navigates to `/contact/:id/groups`.

### E2E (authored, not run)

- `tests/e2e/contact-groups.spec.ts` — contact → `Groups` → empty state; and, after creating a group
  that includes the contact, the group appears and opens its chat; `Back` returns to the contact.

## Definition of Done

- [x] Every FR is covered by at least one named unit test (FR → test map in `tasks.md`)
- [x] Broadcasts are explicitly excluded and tested (FR-003)
- [x] The accessor is read-only: no field, no seed, no persistence change (FR-004)
- [x] The empty-for-everyone default is specified as intentional, not as a defect (FR-006)
- [x] Row activation navigates to a real group chat, not a dead control (FR-007)
- [x] No shared component is modified (FR-005)
- [x] The blocked G1 gate is recorded, not skipped, and the verified entry row is distinguished from
      the provisional sub-screen
- [x] Drift notes are added to specs 015, 044, 046, the gap audit, and `figma/design-map.md` row 15
- [x] Playwright spec authored; execution deferred per the owner directive (2026-09-26)
- [x] `npm run build` green; full unit suite green at **635/635**
- [x] `/speckit.analyze` clean — the one divergence (font scale) is recorded in `tasks.md` and
      annotated in FR-005 rather than applied silently