# Feature Specification: WhatsApp Status — Feed

**Feature Branch**: `006-status`

**Created**: 2026-09-23

**Status**: Implemented (US1-US3 validated, 2026-09-23)

**Input**: Figma design analysis -> design-map row 6, node `0:8498`

---

## Summary

The Status screen presents the user's own status entry as a single "My Status" row (avatar,
badge, name, *Add to my status* subtitle, and trailing camera/pencil circles) above a tip that
reads *No recent updates to show right now.* The frame has no friend statuses, no FAB, and no
bottom action bar. The navigation bar shows a leading **Privacy** action and a centred
**Status** title with no trailing action. The tab bar keeps the shared feature-001 order with
**Status** active.

## Owner Clarifications (2026-09-23, all confirmed)

1. **Privacy** (nav) renders as a button but no-ops for now (Settings/Privacy is a later feature).
2. **Camera + pencil** circles on the My Status row render as focusable buttons but no-op for now
   (Status compose is a later feature).
3. **My Status avatar** renders the initials placeholder (consistent with features 001-005 photo
   drift); the golden slack absorbs it.
4. **Feed content** is exactly the frame: the My Status row + the tip. No seeded friend statuses.
5. **Tab routing**: the Status tab navigates to `/status` from Chats/Calls. Camera/Settings keep
   the "coming soon" stub. The shared tab-bar physical order stays feature-001
   (`Settings - Chats - Camera - Calls - Status`), so Status is active but appears rightmost —
   a recorded drift vs the frame (which physically draws Status first).

## Functional Requirements

- **FR-001**: `/status` renders the shared shell chrome (status bar, navigation bar, tab bar,
  home indicator) and a screen body with background `#EFEFF4`.
- **FR-002**: The navigation bar shows a centred title `Status` (semibold) and a single leading
  action `Privacy` (#007AFF, regular). There is NO trailing action.
- **FR-003**: The My Status row renders a 58px initials avatar, a decorative 20px `+` badge on the
  avatar's bottom-right corner, the name `My Status` (16/600), and the subtitle
  `Add to my status` (14/400, `#8E8E93`).
- **FR-004**: The row's two trailing circles render as focusable buttons with visible focus
  indicators and descriptive aria-labels; both no-op (Clarification 2).
- **FR-005**: The nav `Privacy` button no-ops (Clarification 1).
- **FR-006**: Activating the My Status row body no-ops.
- **FR-007**: On `/status`, the tab bar highlights `Status`; `Chats` navigates to `/chats`; `Calls`
  navigates to `/calls`; `Camera` and `Settings` render the existing "coming soon" stub.
- **FR-008**: From `/chats` and `/calls`, activating the `Status` tab navigates to `/status`
  (Clarification 5); Camera/Settings remain stubs there; existing edit-mode tab guards are
  unchanged.
- **FR-009**: The Status screen MUST NOT render a FAB.
- **FR-010**: The tip `No recent updates to show right now.` is always visible below the My
  Status row (Clarification 4).

## Non-Goals (later features)

- Status compose / camera / text edit (Figma `0:9634`, design-map row 7).
- Friend/recent statuses list with avatars and progress rings.
- Privacy settings (Figma `0:9198`+ , design-map row 13).

## User Stories

- **US1 (chrome + feed)**: As a user I land on `/status` and see the shell chrome, the
  `Privacy` action with the centred `Status` title, the My Status row with badge/name/subtitle
  and trailing circles, and the no-recent-updates tip. No FAB.
- **US2 (routing + no-ops)**: Activating `Privacy`, the camera circle, the pencil circle, or the
  row body does nothing. The `Status` tab is active; `Chats`/`Calls` navigate; `Camera`/`Settings`
  show the stub. From Chats/Calls the `Status` tab now lands on `/status`.
- **US3 (a11y, focus, responsive, golden)**: All buttons/rows expose names; keyboard focus shows a
  visible indicator; no horizontal overflow at any breakpoint; the screen matches the Figma render
  within the measured golden threshold.

## Acceptance Criteria (validation targets)

1. Unit: `StatusPage` renders chrome + My Status row + tip; tab computation highlights Status;
   Chats/Calls navigate; Camera/Settings stub; Privacy/camera/note/row no-op. `ChatsPage` /
   `CallsPage` "Status tab" unit tests remapped to `/status` navigation. Full suite green.
2. E2E `tests/e2e/status.spec.ts`: US1 chrome/feed, US2 routing/no-ops, US3 focus + golden
   `0-8498-status.png` at 375x812.
3. Responsive: `/status` no-overflow appended to `tests/e2e/responsive.spec.ts`.
4. `figma/design-map.md` row 6 spec column set to `006`; spec status Implemented after closure.