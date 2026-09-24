# Quickstart: WhatsApp Settings Modal (feature 011)

## Status

**In progress (structural) — geometry/content blocked on the Figma 429 until ~2026-09-28.** The
shared `action-sheet` component this feature consumes already shipped in feature 009; 010 shipped
the sibling Chat Actions instance.

## Run it

```bash
npm run build              # compile
$env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'
npx ng test --watch=false --browsers ChromeHeadless   # unit
npx playwright test --reporter=line                   # e2e
ng serve                                                # dev: open http://localhost:4200/settings, activate the trigger
```

## What's here (after implementation)

- **Settings entry**: a trailing trigger affordance on the `/settings` stub page emitting a
  sheet-open event (glyph/label from the capture; provisional now).
- **Settings Modal** (`features/settings/settings-modal.*`): the `0:9778` rows feeding the shared
  `app-action-sheet` (from 009) — no shared-component changes.
- **Flow**: Settings trigger -> sheet slides up; a row emits its id (target flows + the real
  Settings screen are later features); backdrop tap / design affordance closes and returns focus to
  the trigger.

## Entry point

`src/app/features/starred-messages/settings-stub-page.ts` — owner-approved host until row 13
(real Settings screen, `0:9198`) replaces the stub.

## Not in scope

- Row destinations (Notifications / Storage / More screens).
- The real Settings screen + sub-pages (row 13, `0:9198`).
- Any shared shell / nav-bar / tab-bar change.

## Golden

`tests/e2e/golden/0-9778-settings-modal.png` (native 1x Figma render) — coarse visual guard;
threshold measured from baseline + 0.05 (pattern from 007/008/009/010). Gated on capture.

## Assets (tests/e2e/golden) — deferred to Figma 429 retry (~09-28)

- `0-9778-settings-modal.png` — frame render (golden source)
- row glyph SVGs + the Settings entry glyph — icon vectors for the sheet + affordance