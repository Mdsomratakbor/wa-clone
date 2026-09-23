# Feature Specification: WhatsApp Calls Screen

**Feature Branch**: `004-calls`

**Created**: 2026-09-23

**Status**: Implemented — all validation targets pass (2026-09-23)

**Input**: Figma design analysis -> design-map row 4, node `0:10395`

## Context

The Calls screen presents the user's phone-call history as a scrollable list of 12 rows, each showing a 40px contact avatar, the contact name, a call-direction line (arrow glyph + `outgoing` / `incoming` / `missed` label), a right-aligned date, and a trailing blue info button. Missed calls render the contact name in system red `#FF3B30`. The navigation bar carries a leading `Edit` action, a centred `All | Missed` segmented control (static in feature 004), and a trailing `+ new call` icon; there is no screen title. The shell chrome (status bar, tab bar, home indicator) is identical to features 001-003.

This feature also introduces the first real tab-bar navigation: the shared tab bar's `Calls` tab now routes to a dedicated `/calls` screen (reviewing `Chats` navigates the reverse way). The calls list is static seed data mirroring the Figma content; no calling flows exist in scope.

## Figma Reference

| Item | Value |
| ---- | ----- |
| Figma file | WhatsApp UI Screens (Community) - `PcGX72lSWkYIk3pL5V8PS3` |
| Page / Canvas | `WhatsApp` (`0:8102`) |
| Frame | `WhatsApp Calls` - `0:10395` (API form) / `0-10395` (URL form) |
| Frame size | 375 x 812 |
| Figma source | [open in Figma](https://www.figma.com/design/PcGX72lSWkYIk3pL5V8PS3/WhatsApp-UI-Screens--Community-?node-id=0-10395&p=f) |
| Golden | `tests/e2e/golden/0-10395-calls.png` (Figma render, 375x812) |

## User Scenarios & Testing

### User Story 1 - Calls list renders the seeded history (Priority: P1)

As a user I can open the Calls screen and read my call history.

**Why this priority**: the list is the whole screen; every other story depends on it.

**Independent Test**: On `/calls` the list renders exactly the 12 seeded calls (name, direction label, date), each row with a 40px avatar, an arrow glyph, and a blue info button; missed rows render the name in `#FF3B30`.

**Acceptance Scenarios**:

1. **Given** the Calls screen, **When** the list renders, **Then** exactly 12 rows appear in the Figma order (newest `10/13/19` first to oldest `8/20/19` last).
2. **Given** any call row, **When** I inspect it, **Then** it shows the contact name (16px/400 `#000000`), the direction line (15px arrow glyph + 14px `outgoing`/`incoming`/`missed` label, both `#8E8E93`), the date (14px `#8E8E93`, right-aligned), a 40px avatar, and a 22px `#007AFF` info button.
3. **Given** a missed call row (Karen Castillo `9/30/19`, Jamie Franco `8/20/19`), **When** I inspect the name, **Then** it renders in `#FF3B30`.
4. **Given** the screen background, **When** the list scrolls under the fixed nav and tab bars, **Then** rows scroll beneath them with the tab bar never obstructed.
5. **Given** no selection controls, **When** I inspect the screen, **Then** there is no FAB and no edit-mode circle on the Calls screen (FAB exists only on Chats screens).

### User Story 2 - Calls chrome and navigation (Priority: P1)

As a user I can reach the Calls screen from the tab bar and return to Chats.

**Why this priority**: establishes the first working tab route across the app shell.

**Independent Test**: On `/chats` activating the `Calls` tab navigates to `/calls`; on `/calls` the tab bar renders with `Calls` active (`#007AFF`, `aria-selected` true) and activating `Chats` navigates back to `/chats`. Other tabs retain the existing "coming soon" stub behaviour.

**Acceptance Scenarios**:

1. **Given** the Chats screen, **When** I activate the `Calls` tab, **Then** the URL becomes `/calls` and the Calls list renders.
2. **Given** the Calls screen, **When** I activate the `Chats` tab, **Then** the URL becomes `/chats` (the shipped Chats list).
3. **Given** the Calls screen, **When** I activate `Status`/`Camera`/`Settings`, **Then** the existing "coming soon" stub replaces the list, exactly as on the Chats screen.
4. **Given** the Calls screen, **When** I inspect the tab bar, **Then** `Calls` is the active tab (accent colour) and the bar matches features 001-003.

### User Story 3 - Static controls (Priority: P2)

As a user I can read every control of the Calls header without triggering flows that are out of scope.

**Why this priority**: the header shape (`Edit` left, segmented control centre, `+ new call` right) is part of the visual contract; the actions themselves are later features.

**Independent Test**: The header renders `Edit` (`#007AFF`, leading), the `All | Missed` segmented control (`All` active), and a `#007AFF` phone-plus icon (trailing); all three are visible and focusable, and activating any of them produces no navigation or state change (control-only no-ops).

**Acceptance Scenarios**:

1. **Given** the Calls screen, **When** I inspect the navigation bar, **Then** the leading action is `Edit`, the centre holds the 151x28 `All | Missed` segmented control (`All` = white-on-blue active, `Missed` = blue-on-white inactive) and there is no screen title; the trailing slot holds a 24px `+ new call` icon.
2. **Given** the `All | Missed` control, **When** I inspect it, **Then** it renders `All` active exactly as Figma's default state (Clarification 2: static, no filtering).
3. **Given** the Calls screen, **When** I activate `Edit`, the `+ new call` icon, a row, or the info button, **Then** nothing happens (no-ops; Clarification 3).

## Clarifications - Decisions Recorded (2026-09-23)

| # | Ambiguity | Decision |
| - | --------- | -------- |
| 1 | Tab-bar order mismatch between frames | **Approved**: keep the feature-001 order `Settings - Chats - Camera - Calls - Status` everywhere. The Calls frame (`0:10395`) physically orders `Status - Calls - Camera - Chats - Settings` (Calls 2nd); a shared tab bar cannot satisfy both screens. The requirements frame order is recorded as design-file drift (see `data-model.md`) |
| 2 | `All | Missed` segmented control | **Approved**: render only, no filtering. `All` is the active state (matches Figma's default); `Missed` and the segments are non-actionable. Filter behaviour is deferred out of scope |
| 3 | Action semantics | **Approved**: all controls are no-ops in 004 - `Edit` (leading) is feature 005 (Calls edit) scope; `+ new call` (trailing icon), row activation, and the info button are later calling-flow scope. Matches the `Broadcast Lists` / `Read All` no-op precedent (focusable, no effect) |
| 4 | Avatar source | **Established**: the Figma rows embed photo avatars (imageRefs). The app renders `UserAvatar` initials fallback (`avatarRef: null`), the drift already approved in feature 001 |
| 5 | `Edit` position | **Established**: on the Calls screen `Edit` renders **leading** (left, x16) - opposite of Chats where it is trailing. The trailing slot holds the `+ new call` icon instead |
| 6 | No screen title | **Established**: the Calls frame has no title text (feature 001's `Chats` title is absent); the segmented control occupies the title band |

## Requirements

### Functional Requirements

- **FR-001**: A new route `/calls` MUST render the Calls page; the route registration MUST follow the existing lazy-load pattern.
- **FR-002**: The tab bar's `Calls` tab (feature-001 order) MUST navigate to `/calls`; the `Chats` tab on the Calls page MUST navigate back to `/chats` (Clarification 1).
- **FR-003**: The calls list MUST render exactly the 12 seeded `CallEntry` rows in Figma order (newest date first).
- **FR-004**: Each row MUST render: 40px avatar, name (16px/400 `#000000`; `#FF3B30` when missed), a 15px arrow glyph + direction label (`outgoing`/`incoming`/`missed`, 14px `#8E8E93`), a right-aligned 14px `#8E8E93` date, and a 22px `#007AFF` info button (Clarification 4).
- **FR-005**: Rows MUST expose row-level button semantics (`role="button"`, `aria-label` = name + direction + date, keyboard Enter/Space activate) and the info button MUST be a focused button labelled "Call info for <name>" (Clarification 3 no-ops).
- **FR-006**: The nav bar on `/calls` MUST render: leading `Edit`, centred 151x28 `All | Missed` segmented control (`All` active, white-on-`#007AFF`; `Missed` inactive, `#007AFF` on white; border `rgba(0,122,255,0.756)` radius 8), trailing 24px `+ new call` icon (`#007AFF`), and NO title (Clarifications 5-6).
- **FR-007**: The `All | Missed` control MUST be non-actionable (static render per Clarification 2).
- **FR-008**: `Edit`, `+ new call`, row activation, and the info button MUST be no-ops (Clarification 3).
- **FR-009**: On `/calls`, selecting `Status`/`Camera`/`Settings` MUST render the existing "coming soon" stub; selecting `Calls` stays (no-op).
- **FR-010**: The Calls screen MUST NOT render a FAB; the background, status bar, and home indicator MUST match the app shell from features 001-003.

### Key Entities

- **CallEntry**: id, contactName, direction (`incoming | outgoing | missed`), date, avatarRef.
- **CallDirection**: `'incoming' | 'outgoing' | 'missed'`; missed rows derive name colour.
- **`NavAction.icon`** (extended): optional `'new-call'` key so the shared nav bar can render the icon-only trailing action.

## Contract

### Inputs

| Field | Type | Required | Constraints |
| ----- | ---- | -------- | ----------- |
| `calls` | `CallEntry[]` | Yes | Static `CALL_SEED` (12 rows) |
| `activeTab` (page state) | `TabKey` | - | defaults `'calls'` |

### Outputs

| Field | Type | Constraints |
| ----- | ---- | ----------- |
| List | view | 12 `CallEntry` rows per FR-003/004, scrollable under fixed chrome |
| Header | view | `Edit` + segmented control + `+ new call` per FR-006/007 |
| Chrome | view | tab bar (`Calls` active) + app shell chrome per FR-002/010 |
| Stub | view | non-chats/calls tabs render the existing placeholder |

### Errors

| Condition | Behaviour |
| --------- | --------- |
| Activating a no-op control | no state change, no navigation (FR-008) |

## Behaviour

1. **Given** `/chats`, **When** `Calls` tab activated, **Then** navigate to `/calls` with `Calls` tab active.
2. **Given** `/calls`, **When** `Chats` tab activated, **Then** navigate to `/chats`.
3. **Given** `/calls`, **When** `Status`/`Camera`/`Settings` activated, **Then** the stub placeholder replaces the list (existing behaviour).
4. **Given** `/calls`, **When** `Edit`, `+ new call`, a row, or an info button activated, **Then** nothing happens.
5. **Given** missed rows, **When** the list renders, **Then** names render `#FF3B30`.

## Constraints

- MUST NOT add calling flows, dialogs, toasts, filters, edit mode, backend, or persistence (Clarifications 2-3).
- MUST keep the feature-001 tab-bar order (`Settings - Chats - Camera - Calls - Status`) and the shipped Chats screen byte-identical (Clarification 1).
- MUST NOT add new UI frameworks/libraries or raster assets; icons are inline SVG (glyph paths exported from Figma, existing convention).
- MUST NOT hard-code Figma credentials in the repo (tokens live only in `.env`, gitignored).
- MUST extend existing components (`NavigationBar`, `UserAvatar`, `TabBar`) rather than fork them; `CallListItem` is a new shared component (reused by feature 005).

## Validation Targets

### Unit (Karma/Jasmine)
- `CallListItem` renders name/date/direction + glyph + info button; missed rows apply the `#FF3B30` name class; activation emits once; info emits and does not activate the row; button semantics correct.
- `NavigationBar` renders no `<h1>` when `title` is empty, projects `[data-nav-center]` content, and renders an icon-only action (`new-call`) as a labelled button.
- `CallsPage` renders 12 seeded rows; `Calls` tab active; `Chats` tab navigates to `/chats`; `Status`/`Camera`/`Settings` show the stub; `Edit`/`+ new call` are no-ops; no FAB.
- `ChatsPage` `Calls` tab navigates to `/calls` (existing tests otherwise unchanged).

### E2E / Visual (Playwright)
- `/calls` asserts 12 rows (names/dates/labels), header (`Edit`, segmented control, `+ new call`), tab bar with `Calls` active, no FAB.
- Navigation: `/chats` -> `Calls` tab -> `/calls`; `/calls` -> `Chats` tab -> `/chats`.
- Missed rows verify the red name colour.
- Screenshot comparison vs golden `0-10395-calls.png` (375x812) with a documented `maxDiffPixelRatio` (photo avatars in the render vs initials in the app inflate the baseline).
- Responsive: no horizontal overflow on `/calls` at existing breakpoints.

### Definition of Done
- Spec, plan, tasks approved; clarifications resolved.
- All unit + E2E validation targets pass.
- Playwright visual check recorded (golden vs `0:10395`; documented drift).
- Design-map row 004 marked implemented.