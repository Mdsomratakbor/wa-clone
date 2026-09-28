# Plan: WhatsApp Chats — muted badge on chat rows (feature 033)

**Input**: `specs/033-chat-mute-badge/spec.md` + `specs/033-chat-mute-badge/research.md` (original: **Input**: `ChatListItem` (shared row, specs 001/003) + `ChatStore.isMuted` (F-030) +)

**Gate**: G1 needs no capture for behaviour; the bell glyph placement is provisional until capture.

## Approach

1. `ChatListItem` template: conditional bell in the head line; scoped SCSS (`flex: none`, colour
   token reuse, no fixed row height changes).
2. Unit coverage (item + page, incl. reload instance); e2e extended (paused).
3. Drift note (`specs/001`); build + unit validation; commits (spec → feat → test).

## Phases

The approach above is executed in order; each numbered step is one commit-sized unit (docs -> feat -> test).

## Review gates

- **G1**: default render unchanged;
- **G2**: build/unit green + e2e authored;
- **G3**: close + drift note.

## Drift policy

Adds a conditional bell to the shared 001 / 003 row (drift note in 001) with no default-render change, so seeded goldens are unaffected.

## Structure

Single project (repo root):

```text
specs/033-chat-mute-badge/
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