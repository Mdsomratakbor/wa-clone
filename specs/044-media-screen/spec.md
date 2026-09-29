# Feature Specification: WhatsApp Media, Photos and Links (feature 044)

**Feature Branch**: `044-media-screen`

**Created**: 2026-09-28

**Status**: **Implemented** (build green, unit 469/469; G1 capture still BLOCKED — see Review Gates)

**Input**: design row 15 (`0:9486`, Contact Info) + gap audit tier B7

## Clarifications

### Session 2026-09-28

The owner answered two scope questions directly.

- Q: B7 (Media) and B8 (Groups) are both inert rows on the same screen — which does F-044 take?
  A (**owner**): **B7 only.** The `Groups` row stays inert. B8 needs group-membership data the store
  does not have: the seed's groups carry `participantIds`, but nothing declares *shared* groups
  between two contacts, which is the whole content of that screen. Inventing membership would mean
  inventing the social graph, and that is not this feature's call to make.
- Q: What should the media grid render, given there are no real image assets?  A (**owner**):
  **derive it from `Message.file` entries in the chat's own thread.** The grid is therefore real
  data that cannot contradict the chat window. Only `chat-006` (Martha Craig) has a seeded thread
  with file messages, so the other 8 contacts get a genuine empty state — which is honest, and
  matches how a fresh install behaves.
- Q (raised at implementation, see `tasks.md`): FR-007 asserted the media screen is reachable
  *only* from a direct contact's row list, but `ContactPage.isGroup()` is `kind === 'group'`, so a
  **broadcast** also renders the row list and can open the screen. Should the code enforce the
  invariant, or the requirement be narrowed?  A (**owner**): **narrow FR-007, no code change.**
  Two reasons, both recorded so the decision is not relitigated: `createBroadcast()` ships without
  a UI caller and without a seed (F-042), so no broadcast can exist in the running app and the
  invariant holds in-app without help; and making it real in code (`kind !== 'direct'`) would be a
  behaviour change to shipped F-015/F-042 contact info — hiding the row list and showing a recipient
  list for broadcasts — which is a different feature, not a correction to this one.

## Summary

Gap audit tier B7 is the `Media, photos and links` row on the Contact info screen, seeded but inert
since F-015. F-044 wires that row to a pushed `/contact/:id/media` screen listing the file messages
in that contact's thread.

The screen is a grid of media tiles, newest first, with an empty state for contacts whose thread has
no files. Media is derived from the thread, not from a new seed, so the screen and the chat window
can never disagree about what was shared.

Unlike B3 and B6, the **entry row is design-verified** (`0:9486`) and the sub-screen's own chrome
is not: the design file's 24 frames contain no media grid, so the grid geometry, the tile treatment
and the empty-state copy are PROVISIONAL under a blocked capture gate.

## Functional Requirements

- **FR-001** Activating the `Media, photos and links` row on `/contact/:id` navigates to
  `/contact/:id/media`.
- **FR-002** The screen lists every message in that chat's thread whose `file` is non-null, newest
  first, in a grid.
- **FR-003** Each tile shows the file's `filename` and `ext` as its accessible name, plus a visible
  file glyph in the same spirit as `message-bubble__file-card`. **No thumbnail imagery** — no image
  asset exists, and none is invented.
- **FR-004** A contact whose thread has no file messages shows an empty state in a `role="status"`
  live region, not an empty grid.
- **FR-005** Media is derived at read time from `ChatStore.conversationMessages(chatId)`, filtered on
  `file !== null` and reversed for newest-first. No new store method, no new model field, no new
  seed, and no snapshot change.
- **FR-006** A tile is keyboard reachable and activating it does **not** navigate: there is no
  media viewer in this design, so a tap is an observable no-op rather than a dead link. Opening the
  originating message is not in scope.
- **FR-007** `Back` returns to `/contact/:id`, preserving the contact. The row list is not rendered
  for a **group** contact, so in the running app the screen is entered from a direct contact (and
  would be entered from a broadcast, were one reachable). A group or broadcast has no thread, so
  reached directly it shows the empty state — see the 2026-09-28 clarification.
- **FR-008** The nav bar title is the contact's current name, so a rename in `ChatStore` is
  reflected immediately (the Contact info screen already reads live from the store).
- **FR-009** The screen is read-only: no view, no filter, no sort control, no sharing, no deletion.
- **FR-010** No horizontal overflow at 320px; the grid uses `minmax` tracks so tile count per row
  degrades rather than clipping.
- **FR-011** An unknown or malformed contact id shows the empty state rather than throwing, matching
  the store's existing `?? []` fallbacks.

## Non-Goals

- The `Groups` row (gap audit B8) — needs shared-group membership data the store lacks.
- A media viewer / full-screen photo view, video playback, and document preview.
- `Media, docs and links` **filter chips**. Real WhatsApp segments this screen, but the segmentation
  is a design detail with no source here; a control invented to satisfy a guess is worse than none.
- Tapping a tile to jump to its message in the chat window.
- Persisting a view preference (grid size, sort) — no such control exists.
- The `contact-media` row for **group** contacts, whose row list is replaced by a participant list.
  A broadcast's row list is not replaced — that is the deliberate gap the 2026-09-28 clarification
  leaves open, not an omission here.

## Review Gates

- **G1 (BLOCKED - Figma)**: the Figma REST API returned `429` (`Retry after 375849s`, quota reset
  **2026-10-02 18:38 UTC**) on 2026-09-28. The **entry row is design-verified** via `0:9486`; the
  media screen's own chrome — grid geometry, tile treatment, empty-state copy, and the absence of
  filter chips — is **PROVISIONAL**. Capture tasks stay open in `tasks.md`.
- **G2**: `npm run build` green and the full unit suite green with the exact count reported.
- **G3**: closure commit, drift notes in every superseded spec, checklist + converge clean.

## Figma Reference

- Design row 15, Contact Info (`0:9486`) — supplies the `Media, photos and links` row's label,
  position and chevron, already implemented by F-015.
- **No Figma node exists for a media grid screen.** No node ID is cited and none is invented.

## UNKNOWN / NEEDS CLARIFICATION

- Grid geometry: columns per row and tile aspect ratio. **Hypothesis** - 3 columns, square tiles,
  following the conventional mobile media grid. No source in the file.
- Empty-state copy. **Hypothesis** - "No media". Real WhatsApp's wording is unconfirmed.
- Whether tiles show `filename.ext` text beneath the glyph. **Hypothesis** - yes, so the grid is not
  a set of unlabelled squares; without text a screen full of identical glyphs tells the user nothing.
- Filter chips (Media / Docs / Links). **Hypothesis** - omitted entirely, per Non-Goals.

## Assumptions

- `chat-006` (Martha Craig) is the only contact with a thread, so it is the only populated case; the
  empty state is therefore the *default* shipped state, as with F-042.
- Reverse order is the right "newest first": the thread seed is chronological, as the chat window
  renders it.
- The `FileInfo.ext` is enough to label a tile without inventing a MIME map.

## Out of Scope Changes

- No edits to `chat.store.ts`, `chat-window.model.ts`, `chat-window.seed.ts`, `contact-info.seed.ts`
  or `call-list-item`.
- `contact-page.ts` gains one branch in `onRowActivate`; nothing else on the Contact screen moves.

## Validation Targets

### Unit

- `MediaPage`: the derived list is newest-first and excludes null-file messages; tiles render one per
  file with filename + ext; the title is the contact's live name; the empty state shows for a chat
  with no thread and for an unknown id; `Back` returns to `/contact/:id`; tiles are keyboard
  reachable and activating one does not navigate; the stored thread is not reordered; no overflow at
  320px. The derivation lives in the page (FR-005), so these are page tests, not store tests.
- `ContactPage`: the `contact-media` row navigates to `/contact/:id/media`; `contact-groups` is still
  inert.

### E2E (authored, not run)

- `tests/e2e/media.spec.ts` — row → media screen, grid for Martha Craig, empty state for another
  contact, Back returns to the contact.

## Definition of Done

- [x] Every FR is covered by at least one named unit test
- [x] Read-only derivation is specified; no store or seed change (FR-005, FR-009)
- [x] Empty state and unknown-id fallback are specified (FR-004, FR-011)
- [x] The tile tap is an observable no-op, not a dead control (FR-006)
- [x] FR-007 matches the shipped `isGroup()` behaviour; the broadcast gap is an owner decision,
      recorded in Clarifications, not a silent narrowing
- [x] The blocked G1 gate is recorded, not skipped, and the verified entry row is distinguished from
      the provisional sub-screen
- [x] Drift notes are planned for specs 015 and the gap audit
