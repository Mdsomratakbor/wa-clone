# Quickstart - Feature 005: Calls Edit Mode

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

Expected: from `/` activate the `Calls` tab -> `/calls` renders the feature-004 call history. Activating `Edit` flips the header to `Done` + `Clear`, adds a red minus circle to every row, shifts row content right and hides the info buttons; rows can be removed one-by-one via their minus, `Clear` empties the whole history, and an emptied list shows a `No calls` placeholder with `Clear` disabled. While editing the tab bar is inert. `Done` restores the feature-004 rendering with the remaining list.

## Unit tests (Karma/Jasmine)

```bash
npm test
```

Covers: `CallListItem` editMode (minus circle, `remove` emission, hidden info, shifted content); `NavigationBar` disabled action; `CallsPage` enter/exit, minus removal, `Clear` + disabled state, empty state, edit-mode guards (row body no-op, tab switch inert).

## E2E + visual validation (Playwright)

```bash
npm run e2e
```

- `/calls` -> `Edit` -> asserts `Done`, `Clear`, 12 minus circles, no info buttons, tab bar with `Calls` active; `Done` restores 004 chrome.
- Tabs inert while editing (`Status`/`Chats`/`Camera`/`Settings` taps do nothing).
- Minus tap removes one row; `Clear` empties; `No calls` + disabled `Clear`; `Done` with reduced list.
- Screenshot compare vs `tests/e2e/golden/0-8597-calls-edit.png` (Figma render) at 375x812 (documented `maxDiffPixelRatio`).
- Responsive drift check: `/calls` edit mode has no horizontal overflow at existing breakpoints.

## Manual validation checklist against Figma

| Check | Expected |
| ----- | -------- |
| Edit entry | `Edit` -> header `Done` (leading) + `Clear` (trailing), segmented control unchanged |
| Rows | 21px red minus at left (x17, vertically centred); avatar at ~47, name at ~99; no info button; missed names still `#FF3B30` |
| Minus tap | that row disappears immediately; others keep order |
| `Clear` | all rows vanish; `Clear` becomes disabled `#C7C7CC`; `No calls` placeholder |
| Tabs | inert while editing; `Calls` stays active; working again after `Done` |
| Done | feature-004 header + info buttons + normal chrome with the remaining list |
| Focus | visible rings through nav actions and minus circles |

## Definition of Done gate

- All unit + E2E assertions pass; visual diff recorded via Playwright.
- Feature-004 tests remapped (`Edit` no-op -> edit mode); full suite green.
- Design-map row 005 marked implemented; drift audit vs node `0:8597` completed.