# Quickstart - Feature 004: Calls Screen

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

Expected: from `/` (Chats) activate the `Calls` tab -> `/calls` renders the 12-row call history (40px avatars, name/date, arrow + `outgoing`/`incoming`/`missed` labels, blue info buttons; missed names in red), a header with leading `Edit`, the centred `All | Missed` control (`All` active), a trailing `+ new call` icon and no title. All controls are no-ops. The `Chats` tab returns to `/chats`; `Status`/`Camera`/`Settings` show the existing "coming soon" stub.

## Unit tests (Karma/Jasmine)

```bash
npm test
```

Covers: `CallListItem` rendering + missed colour + emissions + info-not-bubbling; `NavigationBar` optional title, centre slot, icon action; `CallsPage` seed count, active tab, `/chats` navigation, stub, no-ops, no FAB; `ChatsPage` tabs to `/calls`.

## E2E + visual validation (Playwright)

```bash
npm run e2e
```

- `/calls` asserts 12 rows (names/dates/labels count), header (`Edit`, `All | Missed`, `+ new call`), `Calls` tab active, no FAB.
- Navigation: `Calls` tab on `/chats` -> `/calls`; `Chats` tab on `/calls` -> `/chats`.
- Missed rows assert `#FF3B30` name colour.
- Screenshot compare vs `tests/e2e/golden/0-10395-calls.png` (Figma render) at 375x812 (documented `maxDiffPixelRatio`).
- Responsive drift check: `/calls` has no horizontal overflow at existing breakpoints.

## Manual validation checklist against Figma

| Check | Expected |
| ----- | -------- |
| 12 call rows | names/dates/directions exactly as `data-model.md` table |
| Missed rows | Karen Castillo 9/30/19, Jamie Franco 8/20/19 - name `#FF3B30` |
| Row content | 40px avatar, arrow glyph + label, right-aligned date, blue info button |
| Header | `Edit` leading `#007AFF`, `All | Missed` centred (`All` active white-on-blue), `+ new call` trailing, no title |
| Tab bar | `Calls` active `#007AFF`; order `Settings - Chats - Camera - Calls - Status` (001) |
| Navigation | `Chats` tab -> `/chats`; other tabs -> stub; `Calls` tab on `/chats` -> `/calls` |
| No-ops | `Edit`, `+ new call`, row tap, info button do nothing |
| No FAB | absent on `/calls` |
| Focus | visible rings tabbing header actions, rows, info buttons |

## Definition of Done gate

- All unit + E2E assertions pass; visual diff recorded via Playwright.
- Design-map row 004 marked implemented; drift audit vs node `0:10395` completed.