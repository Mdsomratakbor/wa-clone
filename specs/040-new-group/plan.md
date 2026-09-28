# Plan: WhatsApp New Group (group kind + creation screen) (feature 040)

**Input**: `specs/040-new-group/spec.md` + `specs/040-new-group/research.md` (original: **Input**: design rows 1/3 (`New Group` nav) + 9 (`New group` add-modal entry) + gap audit tier B2 +)

**Gate**: G1 needs no capture for behaviour, but the `/new-group` screen has no design row at all, so its chrome stays provisional until the design map is re-read.

## Approach

1. `chat.model.ts`: `ChatKind`, `kind`, `participantIds`; `normalizeChats` fills the defaults.
2. `chat.store.ts`: `createGroup`, group filter in `contactConversations()`, `groupParticipants()`,
   `conversationKind()`, group subtitle in `contact()`; the contact screen branches on the kind.
3. `features/new-group/new-group-page.{ts,html,scss}` + spec.
4. Route `/new-group`; chats-page nav + add-modal wiring.
5. E2E authored (paused); drift notes 001/003/009; build + unit green; commits (spec → feat → test).

## Phases

The approach above is executed in order; each numbered step is one commit-sized unit (docs -> feat -> test).

## Review gates

- **G1**: model + screen + entries;
- **G2**: build/unit green + e2e authored;
- **G3**: close + drift notes.

## Drift policy

001 / 003 `New Group` and 009 `New group` stop being no-ops (drift notes in all three). Field order, the selection affordance and the Create/Cancel treatment are provisional; `New community` and `Broadcast Lists` stay inert.

## Structure

Single project (repo root):

```text
specs/040-new-group/
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