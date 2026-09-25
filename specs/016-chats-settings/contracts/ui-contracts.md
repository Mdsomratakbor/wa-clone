# UI Contracts: Chats Settings (feature 016)

Anything not independently derivable from the `001` design tokens is **provisional** until the
`0:9973` node payload is captured (Figma 429 → ~09-28). Testids are hard contract; labels are
PENDING.

## Route / track

| Item | Contract |
| ---- | -------- |
| route | `/settings/chats`, lazy `ChatsSettingsPage` (features/settings/chats-settings-page) |
| entry | Settings "Chats Settings" row activation |
| surface | pushed (no tab bar) — PENDING confirmation |
| root testid | `chats-settings-page` |
| scroll | body scrolls internally; no horizontal overflow |

## Chrome (NavigationBar)

| Item | Contract |
| ---- | -------- |
| leading | Back (`icon: back`, label "Back") → `/settings` |
| title | "Chats Settings" (hypothesis; PENDING confirmation) |

## Body

| Testid | Element | Accessible name | Notes |
| ------ | ------- | --------------- | ----- |
| `chats-settings-list` | rows container (`ul`) | — | rows from `CHATS_SETTINGS_ROWS` |
| `chats-settings-row` | row button | row label | chevron trailing; aria-label = label; no-op |

## Seed (provisional, G1 data-swap)

`CHATS_SETTINGS_ROWS` hypothesis: Wallpaper / Font size / Keyboard / Enter key sends / Media
visibility.

## Keyboard / a11y

- Back + rows focusable with visible focus rings.

## Golden

- `tests/e2e/golden/0-9973-chats-settings.png` (native 1x); threshold = measured baseline + 0.05.

## Explicit deviation candidates (drift gate G1)

1. Row set/order/labels/glyphs + section headers.
2. Wallpaper preview tile treatment.
3. Nav title/breadcrumb.
4. Settings US2 e2e no-op row change (Chats Settings now navigates; Notifications becomes the
   no-op probe).