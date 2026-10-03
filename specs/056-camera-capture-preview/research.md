# Research: Camera Capture & Preview (feature 056)

**Source**: `figma/design-map.md` row 12 (`0:9155`, WhatsApp Camera) + `specs/012-camera/research.md`
+ the F-050 photo pipeline.

## Capture status

**BLOCKED — expired OAuth token.** 2026-10-03 re-confirmation: GET returns
`{"status":403,"err":"Token expired"}` (the 429 quota we prepared for is moot; the token lapsed
first). See `specs/design-gap-audit.md` for the authoritative reset timestamp. Nothing about the
Camera node is design-verified; all chrome in F-056 is PROVISIONAL.

## Capture plan (run on first working token)

1. Node inventory: `npx -y figma-developer-mcp fetch --file-key PcGX72lSWkYIk3pL5V8PS3 --node-id 0:9155 --depth 6 --format json`
   (fallback: local MCP `figma_get_figma_data`, `0:9155`).
2. Extract geometry/colour/control facts into this file ("Node inventory"), reconcile against the
   F-056 PROVISIONAL inventory in `spec.md`, and record any drift in `012` and here.
3. Download the golden `tests/e2e/golden/0-9155-camera.png` (native 1x) and any control glyphs via
   `figma_download_figma_images`.
4. Un-skip the golden e2e only after the capture gate clears (feature 007 practice).

## Known facts (certain)

- The Camera is the fifth shared tab (`settings · chats · camera · calls · status`), reached at
  `/camera` inside the shared shell with the tab bar visible (F-012 approved hypothesis).
- F-012 contract: `camera-close` ("Close camera"), `camera-shutter` ("Take photo"),
  `camera-flip` ("Switch camera"); Close → `/chats`.
- F-050 precedent (reused): `downscaleToJpegDataUrl(file, 640, 0.72)` → JPEG data URL or `null`;
  `StatusStore.publishPhoto(dataUrl, nowMs)` enforces `PHOTO_MAX_CHARS` (400 000) and persists under
  `wa.status-store.v1`; the deterministic decode-settle test pattern uses a MutationObserver on the
  "Preparing photo…" marker rather than sleeps.
- `Clock.now()` is the injected time source (F-049/050/051/055 precedent).

## F-050 reuse rationale (not duplicated)

The Camera shutter needs the exact single pipeline the status composer already has. Reimplementing
downscale/store logic in the camera would fork behaviour; instead F-056 imports the two existing
exports, and the recorder of "Send → status" is a navigation + store call already proven green in
`compose-page.spec.ts` photo mode.

## Design tokens

The Camera screen is the second dark surface (after the F-045 in-call `call-field` and the F-051
keyboard palette). `camera-*` tokens are added rather than overloading `call-field`/`keycap`, whose
names already mean specific surfaces; the values are PROVISIONAL and listed in `spec.md`.

## Decisions (owner-confirmed 2026-10-03, F-056 spec §Clarifications)

- Real camera chrome (Flash · Close top bar; gallery · shutter · flip bottom bar; HD chip).
- File-input capture + preview (F-050 pipeline); no `getUserMedia`.
- Provisional viewfinder fill + focus grid + honest hint.
- Send publishes to the user's Status (confirm-at-G1 hypothesis) → `/status`.