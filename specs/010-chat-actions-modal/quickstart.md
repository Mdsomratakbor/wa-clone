# Quickstart: WhatsApp Chat Actions Modal (feature 010)

## Status

**Proposed — blocked on Figma 429 until ~2026-09-28.** Run this once the node inventory is
recorded (research.md) and clarifications are approved (gate G1). The shared `action-sheet`
component this feature consumes already shipped in feature 009.

## Run it

```bash
npm run build              # compile
$env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'
npx ng test --watch=false --browsers ChromeHeadless   # unit
npx playwright test --reporter=line                   # e2e
ng serve                                                # dev: open http://localhost:4200/chat/chat-001, activate More options
```

## What's here (after implementation)

- **Header entry**: a trailing "More options" affordance on the Chat Window header emitting an
  `actions` event (glyph/label from the capture).
- **Chat Actions Modal** (`features/chat-window/chat-actions.*`): the `0:10087` rows feeding the
  shared `app-action-sheet` (from 009) — no shared-component changes.
- **Flow**: chat header More options -> sheet slides up; a row emits its id (target flows are
  later features); backdrop tap / design affordance closes and returns focus to the trigger.

## Entry point

`src/app/shared/components/chat-header/chat-header.html` — new trailing icon button emitting
`actions`; consumed by `chat-window-page.ts` to open the sheet.

## Not in scope

- Row destinations (mute / wallpaper / etc. screens).
- Settings Modal (row 11, `0:9778`) — reuses `action-sheet`, ships later.
- Any shared shell / nav-bar / tab-bar change.

## Golden

`tests/e2e/golden/0-10087-chat-actions.png` (native 1x Figma render) — coarse visual guard;
threshold measured from baseline + 0.05 (pattern from 007/008/009). Gated on capture.

## Assets (tests/e2e/golden) — deferred to Figma 429 retry (~09-28)

- `0-10087-chat-actions.png` — frame render (golden source)
- row glyph SVGs + the header entry glyph — icon vectors for the sheet + affordance