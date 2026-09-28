# Plan: WhatsApp Chat — mute / unmute (feature 030)

**Input**: `specs/030-chat-mute/spec.md` + `specs/030-chat-mute/research.md` (original: **Input**: `ChatWindowPage` + `ChatActionsModal` (F-010 sheet, `CHAT_ACTIONS` = Mute / Wallpaper /)

**Gate**: G1 needs no capture for behaviour; the muted-bell chrome in the header is provisional until capture.

## Approach

1. `ChatStore`: `muted?` on the model + `isMuted`/`toggleMuted` + `contact()` includes `muted`.
2. `ChatHeader` muted bell; `ChatActionsModal` derives Mute/Unmute label from a `muted` input.
3. `ChatWindowPage`: `[muted]` binding + `onChatAction('chat-mute')` toggles (sheet stays open).
4. Unit coverage (store/header/modal/window); e2e authored (paused).
5. Drift note (`specs/010`); build + unit validation; commits (spec → feat → test).

close + drift note.

## Phases

The approach above is executed in order; each numbered step is one commit-sized unit (docs -> feat -> test).

## Review gates

- **G1**: bell chrome provisional (no new capture);
- **G2**: build/unit green + e2e authored;
- **G3**: close + drift note.

## Drift policy

The 010 `Mute` action becomes live (drift note in 010). `Wallpaper` stays a no-op by declaration; the sheet stays open after muting.

## Structure

Single project (repo root):

```text
specs/030-chat-mute/
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