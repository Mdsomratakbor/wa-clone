# Feature Specification: Camera Capture & Preview (feature 056)

**Feature Branch**: `056-camera-capture-preview`

**Created**: 2026-10-03

**Status**: ✅ **Implemented** (T001–T007 done, build green, unit 735/735, 2026-10-03) — G1 capture
still **BLOCKED** (expired Figma token), so everything in §PROVISIONAL inventory awaits the
post-re-auth reconcile. See [Closure](./tasks.md#closure).

**Input**: `figma/design-map.md` row 12 (`0:9155`) + `specs/012-camera/` + the F-050 photo pipeline
(`specs/050-photo-status/`). The node is still **uncaptured** (expired Figma OAuth token → HTTP 403),
so every geometry/colour/copy value below is **PROVISIONAL** and listed for the post-re-auth
reconcile. No node ID is invented for any new chrome.

---

## Clarifications — Session 2026-10-03

Three scope questions, all answered by the owner (recommended options chosen):

- **Q1 — screen content.** *"What should the Camera screen now contain?"*
  **A (owner): the real WhatsApp camera chrome** — a top bar with a **Flash** toggle (left) and
  **Close** (right), and a bottom control bar with a **gallery** entry (left), the **shutter**
  (center) and a **flip** switch (right), plus an **HD/quality hint** chip. Still control-first; the
  functional capture is Q2.
- **Q2 — capture behaviour.** *"Which behaviour is in scope?"*
  **A (owner): a real file-input capture with preview** — the F-050 precedent. A hidden
  `<input type="file" accept="image/*">` opens the device picker; the chosen image is downscaled to
  a JPEG data URL and shown as a captured preview with a **Send**-style CTA. No `getUserMedia`, no
  permissions, no lens/il-stage hardware.
- **Q3 — viewfinder visual.** *"Should the viewport get an informative visual?"*
  **A (owner): a provisional viewfinder fill** — a subtle gradient surface plus a centered focus
  grid and an honest hint, explicitly labelled PROVISIONAL pending the `0:9155` capture.

### Confirm-at-G1 hypotheses (recorded, not yet owner-ratified)

- **Send destination**: the captured photo is published as the user's **Status** via the existing
  `StatusStore.publishPhoto` (the only real target the app has — F-050), then the screen navigates
  to `/status`. A "send to a chat/group" flow is Non-Goal and would need a backend contract that
  does not exist.
- **Flip / Flash semantics**: both are `aria-pressed` state toggles with a visible pressed
  treatment. The design-gap audit moved a state-only **Flip** off an approved list *because* a rear
  lens has no observable effect without a live preview; the owner's explicit chrome decision
  (Q1) supersedes that for the **presence** of the control, while a live flip/lens effect remains
  deferred with the `getUserMedia` pipeline (Non-Goal). Recorded as a drift candidate, not a
  silent contradiction.

## Summary

F-012 shipped a structural placeholder (dark viewport + Close/Shutter/Flip, all controls inert).
This feature makes the Camera screen *informative* and the shutter *actually capture*: it renders
the real-control chrome, presents a provisional viewfinder that reads as a camera without claiming
a live feed, and turns a shutter / viewfinder / gallery tap into a real device picker whose chosen
image is downscaled, previewed and sendable as a photo status. Everything is provisional against
`0:9155`; the F-050 pipeline (`downscaleToJpegDataUrl`, `StatusStore.publishPhoto`) is reused as-is,
so no store, model or persistence change is needed.

## Functional Requirements

- **FR-001**: The screen renders the informative chrome as real, focusable, labelled buttons with
  stable testids: top bar **Flash** + **Close**; bottom bar **gallery** + **shutter** + **flip**;
  a small **HD** quality chip. `camera-close` keeps its label "Close camera"; `camera-shutter`
  keeps "Take photo"; `camera-flip` keeps "Switch camera".
- **FR-002**: The idle (viewfinder) state shows the PROVISIONAL fill — a gradient surface, a
  centered focus grid, and the honest hint "Tap viewfinder to choose a photo". Nothing suggests a
  live preview exists.
- **FR-003**: Tapping **Shutter**, the **viewfinder**, or **gallery** opens one real hidden
  `<input type="file" accept="image/*">`. A chosen file is downscaled via F-050's
  `downscaleToJpegDataUrl`; while decoding, a `role="status"` region announces "Preparing photo…"
  and flashing the send path is impossible.
- **FR-004**: A successful decode switches to the **capture** state: the viewport shows the chosen
  image cover-fit with honest alt text, the status region announces "Photo ready", and the bottom
  bar becomes **gallery + shutter (now "Retake") + Send ("Send to status")**. A file that is not a
  decodable image stays in viewfinder state, announces "Could not read that image", and is never
  published.
- **FR-005**: **Send** publishes the photo through `StatusStore.publishPhoto(dataUrl, Clock.now())`
  — monotonic id, `text: ''`, no wall-clock — then navigates to `/status`. If the store refuses
  (over its payload budget) the photo is kept on screen, the refusal is announced, and navigation
  does not happen: a store refusal is never swallowed.
- **FR-006**: **Retake** (shutter in capture state) discards the current capture and returns to the
  viewfinder without publishing; the discarded photo becomes the **gallery thumbnail** for the
  session (never persisted).
- **FR-007**: **Flash** and **Flip** are `aria-pressed` toggles with a visible pressed treatment;
  Flip renders only in viewfinder state. Live flash illumination and lens switching are Non-Goals
  (no `getUserMedia`); both states are PROVISIONAL.
- **FR-008**: **Close** returns to `/chats` from either state and never publishes.
- **FR-009**: The tab bar stays visible with Camera active; the other four tabs route away (F-012
  contract). No horizontal overflow at any breakpoint.
- **FR-010**: No `getUserMedia`, no network call, no new dependency, no wall-clock read. The only
  stores/helpers touched are `StatusStore` (read) and `downscaleToJpegDataUrl` (reuse). New colour
  tokens are added to the token map in the same change and recorded here.

## Non-Goals

- **Live camera preview / capture.** `getUserMedia` remains unavailable; the app picks a file and
  presents it as a captured photo. Lens switch and flash illumination effects are explicitly out of
  scope and stay with the future media pipeline.
- **Sending to chats/groups, captions, privacy, video**, multi-photo or anything the status model
  does not already support (F-050 Non-Goals apply unchanged).
- **Persisting the last capture** or the gallery thumbnail (session-only by design).
- **Any design-verified chrome claim**: `0:9155` is uncaptured; every value below is PROVISIONAL.
- **Changing the status compose/page, status store model, or the shared shell.**

## Review Gates

- **G1 (BLOCKED — Figma)**: the REST API returns HTTP 403 (`{"status":403,"err":"Token expired"}`,
  re-confirmed 2026-10-03; see `specs/design-gap-audit.md` for the authoritative reset). No captured
  node for row 12 exists, so all geometry/colour/copy shipped here is PROVISIONAL and enumerated
  verbatim (spec §"PROVISIONAL inventory") for the post-re-auth reconcile. The capture plan
  (research §Capture plan) runs the first time the token works.
- **G2**: `npm run build` green and the full unit suite green with the exact count reported.
- **G3**: closure commit; drift notes in every superseded spec; checklist + converge clean.

## Figma Reference

| Item | Value |
| ---- | ----- |
| Screen | WhatsApp Camera — node `0:9155` (design-map row 12) |
| Status | **uncaptured** — 403 expired token; the chrome is PROVISIONAL |
| Reused verified | F-050 photo pipeline (`downscaleToJpegDataUrl`, `StatusStore.publishPhoto`) |
| Proxy surface | `0:9634` (status compose) — the only captured pink surface; NOT copied here |

No node ID is cited for the viewfinder fill, focus grid, HD chip, gallery entry or any hint copy:
none exist in the file, and none is invented as a Figma fact.

## PROVISIONAL inventory (reconcile after re-auth)

| Item | Value shown | File |
| ---- | ----------- | ---- |
| viewport surface | `--wa-camera-bg` (#000000), gradient `camera-gradient-a` → `camera-gradient-b` | tokens |
| filler | gradient overlay; grid 3 lines × 3 lines; `--wa-camera-grid` lines | scss |
| hint copy | "Tap viewfinder to choose a photo" | html |
| decoding copy | "Preparing photo…" | html |
| ready copy | "Photo ready" | html |
| non-image copy | "Could not read that image" | html |
| refusal copy | "This photo is too large to save" | html |
| alt text | "Captured photo — to be sent to your status" | html |
| HD chip | text "HD", viewfinder state only | html |
| control fill | `--wa-camera-control-bg` rgba(255,255,255,0.14); glyph `--wa-camera-control-fg` | tokens |
| shutter | 72×72, 4px ring `--wa-camera-control-fg`; flanking controls 44×44 | scss |

New tokens (added in the same change): `camera-bg`, `camera-gradient-a`, `camera-gradient-b`,
`camera-control-bg`, `camera-control-fg`, `camera-hint`, `camera-grid` — all PROVISIONAL, recorded
here for the reconcile and following the `call-field` / `keyboard-*` token precedents.

## Validation Targets

### Unit — `camera-page.spec.ts` (extended)

- Chrome: Flash, Close, gallery, shutter, flip render with labels + testids; HD chip present only in
  viewfinder state.
- Viewfinder state: filler + grid + hint render; no preview `<img>`; no Send.
- Shutter, viewfinder and gallery each trigger the file input (spy on the input's `click`).
- Picking an image: "Preparing photo…" while decoding; capture state shows a `data:image/jpeg`
  preview with alt text; "Photo ready"; Send enabled — all awaited deterministically (F-050
  mutation-observer settle pattern, no wall-clock sleep).
- Non-image: stays in viewfinder, announces "Could not read that image", publishes nothing.
- Send: publishes via `StatusStore` (photo data URL, `text: ''`, monotonic id), uses the injected
  `Clock`, navigates to `/status`.
- Store refusal: `publishPhoto` spied to return `null` → photo kept, refusal announced, no
  navigation.
- Retake: returns to viewfinder, prior photo becomes the gallery thumbnail, nothing published.
- Close: `/chats` from both states, nothing published.
- Flash/Flip: toggle `aria-pressed`; Flip absent in capture state.
- Tabs route Chats/Calls/Status/Settings away; no horizontal overflow at the breakpoints.
- No shared state: `localStorage.clear()` in `beforeEach`; the store singleton is re-created per
  suite run via the existing F-050 test harness.

### E2E (authored, not run — Playwright paused by owner directive 2026-09-26)

- `tests/e2e/camera.spec.ts` additions: viewfinder ↔ capture state via file picker
  (`setInputFiles`), Send lands on `/status` with the photo published, Retake returns to the
  viewfinder, Flash/Flip toggle `aria-pressed`, Close discards.

## Definition of Done

- [ ] Every FR covered by at least one named unit test (FR → test traceability in `tasks.md`)
- [ ] `npm run build` green; full unit suite green, exact count reported
- [ ] G1 recorded BLOCKED; PROVISIONAL inventory recorded verbatim; no node ID invented
- [ ] Drift notes added to `specs/012-camera/`, `figma/design-map.md` and `specs/design-gap-audit.md`
- [ ] E2E authored and updated; execution deferred per directive
- [ ] Commits split `docs(spec)` / `feat` / `test` with reasons