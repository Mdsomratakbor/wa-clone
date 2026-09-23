# Data Model — Feature 002: WhatsApp Chat Window

Extracted from `spec.md` entities. No persistence — in-memory static seed only.

All values below are read from Figma nodes of frame `0:8257` (2026-09-23). Message order is the on-canvas top→bottom order (node `y`), which differs from chronological sort (`17:47` appears above `10:10`); content is reproduced exactly.

## Entity: Message

Represents one bubble in the thread.

| Field | Type | Required | Constraints |
| ----- | ---- | -------- | ----------- |
| `id` | `string` | Yes | Stable, unique (`msg-001` … `msg-013`) |
| `sender` | `'outgoing' \| 'incoming'` | Yes | outgoing → `#DCF7C5` + read ticks; incoming → `#FAFAFA`, no ticks |
| `text` | `string` | Yes | Exact Figma copy; empty for file messages (text lives in `file`) |
| `time` | `string` | Yes | **Static display string** from Figma (`17:47`, `10:10`, …) — never computed |
| `file` | `FileInfo \| null` | Optional | Present for the 4 file bubbles |

### Entity: FileInfo

| Field | Type | Required | Constraints |
| ----- | ---- | -------- | ----------- |
| `filename` | `string` | Yes | e.g. `IMG_0481` |
| `ext` | `string` | Yes | e.g. `png` |
| `size` | `string` | Yes | e.g. `2.8 MB` (Figma splits `2.8` + `MB`; stored joined) |

## Entity: ContactHeader

| Field | Type | Required | Constraints |
| ----- | ---- | -------- | ----------- |
| `name` | `string` | Yes | `Martha Craig` |
| `subtitle` | `string` | Yes | `tap here for contact info` |
| `avatarRef` | `string \| null` | Optional | Image source; `null` → initials fallback (`MC`) |

## Seed data (static, exact Figma content — frame `0:8257`, contact `Martha Craig` `0:8449`/`0:8450`)

Top→bottom on canvas. Outgoing group nodes `0:8260, 0:8269, 0:8278, 0:8287, 0:8301, 0:8327, 0:8353, 0:8379, 0:8414, 0:8426`; incoming `0:8296, 0:8405, 0:8410`; date chip `0:8423`.

| # | node | sender | text | time | file (filename · ext · size) |
| - | ---- | ------ | ---- | ---- | ---------------------------- |
| 1 | 0:8278 | outgoing | I will write from Japan | 17:47 | — |
| 2 | 0:8269 | outgoing | Good bye! | 17:47 | — |
| 3 | 0:8423 | *(date chip)* | Fri, Jul 26 | — | — |
| 4 | 0:8426 | outgoing | Good morning! | 10:10 | — |
| 5 | 0:8260 | outgoing | Japan looks amazing! | 10:10 | — |
| 6 | 0:8327 | outgoing | — | 10:15 | IMG_0475 · png · 2.4 MB |
| 7 | 0:8301 | outgoing | — | 10:15 | IMG_0481 · png · 2.8 MB |
| 8 | 0:8405 | incoming | Do you know what time is it? | 11:40 | — |
| 9 | 0:8414 | outgoing | It's morning in Tokyo 😎 | 11:43 | — |
| 10 | 0:8410 | incoming | What is the most popular meal in Japan? | 11:45 | — |
| 11 | 0:8296 | incoming | Do you like it? | 11:45 | — |
| 12 | 0:8287 | outgoing | I think top two are: | 11:50 | — |
| 13 | 0:8379 | outgoing | — | 11:51 | IMG_0483 · png · 2.8 MB |
| 14 | 0:8353 | outgoing | — | 11:51 | IMG_0484 · png · 2.6 MB |

Notes:
- The date chip (`Fri, Jul 26`) is a thread-level element rendered once above the first message; it is listed as row 3 only to fix its canvas position.
- Row 9 `It's morning in Tokyo 😎` renders the emoji as a 16px glyph before the timestamp, matching node `0:8421`.
- Rows 6–7 and 13–14 are file bubbles (no text field).

### State transitions

None — static data. Empty thread is an input condition (`messages.length === 0`), not a transition.

## Fills reference (variables resolved from frame `0:8257`)

| Token | Value | Use |
| ----- | ----- | --- |
| fill4 | `#DCF7C5` | Outgoing bubble |
| fill8 | `#FAFAFA` | Incoming bubble |
| fill6 | `#000000` | Bubble text |
| fill7 | `rgba(0,0,0,0.25)` | Bubble timestamp |
| fill5 | `#3497F9` | Read ticks |
| fill3 | `rgba(0,0,0,0.40)` | Bubble shadow layer (+ faint text on file bubbles) |
| fill9 | `rgba(118,118,128,0.12)` | File card rect |
| fill14 | `rgba(0,0,0,0.70)` | Filename |
| fill15 | `rgba(0,0,0,0.20)` | File-info separator dot |
| fill16 | `#DDDDE9` | Date chip bg |
| fill17 | `#3C3C43` | Date chip text |
| fill18 | `#F6F6F6` | Header + composer bg |
| fill13 | `#007AFF` | Accent (back/video/call/+/camera/mic) |
| fill21 | `#8E8E93` | Header subtitle |
| fill10 | `#FFFFFF` | Composer input field |
| fill1 | `#EFEFF4` | Frame bg (wallpaper fallback candidate) |
| fill2 / fill20 | image | Wallpaper / avatar (not embeddable) |
| fill27 | `#171717` | Status time `9:41` |