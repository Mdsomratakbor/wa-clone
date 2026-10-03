# Tasks: Camera Capture & Preview (feature 056)

Commit convention: `docs(spec)` → `feat` → `test`. Each task is one commit-sized unit. Playwright
is paused by owner directive (2026-09-26): e2e tasks are **authored, never executed** — marked `[ ]`
with the directive date.

## T001 — Spec package (docs: spec)

- [x] `spec.md`, `plan.md`, `research.md` (this file) authored
- [x] `contracts/ui-contracts.md` authored (T001 commits the whole package)
- FRs covered: all (documentation)

## T002 — Drift notes in superseded surfaces (docs: spec)

- [x] `specs/012-camera/spec.md` drift note: chrome + capture + Retake/Send supersede the inert
      hypothesis control set; shutter is no longer a no-op; Close unchanged; capture flow deferred
      by F-012 is now F-056
- [x] `specs/012-camera/contracts/ui-contracts.md`: point the PENDING control set at F-056
- [x] `figma/design-map.md` row 12: reference F-056 + "capture flow landed (file-picker, PROVISIONAL)"
- [x] `specs/design-gap-audit.md` changelog entry (F-056, 2026-10-03)

## T003 — Camera tokens (feat: tokens)

- [x] `_tokens.scss`: add `camera-bg`, `camera-gradient-a`, `camera-gradient-b`,
      `camera-control-bg`, `camera-control-fg`, `camera-hint`, `camera-grid` (PROVISIONAL,
      recorded in spec §PROVISIONAL inventory)
- FR-002/FR-010

## T004 — State machine (feat: camera-page)

- [x] `camera-page.ts`: signals (`photo`, `decoding`, `message`, `flash`, `flipped`, `lastPhoto`),
      derived `captured`; `cameraFile` viewChild; `onShutter`/`onViewfinder`/`onGallery` →
      `openPicker`; `onFileChosen` → `downscaleToJpegDataUrl`; `onSend` → `StatusStore.publishPhoto`
      with injected `Clock`; `onRetake`; `onFlash`/`onFlip` toggles; guards against picker during
      decode; computed `statusText` for the live region
- FR-003/FR-004/FR-005/FR-006/FR-007/FR-008/FR-010

## T005 — Template + styles (feat: camera-page)

- [x] `camera-page.html`: top bar (flash, close), viewfinder button (filler, grid, hint, quality
      chip, capture img, live region), bottom bar (gallery, shutter, flip|send), hidden file input
- [x] `camera-page.scss`: PROVISIONAL styling from tokens only
- FR-001/FR-002/FR-003/FR-004/FR-007/FR-009

## T006 — Unit tests (test: camera-page)

- [x] `camera-page.spec.ts`: chrome render; viewfinder state; picker triggers; decode settle
      (mutation-observer, no sleep); capture state + preview + alt; status announcements; non-image
      path; Send publishes via store + Clock + navigation; store-refusal path; Retake + gallery
      thumb; Close from both states; Flash/Flip `aria-pressed`; Flip absent in capture; tab routing;
      no horizontal overflow; `localStorage.clear()` per suite
- FR-001 → FR-010 (traceability in closure section)

## T007 — E2E authored only (test: e2e)

- [ ] `tests/e2e/camera.spec.ts`: viewfinder ↔ capture via `setInputFiles`; Send lands on `/status`
      with the published photo; Retake; Flash/Flip toggles; Close discards.
      **Playwright paused — authored only (directive 2026-09-26), never executed.**

## T008 — Closure (docs: spec)

- [x] FR → test traceability, gate statuses, gap-audit entry already at T002, counts reported
- [x] `npm run build` green; full unit suite green, exact count
- [x] checklist + converge clean

## Checkpoint

`/camera`: the previously placeholder screen now shows the real-control chrome (Flash + Close top
bar; gallery + shutter + flip bottom bar; HD chip), a PROVISIONAL viewfinder fill + focus grid +
an honest hint that tapping the viewfinder chooses a photo. Shutter / viewfinder / gallery open a
real `image/*` picker; a decoded photo enters the capture state (cover-fit preview, shutter
becomes **Retake**, **Send to status** appears); Send publishes the photo as the user's status and
navigates to `/status`; **Close** returns to `/chats` without publishing. Flash/Flip are
`aria-pressed` toggles. No `getUserMedia`, no new dependency, no store/model change.

## FR → test traceability

- **FR-001** - "renders the informative chrome: Flash, Close, gallery, shutter and flip" and
  "shows the HD chip in viewfinder state only"; F-012 contract labels (Close camera / Take photo /
  Switch camera) unchanged and re-asserted.
- **FR-002** - "renders the provisional viewfinder fill, grid and honest hint in idle state".
- **FR-003** - "opens the file picker from shutter, the viewfinder and the gallery" (spy on the
  hidden input click); "keeps the shutter labelled Take photo until a photo is captured";
  "announces Preparing photo, then Photo ready on a successful decode".
- **FR-004** - "enters capture state: preview image with honest alt, shutter becomes Retake, Send
  appears"; "a non-image stays in viewfinder, announces the failure and publishes nothing";
  "picking a second file replaces the first capture rather than stacking".
- **FR-005** - "Send publishes the photo as the status and navigates to /status"; "uses the
  injected Clock, not the wall clock, for the publish"; "announces and keeps the photo when the
  store refuses to save it" (spied `publishPhoto` → `null`).
- **FR-006** - "Retake discards the capture and the old photo becomes the gallery thumbnail".
- **FR-007** - "Flash and Flip are aria-pressed toggles, and Flip is absent in capture state".
- **FR-008** - "Close returns to /chats from capture state without publishing" (and the F-012
  viewfinder-state Close test).
- **FR-009** - tab routing tests (Chats/Calls/Status/Settings) remain green; e2e authored
  no-overflow case in `camera.spec.ts`.
- **FR-010** - "uses the injected Clock"; no token test, tokens asserted via the build; new
  `camera-*` tokens recorded in the spec inventory.
- **E2E (authored, not run)** - `tests/e2e/camera.spec.ts` "Camera capture + preview (F-056)"
  describe block (chrome render, picker triggers, capture state, Send → /status, Retake, Flash/Flip
  toggles, Close discards, no overflow).

## Blocked (recorded, not skipped)

- **G1 capture** - expired Figma OAuth token (`403`, 2026-10-03). `0:9155` remains uncaptured; all
  PROVISIONAL values (7 `camera-*` tokens, geometry, copies) go through the post-re-auth reconcile
  with the 051-055 pending values. The golden stays skipped; no node ID is invented.