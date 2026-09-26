# UI Contracts + Quickstart: Settings — overflow sheet navigation (feature 029)

## Contracts

| Sheet row | Behaviour |
| --------- | --------- |
| `settings-notifications` | dismiss sheet (focus → trigger) + `router.navigate(['/settings/notifications'])` |
| `settings-storage` | dismiss sheet (focus → trigger) + `router.navigate(['/settings/data-storage'])` |
| `settings-more` | sheet stays open; no navigation |

**Stability**: sheet markup/geometry untouched (shared `ActionSheet`); only the select handler
changes — no golden impact.

**E2E (agree with OLAS pause — authored, not executed yet)**:

```bash
npx playwright test tests/e2e/settings-overflow.spec.ts --project=chromium-mobile   # when re-enabled
```