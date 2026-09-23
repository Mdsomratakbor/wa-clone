# Contracts — Feature 002: WhatsApp Chat Window

UI contracts for the Angular application (no external API in this feature). Derived from `data-model.md` and the Figma node values (`0:8257`).

## Reused components (feature 001)

- `StatusBar` — static `9:41` + battery/wifi/signal, `#171717` time (node `0:8474`, identical to chats).
- `HomeIndicator` — hairline `#060606` at y=798 (node `0:8495`).
- `AppShell` — centered ≤480px column on `#E2E2E7` backdrop.
- `UserAvatar` — `name="Martha Craig"`, `size=36`, `src=null` → initials `MC` (pending Clarification 2).

## `MessageBubble`

| Input | Type | Required | Constraints |
| ----- | ---- | -------- | ----------- |
| `message` | `Message` | Yes | See data-model.md (sender/text/time/file) |
| `unpaddedWidth` | `boolean`\* | No | internal sizing flag |

Output: none. Events: none (static in 002).

Behaviour:
- `sender=outgoing` → right-aligned, bg `#DCF7C5`, `Read` double-tick (`#3497F9`) below the timestamp; `sender=incoming` → left-aligned, bg `#FAFAFA`, no tick.
- Text `16px/400 #000000`, padding ~top 5 / left 8 / right 9; timestamp `11px rgba(0,0,0,0.25)` bottom-right.
- Content-driven height: single-line 34px; when `text width + time width + gaps > max-width` (≈262px / 80%), the text wraps and the timestamp drops to a bottom row (→ 50px for two-line). Density mirrors nodes `0:8260` etc.
- `message.file` present → file variant: `File` rect (`rgba(118,118,128,0.12)`, inset 3px, rounded), SVG document icon, filename `16px/500 rgba(0,0,0,0.70)`, bottom row `size · ext` (`11px rgba(0,0,0,0.40)` + `rgba(0,0,0,0.20)` dot) left of the timestamp/tick.
- Bubble shadow approximated from the `fill3` offset shadow layer: `box-shadow: 0 1px 0 rgba(0,0,0,0.40)` (fidelity note in Research Decision 4).
- Accessibility: `aria-label="<time>, <text|filename> — <sender>"`; rendered via interpolation only.

Figma refs: text bubbles `0:8260` (h34), multi-line `0:8410` (h50/50), file bubbles `0:8301` etc. (h67).

## `ChatHeader`

| Input | Type | Required | Constraints |
| ----- | ---- | -------- | ----------- |
| `contact` | `ContactHeader` | Yes | name/subtitle/avatarRef |
| `backLabel` | `string` | No (default `Back`) | aria-label for chevron |

`@Output() back` — emitted on chevron activation (→ route `/chats`).

- Bar: `#F6F6F6` 88px tall (44px status-bar zone + 44px nav zone).
- Contents (local coords, 375 base): `Back` chevron x9 y55 (12×21, `#007AFF`, SVG), avatar 36px at x62 y48, name `16px/600 #000` at x106 y49, subtitle `14px/400 #8E8E93` at x106 y67.5, `Video Call` icon x285 y57.5 (25×16, `#007AFF`), `Call` icon x334.5 y53.5 (21×21, `#007AFF`).
- Bottom hairline + shadow reuse the feature-001 nav-bar treatment (effect1 tokens).
- Video/Call are focusable no-op buttons (no routing in 002) with visible focus.
- Accessibility: `<header>` role banner; icons `role="img"` + aria-labels (`Back to chats`, `Video call (coming soon)`, `Call (coming soon)`); back is a `button`.

Figma ref: `0:8435` (+ children `0:8437/8441/8447/8449/8450/8451`).

## `Composer`

Inputs: none (static). Events: none in 002 (all controls local/focus-only).

- Bar: `#F6F6F6` 80px tall at the bottom (y732–812, above the home indicator overlay).
- Contents (local coords, 375 base): `＋ Add` x13.9 y745.7 (19×19, `#007AFF`); white input rect x47 y739 (228×32, `#FFFFFF`, rounded) with `Stickers` emoji icon inside at x249.5 y746.5 (18×19); `Camera` x294.8 y744.9 (22×19, `#007AFF`); `Record Audio` mic x341.1 y744 (16×24, `#007AFF`).
- Input has **no placeholder** (matches Figma — no TEXT child). It is a real `<input>` that accepts typed text visually but performs no send (out of scope).
- All icon buttons focusable with visible focus; `＋`/camera/mic/emoji = no-op affordances.
- Accessibility: bar `role="toolbar"` + `aria-label="Message composer"`; icons `role="img"` + aria-labels; input `aria-label="Message"`.

Figma ref: `0:8452` (+ `0:8454/8460/8461/8462/8467/8469`).

## `ChatWindowPage` (feature container)

| Input | Type | Required | Constraints |
| ----- | ---- | -------- | ----------- |
| `contactId` | `string` | Yes | route param; resolves seed contact + thread |

- Renders: wallpaper layer (owner-approved approximation), `ChatHeader`, `MessageBubble[]`, date chip, `Composer`, plus reused `StatusBar`/`HomeIndicator`.
- Date chip `0:8423`: centered pill `100×21`, bg `#DDDDE9`, text `Fri, Jul 26` `12px/500 #3C3C43`.
- Wallpaper layer sits between header and composer (y88–724 per `0:8258`), behind bubbles.
- Empty thread → wallpaper only (Clarification 4).

## Route contract

| Route | Renders | Notes |
| ----- | ------- | ----- |
| `/chat/:id` | `ChatWindowPage` | lazy; `id` = seeded contact id |
| `/` / `/chats` | `ChatsPage` | `Back` target |
| `/chats` → `/chat/chat-006` | — | nav built in feature 002 (row `selected` on `chat-006`) |

## Seed contract

`chat-window.seed.ts` exports `CONTACT` + `CHAT_SEED: Message[]` (14 rows incl. date marker, exact Figma copy — data-model.md). Used by `ChatWindowPage` and tests.