# Plan: WhatsApp Calls — persisted call log and live row activation (feature 038)

**Input**: `specs/038-call-log/spec.md` + `specs/038-call-log/research.md` (original: **Input**: `CallsPage` (spec 004/005) + `specs/design-gap-audit.md` ("Also worth fixing") +)

**Gate**: G1 needs no capture - 004 / 005 rows already exist; this feature backs them with a store.

## Approach

1. `core/call.store.ts` (new) + spec: `calls`, `removeCall`, `clearCalls`, persistence, `hasChat`-
   free (chat lookup stays in `ChatStore`).
2. `ChatStore`: add `chatIdForContactName(name)` (returns `string | null`).
3. `calls-page.ts`: read the store, drop the input/effect, `clear` → `clearCalls()`, remove →
   `removeCall()`, row activation → chat navigation.
4. Unit: new store spec + updated page spec. E2E updated (paused).
5. 004 drift note; build + unit green; commits (spec → feat → test).

## Phases

The approach above is executed in order; each numbered step is one commit-sized unit (docs -> feat -> test).

## Review gates

- **G1**: store + page;
- **G2**: build/unit green + e2e authored;
- **G3**: close + drift note.

## Drift policy

Adds a `CallStore` and makes 004 call rows activate (drift note in 004). `New call` and call info stay inert (audit tier B6); row activation matches a chat by contact name only.

## Structure

Single project (repo root):

```text
specs/038-call-log/
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