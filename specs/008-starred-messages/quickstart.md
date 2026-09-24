# Quickstart: WhatsApp Starred Messages (feature 008)

## Run it

```bash
npm run build              # compile
$env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'
npx ng test --watch=false --browsers ChromeHeadless   # unit
npx playwright test --reporter=line                   # e2e
ng serve                                                # dev: open http://localhost:4200/starred-messages
```

## Routes

- `/starred-messages` — lazy `StarredPage`. Leading Back "Settings" -> `/settings`.
- `/settings` — minimal stub (nav bar "Settings" + placeholder body); Back returns to
  `/starred-messages`. Row 13 will replace this stub later.

## What's here

- **Starred Messages empty state**: flat `#EFEFF4` screen (no tab bar, no FAB). Navigation bar =
  Back (chevron + "Settings") + title "Starred Messages". Body = centred Tip: WhatsApp-logo avatar
  circle (132px, hairline stroke + soft shadow), "No Starred Messages" (16px semibold), and the
  two-line helper "Tap and hold on any message to star it, so you can easily find it later."
- **Interactions**: Back navigates to `/settings`. Tip is static copy (avatar decorative).

## Not in scope

- A populated list of starred messages / star & unstar interactions (no frame exists).
- The full Settings feature (row 13); only a minimal `/settings` stub is in scope.

## Golden

`tests/e2e/golden/0-8820-starred-messages.png` (375x812, Figma render) — coarse visual guard.
Chrome (status bar, home indicator, nav bar) matches the already-approved 004/005/006 surfaces, so
expect a modest threshold (width/height locked on capture).

## Assets (tests/e2e/golden) — deferred to Figma 429 retry (~09-28)

- `0-8820-starred-messages.png` — frame render 375x812 (golden source)
- `starred-messages-back-chevron.svg` — vector source for the Back chevron
- `starred-messages-avatar.png` — WhatsApp-logo avatar raster -> also copied to `public/`