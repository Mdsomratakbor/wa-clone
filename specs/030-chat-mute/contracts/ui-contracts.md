# UI Contracts + Quickstart: Chat — mute / unmute (feature 030)

## Contracts

| Item | Contract |
| ---- | -------- |
| model | `ChatPreview.muted?: boolean` (additive; `normalizeChats` sets `false`) |
| store | `isMuted(chatId)`; `toggleMuted(chatId)` (persists); `reset()` clears; `contact(chatId).muted` |
| header | `ContactHeader.muted?: boolean`; muted ⇒ `data-testid="chat-header__muted-bell"`, `aria-label="Muted"` |
| sheet | `ChatActionsModal` `muted` input; `chat-mute` label = `Mute`/`Unmute`; still emits id |
| window | Mute/Unmute toggles store, sheet stays open, label + header update; Wallpaper/More no-op |

**Stability**: no seed conversation is muted ⇒ default renders identical to today (no golden
change on `0-8257` / `0-8855`). Only post-toggle surfaces change.

**E2E (agree with OLAS pause — authored, not executed yet)**:

```bash
npx playwright test tests/e2e/chat-mute.spec.ts --project=chromium-mobile   # when re-enabled
```