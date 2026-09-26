# UI Contracts + Quickstart: Settings — persisted toggles (feature 027)

## Contracts

| Item | Contract |
| ---- | -------- |
| store | `PrefsStore` root, `wa.prefs.v1`, snapshot `{ version: 1, prefs }`, `DEFAULT_PREFS` (all true) |
| api | `prefs()` signal; `toggle(key)`; `set(key, value)`; `reset()` (clears storage + defaults) |
| keys | `enterKeySends`, `mediaVisibility`, `sound`, `vibrate`, `popup`, `light`, `showPreviews` |
| toggle | `app-toggle` — `checked` input, `label` input, `checkedChange` output; `role="switch"` + `aria-checked` |
| chats settings | `chats-enter-sends` → `enterKeySends`; `chats-media-visibility` → `mediaVisibility` (switch rows); other 3 chevron rows |
| notifications | all 5 rows switch rows → `sound`/`vibrate`/`popup`/`light`/`showPreviews` |
| composer | Enter sends only when `enterKeySends` is true; inert otherwise |

**Stability**: toggle rows replace chevrons on the two settings surfaces only (no goldens);
defaults keep the shipped Enter behavior; chat-list golden (`0-8855`) untouched (Show previews
unwired).

**E2E (agree with OLAS pause — authored, not executed yet)**:

```bash
npx playwright test tests/e2e/settings-toggles.spec.ts --project=chromium-mobile   # when re-enabled
```