# Quickstart — Feature 001: WhatsApp Chats

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

Expected: `/` renders `Chats` screen — nav bar (`Chats`, `Edit`, `Broadcast Lists`, `New Group`), 9 chat rows (exact Figma strings), 5-item tab bar (Chats active), FAB, iOS status bar/home indicator.

## Unit tests (Karma/Jasmine)

```bash
npm test
```

Covers: `ChatListItem` renders name/preview/time/avatar; `TabBar` active toggle; `UserAvatar` initials fallback; empty-state placeholder; seed count.

## E2E + visual validation (Playwright)

```bash
npm run e2e
```

- Asserts 9 rows, nav elements, 5 tabs, FAB at 375px.
- Screenshot compare vs `tests/e2e/golden/0-8855-chats.png` (Figma render export) at 375px.
- Responsive drift check: 800px and 1440px viewports — centered shell, **no horizontal overflow** (scrollWidth ≤ clientWidth).

## Manual validation checklist against Figma

| Check | Expected |
| ----- | -------- |
| Background | `#EFEFF4` across the screen |
| Row name | `16px/600` black; preview/time `14px/400` `#8E8E93` |
| Nav actions | `17px/400` `#007AFF` (`Edit`, `Broadcast Lists`, `New Group`) |
| Tab bar | active `#007AFF`, inactive `#545458`, labels `10px/500` |
| Focus | visible focus ring when tabbing through nav actions, tabs, FAB |
| Empty list | "No chats" placeholder when seed removed |

## Definition of Done gate

- All unit + E2E assertions pass; visual diff recorded via Playwright.
- Design-map row 001 marked implemented; drift audit vs node `0:8855` completed.