# UI Contracts: Notifications (feature 017)

Anything not independently derivable from the `001` design tokens is **provisional** until the
`0:10758` node payload is captured (Figma 429 → ~09-28). Testids are hard contract; labels are
PENDING.

## Route / track

| Item | Contract |
| ---- | -------- |
| route | `/settings/notifications`, lazy `NotificationsPage` (features/settings/notifications-page) |
| entry | Settings "Notifications" row activation |
| surface | pushed (no tab bar) — PENDING confirmation |
| root testid | `notifications-page` |
| scroll | body scrolls internally; no horizontal overflow |

## Chrome (NavigationBar)

| Item | Contract |
| ---- | -------- |
| leading | Back (`icon: back`, label "Back") → `/settings` |
| title | "Notifications" (hypothesis; PENDING confirmation) |

## Body

| Testid | Element | Accessible name | Notes |
| ------ | ------- | --------------- | ----- |
| `notifications-list` | rows container (`ul`) | — | rows from `NOTIFICATIONS_ROWS` |
| `notifications-row` | row button | row label | chevron trailing; aria-label = label; no-op |

## Seed (provisional, G1 data-swap)

`NOTIFICATIONS_ROWS` hypothesis: Sound / Vibrate / Popup notification / Light / Show previews.

## Keyboard / a11y

- Back + rows focusable with visible focus rings.

## Golden

- `tests/e2e/golden/0-10758-notifications.png` (native 1x); threshold = measured baseline + 0.05.

## Explicit deviation candidates (drift gate G1)

1. Section/row set, labels, grouping, glyphs.
2. Toggle-row treatment (provisional: chevron no-op rows).
3. Nav title.
4. Settings US2 e2e no-op row change (Notifications now navigates; Data and Storage becomes the
   no-op probe).