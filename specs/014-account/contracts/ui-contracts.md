# UI Contracts: Account (feature 014)

Anything not independently derivable from the `001` design tokens is **provisional** until the
`0:9371` node payload is captured (Figma 429 → ~09-28). Testids are hard contract; labels/glyphs/
hero are PENDING.

## Route / track

| Item | Contract |
| ---- | -------- |
| route | `/settings/account`, lazy `AccountPage` (features/settings/account-page) |
| entry | Settings screen row "Account" (`router.navigate(['/settings/account'])`) |
| surface | pushed (no tab bar) — PENDING confirmation |
| root testid | `account-page` |
| scroll | body scrolls internally; no horizontal overflow |

## Chrome (NavigationBar)

| Item | Contract |
| ---- | -------- |
| leading | Back (`icon: back`, label "Back") → `/settings` |
| title | "Account" (h1) |

## Body

| Testid | Element | Accessible name | Notes |
| ------ | ------- | --------------- | ----- |
| `account-hero` | hero/illustration block | — | structural hypothesis; PENDING glyph/geometry |
| `account-list` | rows container (`ul`) | — | rows from `ACCOUNT_ROWS` |
| `account-row` | row button | row label | chevron trailing; `aria-label` = row label; activation no-op (targets not in map) |

## Seed (provisional, G1 data-swap)

`ACCOUNT_ROWS` hypothesis: Security, Two-step verification, Change number, Delete my account.

## Keyboard / a11y

- Rows + Back focusable with visible focus rings.
- Tab order: Back → hero (non-interactive) → rows.

## Golden

- `tests/e2e/golden/0-9371-account.png` (native 1x); threshold = measured baseline + 0.05.

## Explicit deviation candidates (drift gate G1)

1. Hero block presence/geometry/glyph.
2. Row list/order/glyphs (hypothesis above).
3. No-tab-bar pushed surface.