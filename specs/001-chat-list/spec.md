# Feature Specification: WhatsApp Chats — Chat List

**Feature Branch**: `001-chat-list`

**Created**: 2026-09-23

**Status**: Clarified — ready for `/speckit.plan` (pending owner approval)

**Input**: Figma design analysis → recommended first feature (design-map row 1, node `0:8855`)

## Context

The Chat List is the primary landing screen of the WhatsApp UI. It presents the user's conversations as a scrollable list, each row showing a contact avatar, name, latest message preview, and a timestamp. A navigation bar provides the `Edit` action and entry points to `Broadcast Lists` / `New Group`; a tab bar at the bottom provides top-level navigation (Settings · Chats · Camera · Calls · Status); a floating `Actions` button opens the New Chat flow.

This feature reproduces the **static visual and interaction structure** of the design. It is the smallest useful slice because it exercises the core layout shell (nav bar, tab bar, list, FAB) that every other screen reuses, and it gives visual-validatable value in isolation.

## Figma Reference

| Item | Value |
| ---- | ----- |
| Figma file | WhatsApp UI Screens (Community) — `PcGX72lSWkYIk3pL5V8PS3` |
| Page / Canvas | `WhatsApp` (`0:8102`) |
| Frame | `WhatsApp Chats` — `0:8855` (API form) / `0-8855` (URL form) |
| Frame size | 375 × 812 |
| Related frames | `WhatsApp Chats Edit` (`0:8114`) — selection/edit mode (out of scope for F-001) |
| Figma source | [open in Figma](https://www.figma.com/design/PcGX72lSWkYIk3pL5V8PS3/WhatsApp-UI-Screens--Community-?node-id=0-8855&p=f) |

## User Scenarios & Testing

### User Story 1 — Browse my chat list (Priority: P1)

As a user I can see my conversations, each with a contact name, last-message preview and timestamp, so I can quickly identify who I was last talking to.

**Why this priority**: This is the entire purpose of the screen; everything else is chrome around it.

**Independent Test**: Can be fully tested by rendering the Chat List and verifying all rows display their name, preview and time in the designed layout.

**Acceptance Scenarios**:

1. **Given** the app has loaded with 9 seeded conversations, **When** I open the Chats screen, **Then** all 9 conversation rows are visible with avatar, name, preview text, and timestamp.
2. **Given** a conversation preview text is longer than one line, **When** the row renders, **Then** the preview is truncated with ellipsis per the Figma line height (14px/400).
3. **Given** the list is taller than the viewport, **When** I scroll, **Then** the navigation bar and tab bar remain fixed and the list scrolls beneath them.

### User Story 2 — Use the top-level navigation (Priority: P2)

As a user I can switch between Settings, Chats, Camera, Calls and Status using the tab bar, with the active tab highlighted.

**Why this priority**: Provides the app shell; Chats is the active (default) tab.

**Independent Test**: Switching tabs updates an observable active state and renders the placeholder content of the selected tab.

**Acceptance Scenarios**:

1. **Given** the Chats screen, **When** I activate the Calls tab, **Then** the Calls tab becomes active/in accent color and the Chats tab returns to inactive styling.
2. **Given** any tab is selected, **When** I re-open the app, **Then** Chats is the default active tab.

### User Story 3 — Access Chat-list header actions (Priority: P3)

As a user I can reach the `Edit`, `Broadcast Lists`, and `New Group` actions from the navigation bar.

**Why this priority**: Interactive surface for future flows (edit mode, new chat) that are their own features.

**Independent Test**: Header actions are rendered with the Figma typography/color and are keyboard-focusable.

**Acceptance Scenarios**:

1. **Given** the Chats screen, **When** I inspect the navigation bar, **Then** `Edit` (trailing) and `Broadcast Lists` / `New Group` (leading area) are present and styled per Figma (`17px/400`, `#007AFF`).
2. **Given** the FAB (`Actions`), **When** I focus or press it, **Then** it responds to focus/keyboard affordance (see Constraints; no navigation wiring in F-001).

### Edge Cases

- Zero conversations: the list area renders a centered "No chats" empty placeholder (owner-approved 2026-09-23; not present in Figma, styling follows accessibility defaults).
- Very long contact names: names must not break layout; ellipsize.
- Unread/muted markers: none required — rows match the Figma design exactly (no badges; owner-approved 2026-09-23).
- Timestamps: static seeded strings reproduced exactly from Figma (`10/30/19`, etc.); not computed from the current date (owner-approved 2026-09-23).

## Clarifications — Decisions Recorded (2026-09-23)

| # | Ambiguity | Decision |
| - | --------- | -------- |
| 1 | Empty-state design | Render an "No chats" empty placeholder; owner-approved, documented in Edge Cases |
| 2 | Unread/mute badges | None — match Figma exactly |
| 3 | Timestamps | Static seed data replicating Figma strings |
| 4 | Responsive scope | **Responsive adaptation required** — define breakpoints/desktop–tablet layouts in `plan.md` (no Figma source). This is an explicit, owner-approved deviation from the design file, tracked as approved drift |
| 5 | Tab-bar behavior | Active-state toggling only; non-chats tabs show a "coming soon" stub — no routing shell in 001 |
| 6 | Design tokens | Use node-extracted tokens from `figma/design-analysis.md` (variables API unavailable; no additional credentials) |

## Requirements

### Functional Requirements

- **FR-001**: System MUST render a scrollable list of chat rows, one per conversation.
- **FR-002**: Each chat row MUST display a contact avatar, contact name, message preview, and a timestamp, matching the Figma node values (name `16/600`, preview & time `14/400`, secondary color `#8E8E93`).
- **FR-003**: System MUST include a navigation bar with title `Chats` (`17/600 #000000`), trailing `Edit` action, and leading `Broadcast Lists` / `New Group` actions (`17/400 #007AFF`).
- **FR-004**: System MUST include a 5-item tab bar (Settings, Chats, Camera, Calls, Status) with the active tab in accent `#007AFF` and inactive tabs in `#545458`.
- **FR-005**: System MUST include a floating `Actions` button matching the design.
- **FR-006**: System MUST render screen background `#EFEFF4` with the iOS status bar (`9:41`) and home indicator as per the Figma frame.
- **FR-007**: Data MUST be static seed data (no backend). The 9 seeded conversations MUST replicate the Figma contact names/previews/timestamps exactly (owner-approved 2026-09-23).
- **FR-008**: Chats screen MUST be the default route (`/` → chats).
- **FR-009**: When the conversation list is empty, the app MUST display a centered "No chats" empty placeholder.

> **Drift note (F-028, 2026-09-26)**: The Chats tab now hosts a **search bar** (`data-testid="chat-search"`,
> filters by contact name/preview, case-insensitive) and a **sort segment** (Recent/Name/Unread,
> chosen option persisted via `PrefsStore`, `wa.prefs.v1` v2). A no-match query shows a distinct
> "No chats found" placeholder; search/sort are hidden in edit mode and on other tabs. See
> `specs/028-chats-search-sort`. G1: the new chrome means the `0-8855` golden needs re-capture
> when Figma/playwright unblock (coarse `0.3` ratio guard may absorb it in the interim).
- **FR-010**: The tab bar MUST expose active-state toggling only in 001; selecting a non-chats tab MUST show a "coming soon" stub. Full routing is a later feature.
- **FR-011**: The UI MUST adapt responsively to viewports wider than 375px per breakpoints defined in `plan.md` (owner-approved adaptation; overrides design-map mobile-only assumption).

### Key Entities

- **ChatPreview**: id, contactName, preview(text), timestamp, avatarRef.
- **TabItem**: key, label, isActive, (future: route/target). Static per Figma.

## Contract

### Inputs

| Field | Type | Required | Constraints |
| ----- | ---- | -------- | ----------- |
| `conversations` | `ChatPreview[]` | Yes | Non-empty at first render; static seed list |
| `activeTab` | `TabKey` | No (defaults `chats`) | `'chats'` is the default |
| `avatarRef` | `string`/token | Yes | Rendered as circle avatar; fallback initials |

### Outputs

| Field | Type | Constraints |
| ----- | ---- | ----------- |
| Rendered Chat List | view | 9 rows at 375px width; scrolling list; fixed nav + tab bars |
| Active tab indicator | view | accent `#007AFF` for active, `#545458` otherwise |
| Header actions | view | `Edit`, `Broadcast Lists`, `New Group` in `17px/400 #007AFF` |

### Errors

| Condition | Behaviour |
| --------- | --------- |
| `conversations` empty | Render the owner-approved "No chats" empty placeholder |
| `avatarRef` image fails to load | Fall back to initials-based avatar (design has no fallback specified — assumption) |
| Long name / preview overflows | Ellipsis truncation, no layout shift |

## Behaviour

1. **Given** the app routes to `/`, **When** the Chat List loads, **Then** the nav bar, list of 9 chat rows, tab bar, and FAB render per Figma (`0:8855`).
2. **Given** the Chat List is rendered, **When** I scroll the list, **Then** only the middle list area scrolls; nav/tab bars stay fixed.
3. **Given** a row's preview text exceeds its line budget, **When** rendered, **Then** it truncates with ellipsis, single/two-line per Figma line heights.
4. **Given** a non-chats tab label, **When** the tab bar renders, **Then** it uses tertiary color `#545458`; the active one uses `#007AFF`.
5. **Given** keyboard focus moving through header actions and FAB, **When** the element is focused, **Then** a visible focus indicator is shown (accent border/outline; design does not define one — accessibility default required).
6. **Given** a tab other than Chats is activated, **When** the user returns to settings landing, **Then** Chats remains the default active tab on initial load (no persisted state in F-001).

## Constraints

- MUST NOT implement chat window, send/back-end messaging, voice/video calls, status posting, camera capture, real authentication, or databases — out of scope.
- MUST NOT persist tab or list state (no local storage, no backend) unless specified.
- MUST NOT render user content with unsafe HTML (`*ng` interpolation only; no `bypassSecurityTrustHtml`).
- MUST NOT introduce new UI frameworks/libraries beyond the existing Angular + Angular Material + SCSS stack without a plan-level justification.
- MUST NOT hard-code Figma credentials or tokens anywhere in the repo.
- MUST keep the implementation static & visual-fidelity-focused; hover/pressed transitions follow accessibility defaults since Figma defines none.
- MUST treat responsive breakpoints as owner-approved design drift: they will be defined in `plan.md` and linked back to this spec; never implemented silently.

## Validation Targets

### Unit (Karma/Jasmine)
- Chat row component renders name, preview, timestamp, avatar from input.
- List renders the seeded collection count correctly.
- Tab bar marks the active tab and toggles CSS classes.
- Avatar falls back to initials when image source is invalid.
- Empty-state placeholder renders when the list is empty.

### E2E / Visual (Playwright)
- Load `/`, assert 9 chat rows visible.
- Assert nav bar title `Chats`, header actions, 5 tab labels, FAB presence.
- Screenshot comparison against Figma render of node `0:8855` (375×812 viewport) for layout/typography/color fidelity checks.
- Keyboard focus is visible when tabbing through the header actions and FAB.
- Responsive check at breakpoints defined in `plan.md` (≥1 viewport wider than 375px) verifying the layout reflows without horizontal overflow.

### Definition of Done
- Spec approved; plan.md and tasks.md approved.
- All unit and E2E validation targets pass.
- Playwright visual check completed and recorded (do not claim pixel match without running it).
- Design-map `001` row marked implemented; drift audited against `0:8855`.

## Assumptions

- Response breakpoints for desktop/tablet are not present in Figma; they will be defined in `plan.md` as owner-approved design drift (decision 2026-09-23).
- F-001 tab bar is active-state only; non-chats tabs render a "coming soon" stub — routed stub screens are separate features.
- The 9 seed conversations mirror the Figma content (names/previews/times) exactly (owner-approved 2026-09-23).
- Static design tokens from `figma/design-analysis.md` (colors, typography) become SCSS custom properties; token file is shared infrastructure approved as part of the plan.