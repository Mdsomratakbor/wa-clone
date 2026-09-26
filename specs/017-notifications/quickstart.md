# Quickstart: Feature 017 Notifications

## Smoke

```bash
npm run build
npx ng test --watch=false --reporters=progress
```

## E2E (reuses the running `ng serve` on port 4200 — keep it alive, don't restart)

```bash
npm run start          # once per session; playwright reuses it
npm run test:e2e:fast  # dev loop — mobile project only (~1/3 of matrix, ~1 min)
npx playwright test tests/e2e/notifications.spec.ts tests/e2e/settings.spec.ts tests/e2e/responsive.spec.ts --project=chromium-mobile
npm run test:e2e:responsive
npm run e2e            # closure only — full 3-project matrix
```

## Relevant paths

- `src/app/features/settings/` — `notifications-page.{ts,html,scss,spec.ts}`, `settings.seed.ts`
  (`NOTIFICATIONS_ROWS`), `settings-page.ts`/`.spec.ts`
- `src/app/app.routes.ts` — `/settings/notifications`
- `tests/e2e/notifications.spec.ts`, `tests/e2e/settings.spec.ts`, `tests/e2e/responsive.spec.ts`
- `tests/e2e/golden/0-10758-notifications.png` — gated golden (Figma capture, ~09-28)
- `figma/design-map.md` — row 17

## Capture (deferred ~2026-09-28)

```powershell
npx -y figma-developer-mcp fetch --file-key PcGX72lSWkYIk3pL5V8PS3 --node-id 0:10758 --depth 6 --format json
```

## Golden practice (007-014 pattern)

Golden test `.skip`'d until `0-10758-notifications.png` exists; then measure tight baseline and
ship `measured + 0.05`.