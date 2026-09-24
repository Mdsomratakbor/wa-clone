# Feature Specification: WhatsApp Camera

**Feature Branch**: `012-camera`

**Created**: 2026-09-24

**Status**: **Implemented — structural scope landed pre-capture (owner directive `2026-09-24`,
validated `2026-09-24`).** `/camera` top-level screen (dark viewport + Close/Shutter/Flip controls,
tab bar active on Camera) + Camera-tab navigation wired across chats/calls/status shipped: build
green, unit 145/145, full e2e 276 passed / 15 skipped (0 failures). Exact geometry, control set,
glyphs and golden remain PENDING the Figma capture (~2026-09-28) and are gated at G1; provisional/
hypothesis values in place until then.

**Input**: `figma/design-map.md` row 12 (`0:9155`) + `specs/012-camera/research.md`

---

## Summary

The Camera is the fifth top-level screen reachable from the shared tab bar (design-analysis flow 5:
tab bar switches top-level screens, including Camera). Today the Camera tab is a local stub on
chats/calls/status. This feature adds the real `/camera` screen (viewport + controls) and wires the
tab, so the Camera tab navigates like Calls/Status/Chats do. Actual camera capture/send is out of
scope. Geometry, palette, the exact control set, and glyphs are all PENDING the node capture.

## PENDING design inventory (capture on ~2026-09-28)

To be filled from the `0:9155` payload (mirrors 008 research format):

- [ ] Frame dims/fills; viewport + overlay chrome topology (bars vs floating controls)
- [ ] Control set: shutter/capture, flip/reverse, flash, close/cancel, capture-send CTA — which
      exist, glyphs, sizes, positions
- [ ] Tab-bar visibility on Camera vs immersive full-screen
- [ ] Status bar / home indicator treatment on the dark surface

## Owner Clarifications (proposed — confirm at G1)

1. **Topology**: confirm the viewport is full-bleed with overlaid controls and whether the tab bar
   is visible (hypothesis: tab bar visible, Camera active — matches sibling top-level screens).
2. **Control set**: exact controls + labels/glyphs come from the node payload. Structural
   hypothesis (Close / Shutter / Flip) is data-driven and replaced at G1.
3. **Close destination**: hypothesis — Close returns to `/chats`. Confirm the design's intent.
4. **Capture flow**: capturing/sending an image is a Non-Goal; confirm this feature only presents
   the screen + controls (no media pipeline).
5. **Responsive**: no horizontal overflow at any breakpoint (same contract as 006-011).

## Functional Requirements

- **FR-001**: The Camera tab (chats/calls/status) navigates to `/camera` instead of showing the
  local stub.
- **FR-002**: `/camera` renders a dark viewport with the control affordances per the design (real,
  focusable, a11y-labelled buttons with a testable `data-testid`).
- **FR-003**: The tab bar stays active on Camera; other tabs route to their top-level screens.
- **FR-004**: Close returns to `/chats`; no route change on shutter/flip (control-only this
  feature).
- **FR-005**: No horizontal overflow at any breakpoint.

## Non-Goals (later features / explicitly deferred)

- Camera capture pipeline (permission, recording, media, send/done flow).
- The Camera screen content beyond the viewport + controls (e.g., gallery strip, filters).
- Any change to the Status composer camera circle (`status-camera`) — it already routes to
  `/status/compose` (feature 007).

## User Stories

- **US1 (entry)**: As a user I tap the Camera tab on any of Chats/Calls/Status and land on the
  Camera screen with the Camera tab active.
- **US2 (screen + controls)**: I see the dark viewport and the design's controls (Close/shutter/
  flip hypothesis), each focusable and labelled.
- **US3 (chroming, responsive, golden)**: tabs route away correctly, Close returns to `/chats`,
  no horizontal overflow at any breakpoint, and the screen matches the Figma render within the
  measured golden threshold.

## Acceptance Criteria (validation targets)

1. Unit — `camera-page.spec.ts` (new): renders viewport + Close/Shutter/Flip with labels; Close
   navigates to `/chats`; tabs route (`chats`→`/chats`, `calls`→`/calls`, `status`→`/status`;
   settings = local stub); full suite green.
2. Unit — extension: `chats-page.spec.ts`, `calls-page.spec.ts`, `status-page.spec.ts` Camera tab
   now asserts `navigate(['/camera'])` (swap list).
3. E2E `tests/e2e/camera.spec.ts`: US1 tab entry from each top-level page, US2 controls visible &
   labelled, US3 Close returns to `/chats` + golden `0-9155-camera.png` with measured
   `maxDiffPixelRatio` (= measured + 0.05; gated on capture).
4. Responsive: appended no-overflow cases for `/camera` at all breakpoints.
5. `figma/design-map.md` row 12 spec → `012` + implemented at closure.

## Swap list

- `chats-page.ts`, `calls-page.ts`, `status-page.ts` `onTabSelect`: add `camera` → `/camera`
  branch (replace the `activeTab.set(key)` stub fallback for camera only).
- Unit: `chats-page.spec.ts:40-51` (Camera stub test → navigate assert), `calls-page.spec.ts:66-77`
  (same), `status-page.spec.ts` (same); E2E `status.spec.ts:45-54` ("Camera/Settings show the
  stub" → Camera navigates, Settings only stub).
- Confirm no smoke/unit/e2e asserts the Camera tab is inert (search completed: only the four
  listed). Existing `calls-edit` `tab-stub` count checks stay valid (editing blocks tab routing).
- `shared/components/action-sheet`, `navigation-bar`, tab-bar, app-shell untouched.

## Closing note (deliberately incomplete)

Until T001 lands, `camera-page` renders a structural placeholder viewport + the hypothesis control
set (stable aria-labels/testids) — replaced at G1 with the captured design. No exact design values
are claimed anywhere.