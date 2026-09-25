# UI Contracts: Contact Info (feature 015)

Anything not independently derivable from the `001` design tokens is **provisional** until the
`0:9486` node payload is captured (Figma 429 → ~09-28). Testids are hard contract; labels/glyphs/
hero are PENDING.

## Route / track

| Item | Contract |
| ---- | -------- |
| route | `/contact/:id`, lazy `ContactPage` (features/contact-info/contact-page) |
| entry | chat-window header identity tap (`chat-header__identity`) |
| identity | route id → `CHAT_SEED` lookup → `contactName`; `UserAvatar` initials fallback |
| surface | pushed (no tab bar) — PENDING confirmation |
| root testid | `contact-page` |
| scroll | body scrolls internally; no horizontal overflow |

## Chrome (NavigationBar)

| Item | Contract |
| ---- | -------- |
| leading | Back (`icon: back`, label "Back") → `/chat/:id` |
| title | contact name (hypothesis; "Contact info" alternative PENDING) |

## Body

| Testid | Element | Accessible name | Notes |
| ------ | ------- | --------------- | ----- |
| `contact-hero` | hero block (avatar + name) | — | phone row PENDING capture |
| `contact-name` | live region text | — | `contactName` from seed |
| `contact-messages` | primary action button | "Messages" | no-op this feature (Non-Goal) |
| `contact-list` | info rows container (`ul`) | — | rows from `CONTACT_ROWS` |
| `contact-row` | row button | row label | chevron trailing; aria-label = label; no-op |

## ChatHeader identity (shared component change)

| Item | Contract |
| ---- | -------- |
| `chat-header__identity` | button wrapping avatar + name/subtitle | aria-label "Open contact info"; emits `identity`; focus ring on focus-visible |
| placement | between back button and video/call affordances in tab order |

## Seed (provisional, G1 data-swap)

`CONTACT_ROWS` hypothesis: Media, photos and links / Groups / Starred messages.

## Keyboard / a11y

- Identity, Back, Messages, rows focusable with visible focus rings.
- Tab order (chat window): Back → identity → Video → Call → More → composer tools.

## Golden

- `tests/e2e/golden/0-9486-contact-info.png` (native 1x); threshold = measured baseline + 0.05.

## Explicit deviation candidates (drift gate G1)

1. Hero topology + phone row (omitted pre-capture) + glyphs.
2. Action row: Messages label/glyph (call/video affordances PENDING).
3. Info rows list/order/glyphs (hypothesis above).
4. Pushed-header title text.
5. Chat-header tab-order insertion (deliberate, spec'd).