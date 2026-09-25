# UI Contracts: Settings (feature 013)

Anything not independently derivable from the `001` design tokens is **provisional** until the
`0:9198` node payload is captured (Figma 429 → ~09-28). Testids are hard contract; labels/glyphs/
profile identity are PENDING.

## Route / track

| Item | Contract |
| ---- | -------- |
| route | `/settings`, lazy `SettingsPage` (features/settings/settings-page) — replaces `settings-stub-page` |
| root testid | `settings-page` (preserved from the stub host) |
| entry | Back from `starred-page`; Settings tab (tab bar) |
| scroll | body scrolls internally; no horizontal overflow (pattern 006-012) |

## Chrome (NavigationBar)

| Item | Contract |
| ---- | -------- |
| leading | Back (`icon: back`, label "Back") → `router.navigate(['/starred-messages'])` |
| title | "Settings" (h1 via `navigation-bar__title`) |

## Body

| Testid | Element | Accessible name | Notes |
| ------ | ------- | --------------- | ----- |
| `settings-profile` | profile header row (avatar + name + chevron) | — | provisional; PENDING identity/geometry |
| `settings-avatar` | avatar placeholder (structural only) | — | PENDING real asset |
| `settings-name` | profile name | — | seed `SETTINGS_PROFILE.name` (provisional "Ani") |
| `settings-options` | button | "Settings options" | **011 contract — frozen** (open Settings Modal; focus return on dismiss) |
| `settings-list` | rows container (`ul`) | — | rows from `SETTINGS_ROWS` |
| `settings-row` | row button | row label | chevron trailing; `aria-label` = row label; activation no-op (rows 14-20 later) |

## 011 Settings Modal (unchanged contract, re-hosted)

- opens on `settings-options`; `action-sheet` + `action-sheet-backdrop`; backdrop click and
  Escape dismiss; focus returns to `settings-options`; rows `action-sheet-row` from
  `SETTINGS_ACTIONS` (Notifications / Storage / More).

## Tab bar (same shared component as siblings)

- Settings active; `chats` → `/chats`, `camera` → `/camera`, `calls` → `/calls`, `status` →
  `/status`. No local stub on the Settings page itself.

## Keyboard / a11y

- All rows + Back + options are focusable buttons with visible focus rings.
- Tab order: Back → options → rows → tabs.

## Golden

- `tests/e2e/golden/0-9198-settings.png` (native 1x); threshold = measured baseline + 0.05.

## Explicit deviation candidates (drift gate G1)

1. Profile identity (name/subtitle/phonetics), avatar, chevron.
2. Exact row list/order/glyphs (hypothesis: Account, Chats Settings, Notifications, Data and
   Storage, Contacts).
3. 011 Settings Modal entry placement (⋮ top-right hypothesis).
4. Back destination (`/starred-messages` hypothesis, kept from prior contract).