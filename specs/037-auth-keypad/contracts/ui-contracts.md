# UI Contracts + Quickstart: auth keypad (feature 037)

## Contracts

| Item | Contract |
| ---- | -------- |
| keypad | `auth-key` (`1`–`9`, `0`) appends to `auth-phone` (max 15 digits, `aria-live="polite"`) |
| backspace | `auth-key-delete` removes the last digit; no-op when empty |
| continue | `auth-continue` with < 7 digits → no navigation + `auth-error` (`role="status"`); with ≥ 7 digits → `navigate(['/chats'])` |
| error copy | `Enter your phone number to continue.` (map-external wording, see caveat) |
| unchanged | title, tagline, `No country selected`, key grid, Continue treatment, no tab bar, `/` → `/chats` |

**Stability**: empty seeded state renders exactly as spec 021 ⇒ `0-11030-auth.png` unaffected.

**E2E (authored, not executed — playwright paused)**:

```bash
npx playwright test tests/e2e/auth.spec.ts --project=chromium-mobile   # when re-enabled
```