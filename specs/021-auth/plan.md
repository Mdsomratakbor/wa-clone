# Plan: WhatsApp Authorization (feature 021)

**Input**: `specs/021-auth/spec.md` + `specs/021-auth/research.md` (original: **Input**: `figma/design-map.md` row 21 (`0:11030`) + `specs/021-auth/research.md`)

**Gate**: Figma 429 clears (~2026-09-28) -> node payload capture (`0:11030`) -> owner approval -> test-first -> implementation. Structural implementation approved pre-capture (owner directive `2026-09-24`).

## Approach

1. **Screen**: `features/auth/auth-page` (title + phone region + 12-key keypad + Continue,
   all no-op) + units.
2. **Route**: `/auth` lazy (no entry wiring; default `**` → `/chats` unchanged).
3. **US3**: responsive + gated golden (measured + 0.05 at capture).
4. **Closure**: design-map row 21 -> `021` + implemented; commits (spec/feat/docs).

(e2e runs paused per owner directive); G3 closure commit.

## Phases

The approach above is executed in order; each numbered step is one commit-sized unit (docs -> feat -> test).

## Review gates

- **G1**: capture + owner approval (incl. entry/default-flow decision);
- **G2**: build/unit green (e2e runs paused per owner directive);
- **G3**: closure commit.

## Drift policy

`/auth` has no designed entry point, so none was invented and the default route (`**` -> `/chats`) is unchanged. Keypad labels, phone-region text and the `Continue` treatment are provisional until G1.

## Structure

Single project (repo root):

```text
specs/021-auth/
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