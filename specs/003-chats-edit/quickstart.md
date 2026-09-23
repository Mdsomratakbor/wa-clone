# Quickstart — Feature 003: Chats Edit Mode

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

Expected: open `/` (Chats) → activate the blue `Edit` action → edit mode: every row shows a leading selection circle, trailing action reads `Done`, the FAB and tab bar are replaced by `Archive · Read All · Delete`. Activating a row toggles its circle (filled blue + check). With a selection, `Archive`/`Delete` remove those rows; `Read All` does nothing. `Done` restores the normal Chats list.

## Unit tests (Karma/Jasmine)

```bash
npm test
```

Covers: `ChatActionsBar` states/emissions; `ChatListItem` edit-mode circle + checkbox semantics; `ChatsPage` edit entry/exit, selection toggle, Delete/Archive removal, Read All no-op, empty state, and untouched normal mode.

## E2E + visual validation (Playwright)

```bash
npm run e2e
```

- `/` → `Edit` → asserts `Done`, per-row circles, action bar, no FAB/tab bar; `Done` restores them.
- Row/circle selection toggles with `aria-checked`.
- Archive removes 1, Delete removes 2, Read All is a no-op; full deletion → `No chats`.
- Keyboard-focus ring through circles + action bar.
- Screenshot compare vs `tests/e2e/golden/0-8114-chats-edit.png` (Figma render) in default edit state at 375px.
- Responsive drift check: edit mode has no horizontal overflow at existing breakpoints.

## Manual validation checklist against Figma

| Check | Expected |
| ----- | -------- |
| `Edit` action | enters edit mode (`#007AFF`) |
| Selection circle (idle) | 21px ring `#3C3C43` 1.5px @ 42% |
| Selection circle (selected) | solid `#007AFF` + white check |
| Row in edit mode | `role=checkbox`, toggles on activation, avatar stays ~55px |
| Chat Actions bar | `#F6F6F6`, hairline top shadow, 49px visible, `Archive · Read All · Delete` |
| Bar disabled | all three `#C7C7CC`, disabled, at 0 selected (matches Figma) |
| Bar enabled | `Archive`/`Read All` `#007AFF`, `Delete` `#FF3B30` at ≥1 selected |
| Actions | Delete/Archive remove selected rows; Read All no-op |
| `Done` | restores FAB + tab bar + `Edit`, no circles |
| Empty list | `No chats` placeholder, nav + action bar intact |
| Focus | visible ring while tabbing circles and bar buttons |

## Definition of Done gate

- All unit + E2E assertions pass; visual diff recorded via Playwright.
- Design-map row 003 marked implemented; drift audit vs node `0:8114` completed.