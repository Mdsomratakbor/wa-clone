# Quickstart: WhatsApp Status — Compose (feature 007)

## Run it

```bash
npm run build              # compile
$env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'
npx ng test --watch=false --browsers ChromeHeadless   # unit, 90+ tests
npx playwright test --reporter=line                   # e2e, 171+ tests
ng serve                                                # dev: open http://localhost:4200/status/compose
```

## Route

`/status/compose` — lazy `ComposePage` under `src/app/features/status/`.

Reached from the feed by tapping the camera or note circle on the My Status row (`/status`).

## What's here

- **Empty-state compose screen**: full-bleed flat `#FF8A8C` surface (no tab bar, no nav title, no
  FAB). Top row = white `Close` X (left) + two white send glyphs (right). Centred
  `Type a status` placeholder (38px) + caret. Bottom = the **Keyboard Alphabetic** graphic,
  reproduced exactly as `status-compose-keyboard.png` (375x291) served from `public/`.
- **Interactions**: `Close` -> back to `/status`; the two send glyphs, placeholder and keyboard are
  no-ops (publishing is a later feature). The feed's camera/note circles now enter compose; the
  `Privacy` action and My Status row stay no-ops.
- **Runtime asset**: `public/status-compose-keyboard.png` (copy of the golden crop) referenced
  `/status-compose-keyboard.png`.

## Not in scope

- Entering status text / publishing (the screen is the empty state).
- Camera/photo compose, friend/recent statuses with progress rings.
- Privacy settings.

## Golden

`tests/e2e/golden/0-9634-status-compose.png` (375x812, Figma render) — coarse visual guard. The
keyboard band matches by construction (exact image crop); top-half drift (status-bar variant D1,
38px font metrics, glyph rendering) is absorbed by the measured threshold (expect a lower ratio
than 004/005).

## Assets (tests/e2e/golden)

- `0-9634-status-compose.png` — frame render 375x812 (golden source)
- `status-compose-top-actions.svg` — vector source for the three white glyphs
- `status-compose-keyboard.png` — keyboard band crop (375x291) -> also copied to `public/`