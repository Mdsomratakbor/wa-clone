# Plan: Composer Attachment (feature 058)

**Scope**: Resolve the F-046 deferral "attachment (doc/media) pipeline" — re-enable the composer's
`Add attachment` control and give it a real flow: sheet → pick (photo/document) → pending preview →
explicit Send (draft = caption) → persisted file message in the thread. Per the owner clarify
answers (2026-10-04, spec §Clarification): photos persist as **downscaled JPEG data URLs** (F-050
helper, char-capped), documents persist **metadata only**, interaction is **pending preview +
explicit Send**, **one** file per message. One feature, one commit series:
`docs(spec)` → `feat` → `test` → `docs(spec)` closure. Playwright stays paused (2026-09-26): e2e
authored only.

## Approach (traceable to the spec)

1. **Model — additive only** (`chat-window.model.ts`): `FileInfo` gains `dataUrl?: string`.
   Pre-058 snapshots and the seed's four `file` messages carry no `dataUrl` and must keep loading
   unchanged (FR-006). No non-additive shape change.
2. **Store** (`chat.store.ts`): pure helpers + one send path.
   - `isSafeImageDataUrl(value)` — mirrors `StatusStore`'s `isPhotoDataUrl`: `data:image/` but never
     `data:image/svg`; a photo `src` must never be `https://` or attacker-markup (FR-006 safety).
   - `formatFileSize(bytes)` → human string (`KB`/`MB`), unit rules PROVISIONAL.
   - `splitFileName(name)` → `{ filename, ext }`; `ext` lowercased, whatever follows the last dot.
   - `filePreviewLabel(caption, file)` → trimmed caption, else `Photo` for a dataUrl file, else
     `name.ext` — the honest chat-list preview string (PROVISIONAL).
   - `sendAttachment(chatId, text, file): boolean` — refuses (`false`, nothing persisted) a missing
     file, an unsafe `dataUrl`, or a `dataUrl` longer than `PHOTO_MAX_CHARS` (same reason as
     `StatusStore.publishPhoto`: the adapter swallows quota errors, so only the store can keep the
     visible message and the persisted one identical). Caption trimmed (may be `''`). Message id via
     the existing `nextMessageId()`; conversation preview via `filePreviewLabel`.
   - Hydrate: sanitize loaded threads — a `file.dataUrl` that is not a safe image data URL is
     dropped from the message (the card metadata stays), so a stale/foreign snapshot cannot put
     attacker markup behind an `<img src>`.
3. **Composer** (`shared/components/composer`): un-disable `Add attachment` (FR-001).
   - The sheet reuses `ActionSheet` (imported into the composer) with two rows: `Photos & Videos`
     (`accept="image/*"`) and `Document` (metadata card). `Camera` is not a row (FR-001: F-056
     cannot return a capture to the composer).
   - Two hidden `<input type="file">`: photo path follows the `compose-page.ts` pattern — decode is
     awaited (`downscaleToJpegDataUrl`), `null` leaves the pending state empty (FR-002), and the
     input value is reset so selecting the same file again re-fires. Document path is synchronous
     metadata only (FR-003).
   - Pending state: `pending: FileInfo | null`, `decoding`, removable strip with `role="status"`
     (FR-004/FR-007). `canSend` = draft non-blank **or** pending present; `Send` emits
     `sendAttachment = output<{ text: string; file: FileInfo }>` and clears both. Removing the
     attachment leaves the draft untouched. `Emoji stickers` / `Record audio` stay `disabled`
     (FR-008).
4. **Chat window wiring** (`chat-window-page.ts/.html`) + **bubble** (`message-bubble`):
   chat-window forwards `(sendAttachment)` to `store.sendAttachment(...)`; `message-bubble` renders
   inline `<img>` when `file.dataUrl` is present, caption line when `message.text` is non-empty,
   and otherwise the existing file card (FR-002/FR-005). aria-label extended to cover photo/caption.
5. **Tests**: `chat.store.spec.ts` (send/refuse/oversize/unsafe/preview/caption/hydrate-sanitize/
   reload compatibility), `composer.spec.ts` (sheet open, photo decode pending via the
   canvas-made-image fixture pattern from `status-photo.spec.ts`, document pending, remove-keeps-
   draft, send emits `{text,file}`, sticker/voice still disabled), `message-bubble.spec.ts` photo +
   caption cases, no-overflow cases; e2e authored in `tests/e2e/chat.spec.ts`. No sleeps; decode
   promise awaited (`Image` loads are not zone-tracked tasks — `whenStable()` alone is not enough);
   `localStorage` cleared per suite.
6. **Docs**: drift notes — `specs/046-inert-control-sweep/disposition.md` (the
   `composer-add-attachment` row → RESOLVED by 058), the F-046 comment in `composer.html` now
   pointing at 058, `figma/design-map.md` row 2 note, `specs/design-gap-audit.md` changelog entry.

## Review gates

- **G1 (capture)** — **BLOCKED**: expired Figma token (`403`). The composer `0:8452` is design-
  verified but uncaptured, and the sheet / pending strip / photo bubble / preview string have **no
  node**; every value is PROVISIONAL, recorded in the spec §PENDING inventory for the post-re-auth
  reconcile. No node ID invented; goldens stay skipped.
- **G2 (plan)** — this plan + spec §Clarification (resolved 2026-10-04); proceed once spec/plan/
  tasks are self-consistent.
- **G3 (review)** — build green, full unit suite green with exact count (771 prior), drift notes
  landed, e2e authored-only, closure commits in order.

## Drift policy

The F-046 honesty contract is load-bearing: **do not re-enable a control without wiring it** —
everything this feature re-enables is wired; sticker/voice stay disabled. If implementation reveals
a requirement is wrong (e.g., the preview label or size format conflicts with the cannot-invent
rule), **stop** and run a clarify pass — never silently change the contract. PROVISIONAL copy may
not be presented as design-verified.