# Plan: Camera Capture & Preview (feature 056)

## Goal

Turn the F-012 placeholder Camera screen (dark viewport, three inert controls) into an informative
camera: real chrome (Flash · Close top bar; gallery · shutter · flip bottom bar; HD chip), a
provisional viewfinder fill that reads as a camera without claiming a live feed, and a real
file-picker capture flow (F-050 pipeline) ending in a Send ("to status") / Retake CTA.

## Approach

Everything reuses what exists; the only novel code is the Camera page itself.

1. **Tokens first** — add the `camera-*` PROVISIONAL tokens to `_tokens.scss` (spec §PROVISIONAL
   inventory). No raw hex in the page.
2. **State machine in `camera-page.ts`** — signals: `photo`, `decoding`, `message`, `flash`,
   `flipped`, `lastPhoto`; derived `captured = photo !== null && !decoding`. A single
   `viewChild<HTMLInputElement>(cameraFile)` drives the picker from shutter / viewfinder / gallery.
   `downscaleToJpegDataUrl` and `StatusStore.publishPhoto` are reused untouched; `Clock` is injected
   for FR-005. Guard against a second picker while decoding.
3. **Template + SCSS** — per FR-001/002/004. `role="status"` live region announced via a computed
   text. Hidden file input unreachable by pointer but present in the a11y tree (F-050 pattern).
4. **Tests** — deterministic: F-050 mutation-observer settle for the decode; no sleeps; spies on
   `publishPhoto` for the refusal path; localStorage cleared per suite.
5. **E2E authored only** — extend `tests/e2e/camera.spec.ts`; never executed (directive 2026-09-26).

## Review gates

- **G1 — Figma capture (BLOCKED)**: HTTP 403, expired token. Ship PROVISIONAL chrome; enumerate
  every value in the spec inventory; run the research capture plan on the first 200 re-auth; no
  golden un-skip, no "design-verified" claim until then.
- **G2 — build + unit**: `npm run build` green; full suite green with the exact count reported.
- **G3 — closure**: commit closure, drift notes in `012`/design-map/gap-audit, checklist + converge
  clean.

## Drift policy

F-056 **extends** F-012's contract; it does not silently change it. Any F-012 assertion or contract
that F-056 revises gets a drift note in `specs/012-camera/spec.md` and its contract file is updated
to point at `056`. The gap-audit's "Flip belongs with the preview work" note is superseded for
control *presence* by the owner's explicit Q1 answer, with the live-flip deferral re-recorded under
`056` FR-007. No other feature's behavior changes.

## Out of scope / untouched

`compose-page`, `status-page`, `status.store.ts`, `status-photo.ts`, `navigation-bar`, `tab-bar`,
`app-shell`, `_tokens.scss` **except** the additive `camera-*` block (the one allowed token change,
recorded in the spec).

## Risks

- **Over-eager "camera" claims**: the hint/alt copy is written literally ("choose a photo",
  "Captured photo — to be sent to your status") so nothing suggests a live feed or delivery that is
  not real.
- **Test flakiness on decode**: solved by the F-050 mutation-observer settle with a loud timeout; no
  clock-based polling.
- **Send destination hypothesis** (`StatusStore`): recorded as confirm-at-G1; refactoring later is a
  two-line store call swap, not architectural.