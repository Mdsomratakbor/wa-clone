# Quickstart: Feature 015 Contact Info

## Smoke

```bash
npm run build
npx ng test --watch=false --reporters=progress
```

## E2E (runs against the local dev server on port 4200)

```bash
# 1. fresh server (kill stale node on 4200 first)
npm run start
# 2. targeted
npx playwright test tests/e2e/contact-info.spec.ts tests/e2e/chat-window.spec.ts tests/e2e/responsive.spec.ts
# 3. full suite
npx playwright test
```

## Relevant paths

- `src/app/features/contact-info/` — `contact-page.{ts,html,scss,spec.ts}`
- `src/app/shared/components/chat-header/*` — identity button + `identity` output
- `src/app/features/chat-window/chat-window-page.{ts,html}` — identity wiring
- `src/app/app.routes.ts` — `/contact/:id`
- `tests/e2e/contact-info.spec.ts`, `tests/e2e/chat-window.spec.ts`,
  `tests/e2e/responsive.spec.ts`
- `tests/e2e/golden/0-9486-contact-info.png` — gated golden (Figma capture, ~09-28)
- `figma/design-map.md` — row 15

## Capture (deferred ~2026-09-28)

```powershell
npx -y figma-developer-mcp fetch --file-key PcGX72lSWkYIk3pL5V8PS3 --node-id 0:9486 --depth 6 --format json
```

## Golden practice (007-014 pattern)

1. Gated: golden test `.skip`'d until `0-9486-contact-info.png` exists.
2. Unskip after capture; run once; thr `maxDiffPixelRatio` from the measured baseline; ship
   `measured + 0.05`.