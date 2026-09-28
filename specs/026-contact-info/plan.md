# Plan: WhatsApp Contact Info — live wiring (feature 026)

**Input**: `specs/026-contact-info/spec.md` + `specs/026-contact-info/research.md` (original: **Input**: `specs/015-contact-info` (row 15, node `0:10334`) + `specs/019-edit-contact`)

**Gate**: G1 needs no capture - row 15 (`0:10334`) already defines the Contact Info surface being wired.

## Approach

1. `ChatPreview.phone?` + `ChatStore` `updateContact` / `contactName` / `contactPhone`.
2. `ContactPage`: store name; Messages → open+route; Starred row → route.
3. `EditContactPage`: store-prefilled drafts; Save → `updateContact` + back.
4. Unit updates; e2e authored (paused); build + unit validation.
5. Drift notes (015, 019); commits (spec → feat → test).

paused); G3 close + drift notes.

## Phases

The approach above is executed in order; each numbered step is one commit-sized unit (docs -> feat -> test).

## Review gates

- **G1**: no-op (no new Figma data needed);
- **G2**: build/unit green + e2e authored (runs paused);
- **G3**: close + drift notes.

## Drift policy

Supersedes the 015 / 019 "rows are no-ops" treatment with drift notes in both; `Media, photos and links` and `Groups` remain inert by declaration.

## Structure

Single project (repo root):

```text
specs/026-contact-info/
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