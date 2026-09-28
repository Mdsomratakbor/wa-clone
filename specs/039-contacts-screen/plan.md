# Plan: WhatsApp Contacts screen (Settings → Contacts) (feature 039)

**Input**: `specs/039-contacts-screen/spec.md` + `specs/039-contacts-screen/research.md` (original: **Input**: design row 13 (`Contacts` row) + gap audit tier B1 + `ContactPage` (015) +)

**Gate**: G1 needs no capture for behaviour; the `/contacts` chrome is provisional until the 13 Settings row is captured.

## Approach

1. `ChatStore.contactConversations()` + store spec.
2. `features/contacts/contacts-page.{ts,html,scss}` + spec.
3. `/contacts` lazy route; `SettingsPage` `contacts` row → `/contacts`.
4. E2E authored (paused); 013 drift note; build + unit green; commits (spec → feat → test).

## Phases

The approach above is executed in order; each numbered step is one commit-sized unit (docs -> feat -> test).

## Review gates

- **G1**: store + screen + row wiring;
- **G2**: build/unit green + e2e authored;
- **G3**: close + drift note.

## Drift policy

The 013 `Contacts` row stops being a no-op (drift note in 013). "Contacts" is defined as the distinct people you already have a chat with, which is narrower than a real address book - declared, not invented.

## Structure

Single project (repo root):

```text
specs/039-contacts-screen/
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