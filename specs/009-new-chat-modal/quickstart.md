# Quickstart: WhatsApp New Chat (Add) Modal (feature 009)

## Status

**Proposed — blocked on Figma 429 until ~2026-09-28.** Run this once the node inventory is
recorded (research.md) and clarifications are approved (gate G1).

## Run it

```bash
npm run build              # compile
$env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'
npx ng test --watch=false --browsers ChromeHeadless   # unit
npx playwright test --reporter=line                   # e2e
ng serve                                                # dev: open http://localhost:4200/chats, press the + FAB
```

## What's here (after implementation)

- **Shared `action-sheet`** (`shared/components/action-sheet`): dimmed backdrop + bottom sheet,
  data-driven `Action` rows — the single source for rows 9, 10, 11.
- **Add Modal** (`features/new-chat-modal/add-modal.*`): the 009 rows, opened from the Chats FAB.
- **Flow**: Chats FAB -> sheet slides up; a row emits its id (target flows are later features);
  backdrop tap / design affordance closes and returns focus to the trigger.

## Entry point

`chats-page.ts:105` `onFabPressed()` — currently a no-op TODO awaiting F-001; becomes the modal
trigger.

## Not in scope

- Row destinations (new group / contacts / community screens).
- Chat Actions Modal (row 10) and Settings Modal (row 11) — reuse `action-sheet`, ship later.

## Golden

`tests/e2e/golden/0-9072-add-modal.png` (native 1x Figma render) — coarse visual guard; threshold
measured from baseline + 0.05 (pattern from 007/008). Gated on capture.

## Assets (tests/e2e/golden) — deferred to Figma 429 retry (~09-28)

- `0-9072-add-modal.png` — frame render (golden source)
- row glyph SVGs — icon vectors for the action rows