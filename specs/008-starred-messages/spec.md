# Feature Specification: WhatsApp Starred Messages

**Feature Branch**: `008-starred-messages`

**Created**: 2026-09-23

**Status**: Implemented - US1-US3 structural scope complete and green (unit 103/103, e2e 210 pass /
3 skipped); golden `T020` + exact chevron path `T019` deferred to Figma capture (~2026-09-28).
Clarifications 1-5 approved; deviations: tip avatar is a plain decorative `<img>` (not
`app-user-avatar`); chevron uses a temporary SVG path until `T002`.

> **Drift note (F-025, 2026-09-26)**: the 008 non-goals "populated list" and "starring /
> unstarring interactions" are COMPLETED by feature 025 (`specs/025-starred-flow`): messages
> star via long-press/right-click into `ChatStore`, and Starred Messages renders live rows
> (empty tip preserved exactly). Populated-list layout is map-external (no Figma frame); the
> deferred golden still targets the empty state.

**Input**: Figma design analysis -> design-map row 8, node `0:8820`

---

## Summary

The Starred Messages screen is the empty state shown when no message has been starred
("Tap and hold on any message to star it, so you can easily find it later"). It is a 375x812
screen on the shared light surface `#EFEFF4` (the same surface as Chats/Calls). The shared shell
(light status bar + home indicator) is reused unchanged — the frame uses the **Light** status bar,
so unlike feature 007 there is no status-bar drift.

The top-of-content **navigation bar** (`#F6F6F6` + hairline) shows a leading **Back** action —
chevron + "Settings" (blue `#007AFF`) — and a centred title **"Starred Messages"**; no trailing
actions. The body is a single centred **Tip**: a WhatsApp-logo avatar in a 132px circle (hairline
stroke + soft shadow), the header **"No Starred Messages"** (16px semibold), and a two-line helper
(14px regular). No tab bar, no FAB, no list rows (the design contains only the empty state).

Back returns to `/settings`. Feature 008 adds the `/starred-messages` route and a minimal `/settings`
stub so the back flow is real (Settings itself is design-map row 13, a later feature).

## Owner Clarifications (recommended defaults from the design)

1. **Entry / back target**: the design labels the leading action "Settings" (`#0:8824`). Recommend
   adding route `/starred-messages` now; Back navigates to `/settings`, which renders a minimal
   stub (nav bar "Settings" + placeholder body) until row 13 lands. *(Alternative: Back no-ops like
   the Status "Privacy" action — traps the user; not recommended.)*
2. **Empty-state only**: the frame contains no populated list — confirm feature 008 is the static
   empty-state screen (no star/unstar interactions, no seeded rows).
3. **Avatar**: the WhatsApp-logo circle is a raster IMAGE fill; reproduce as a cached asset
   (`public/starred-messages-avatar.png`) captured from the render once the Figma 429 clears
   (~09-27). (Fallback if capture is impossible: `app-user-avatar` initials — a small drift.)
4. **Golden + chevron**: full-frame golden `0-8820-starred-messages.png` (375x812) and the Back
   chevron vector are also deferred to the rate-limit retry; e2e tasks that depend on them are
   gated until captured.
5. **Status bar**: the frame's Light status bar is expected to match the shared in-app bar with no
   drift — verify via the golden.

## Functional Requirements

- **FR-001**: `/starred-messages` renders inside the shared shell (status bar, home indicator) on a
  flat `#EFEFF4` surface; no tab bar, no `app-tab-bar`, no FAB.
- **FR-002**: The navigation bar (shared `app-navigation-bar`) shows a leading **Back** action —
  chevron + "Settings" (blue) — and the centred title "Starred Messages"; no trailing actions;
  hairline bottom border.
- **FR-003**: Selecting Back navigates to `/settings`.
- **FR-004**: The body is the **Tip**: avatar circle (WhatsApp logo, ~132px, hairline stroke +
  soft shadow), "No Starred Messages" header (16px semibold, rgba(60,60,67,0.6)), and the helper
  line "Tap and hold on any message to star it, so you can easily find it later." (14px regular,
  rgba(60,60,67,0.6), wraps to 2 centred lines).
- **FR-005**: The tip copy is real, selectable text; the avatar is a decorative `<img>` (`alt=""`).
- **FR-006**: No horizontal overflow at any breakpoint (same responsive contract as 006/007).

## Non-Goals (later features)

- A populated list of starred messages (no frame exists; requires a starred-message model).
- Starring / unstarring interactions (long-press to star belongs with message actions).
- The full Settings feature (design-map row 13); only the minimal `/settings` stub is in scope.
- Search inside starred messages.

## User Stories

- **US1 (chrome)**: As a user I land on `/starred-messages` and see the navigation bar with the
  Back "Settings" action and the "Starred Messages" title; the surface is flat and shared; no tab
  bar and no FAB.
- **US2 (empty state)**: I see the tip — avatar circle, "No Starred Messages", and the helper text;
  the copy is real text and the avatar is decorative.
- **US3 (a11y, focus, responsive, golden)**: Back is focusable with a visible indicator and
  navigates to `/settings`; no horizontal overflow at any breakpoint; the screen matches the Figma
  render within the measured golden threshold.

## Acceptance Criteria (validation targets)

1. Unit: `StarredPage` renders nav bar (Back "Settings" + title), tip copy, decorative avatar; no
   tab bar/FAB; Back click -> `router.navigate(['/settings'])`. Full suite green.
2. E2E `tests/e2e/starred.spec.ts`: US1 chrome, US2 tip, US3 focus + golden
   `0-8820-starred-messages.png` at 375x812 (gated on asset capture).
3. Settings stub: `/settings` renders a minimal chrome screen with a Back that returns to
   `/starred-messages`; covered by unit + e2e if Clarification 1 default is approved.
4. Responsive: `/starred-messages` (and `/settings`) no-overflow cases appended to
   `tests/e2e/responsive.spec.ts`.
5. `figma/design-map.md` row 8 spec column set to `008`; spec status Implemented after closure.