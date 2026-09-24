# Quickstart: Feature 012 Camera

## Smoke

```bash
npm run build
npm test -- --watch=false
```

## E2E (runs against the local dev server)

```bash
# 1. start the server (or reuse the running one)
npx ng serve --port 4200 --no-open
# 2. targeted run: this feature + responsive
npx playwright test tests/e2e/camera.spec.ts tests/e2e/responsive.spec.ts
# 3. full suite
npx playwright test
```

> On Windows / PowerShell: kill stale `ng serve` node processes on port 4200 before starting.

## Relevant paths

- `src/app/features/camera/` — `camera-page.{ts,html,scss,spec.ts}`
- `src/app/app.routes.ts` — `/camera` lazy route
- `src/app/features/chat-list/chats-page.ts` — Camera tab branch
- `src/app/features/calls/calls-page.ts` — Camera tab branch
- `src/app/features/status/status-page.ts` — Camera tab branch
- `tests/e2e/camera.spec.ts`, `tests/e2e/responsive.spec.ts`
- `tests/e2e/golden/0-9155-camera.png` — gated golden (Figma capture, ~09-28)
- `figma/design-map.md` — row 12

## Capture (deferred ~2026-09-28)

```powershell
npx -y figma-developer-mcp fetch --file-key PcGX72lSWkYIk3pL5V8PS3 --node-id 0:9155 --depth 6 --format json
```

## Golden practice (007-011 pattern)

1. Gated: golden test is `.skip`'d until `0-9155-camera.png` exists.
2. Unskip after capture; run once; thr `maxDiffPixelRatio` from the measured baseline; ship
   `measured + 0.05`.