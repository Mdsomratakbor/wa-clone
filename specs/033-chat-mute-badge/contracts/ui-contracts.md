# UI Contracts + Quickstart: muted badge on chat rows (feature 033)

## Contracts

| Item | Contract |
| ---- | -------- |
| row | `@if (chat().muted)` renders the bell: `data-testid="chat-mute-badge-{id}"`, `role="img"`, `aria-label="Muted"`, 14×14, in `.chat-list-item__head` before `<time>` |
| style | `.chat-list-item__mute { flex: none; color: var(--wa-text-secondary); }` + 4px gap; no fixed heights touched |
| states | badge ⇔ `chat.muted`; `selectMode` (edit mode) and all sort orders unaffected |
| a11y | row `aria-label` unchanged (name only) so existing selectors keep working; the badge announces itself |

**Stability**: `normalizeChats` seeds `muted: false` ⇒ zero seeded badges ⇒ `0-8855` and the
edit-mode golden unchanged.

**E2E (authored, not executed — playwright paused)**:

```bash
npx playwright test tests/e2e/chat-mute.spec.ts --project=chromium-mobile   # when re-enabled
```