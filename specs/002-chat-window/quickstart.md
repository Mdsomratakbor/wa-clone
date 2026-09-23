# Quickstart — Feature 002: WhatsApp Chat Window

Runnable validation guide. Implementation-free; full details in `contracts/` and `tasks.md`.

## Prerequisites

- Node + npm installed (`node_modules/` present)
- (E2E only) Playwright browsers installed: `npx playwright install chromium`

## Install

```bash
npm install
```

## Run the app

```bash
npm start            # http://localhost:4200
```

Expected: open `/` (Chats) → tap/activate row 6 `Martha Craig` → `/chat/chat-006` renders the Chat Window — contact header (`Back`, avatar, `Martha Craig`, `tap here for contact info`, video/call), `Fri, Jul 26` date chip, 13-message thread (green outgoing + blue read ticks, white incoming, 4 file cards), composer (`＋`, input, emoji, camera, mic), wallpaper background, status bar/home indicator.

## Unit tests (Karma/Jasmine)

```bash
npm test
```

Covers: `MessageBubble` renders text/time/side/fill/read-tick + file variant + long-text wrap; `ChatHeader` name/subtitle/actions + `back` emit; `Composer` field + 4 controls + focus; page renders seed thread order; avatar initials fallback.

## E2E + visual validation (Playwright)

```bash
npm run e2e
```

- Loads `/chat/chat-006`; asserts header copy, date chip, 13 messages (bubble side classes), composer.
- `Back` → `/chats`.
- Keyboard-focus flows through header + composer with visible indicators.
- Screenshot compare vs `tests/e2e/golden/0-8257-chat.png` (Figma render export) at 375px.
- Responsive drift check: 800px and 1440px viewports — centered shell, **no horizontal overflow** (scrollWidth ≤ clientWidth).

## Manual validation checklist against Figma

| Check | Expected |
| ----- | -------- |
| Header | `#F6F6F6`; back chevron, 36px avatar (initials `MC`), `Martha Craig` `16/600#000` + `tap here for contact info` `14/400 #8E8E93`; video/call `#007AFF` |
| Date chip | centered pill `Fri, Jul 26` `#DDDDE9`/`#3C3C43` |
| Outgoing bubble | right-aligned `#DCF7C5`, `16px/400#000` text, `11px rgba(0,0,0,.25)` time, blue `Read` double-tick |
| Incoming bubble | left-aligned `#FAFAFA`, no tick |
| File bubble | `File` card (doc icon, `IMG_04xx`, `2.x MB·png`), time + ticks right |
| Composer | `#F6F6F6`; `＋`/camera/mic `#007AFF`; white input (empty), emoji sticker inside |
| Wallpaper | approved approximation fills thread area between header and composer |
| Focus | visible focus ring when tabbing header icons and composer controls |
| Back | returns to `/chats` |

## Definition of Done gate

- All unit + E2E assertions pass; visual diff recorded via Playwright.
- Design-map row 002 marked implemented; drift audit vs node `0:8257` completed.