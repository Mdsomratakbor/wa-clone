# Feature Specification: WhatsApp Calls — Edit Mode

**Feature Branch**: `005-calls-edit`

**Created**: 2026-09-23

**Status**: Implemented — all validation targets pass (2026-09-23)

**Input**: Figma design analysis -> design-map row 5, node `0:8597`

## Context

The Calls Edit screen is the Calls list (feature 004, node `0:10395`) with **edit mode active**: every call row gains a leading 21px red circle with a white minus (`#FF3B30`), the row content shifts right (avatar 16 -> 47, name 68 -> 99), and the trailing blue info button disappears. The navigation bar flips `Edit` -> `Done` (#007AFF semibold, leading) and the trailing slot swaps the `+ new call` icon for a `Clear` text action; the centred `All | Missed` segmented control persists unchanged. Unlike Chats Edit (feature 003) there is **no bottom action bar** — the tab bar remains visible with `Calls` active.

This feature wires the feature-004 `Edit` nav action into an interactive **edit mode** on `/calls`: enter/exit (`Edit` <-> `Done`), immediate per-row removal via each row's red minus, and a `Clear` all action over an in-memory working copy of the static seed. No backend, no persistence. Deleting every row reveals a `No calls` empty state (mirroring `No chats` in feature 001/003).

## Figma Reference

| Item | Value |
| ---- | ----- |
| Figma file | WhatsApp UI Screens (Community) - `PcGX72lSWkYIk3pL5V8PS3` |
| Page / Canvas | `WhatsApp` (`0:8102`) |
| Frame | `WhatsApp Calls Edit` - `0:8597` (API form) / `0-8597` (URL form) |
| Frame size | 375 x 812 |
| Figma source | [open in Figma](https://www.figma.com/design/PcGX72lSWkYIk3pL5V8PS3/WhatsApp-UI-Screens--Community-?node-id=0-8597&p=f) |
| Golden | `tests/e2e/golden/0-8597-calls-edit.png` (Figma render, 375x812) |

## User Scenarios & Testing

### User Story 1 - Enter / exit edit mode (Priority: P1)

As a user I can flip the Calls list into edit mode (per-row minus circles + `Clear`) and back to the normal list.

**Why this priority**: the whole screen is a mode of the existing list; entry/exit is the primary interaction.

**Independent Test**: On `/calls`, activating `Edit` shows `Done` + `Clear`, a red minus circle on every row, no info buttons, and the tab bar still visible with `Calls` active; activating `Done` restores the feature-004 header (`Edit`, `+ new call`), info buttons and normal chrome.

**Acceptance Scenarios**:

1. **Given** the Calls list, **When** I activate the leading `Edit` action, **Then** edit mode renders: leading becomes `Done`, trailing becomes `Clear`, every row shows a leading 21px red minus circle, the info button is hidden, and the `All | Missed` segmented control stays as in feature 004.
2. **Given** edit mode, **When** I activate `Done`, **Then** minus circles disappear, the info button returns, and the header restores `Edit` + `+ new call` (normal mode exactly as feature 004).
3. **Given** the tab bar in edit mode, **When** I activate any tab, **Then** nothing happens (tab switches are inert until `Done`; Clarification 4).

### User Story 2 - Remove call entries (Priority: P1)

As a user I can delete an individual call (red minus) or clear the whole history (`Clear`).

**Why this priority**: the destructive actions are the point of edit mode.

**Independent Test**: Activating a row's red minus removes exactly that row from the list; `Clear` removes every row; with 0 rows left `Clear` renders disabled gray and the `No calls` empty state appears.

**Acceptance Scenarios**:

1. **Given** edit mode, **When** I activate a row's red minus, **Then** that row is removed immediately and the remaining rows stay in order.
2. **Given** edit mode, **When** I activate `Clear`, **Then** every row is removed.
3. **Given** an emptied list, **When** I inspect `Clear` and the list area, **Then** `Clear` renders disabled (`#C7C7CC`, non-actionable) and the `No calls` placeholder shows (Clarifications 2-3).
4. **Given** edit mode, **When** I activate a row body (not the minus), **Then** nothing happens (no navigation, no removal; Clarification 1).

### User Story 3 - Edit-mode chrome stability (Priority: P2)

As a user I get a stable, accessible edit mode that returns the screen to feature-004 state on exit.

**Why this priority**: guarantees the mode is predictable and the normal screen is untouched.

**Independent Test**: In edit mode tab switches are no-ops; the segmented control is still non-actionable; focus trailers cover the minus circles; exiting restores the exact feature-004 rendering.

**Acceptance Scenarios**:

1. **Given** edit mode, **When** I activate `Status`/`Camera`/`Settings` or `Chats` tabs, **Then** no navigation or stub switch occurs (Call stays active; Clarification 4).
2. **Given** edit mode, **When** I tab through the screen, **Then** the `Done`/`Clear` nav actions and every minus circle are focusable with a visible ring; disabled `Clear` is not focusable (mirrors feature-003 disabled pattern).
3. **Given** `Done` after any removal history, **Then** the screen is visually identical to feature 004 with the (reduced) remaining list.

## Clarifications - Decisions Recorded (2026-09-23)

| # | Ambiguity | Decision |
| - | --------- | -------- |
| 1 | Red-minus semantics | **Approved**: tapping a row's 21px red `#FF3B30` circle-minus removes that call entry immediately from the in-memory list (iOS Call Recents edit style). Row-body activation is a no-op in edit mode; the info button is hidden in edit mode (Figma `0:8597` rows carry no info node) and returns on `Done` |
| 2 | `Clear` semantics | **Approved**: the trailing `Clear` removes ALL call entries in-memory; when 0 entries remain it renders disabled gray `#C7C7CC` (non-actionable), mirroring the feature-003 disabled action pattern |
| 3 | Empty state | **Approved**: an emptied list shows the `No calls` placeholder centred in the list area (mirrors the `No chats` placeholder of features 001/003); nav + tab bar stay visible, and the segmented control stays as in 004 |
| 4 | Tab bar during edit | **Approved**: the design keeps the tab bar visible in edit mode, but tab switches are inert while editing (extension of the feature-003 guard at `chats-page.ts:69` — `Done` first, then navigate). The `Calls` tab is active throughout |

## Requirements

### Functional Requirements

- **FR-001**: The leading nav action on `/calls` MUST alternate `Edit` <-> `Done` (`#007AFF`); `Edit` enters edit mode, `Done` exits it.
- **FR-002**: In edit mode the trailing nav action MUST be `Clear` (`#007AFF`); the `+ new call` icon returns on `Done` (feature-004 state).
- **FR-003**: In edit mode EVERY call row MUST render a leading 21px red circle with a white minus at the Figma offset (left 17, vertically centred; content shifts so the avatar sits at ~47 and the name at ~99 like Figma `0:8597`).
- **FR-004**: In edit mode the trailing info button MUST be hidden; `Done` restores it (Clarification 1).
- **FR-005**: Activating a row's minus MUST remove that row from the in-memory working list immediately; row-body activation MUST NOT navigate or remove (Clarification 1).
- **FR-006**: `Clear` MUST remove all rows; with 0 rows it MUST render disabled `#C7C7CC` (Clarification 2).
- **FR-007**: An emptied list MUST show the `No calls` placeholder (Clarification 3), with nav, tab bar and segmented control intact.
- **FR-008**: While editing, tab-bar activation MUST be inert (no navigation, no stub switch; Clarification 4).
- **FR-009**: The `All | Missed` segmented control MUST remain as implemented in feature 004 (static, `All` active, non-actionable) in and out of edit mode.
- **FR-010**: Normal (non-edit) mode MUST remain byte-identical to feature 004 (header `Edit` + segmented + `+ new call`, info buttons, working tab navigation), aside from the working list having been mutated by edit-mode actions.
- **FR-011**: The working list MUST be the page-owned, in-memory copy seeded from the feature-004 `CALL_SEED`; no backend or persistence.

### Key Entities

- **CallEntry** (unchanged from 004): id, contactName, direction (`incoming | outgoing | missed`), date, avatarRef.
- **Edit state**: `editMode` (page signal) toggled by `Edit`/`Done`; `items` = mutable working copy of the seed.
- **NavAction.disabled** (extended): optional `boolean` so the shared nav bar can render a disabled action (`Clear` when empty).

## Contract

### Inputs

| Field | Type | Required | Constraints |
| ----- | ---- | -------- | ----------- |
| `calls` | `CallEntry[]` | Yes | Static `CALL_SEED` (12 rows, same as 004) |
| `editMode` (page state) | `boolean` | - | toggled by `Edit`/`Done` |
| `items` (page state) | `CallEntry[]` | - | working copy; mutations only in-memory |

### Outputs

| Field | Type | Constraints |
| ----- | ---- | ----------- |
| Header | view | `Edit` + segmented + `+ new call` (normal) / `Done` + segmented + `Clear` (edit) per FR-001/002/006/009 |
| Row | view | red minus circle + shifted content + no info button in edit mode; feature-004 rendering in normal mode (FR-003/004) |
| List | view | working copy updated by minus/`Clear`; `No calls` placeholder when empty (FR-005-007) |
| Chrome | view | tab bar stays visible with `Calls` active; switches inert while editing (FR-008) |

### Errors

| Condition | Behaviour |
| --------- | --------- |
| All rows removed | `No calls` empty state; nav (incl. disabled `Clear`) + tab bar remain (FR-006/007) |
| `Clear` activated with 0 rows | impossible - button disabled (FR-006) |

## Behaviour

1. **Given** `/calls`, **When** `Edit` is activated, **Then** header flips to `Done` + `Clear`, rows gain minus circles, info buttons hide, tab switches become inert.
2. **Given** edit mode, **When** a row's minus is activated, **Then** that row vanishes; otherwise the list is unchanged.
3. **Given** edit mode, **When** `Clear` is activated, **Then** all rows vanish and `No calls` + disabled `Clear` render.
4. **Given** edit mode with a non-empty list, **When** `Done` is activated, **Then** feature-004 normal mode returns with the current working list.
5. **Given** edit mode, **When** any tab is activated, **Then** nothing happens.
6. **Given** keyboard focus, **When** tabbing through nav actions, minus circles and (normal mode) info buttons, **Then** visible focus indicators show.

## Constraints

- MUST NOT add backend, persistence, undo, swipe gestures, or a bottom action bar (none exists in Figma `0:8597`).
- MUST NOT make the segmented control interactive (feature-004 decision carries over; FR-009).
- MUST keep all feature-004 behaviour, routes and renderings intact outside edit mode (FR-010).
- MUST NOT introduce new UI frameworks/libraries or raster assets; the red minus is an inline SVG (path re-exported from Figma `0:8606`, stored under `tests/e2e/golden/`).
- MUST NOT hard-code Figma credentials in the repo.
- MUST extend existing components (`CallListItem` gains `editMode` + `remove`; `NavigationBar` + `NavAction` gain `disabled`) rather than fork them.

## Validation Targets

### Unit (Karma/Jasmine)
- `CallListItem` renders the red minus circle in `editMode` (class `--edit`, shifted content, no info button), `aria-label = "Remove call for <name>"`, emits `remove` once and does not bubble; normal mode unchanged.
- `NavigationBar` renders a disabled action (native `disabled`, no emission, `#C7C7CC`) for items with `disabled: true`.
- `CallsPage`: `Edit` enters edit mode (`Done`/`Clear` header), `Done` exits to the 004 header; row minus removes exactly that row; `Clear` empties the list; `Clear` disabled at 0 rows; `No calls` empty state; row-body activation no-op while editing; tab select inert while editing and working after `Done`.

### E2E / Visual (Playwright)
- `/calls` -> `Edit` -> asserts `Done`, `Clear`, 12 minus circles, no info buttons, tab bar present with `Calls` active.
- Tab inertness: while editing, activating `Status`/`Chats` does not navigate or swap the stub.
- Minus tap removes one row (count 11); `Clear` empties (count 0); `No calls` placeholder and disabled `Clear` then render; `Done` restores normal mode with the reduced list.
- Screenshot comparison vs golden `0-8597-calls-edit.png` (375x812) in the default edit state (nothing removed), with a documented `maxDiffPixelRatio`.
- Responsive: no horizontal overflow in `/calls` edit mode at existing breakpoints.
- Focus: minus circles + nav actions show visible rings.

### Definition of Done
- Spec, plan, tasks approved; clarifications resolved.
- All unit + E2E validation targets pass.
- Playwright visual check recorded (golden vs `0:8597`; documented drift).
- Existing feature-004 tests updated only for the `Edit` no-op -> edit-mode behaviour change (see `tasks.md` swap list).
- Design-map row 005 marked implemented.