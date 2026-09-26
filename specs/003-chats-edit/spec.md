# Feature Specification: WhatsApp Chat List — Edit Mode

**Feature Branch**: `003-chats-edit`

**Created**: 2026-09-23

**Status**: Implemented — all validation targets pass (2026-09-23)

> **Drift note (F-022, 2026-09-26)**: `Read All` was "control-only no-op" in 003 (no read
> state existed). F-022 introduced `ChatStore` with read state; `Read All` is now functional —
> it marks every conversation read and renders read ticks. Layout/semantics unchanged; see
> `specs/022-messaging-loop/spec.md` deviations.

**Input**: Figma design analysis → design-map row 3, node `0:8114`

## Context

The Chats Edit screen is the Chats list with **edit mode active**: every row gains a leading selection circle (iOS-style), the trailing nav action flips from `Edit` to `Done` (`#007AFF`), the FAB disappears, and a bottom **Chat Actions** bar (`Archive · Read All · Delete`, `#F6F6F6` with hairline shadow, labels `#C7C7CC`) replaces the tab bar. The 8 chat rows, separators, wallpaper, status bar and home indicator are identical to the base Chats screen (feature 001).

This feature wires the existing (001) `Edit` nav action into a fully interactive **edit mode** on `/chats`: enter/exit (`Edit` ↔ `Done`), per-row selection, and in-memory actions over a copy of the static seed (`ChatPreview[]`). No backend, no persistence.

## Figma Reference

| Item | Value |
| ---- | ----- |
| Figma file | WhatsApp UI Screens (Community) — `PcGX72lSWkYIk3pL5V8PS3` |
| Page / Canvas | `WhatsApp` (`0:8102`) |
| Frame | `WhatsApp Chats Edit` — `0:8114` (API form) / `0-8114` (URL form) |
| Frame size | 375 × 812 |
| Figma source | [open in Figma](https://www.figma.com/design/PcGX72lSWkYIk3pL5V8PS3/WhatsApp-UI-Screens--Community-?node-id=0-8114&p=f) |

## User Scenarios & Testing

### User Story 1 — Enter / exit edit mode (Priority: P1)

As a user I can flip the Chats list into edit mode (selection circles + action bar) and back to the normal list.

**Why this priority**: the whole screen is a mode of the existing list; entry/exit is the primary interaction.

**Independent Test**: On `/chats`, activating `Edit` shows `Done`, 21px selection circles on every row, the `Archive · Read All · Delete` bar, no FAB and no tab bar; activating `Done` restores `Broadcast Lists · New Group` leading actions, `Edit`, the FAB and the tab bar.

**Acceptance Scenarios**:

1. **Given** the Chats list, **When** I activate the trailing `Edit` action, **Then** edit mode renders: trailing action becomes `Done`, each row shows a leading selection circle (21px ring, `#3C3C43`, 42% opacity), the Chat Actions bar replaces the tab bar, and the FAB is hidden.
2. **Given** edit mode, **When** I activate `Done`, **Then** selection circles disappear, `Edit` returns, and the tab bar + FAB are restored (normal mode exactly as feature 001).
3. **Given** edit mode with no selection, **When** I inspect the Chat Actions bar, **Then** `Archive`, `Read All` and `Delete` render on `#F6F6F6` in `#C7C7CC` (disabled, non-actionable).

### User Story 2 — Select rows in edit mode (Priority: P1)

As a user I can select/deselect chats via the row or its circle, mirroring iOS.

**Why this priority**: selection drives every action in US3.

**Independent Test**: Rows expose checkbox semantics (`role="checkbox"`, `aria-checked`). Activating a row toggles its state; the circle renders blank ring when unselected and a filled `#007AFF` ring with a white check when selected.

**Acceptance Scenarios**:

1. **Given** edit mode, **When** I activate a row (or its circle), **Then** the row toggles to selected (filled accent ring + white check) and does **not** navigate.
2. **Given** a selected row, **When** I activate it again, **Then** it deselects.
3. **Given** ≥1 selected row, **When** I inspect the Chat Actions bar, **Then** `Archive`/`Read All` become `#007AFF` and `Delete` becomes `#FF3B30`; all three are actionable.

### User Story 3 — Chat actions (Priority: P2)

As a user I can archive or delete the selected chats and exit with the list updated in-memory.

**Why this priority**: completes the mode with a visible, testable effect; Read All is a control-only no-op (per owner decision, no read state exists in 001).

**Independent Test**: Selecting rows then activating `Delete` or `Archive` removes exactly those rows: the visible list shrinks and the selection clears; `Read All` leaves the list unchanged.

**Acceptance Scenarios**:

1. **Given** selected rows, **When** I activate `Delete`, **Then** the selected chats are removed from the list and the selection clears (`No chats` empty state when the list empties).
2. **Given** selected rows, **When** I activate `Archive`, **Then** the selected chats are removed from the list (archived view is out of scope) and the selection clears.
3. **Given** selected rows, **When** I activate `Read All`, **Then** the list is unchanged (control-only no-op, owner decision).
4. **Given** the list emptied via actions, **When** the list renders, **Then** the existing `No chats` empty state shows; `Edit`/`Done` and the action bar remain visible.

## Clarifications — Decisions Recorded (2026-09-23)

| # | Ambiguity | Decision |
| - | --------- | -------- |
| 1 | Entry point | **Established**: the feature-001 `Edit` trailing action enters edit mode; `Done` exits. Figma shows only the edit state (`Done` already rendered) |
| 2 | Selected-circle visual | **Approved**: 21px circle — unselected = Figma ring (`#3C3C43` stroke 1.5px @ 42%); selected = solid `#007AFF` with white check (iOS standard; not in Figma) |
| 3 | Selection interaction | **Approved**: in edit mode activating the row **or** its circle toggles selection; row no longer navigates. Content shifts right so avatar stays at the Figma offset (circle occupies the 16px gutter) |
| 4 | Action semantics | **Approved**: `Delete` and `Archive` remove the selected rows from the in-memory list (visible + testable); `Read All` is a focusable no-op (001 renders no read/unread state) |
| 5 | Enabled / disabled styling | **Approved**: 0 selected → all three `#C7C7CC` disabled (matches Figma); ≥1 selected → `Archive`/`Read All` `#007AFF`, `Delete` `#FF3B30`, enabled |
| 6 | Empty list in edit mode | **Approved**: reuse the existing `No chats` placeholder; nav + action bar stay visible |
| 7 | Chat Actions bar geometry | **Established**: Figma bar is 83px tall but the bottom 34px sits under the `HomeIndicator` sibling, exactly like feature 002's composer → visible band `49px` (= `--wa-tab-bar-height`), recorded shell drift |

## Requirements

### Functional Requirements

- **FR-001**: The trailing nav action MUST alternate `Edit` ↔ `Done`; both at `#007AFF` (existing nav style).
- **FR-002**: In edit mode, EVERY chat row MUST render a leading 21px selection circle at the Figma offset (16px gutter; row content shifted so the avatar sits at ~55px like Figma `0:8114`).
- **FR-003**: Rows in edit mode MUST use checkbox semantics (`role="checkbox"` + `aria-checked`) and toggle selection on activation instead of navigating.
- **FR-004**: Selected circles MUST render solid `#007AFF` + white check; unselected the Figma ring (`#3C3C43` 1.5px @ 42%) (Clarification 2).
- **FR-005**: In edit mode the FAB and tab bar MUST be replaced by the Chat Actions bar (`#F6F6F6`, hairline top shadow, visible `49px`) with `Archive`, `Read All`, `Delete` (Clarification 7).
- **FR-006**: Action bar state MUST follow Clarification 5 (disabled `#C7C7CC` at 0 selected; `#007AFF`/`#FF3B30` enabled at ≥1 selected).
- **FR-007**: `Delete` and `Archive` MUST remove the selected rows from the in-memory list and clear selection; `Read All` MUST be a no-op (Clarification 4).
- **FR-008**: An emptied list MUST show the existing `No chats` empty state, with nav and action bar intact (Clarification 6).
- **FR-009**: Normal (non-edit) mode MUST remain visually identical to feature 001 (tab bar, FAB, `Edit`, no circles).

### Key Entities

- **ChatPreview** (unchanged from 001): id, contactName, preview, timestamp, avatarRef.
- **Selection**: `Set<ChatPreview['id']>` managed by the page.
- **ChatAction**: key `archive | read-all | delete`, label, disabled state, color.

## Contract

### Inputs

| Field | Type | Required | Constraints |
| ----- | ---- | -------- | ----------- |
| `conversations` | `ChatPreview[]` | Yes | Static seed (001); page owns a mutable working copy |
| `editMode` (page state) | `boolean` | — | toggled by `Edit`/`Done` |
| `selection` (page state) | `Set<string>` | — | selected row ids |

### Outputs

| Field | Type | Constraints |
| ----- | ---- | ----------- |
| Row | view | circle (`#007AFF`+check / Figma ring) + checkbox semantics in edit mode; 001 rendering in normal mode |
| Chat Actions bar | view | `Archive · Read All · Delete` per FR-005/006 |
| Nav | view | `Edit` ↔ `Done`; leading actions unchanged |
| List | view | working copy updated by actions; empty state on empty |

### Errors

| Condition | Behaviour |
| --------- | --------- |
| All rows removed | `No chats` empty state; nav + action bar remain (FR-008) |
| Action activated with 0 selected | impossible — buttons disabled (FR-006) |

## Behaviour

1. **Given** `/chats`, **When** `Edit` is activated, **Then** circles + action bar render, FAB/tab bar hide, selection is empty.
2. **Given** edit mode, **When** a row is activated, **Then** it toggles selected; row navigation is suspended.
3. **Given** edit mode with ≥1 selection, **When** the circle is inspected, **Then** filled accent + check; activation toggles off.
4. **Given** a selection, **When** `Delete`/`Archive` is activated, **Then** the listed rows vanish and selection clears; bar returns to disabled gray.
5. **Given** a selection, **When** `Read All` is activated, **Then** the list is unchanged.
6. **Given** edit mode, **When** `Done` is activated, **Then** 001 normal mode is restored.
7. **Given** keyboard focus, **When** tabbing through circles and action bar, **Then** visible focus indicators show.

## Constraints

- MUST NOT add unread/read state to rows, backend, persistence, archived screen, undo, or multi-select key handling (shift/cmd).
- MUST NOT route anything new; actions mutate a local, in-memory copy only.
- MUST keep 001 behaviour/routes intact outside edit mode (FR-009).
- MUST NOT introduce new UI frameworks/libraries or assets beyond existing Angular + Material + SCSS.
- MUST NOT hard-code Figma credentials in the repo.
- MUST keep the selection circle and action-bar substitutions on the existing component contracts where possible (`ChatListItem` gains `selectMode`/`checked` inputs; new `ChatActionsBar` component).

## Validation Targets

### Unit (Karma/Jasmine)
- `ChatActionsBar` renders three labels; disabled at `selectedCount=0` (no emissions), enabled + colored (Archive/Read All `#007AFF`, Delete `#FF3B30`) at ≥1; emits `archive`/`readAll`/`delete`.
- `ChatListItem` renders checkbox semantics + circle in `selectMode`; `aria-checked` reflects input; activation emits once.
- `ChatsPage` enters/exits edit mode via nav; selection toggles per row; Delete/Archive shrink the seeded list and clear selection; Read All no-op; empty list shows `No chats`; normal mode untouched.

### E2E / Visual (Playwright)
- `/` → `Edit` → asserts `Done`, circles (seed count), action bar, no FAB/tab bar; `Done` restores them.
- Selection toggles via row and circle; `aria-checked` correct.
- Archive removes 1 / Delete removes 2; Read All is a no-op; all-deleted → `No chats`.
- Keyboard-focus ring through circles + action bar.
- Screenshot comparison vs golden `0-8114-chats-edit.png` (Figma render, 375×812) in default (nothing selected) edit state.
- Responsive: no horizontal overflow in edit mode at existing breakpoints.

### Definition of Done
- Spec, plan, tasks approved; clarifications resolved.
- All unit + E2E validation targets pass.
- Playwright visual check recorded (golden vs `0:8114`; documented drift).
- Design-map `003` row marked implemented.