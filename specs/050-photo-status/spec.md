# Feature Specification: WhatsApp Photo Status (feature 050)

**Feature Branch**: `050-photo-status`

**Created**: 2026-10-01

**Status**: ✅ **Implemented** (T001–T009 done, build green, unit 691/691, 2026-10-01) — G1 capture
still **BLOCKED**, so T010–T012 (photo presentation reconcile) and T013 (the on-screen keyboard)
remain open. See [Closure](./tasks.md#closure-g3).

**Input**: design row 7 (`0:9634`, Status compose chrome) + the open gap "Publish a status" follow-up
raised after F-049 shipped

## Drift note (F-051, 2026-10-02) — on-screen keyboard decision reversed

On 2026-10-01 the owner decided to **wait for the capture** and declined a provisional QWERTY; the
on-screen keyboard and its "keep both" decision were recorded here as a capture-gated deferral and
open task T013. On **2026-10-02** the owner reversed that: the keyboard is now built **immediately**
and **provisional** by `specs/051-status-keyboard/` (a real segmented keyboard rendered from design
tokens, replacing the static band graphic). T013 below is therefore **superseded**, not silently
dropped: the F-051 spec inherits and confirms the "keep both" decision (the real input stays
focusable; on-screen keys insert into it).

## Drift note (F-052, 2026-10-02) — feed photo presentation superseded

FR-008's provisional photo treatment (the photo fills the existing 43px band, cover-fit, left
padding 13 to match the row) is **superseded** by `specs/052-status-photo-preview/`, approved the
same day because the smear was not informative: the published photo now renders as a rounded preview
block (radius 8px, gutters 16px, max-height 280px, `object-fit: cover`), and the band modifier plus
strip styles are deleted. The subtitle (`A photo`), `role="status"`, testids, `src`/`alt`, and the
store/model/route contract are unchanged. The photo geometry remains PROVISIONAL against the
T010–T012 reconcile.

## Clarifications

### Session 2026-10-01

The owner identified two remaining gaps in the Status feature and answered three scope questions.

- Q: The camera circle is labelled "Add a photo to my status" but opens the **text** composer. There
  is no working camera in this app (`getUserMedia` is unavailable and the `/camera` shutter is itself
  a no-op), so routing it to `/camera` would only move the lie one screen over.
  A (**owner**): **a real photo picker.** An `<input type="file" accept="image/*">` opens the device
  picker, the photo is downscaled to fit the storage budget, and the feed renders it. This is a
  genuine frontend capability with no backend behind it. The alternative — routing to the `/camera`
  stub — was explicitly rejected.
- Q: The design's segmented keyboard is a static PNG that cannot type, and its key layout and glyph
  positions exist in **no captured artifact**.
  A (**owner**): **wait for the capture.** Nothing is to be invented. The keyboard gap therefore
  **stays open** as a named, capture-gated deferral and is closed by a later feature once the real
  geometry exists. A provisional QWERTY was considered and declined.
- Q: When the on-screen keyboard is eventually built, should the real input stay usable with the OS
  keyboard too?
  A (**owner**): **keep both.** The input stays focusable and the on-screen keys insert into it, so
  screen-reader, switch and physical-keyboard users are not locked out. Recorded here so the later
  keyboard feature inherits the decision instead of re-litigating it.

## Summary

F-049 made the text composer real but left the **entry point** dishonest. Both circles on the `My
Status` row navigate to `/status/compose`, so tapping a control labelled *Add a photo to your status*
hands the user a text box. The label and the behaviour disagree, which is the same defect class as
the inert controls F-046 was created to remove — the difference is that this one *looks* finished.

F-050 gives the camera circle a real photo flow. Rather than inventing a new screen, photo mode
**reuses the design-verified compose chrome** (`0:9634` — the full-bleed pink surface, the `Close`
glyph, the `Send` glyph) and replaces only the text-entry region, which the design does not specify
for a photo. The photo's *presentation* is therefore the one PROVISIONAL element in this feature,
and no Figma node is cited for it.

`StatusEntry` gains an **additive, optional** `photo` field, so a snapshot written by F-049 loads
unchanged and a malformed photo is dropped at load instead of rendering `undefined` — the same
defect class F-049 fixed for the entry itself.

## Functional Requirements

- **FR-001** The camera circle (`Add a photo to my status`) opens the composer in **photo mode**,
  addressed as `/status/compose?kind=photo`. The note circle and the row body continue to open text
  mode. The circle's accessible name and the screen it opens now agree.
- **FR-002** Photo mode renders a real `<input type="file" accept="image/*">` with an associated
  label, and renders a preview of the chosen image. Until a file is chosen and decoded, `Send` is
  genuinely `disabled` — the same rule text mode follows for blank input.
- **FR-003** The keyboard graphic is **not** rendered in photo mode. A keyboard is meaningless when
  the interaction is choosing a file, and hiding the design's graphic is *less* invented than
  rendering it. Text mode renders it exactly as before.
- **FR-004** The chosen file is downscaled to a JPEG data URL before it reaches the store: its
  longest edge is capped and the encoding quality has a floor, so the payload fits the storage
  budget. A file that is not a decodable image leaves the preview empty and `Send` disabled — it is
  never published as a broken image.
- **FR-005** `StatusStore.publishPhoto(dataUrl, nowMs)` stores a single entry with `text: ''` and a
  `photo` payload, **replacing** any previous status (text or photo), and persists it. The entry id
  stays monotonic `status-<n>` and is issued from the same counter.
- **FR-006** `StatusEntry.photo` is additive and optional. `hydrate` loads an F-049 snapshot with no
  `photo` unchanged, and a snapshot whose `photo` is malformed loads as a text status with the photo
  **dropped** — never as an entry that renders `undefined`.
- **FR-007** `publishPhoto` refuses a payload over the store's byte budget. This is a store rule, not
  a UI nicety: `LocalStorageAdapter.write` swallows `QuotaExceededError` by design (F-047 FR-002), so
  an oversized photo would be published, shown, and then **silently vanish on reload**. Refusing up
  front is what keeps the visible status and the persisted status the same thing.
- **FR-008** The feed renders a published photo as an `<img>` whose `src` is the persisted data URL,
  with honest alt text, and does **not** render the text region for a photo status. A photo status
  survives a reload.
- **FR-009** The `My Status` row subtitle shows a provisional photo label when the current status is a
  photo, instead of the text or the `Add to my status` invitation.
- **FR-010** No wall-clock read: the page passes `Clock.now()` into `publishPhoto`, as F-049 does for
  `publish`. No `getUserMedia`, no network call, and no new dependency.
- **FR-011** `Close` in photo mode returns to `/status` without publishing anything, exactly as it
  does in text mode.

## Non-Goals

- **The on-screen keyboard.** Explicitly deferred by owner decision (2026-10-01) to a later,
  capture-gated feature, together with the recorded "keep both" input/OS-keyboard decision. It is
  tracked as an open task here, not quietly dropped.
- **Camera capture.** `getUserMedia` is unavailable and the capture chrome is capture-gated
  (F-012). This feature picks an existing file; it does not pretend to take a photo.
- **Video statuses, multi-photo statuses, captions, editing or deleting a status**, and any status
  privacy setting. One status, text or photo, replaced by the next publish.
- **Delivery or upload.** A photo status is local, like a text status. Nothing is sent anywhere, and
  the feed shows no recipient affordance implying otherwise.
- **Other people's statuses.** No social graph is invented, per the F-049 precedent.

## Review Gates

- **G1 (BLOCKED - Figma)**: the REST API returned `429` (`Retry after 375849s`, quota reset
  **2026-10-02 18:38 UTC**). The chrome this feature **reuses** is design-verified (`0:9634`).
  **PROVISIONAL**: the photo preview's size and crop, the published photo's size on the feed, the
  photo subtitle copy, and the image alt text — none of these exist in the file, and no node is
  invented for them.
- **G2**: `npm run build` green and the full unit suite green with the exact count reported.
- **G3**: closure commit, drift notes in every superseded spec, checklist + converge clean.

## Figma Reference

- Design row 7, Status compose (`0:9634`) — the full-bleed `#FF8A8C` surface, the `Close` glyph and the
  send glyph, all reused unchanged in photo mode. This is why photo mode is a mode of the existing
  screen rather than a new screen: it spends no invented chrome.
- **No Figma node shows a photo status, a photo preview, or a keyboard that types.** The design's
  photo variant and its segmented keyboard both exist only inside the compose frame, and the key
  geometry is not in any captured artifact. The capture-gated items are listed under G1 and in
  `tasks.md`; none is presented as design-verified.

## UNKNOWN / NEEDS CLARIFICATION

- Preview and feed sizing for a photo. **Hypothesis** - cover-fit within the existing feed band and
  a capped preview in the composer, using existing spacing tokens. No captured variant exists.
- Alt text for a photo status, which has no caption to describe. **Hypothesis** - short and literal
  ("Status photo"). Inventing a description of image *content* would be fabricating.
- Subtitle copy for a photo status. **Hypothesis** - a short photo label. The alternatives (showing
  nothing, or reusing `Add to my status`) are both worse: the first hides real state and the second
  invites a second publish that would destroy the photo.
- Whether the file input should also accept a capture (`capture` attribute) to open the camera
  directly on mobile. **Hypothesis** - no. It changes which dialog the OS shows, which is
  unsourced, and the camera path is blocked anyway.

## Assumptions

- A photo status is a single local image, with no text, no recipients and no delivery.
- `PersistencePort`'s payload is an opaque string, so a data URL needs no change to the F-047 seam
  and no new adapter.
- The origin's `localStorage` budget is finite, which FR-004 and FR-007 treat as a design constraint
  rather than an error to swallow.

## Out of Scope Changes

- `navigation-bar`, `tab-bar`, `user-avatar`, `PersistencePort` and `LocalStorageAdapter` are
  untouched. The adapter already swallows quota errors; FR-007 exists so that path is never reached
  with an oversized payload.
- `compose-page.html` changes only inside the entry region: photo mode adds the file input, label
  and preview, and omits the keyboard graphic. The surface, glyphs, `Close` behaviour and all of text
  mode are unchanged.
- `status-page.html` changes only inside the feed body and the row subtitle, as F-049 did.
- `status.model.ts` gains one optional field; no existing field changes type or meaning.
- `_tokens.scss` is unchanged.
- `chat-window` and all other features are untouched.

## Implemented (2026-10-01) — recorded, not design-verified

The PROVISIONAL hypotheses from `UNKNOWN / NEEDS CLARIFICATION` shipped as literal choices so that
T010/T011 have exact values to reconcile against a capture, and no node is cited for any of them:

- **Subtitle copy**: `A photo` (FR-009), replacing both the empty-string trap (`text: ''`) and the
  `Add to my status` invitation that would invite a second publish.
- **Alt text**: `Status photo` (FR-008) — short and literal, no invented description of content.
- **Preview**: 232px wide (the screen's design-verified field width), `object-fit: cover`,
  `border-radius: 8`, label pill 999 radius, `gap: 16`, using only values already present on the
  screen. Feed photo: the existing 43px band, `object-fit: cover`, left padding 13 to match the
  row's design padding.
- **Decoding state**: the page shows the provisional copy "Preparing photo…" while the file
  read-decode-encode runs (an inert button through an async step would read as broken), which is
  also the deterministic wait target the unit tests settle on.
- **Row `aria-label`**: now mirrors `subtitle()`. The hardcoded `Add to my status` predates
  F-049's data-driven subtitle and would have announced a photo status as an invitation — FR-009's
  intent ("no invitation over a photo") is honoured for assistive technology too. Recorded as a
  deviation rather than a silent spec change.
- **Failure path**: a non-image resolves to "no photo" and `Send` stays disabled (FR-004). The
  file input is visually the label, stays in the accessibility tree, keeps a real focus ring, and
  is unreachable by pointer as a 1px sliver.

## Validation Targets

### Unit

- `StatusStore`: `publishPhoto` stores `text: ''` plus the photo and replaces a prior status;
  refuses an over-budget payload and leaves the previous status intact; a photo survives a reload; a
  snapshot whose `photo` is malformed loads as a text status with the photo dropped; an F-049
  snapshot with no `photo` loads unchanged; ids stay monotonic across text and photo publishes.
- Downscale helper: produces a JPEG data URL, respects the edge cap, and rejects a non-image without
  throwing.
- `ComposePage` photo mode: renders the labelled file input, `Send` disabled until an image is
  chosen, the keyboard graphic absent in photo mode and present in text mode, `Send` publishes the
  photo and navigates to `/status`, `Close` returns to `/status` without publishing.
- `StatusPage`: renders the photo and not the text region for a photo status, shows the provisional
  subtitle, and still renders the tip when nothing is published.

### E2E (authored, not run)

- `tests/e2e/status-compose.spec.ts` — camera circle opens photo mode, choose a file, preview,
  `Send`, feed shows the photo, reload keeps it.
- `tests/e2e/status.spec.ts` — the camera circle reaches photo mode rather than the text composer.

## Definition of Done

- [ ] Every FR is covered by at least one named unit test
- [ ] The camera circle opens a photo flow, and its label matches what it opens (FR-001)
- [ ] A photo is picked, downscaled, published, rendered and restored after a reload (FR-004, FR-005, FR-008)
- [ ] An over-budget payload is refused rather than silently lost on reload (FR-007)
- [ ] A malformed photo is dropped at load, and an F-049 snapshot still loads (FR-006)
- [ ] The keyboard graphic is absent in photo mode and unchanged in text mode (FR-003)
- [ ] No `getUserMedia`, no network call, no new dependency (FR-010)
- [ ] The deferred keyboard is recorded as an open, capture-gated task — not silently dropped
- [ ] The blocked G1 gate is recorded, and the reused verified chrome is distinguished from the
      provisional photo presentation
- [ ] Drift notes are added to specs 006, 007, 035, the gap audit, and `figma/design-map.md`
- [ ] `npm run build` green; full unit suite green with the exact count reported
- [ ] Playwright specs authored; execution deferred per the owner directive (2026-09-26)
