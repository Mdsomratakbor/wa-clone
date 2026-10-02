# Tasks: Photo Status (feature 050)

**Spec**: [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md)

**Total**: 9 implementation tasks · 3 capture-gated tasks (T010–T012) · 1 deferred task (T013)

## Implementation

- [x] **T001** - `status.model.ts`: `StatusPhoto { dataUrl, width, height }` and an **optional**
      `photo?: StatusPhoto` on `StatusEntry`. No existing field changes type or meaning, so an F-049
      snapshot still loads.

- [x] **T002** - `status-photo.ts` (new): `downscaleToJpegDataUrl(file, maxEdge, quality)` returning a
      `Promise<string>`, plus the named constants `PHOTO_MAX_EDGE` and `PHOTO_MAX_CHARS`. Rejects a
      non-decodable file by resolving `null` rather than throwing. **Tests first** in
      `status-photo.spec.ts`, using a real canvas → blob → `File` round trip (Karma runs a real
      Chrome, so `Image` and canvas are exercised rather than mocked — research §7):
  - produces a `data:image/jpeg;base64,` URL for a real image
  - the longest edge is capped, and a small image is not enlarged
  - a non-image file resolves `null` and does not throw
  - a `PHOTO_MAX_CHARS`-sized string is rejected by the store, not here (store's rule, T003)

- [x] **T003** - `StatusStore`: `publishPhoto(dataUrl, nowMs)` beside `publish`. Rejects a
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

- [x] **T004** - Compose page: photo mode from `this.route.snapshot.queryParamMap.get('kind')`,
      following the `in-call-page.ts:100` precedent; anything other than `photo` is text mode.
      `onFileChosen` runs the downscale helper, holds the data URL in a signal, and enables `Send`
      only once one exists. `onSend` calls `publishPhoto(dataUrl, Clock.now())` then navigates to
      `/status`. A decode failure leaves the preview empty and `Send` disabled. **Tests first**.

- [x] **T005** - Compose template + styles: in photo mode a labelled `<input type="file"
      accept="image/*">` and a preview `<img>`; the keyboard graphic is **omitted**; text mode is
      byte-for-byte unchanged in behaviour. Preview rules reuse existing spacing values; no new token.
      **Tests first**: file input rendered and labelled; `Send` disabled until an image is chosen;
      keyboard graphic absent in photo mode and present in text mode; `Send` publishes and navigates;
      `Close` returns to `/status` without publishing.

- [x] **T006** - Status page: `hasPhoto` and a provisional photo subtitle; the `role="status"` region
      renders an `<img>` with the persisted `src` and literal alt text for a photo, and the text
      region is not rendered. **Tests first**: photo renders and the text region is absent; the tip
      still shows when nothing is published; a data URL containing markup-like text is inert.

- [x] **T007** - Entry point: the camera circle navigates to `/status/compose?kind=photo`. The note
      circle and the row body are unchanged. **Tests first** in `status-page.spec.ts`.

- [x] **T008** - E2E, **authored and not run** (Playwright paused, owner directive 2026-09-26):
      `status-compose.spec.ts` gains a photo case using `setInputFiles` (choose → preview → `Send` →
      feed shows the photo → reload keeps it); `status.spec.ts` gains "the camera circle opens photo
      mode". Existing assertions are untouched, since an absent `kind` param is text mode.

- [x] **T009** - G2: `npm run build` green, then the **full** unit suite green with the exact count
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

Suite: **691 / 691 SUCCESS** (`npx ng test --watch=false --reporters=progress`), `npm run build`
green, both on 2026-10-01. Baseline before F-050 was 658; F-050 added **33** tests (7 photop helper,
11 photo store, 11 compose photo-mode + 4 net-new text-mode-structure, 3 net-new feed). Test names
are quoted exactly as they appear in the files.

| FR | Task | Named test evidence |
|----|------|---------------------|
| FR-001 | T007 | `StatusPage` › "camera opens photo mode, note opens the text composer (FR-001)" |
| FR-002 | T004, T005 | `ComposePage` › "photo mode renders the labelled file input and omits the keyboard graphic (FR-002)"; "Send is disabled until an image is chosen, and enabled once decoded (FR-002)"; "shows a preview of the chosen photo and publishes it (FR-002, FR-004, FR-005)" |
| FR-003 | T005 | `ComposePage` › "photo mode renders the labelled file input and omits the keyboard graphic (FR-002)"; "a plain navigation to the composer is text mode (FR-001, FR-003)" |
| FR-004 | T002, T003 | `status-photo.spec` › "is not an image it resolves null rather than throwing"; `status.store.spec` › "refuses a payload that is not a data:image URL (FR-004, FR-007)"; `ComposePage` › "a file that is not an image leaves Send disabled and publishes nothing (FR-004)" |
| FR-005 | T003 | `status.store.spec` › "stores a photo and returns it (F-050 FR-005)"; "a photo replaces a text status and a text publish replaces a photo (F-050 FR-005)"; "ids stay monotonic across text and photo publishes (F-050 FR-005)"; `ComposePage` › "picks a second file in place of the first rather than stacking (FR-005)" |
| FR-006 | T001, T003 | `status.store.spec` › "a snapshot whose photo is malformed loads as a text status with the photo dropped (F-050 FR-006)"; "an F-049 snapshot with no photo key loads unchanged (F-050 FR-006)" |
| FR-007 | T003 | `status.store.spec` › "refuses an over-budget payload and keeps the previous status (F-050 FR-007)"; "refuses a payload that is not a data:image URL (FR-004, FR-007)" |
| FR-008 | T006 | `StatusPage` › "renders a published photo and not the text region (FR-008)"; "a photo status survives a reload via the store (F-050 FR-005, FR-008)"; "a photo data URL containing markup-like text stays an inert img src (FR-008)" |
| FR-009 | T006 | `StatusPage` › "the My Status subtitle shows the provisional photo label for a photo status (FR-009)" |
| FR-010 | T004 | `ComposePage` › "uses the injected Clock for the photo (FR-010)" |
| FR-011 | T005 | `ComposePage` › "Close returns to /status without publishing (FR-011)" |

## Analysis pass (the `/speckit.analyze` gate)

Run 2026-10-01 at closure, after T001–T008. Result: **no unresolved contradiction** between
`spec.md`, `plan.md`, `tasks.md` and the shipped code. Four items were found and resolved rather
than left open:

1. **T002's signature text was internally contradictory.** It promised a `Promise<string>` while
   also requiring a non-decodable file to "resolve `null`". The contract was always "one failure
   channel, not a rejection", and the implementation resolves `Promise<string | null>`. Recorded
   here so the task and the code agree; reworded rather than re-contracted.
2. **T006 named a `hasPhoto` member that would be dead code.** The template needs the `photo`
   branch narrowed on the entry, which `@if (status.photo; as photo)` does directly; a separate
   `hasPhoto` computed would have read a signal only to re-read the same field in the template.
   The requirement (photo renders, text region suppressed) is delivered as written.
3. **The test wait for the async decode could not rely on `whenStable`.** An `Image` load is not a
   task zone.js tracks, so `whenStable()` returned before the data URL landed and a clock-based
   poll was flaky under load. Resolved in the implementation, not just the test: the page shows a
   `decoding` state (a real UX gap — a button sitting inert through read-decode-encode reads as
   broken), and the spec takes `fixture.autoDetectChanges()` so the DOM mutates on the zone turn the
   decode finishes in, letting the tests await a MutationObserver with no fixed sleep and no rAF
   spin. The provisional "Preparing photo…" copy is recorded in `spec.md`.
4. **`aria-label` on the `My Status` row was hardcoded `Add to my status`.** The visible subtitle
   became data-driven in F-049, so a photo publish made the announced state a lie before the
   visible state. The label now mirrors `subtitle()`; FR-009's "invitation must not persist over a
   photo" now holds for assistive technology too.

Consistency checks that passed: no route change (the `kind` query param rides `status/compose`);
`StatusStore` stays reachable only through `PersistencePort`; no wall-clock read outside `Clock`;
no shared component, existing token, `LocalStorageAdapter` or other store modified; the feed photo
and preview are covered by cover/contain-fit rules using values already present on the screen.

## Closure (G3)

**F-050 is closed with G1 still BLOCKED.** The structural and behavioural work is shipped; the
capture-gated presentation questions (T010–T012) and the deferred keyboard (T013) remain open and
are not claimed as done.

- **Files changed**: `status.model.ts`, `status.store.ts`, `status.store.spec.ts`;
  `status-photo.ts`, `status-photo.spec.ts` (new); `compose-page.{ts,html,scss,spec.ts}`,
  `status-page.{ts,html,scss,spec.ts}`, `tests/e2e/status-compose.spec.ts`,
  `tests/e2e/status.spec.ts`.
- **Commits**: `cc31984` docs(spec) · `bee68cc` store + helper (T001–T003) · `8e54f5d` photo
  compose (T004–T005) · `983ea4c` compose tests · `e702e13` feed + camera entry (T006–T007) ·
  `71f553e` feed tests · `2e14638` E2E authored (T008) · this closure commit.
- **G2 evidence**: `npm run build` green; unit **691 / 691 SUCCESS**.
- **G3 evidence**: drift notes added to specs 006, 007 and 035, the gap audit, and
  `figma/design-map.md` rows 6–7. This table is the per-FR checklist.
- **PROVISIONAL until T011/T012**: the photo preview (232px, cover, radius 8, gap 16), the feed
  photo (43px band, cover-fit, left-padded 13 to match the row), the subtitle copy **"A photo"**,
  the alt text **"Status photo"**, the decoding copy "Preparing photo…", and the labelled-file
  treatment. All recorded in the spec; no Figma node is cited for any of them.
- **Deferred, not silently dropped**: the on-screen keyboard (T013, capture-gated, inherits the
  owner's "keep both" decision), camera capture (blocked F-012), video/multi-photo/captions,
  delivery and other people's statuses.
- **Known limitations recorded rather than fixed**: the downscaled JPEG quality (0.72) and the
  640px cap are hypotheses fitted to the character budget, not sourced values; the file input
  carries no `capture` attribute (unsourced and camera-blocked anyway).
