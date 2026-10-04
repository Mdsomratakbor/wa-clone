# Feature Specification: Composer Attachment (pick · preview · send a file)

**Feature Branch**: `058-composer-attachment`

**Created**: 2026-10-04

**Status**: ✅ **Implemented** (2026-10-04) — build green, full unit suite **794/794** (baseline 771
→ +23), e2e authored only (Playwright paused 2026-09-26). G1 capture still blocked (expired Figma
token), so the 058 attachment sheet, pending strip, photo bubble, and chat-list preview string
remain PROVISIONAL until the post-re-auth reconcile.

**Input**: `figma/design-map.md` row 2 (composer, group `Send Message`, node `0:8452`, design-
verified) + `specs/046-inert-control-sweep/disposition.md` deferral destination "attachment
(doc/media) pipeline" + `src/app/shared/components/composer/composer.html` (F-046 FR-004) +
`src/app/features/chat-window/chat-window.model.ts` (`Message.file`).

---

## Premise

F-046 FR-004 honestly disabled the composer's `Add attachment` button:

> ```html
> <button class="composer__control composer__add" type="button" aria-label="Add attachment" disabled>
> ```

Its recorded destination is the **attachment pipeline** — the deferral this feature resolves.
Everything the pipeline needs already exists and is verified:

- `Message` / `FileInfo` (`chat-window.model.ts`) already carry a `file: { filename, ext, size }`
  on messages; the seed has four such messages (`msg-005/006/012/013`), and `message-bubble.html`
  already renders a file card (name, size, ext) for them.
- `ChatStore.sendMessage` persists messages into the versioned `wa.chat-store.v1` snapshot; a file
  message is just a `Message` with `file !== null`.
- `F-044` media grid (`/contact/:id/media`) already derives its tiles from `Message.file` entries,
  so a sent attachment is immediately visible there — a second consumer of the same data.
- F-050's `downscaleToJpegDataUrl` (`core/status-photo.ts`) is a tested, pure downscale-to-JPEG
  helper; `compose-page.ts`/`camera-page.ts` show the established picker pattern
  (`<input type="file">` + hidden, `onFileChosen` reads `files.item(0)`, decode is explicit).
- `ActionSheet` (`shared/components/action-sheet`) is the established sheet surface for this kind
  of choice (call-info, chat More); it already supports `disabled` rows.

So the gap is connective: un-disable `Add attachment`, offer the pick, hold the file until the user
sends (or cancels), append a file message to the thread, and keep that message honest on reload.

## PENDING design inventory (all PROVISIONAL)

There is **no Figma node for an attachment sheet, an attachment preview, a photo bubble, or a file
caption** — the design file exposes only the composer `0:8452` (verified, and uncaptured). Every new
chrome below is therefore **PROVISIONAL** per the no-node precedent (F-044/045/048/056/057):
built from the existing token maps and recorded here for the post-re-auth reconcile. No node ID is
invented; the F-051/052/053 pending values share the same reconcile list.

- [ ] The attachment sheet that `Add attachment` opens — row set, order, labels (`Photos &
      Videos`, `Document`). PROVISIONAL.
- [ ] A pending-attachment strip on the composer while a file is attached but not yet sent (photo
      thumb / name / size / remove). PROVISIONAL.
- [ ] A photo bubble in the thread: inline JPEG (`file.dataUrl`) + an optional caption line; a
      document keeps the existing file card and gains a caption line. PROVISIONAL.
- [ ] The chat-list preview string for a sent file message (`Photo` / `📎 name.ext` / caption).
      PROVISIONAL.
- [ ] Golden for the composed-with-attachment state — gated at G1 (capture blocked).

## Clarification (resolved — 2026-10-04)

> Constitution Art. I: ≤3 questions per pass. Answers below are owner-approved and binding.

1. **Photo persistence model** — **(a) Downscaled JPEG data URL** (owner, 2026-10-04): reuse F-050's
   `downscaleToJpegDataUrl` (640px edge cap); the message's `FileInfo.dataUrl` holds the URL, the
   bubble renders the actual image inline, and it survives reload. Bounded by a char cap enforced at
   send time (same honest contract as `StatusStore.publishPhoto`: refuse before the adapter silently
   swallows a quota error). Documents stay metadata-only — no bytes are ever persisted for them.
2. **Interaction model** — **(a) Pending preview + explicit Send** (owner, 2026-10-04): picking holds
   a **removable** attachment strip on the composer; the draft text becomes the optional caption;
   Send appends the file message and clears both strip and draft. Nothing auto-sends; removing the
   attachment leaves the draft untouched.
3. **Selection breadth** — **(a) One per message** (owner, 2026-10-04): a single file input, one
   pending file at a time, deterministic and matching the four single-file seed messages.

## Functional Requirements (final — clarified 2026-10-04)

- **FR-001**: `Add attachment` in the composer is re-enabled and opens an attachment sheet offering
  `Photos & Videos` and `Document`. Every sheet row either performs a real action or is honestly
  disabled (F-046). `Camera` is **not** a sheet row (F-056 cannot return a capture to the composer,
  per the composer's own note).
- **FR-002** (`Photos & Videos`): a real file picker (`accept="image/*"`, single); a picked photo is
  downscaled with the F-050 helper and held as pending. A non-decodable image resolves `null` and
  leaves the pending state empty — never a broken preview. `FileInfo.dataUrl` is additive.
- **FR-003** (`Document`): a real file picker, any non-image file; a picked document is held as
  metadata only (`filename`, `ext`, `size`, no `dataUrl`) — the card is honest about being a
  reference, so arbitrary bytes never enter `localStorage`.
- **FR-004**: while a file is pending, the composer shows a removable attachment preview (photo
  thumb / name / size); the draft still types and is sent as the caption alongside the file;
  removing the attachment leaves the draft untouched; a pending file is never auto-sent.
- **FR-005**: `Send` with a pending file appends a `Message` with `file` set and a trimmed caption
  (`text`, may be empty) and persists in `wa.chat-store.v1`; the thread renders it; the chat-list
  preview, the F-044 media grid and starred-messages all derive honestly from the same message.
  Blank caption is fine (file-only message); a missing file is refused.
- **FR-006**: a `FileInfo.dataUrl` must be a safe inline image data URL (never `https://`, never
  `data:image/svg`) and its length is capped at send time; oversized photos are refused before
  persistence. Reload normalization keeps old snapshots working — the seed and pre-058 file
  messages (no `dataUrl`) still render as today.
- **FR-007**: Accessibility — the re-enabled control keeps `aria-label`; the sheet is
  `role="dialog"` `aria-modal` with focusable rows; the pending strip is announced (`role="status"`)
  and removable by keyboard; stable `data-testid`s; no horizontal overflow; disabled = real
  `disabled`.
- **FR-008**: the composer's other honestly-disabled controls (`Emoji stickers`, `Record audio`)
  stay disabled — their destinations are separate deferrals, not this feature.

## Non-Goals

- Sticker picker and voice-note recording (separate deferrals; controls stay disabled).
- Sending a captured photo from `/camera` back into the composer (F-056 cannot do this yet).
- Real upload/download/network delivery; the `Message.file` stays a local reference.
- Multi-recipient send, or sending to anything but the open conversation.
- Changing `Message`/`FileInfo` non-additively, or changing design-verified composer chrome beyond
  un-disabling the one control and adding the pending strip.
- Capturing the missing Figma nodes (G1 blocked; everything above stays PROVISIONAL).

## User Stories

- **US1 (pick)**: I tap `Add attachment`, choose a photo or document, and see it held as a preview
  in my composer — nothing is sent until I say so.
- **US2 (caption + send)**: I can type a caption, then Send; the thread shows the file (image inline
  for photos) and the chat list reflects the attachment honestly.
- **US3 (manage)**: I can remove the pending attachment before sending without losing my draft.
- **US4 (remember)**: The sent attachment is still there after reload, and visible in the contact's
  media grid and starred messages the same way my text messages are.

## Acceptance Criteria (validation targets)

1. Unit — new `composer-attachment` tests plus `chat.store.spec.ts` cases for
   `sendAttachment`-equivalent store behavior (persistence, file refusal, caption trim, reload of a
   file message, snapshot compatibility); `composer.spec.ts` updated: `Add attachment` now opens the
   sheet (the F-046 "disabled without handler" assertion is replaced, not renamed); no sleeps,
   local storage cleared per suite; full suite green with exact count.
2. E2E authored only (Playwright paused 2026-09-26): `tests/e2e/chat.spec.ts` walks pick → preview
   → send → bubble, document path, and remove-without-draft-loss.
3. Responsive: no-overflow cases for the sheet and pending strip at 375px.
4. Drift notes in `specs/046-inert-control-sweep/disposition.md` (composer-add-attachment row →
   RESOLVED), the `composer.html` F-046 comment now pointing at 058, and `specs/design-gap-audit.md`
   changelog entry.

## Swap list

- `composer.html`: un-disable `Add attachment`, wire it; add the pending strip markup.
- `composer.ts`: attachment sheet state, picker handlers, pending-state signals, remove/send/cancel.
- `composer.scss`: pending strip (tokens, provisional) — only if genuinely new, note in spec.
- `chat-window-page.ts/.html`: forward the composer's new `sendAttachment` event to the store;
  render the photo bubble via `message-bubble`.
- `message-bubble.html/.ts`: render the inline photo when `file.dataUrl` is present; a caption line
  under the image or the existing file card.
- `chat-window.model.ts`: extend `FileInfo` **additively** with `dataUrl?: string` (clarify Q1).
- `chat.store.ts`: a send-with-file path (extend `sendMessage` or add `sendAttachment`),
  photo char-cap refusal, honest chat-list preview for file messages.
- `chat-window.seed.ts`: unchanged — the seed's four `file` messages must keep loading.

## Closing note (deliberately incomplete)

Spec, plan, tasks and contracts are not finalized until the clarify answers (2026-10-04) are
written into §Clarification. No code until then.