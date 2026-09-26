# UI Contracts + Quickstart: Authorization (feature 021)

## UI contracts

Provisional until `0:11030` captured (Figma 429 → ~09-28). Testids are hard contract; labels
PENDING.

| Item | Contract |
| ---- | -------- |
| route | `/auth`, lazy `AuthPage`; **no entry wiring** — default `**` → `/chats` unchanged (cold-start flow PENDING) |
| surface | full-screen cold-start (no navigation bar, no tab bar) |
| root testid | `auth-page` |
| `auth-title` | brand title (e.g. "WhatsApp", PENDING confirmation) |
| `auth-country` | country region display (no-op) |
| `auth-phone` | phone number display region (empty) |
| `auth-key` | keypad key (digits 1–9 + 0; aria-label = digit); 12-slot grid w/ backspace at last slot |
| `auth-key-delete` | backspace key (no-op) |
| `auth-continue` | Continue/Next action (no-op) |

**Keyboard/a11y**: all keys/Continue focusable with visible focus rings.
**Golden**: `tests/e2e/golden/0-11030-auth.png` (native 1x); threshold = measured + 0.05.

## Explicit deviation candidates (drift gate G1)

1. Title/brand + country/phone labels and layout.
2. Keypad geometry/digits/backspace glyph.
3. Continue treatment + the default-flow entry wiring decision (biggest drift: not assigning
   `/auth` as the app default keeps every feature reachable).

## Quickstart — E2E (reuses the running `ng serve` on 4200)

```bash
npm run start          # once per session
npx playwright test tests/e2e/auth.spec.ts tests/e2e/responsive.spec.ts --project=chromium-mobile
npm run test:e2e:fast
npm run e2e            # when playwright runs are re-enabled
```

## Capture (deferred ~2026-09-28)

```powershell
npx -y figma-developer-mcp fetch --file-key PcGX72lSWkYIk3pL5V8PS3 --node-id 0:11030 --depth 6 --format json
```