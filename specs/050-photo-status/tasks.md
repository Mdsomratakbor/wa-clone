# Tasks: Photo Status (feature 050)

**Spec**: [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md)

**Total**: 9 implementation tasks · 3 capture-gated tasks (T010–T012) · 1 deferred task (T013)

## Implementation

- [ ] **T001** - `status.model.ts`: `StatusPhoto { dataUrl, width, height }` and an **optional**
      `photo?: StatusPhoto` on `StatusEntry`. No existing field changes type or meaning, so an F-049
      snapshot still loads.

- [ ] **T002** - `status-photo.ts` (new): `downscaleToJpegDataUrl(file, maxEdge, quality)` returning a
      `Promise<string>`, plus the named constants `PHOTO_MAX_EDGE` and `PHOTO_MAX_CHARS`. Rejects a
      non-decodable file by resolving `null` rather than throwing. **Tests first** in
      `status-photo.spec.ts`, using a real canvas → blob → `File` round trip (Karma runs a real
      Chrome, so `Image` and canvas are exercised rather than mocked — research §7):
  - produces a `data:image/jpeg;base64,` URL for a real image
  - the longest edge is capped, and a small image is not enlarged
  - a non-image file resolves `null` and does not throw
  - a `PHOTO_MAX_CHARS`-sized string is rejected by the store, not here (store's rule, T003)

- [ ] **T003** - `StatusStore`: `publishPhoto(dataUrl, nowMs)` beside `publish`. Rejects a
      non-`data:image/` payload and any payload over `PHOTO_MAX_CHARS` **leaving the previous status
      intact**; otherwise stores `text: ''` + `photo`, replacing whatever was there. The photo-aware
      `isStatusEntry` drops a malformed `photo` while keeping the entry. **Tests first**:
  - `publishPhoto` stores `text: ''` and the photo, and returns the entry (FR-005)
  - a photo replaces a previous text status, and a text publish replaces a photo (FR-005)
  - an over-budget payload is refused and the previous status survives (FR-007)
  - a non-`data:image/` payload is refused (FR-004, FR-007)
  - a photo survives a reload (FR-005, FR-008)
  - a snapshot whose `photo` is malformed loads as a text status with the photo dropped (FR-006)
  - an F-049 snapshot with no `photo` key loads unchanged (FR-006)
  - ids stay monotonic across text and photo publishes (FR-005)

- [ ] **T004** - Compose page: photo mode from `this.route.snapshot.queryParamMap.get('kind')`,
      following the `in-call-page.ts:100` precedent; anything other than `photo` is text mode.
      `onFileChosen` runs the downscale helper, holds the data URL in a signal, and enables `Send`
      only once one exists. `onSend` calls `publishPhoto(dataUrl, Clock.now())` then navigates to
      `/status`. A decode failure leaves the preview empty and `Send` disabled. **Tests first**.

- [ ] **T005** - Compose template + styles: in photo mode a labelled `<input type="file"
      accept="image/*">` and a preview `<img>`; the keyboard graphic is **omitted**; text mode is
      byte-for-byte unchanged in behaviour. Preview rules reuse existing spacing values; no new token.
      **Tests first**: file input rendered and labelled; `Send` disabled until an image is chosen;
      keyboard graphic absent in photo mode and present in text mode; `Send` publishes and navigates;
      `Close` returns to `/status` without publishing.

- [ ] **T006** - Status page: `hasPhoto` and a provisional photo subtitle; the `role="status"` region
      renders an `<img>` with the persisted `src` and literal alt text for a photo, and the text
      region is not rendered. **Tests first**: photo renders and the text region is absent; the tip
      still shows when nothing is published; a data URL containing markup-like text is inert.

- [ ] **T007** - Entry point: the camera circle navigates to `/status/compose?kind=photo`. The note
      circle and the row body are unchanged. **Tests first** in `status-page.spec.ts`.

- [ ] **T008** - E2E, **authored and not run** (Playwright paused, owner directive 2026-09-26):
      `status-compose.spec.ts` gains a photo case using `setInputFiles` (choose → preview → `Send` →
      feed shows the photo → reload keeps it); `status.spec.ts` gains "the camera circle opens photo
      mode". Existing assertions are untouched, since an absent `kind` param is text mode.

- [ ] **T009** - G2: `npm run build` green, then the **full** unit suite green with the exact count
      reported. Then the `/speckit.analyze` pass, `/speckit.checklist` per FR with named test
      evidence, and `/speckit.converge`.

## Capture - BLOCKED (Figma 429, reset 2026-10-02 18:38 UTC)

- [ ] **T010** - Capture the photo variant of the compose frame and record its node id in
      `research.md`, or record that no photo frame exists. Until then the preview, the feed photo size,
      the subtitle copy and the alt text are **PROVISIONAL** and no node is invented for them.
- [ ] **T011** - Reconcile the provisional presentation against the capture, replacing the
      hypotheses in `spec.md` if the design differs. The reused `0:9634` chrome is already verified and
      is not in scope here.
- [ ] **T012** - Goldens for photo mode and the published photo feed state (blocked twice over:
      capture **and** the Playwright pause).

## Deferred - capture-gated, owner decision 2026-10-01

- [ ] **T013** - **A keyboard that types.** Explicitly deferred by the owner rather than shipped as a
      provisional QWERTY: the design's segmented key layout and glyph positions exist in no captured
      artifact, so building it before the quota resets would mean inventing the design. To be picked
      up by a later feature, which **inherits the recorded decision**: the real input stays focusable
      and the OS keyboard keeps working, with the on-screen keys inserting into it (no `readonly`).
      This task stays open and visible; it is not dropped.

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per owner directive
```

## Notes

- `publish` and `publishPhoto` are independent guards on the single-entry rule: whichever runs last
  wins, which is the intended "one status, text or photo" behaviour from the spec's Non-Goals.
- An over-budget refusal is a **user-visible no-op with a disabled button**, not a silent failure —
  the store returns `null` and the page leaves `Send` disabled. The alternative, publishing something
  that will not survive a reload, is the one outcome this feature must not ship (research §4).
- No route change: `?kind=photo` rides the existing `status/compose` route, matching the
  `queryParamMap` precedent in `in-call-page.ts`.
- No `getUserMedia`, no network, no new dependency. A photo is picked, not captured — the `/camera`
  shutter remains the blocked F-012 item.

## FR → test traceability

Filled in at closure with the exact suite count and named tests.

| FR | Task |
|----|------|
| FR-001 | T007 |
| FR-002 | T004, T005 |
| FR-003 | T005 |
| FR-004 | T002, T003 |
| FR-005 | T003 |
| FR-006 | T001, T003 |
| FR-007 | T003 |
| FR-008 | T006 |
| FR-009 | T006 |
| FR-010 | T004 |
| FR-011 | T005 |

## Analysis pass (the `/speckit.analyze` gate)

Run at closure; results appended here.

## Closure (G3)

Appended at closure.
