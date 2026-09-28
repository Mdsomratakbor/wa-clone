# Plan: WhatsApp Chats — edit-mode Archive / Delete backed by the store (feature 032)

**Input**: `specs/032-chats-edit-store-actions/spec.md` + `specs/032-chats-edit-store-actions/research.md` (original: **Input**: `ChatsPage` edit mode (spec 003) + `ChatStore` (F-022–F-031) +)

**Gate**: G1 needs no capture - 003 edit mode already defines Archive / Delete / Read All.

## Approach

1. Model + store: `archived?`, `normalizeChats` seeds `false`, `archiveConversations`,
   `deleteConversations` (delegates to the single-id cleanup).
2. `ChatsPage`: drop `removeSelected`'s local mutation; filter archived in the `items` effect.
3. Unit coverage (store + page, including a fresh-instance persistence check); e2e updated
   (paused).
4. Drift note (`specs/003`); build + unit validation; commits (spec → feat → test).

## Phases

The approach above is executed in order; each numbered step is one commit-sized unit (docs -> feat -> test).

## Review gates

- **G1**: model/store shape;
- **G2**: build/unit green + e2e authored;
- **G3**: close + drift note.

## Drift policy

003 `Archive` and `Delete` are no longer local list mutations; they are store-backed and persisted (drift note in 003). `Read All` remains a declared no-op.

## Structure

Single project (repo root):

```text
specs/032-chats-edit-store-actions/
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