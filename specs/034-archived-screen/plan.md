# Plan: WhatsApp Archived chats screen (feature 034)

**Input**: `specs/034-archived-screen/spec.md` + `specs/034-archived-screen/research.md` (original: **Input**: `ChatStore.archivedIds` (F-032) + `ChatListItem` + `NavigationBar` +)

**Gate**: G1 needs no capture - the Archived row and screen reuse existing 001 / 003 chrome; no new Figma data.

## Approach

1. Store: `unarchiveConversations(ids)`.
2. `ArchivedPage` (ts/html/scss) + `/archived` route; nav back → `/chats`; tap → unarchive +
   `/chat/:id`.
3. `ChatsPage`: pinned row gated on `!editing() && !searchActive() && archivedCount() > 0`.
4. Unit coverage (store, archived page, chats page); e2e authored (paused).
5. Drift notes (`specs/001`, `003`, `032`); build + unit validation; commits (spec → feat → test).

## Phases

The approach above is executed in order; each numbered step is one commit-sized unit (docs -> feat -> test).

## Review gates

- **G1**: default render unchanged;
- **G2**: build/unit green + e2e authored;
- **G3**: close + drift notes.

## Drift policy

Adds a pinned `Archived` row to 001 and an unarchive action, recorded as drift notes in 001, 003 and 032. The row is hidden unless something is archived, so the default render is unchanged.

## Structure

Single project (repo root):

```text
specs/034-archived-screen/
- spec.md          # requirements (canonical)
- research.md      # Phase 0 research + assumptions
- plan.md          # this file (Phase 1)
- tasks.md         # Phase 2 task list
- contracts/ui-contracts.md
src/app/core/        # stores (ChatStore, PrefsStore, CallStore)
src/app/features/    # one folder per screen
src/app/shared/components/  # nav bar, list item, action sheet, toggles
tests/e2e/           # playwright specs (authored; runs paused)
```