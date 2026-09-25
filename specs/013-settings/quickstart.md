# Quickstart: Feature 013 Settings

## Smoke

```bash
npm run build
npm test -- --watch=false   # (or: npx ng test --watch=false --reporters=progress)
```

## E2E (runs against the local dev server on port 4200)

```bash
# 1. fresh server (kill stale node on 4200 first)
npm run start
# 2. targeted: this feature + 011 regression + responsive
npx playwright test tests/e2e/settings.spec.ts tests/e2e/settings-modal.spec.ts tests/e2e/starred.spec.ts tests/e2e/responsive.spec.ts
# 3. full suite
npx playwright test
```

> On Windows / PowerShell: kill stale `ng serve` node processes on port 4200 before starting.

## Relevant paths

- `src/app/features/settings/` — `settings-page.{ts,html,scss,spec.ts}`, `settings.seed.ts`,
  `settings-modal.*` (011, untouched)
- `src/app/app.routes.ts` — `/settings` → `settings-page`
- `src/app/features/starred-messages/settings-stub-page.*` — deleted this feature
- `tests/e2e/settings.spec.ts`, `tests/e2e/settings-modal.spec.ts`, `tests/e2e/starred.spec.ts`,
  `tests/e2e/responsive.spec.ts`
- `tests/e2e/golden/0-9198-settings.png` — gated golden (Figma capture, ~09-28)
- `figma/design-map.md` — row 13

## Capture (deferred ~2026-09-28)

```powershell
npx -y figma-developer-mcp fetch --file-key PcGX72lSWkYIk3pL5V8PS3 --node-id 0:9198 --depth 6 --format json
```

## Golden practice (007-012 pattern)

1. Gated: golden test is `.skip`'d until `0-9198-settings.png` exists.
2. Unskip after capture; run once; thr `maxDiffPixelRatio` from the measured baseline; ship
   `measured + 0.05`.