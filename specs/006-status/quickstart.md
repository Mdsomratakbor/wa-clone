# Quickstart: WhatsApp Status — Feed (feature 006)

## Run it

```bash
npm run build              # compile
$env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'
npx ng test --watch=false --browsers ChromeHeadless   # unit, 79+ tests
npx playwright test --reporter=line                   # e2e, 144+ tests
ng serve                                                # dev: open http://localhost:4200/status
```

## Route

`/status` — lazy `StatusPage` under `src/app/features/status/`.

## What's here

- **Chrome**: shared status bar / home indicator (`app-shell`) + `NavigationBar`
  (`title="Status"`, leading `Privacy`, no trailing) + `TabBar` (Status active, shared 001 order).
- **Feed**: a single **My Status** row (58px initials avatar + `+` badge, `My Status`,
  `Add to my status`, camera + pencil circles) above the tip
  `No recent updates to show right now.`
- **Interactions**: `Privacy` / camera / note / row = no-ops (per clarifications). `Chats` /
  `Calls` tabs navigate; `Camera` / `Settings` show the "coming soon" stub. The `Status` tab on
  `/chats` and `/calls` now routes to `/status`.

## Not in scope

- Composing statuses (camera/note behavior, Figma `0:9634`).
- Friend/recent statuses, progress rings.
- Privacy settings.

## Golden

`tests/e2e/golden/0-8498-status.png` (375x812, Figma render) — coarse visual guard, threshold
measured at validation (expect the ~0.10-0.12 band of 004/005 due to photo->initials + overlay drift).