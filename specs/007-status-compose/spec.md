# Feature Specification: WhatsApp Status — Compose

**Feature Branch**: `007-status-compose`

**Created**: 2026-09-23

**Status**: ✅ **Implemented** (US1–US3, full suite green, 2026-09-23)

**Input**: Figma design analysis -> design-map row 7, node `0:9634`

---

## Summary

The compose screen is the whatsapp text-status editor's *empty* state. It is a full-bleed
375x812 surface filled flat **#FF8A8C** (distinct from the feed's `#EFEFF4`), with no
navigation bar component, no tab bar, and no FAB. A slim top row holds white vector glyphs —
a Close **X** on the left and two send-shaped glyphs on the right (an upright "text-bar" and a
paper-plane) — with no centre title. Mid-screen, a centred placeholder **"Type a status"**
(38px, semibold-white) with a static caret marks the text entry zone. The bottom ~291px is the
**Keyboard Alphabetic** graphic (light keys `#FCFCFE` on a pink-grey base `#D8CACF`, `Go` return
key, black shift/delete/emoji/dictation glyphs), reproduced in-app as a static image. The iOS
status bar is the *Dark* variant in the frame; the app keeps the shared light one (drift D1).

Entry is from the Status feed: tapping the camera or note circle on the My Status row navigates
to `/status/compose`. The Close **X** returns to `/status`. The two send glyphs no-op (publishing
a status is a later feature); the keyboard graphic has no key interactions.

## Owner Clarifications (2026-09-23, recommended defaults from launch analysis)

1. **Entry points**: both the camera circle (`Add a photo to my status`) and the note circle
   (`Add a text to my status`) on the My Status row navigate to `/status/compose`. The `+` badge
   stays decorative. *(There is exactly one compose frame in the design — the text composer;
   the camera/photo flow is not part of row 7.)*
2. **Top glyphs**: all three white glyphs render as focusable buttons — `Close` (X) navigates to
   `/status`; the "text-bar" glyph and the paper-plane render as no-op send affordances (publish
   flow is a later feature).
3. **Keyboard**: reproduced as a static graphic (375x291 image, exact crop of the frame band) —
   no key interactions. Native keyboards cannot render the custom design; key behavior is
   non-goal.
4. **Placeholder/caret**: static copy of the frame (the text "Type a status" + caret, not wired
   to real typing). Entering/publishing status text is a later feature.
5. **Status bar**: the frame shows the iOS *Dark* status bar; in-app keeps the shared light
   `app-status-bar` (drift D1).

## Functional Requirements

- **FR-001**: `/status/compose` renders inside the shared shell (status bar, home indicator) with a
  full-bleed body filled flat `#FF8A8C`; no tab bar and no `app-navigation-bar`.
- **FR-002**: The top row (spanning x19-357, ~16.5px below the status bar) renders three white
  glyphs: `Close` (X, left), `text-bar` glyph and `paper-plane` (right). They are focusable
  buttons with descriptive aria-labels.
- **FR-003**: `Close` navigates to `/status` (back to the feed).
- **FR-004**: The two right-side send glyphs no-op (Clarification 2).
- **FR-005**: The centred placeholder `Type a status` renders at 38px semibold white with a white
  caret beside the glyph; both are static (Clarification 4).
- **FR-006**: The keyboard graphic (375x291) is pinned to the bottom of the content area and is
  non-interactive (Clarification 3).
- **FR-007**: On `/status`, activating the camera or note circle navigates to `/status/compose`
  (Clarification 1); the `Privacy` action and the My Status row body remain no-ops (feature 006).
- **FR-008**: The compose screen MUST NOT render a tab bar, a FAB, a navigation title, or the
  "coming soon" stub.
- **FR-009**: No horizontal overflow at any breakpoint (same responsive contract as 006).

## Non-Goals (later features)

- Entering status text / publishing (share-to-status flow beyond the empty state).
- Camera/photo compose (separate design if it exists beyond row 7).
- Friend/recent statuses with progress rings.
- Privacy settings.

## User Stories

- **US1 (chrome + empty state)**: As a user I land on `/status/compose` and see the pink
  full-bleed surface, the top row (X left, two send glyphs right, no title), the centred
  `Type a status` placeholder with a caret, and the keyboard graphic pinned at the bottom. No tab
  bar, no FAB.
- **US2 (entry + back + no-ops)**: From the feed, the camera circle or the note circle lands on
  `/status/compose`; `Close` returns to `/status`; the send glyphs, placeholder and keyboard taps
  change nothing (URL stays `/status/compose`).
- **US3 (a11y, focus, responsive, golden)**: All buttons expose names; keyboard focus shows a
  visible indicator; no horizontal overflow at any breakpoint; the screen matches the Figma render
  within the measured golden threshold.

## Acceptance Criteria (validation targets)

1. Unit: `ComposePage` renders top glyphs + placeholder + caret + keyboard; Close navigates to
   `/status`; send/placeholder/keyboard no-op; no tab bar/FAB/title. `StatusPage` camera/note unit
   tests remapped to `/status/compose` navigation. Full suite green.
2. E2E `tests/e2e/status-compose.spec.ts`: US1 chrome/empty-state, US2 entry/back/no-ops, US3
   focus + golden `0-9634-status-compose.png` at 375x812.
3. `tests/e2e/status.spec.ts`: remap the camera/note "no-op" case to navigation (US2 swap).
4. Responsive: `/status/compose` no-overflow appended to `tests/e2e/responsive.spec.ts`.
5. `figma/design-map.md` row 7 spec column set to `007`; spec status Implemented after closure.