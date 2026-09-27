# UI Contracts + Quickstart: Status wiring (feature 035)

## Contracts

| Item | Contract |
| ---- | -------- |
| nav | `Privacy` (`status-page` leading action) → `navigate(['/settings'])` |
| row | `My Status` row click / `keydown.enter` / `keydown.space` → `navigate(['/status/compose'])` |
| circles | `Add a photo to my status` / `Add a text to my status` → `navigate(['/status/compose'])` (unchanged) |
| unchanged | header (`Privacy` + `Status` title), tip copy, tab bar, no FAB, store untouched |

**Stability**: no visual change ⇒ status goldens unaffected.

**E2E (authored, not executed — playwright paused)**:

```bash
npx playwright test tests/e2e/status-wiring.spec.ts --project=chromium-mobile   # when re-enabled
```