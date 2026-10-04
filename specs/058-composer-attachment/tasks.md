# Tasks: Composer Attachment (feature 058)

Each task is one commit-sized unit. Commit order: `docs(spec)` → `feat` → `test` → `docs(spec)`
closure. Playwright stays paused (2026-09-26): **e2e authored, never executed** — recorded `[ ]`
with the directive date.

## T1 — docs(spec): spec, plan, research, tasks

- [x] `specs/058-composer-attachment/{spec,plan,research,tasks}.md` exist; clarify answers
  (2026-10-04) written into §Clarification; FR-001..FR-008 final; PROVISIONAL inventory recorded.
- Evidence: FR numbers trace to real code (§research), every consumer named.

## T2 — feat: additive model + store send path

- [x] `chat-window.model.ts`: `FileInfo.dataUrl?: string` — additive, no other shape change.
- [x] `chat.store.ts` pure helpers: `isSafeImageDataUrl`, `formatFileSize`, `splitFileName`,
      `filePreviewLabel(caption, file)` (PROVISIONAL `Photo` label recorded in spec).
- [x] `ChatStore.sendAttachment(chatId, text, file): boolean` — refuses a missing file / unsafe
      `dataUrl` / `dataUrl` over `PHOTO_MAX_CHARS` (`false`, nothing persisted); appends the message
      (`nextMessageId()`, trimmed caption, `file`), persists, sets conversation preview via
      `filePreviewLabel`. (FR-005, FR-006)
- [x] Hydrate sanitizes a loaded `file.dataUrl` that is not a safe image data URL (dropped, card
      stays). (FR-006)
- Files: `src/app/features/chat-window/chat-window.model.ts`, `src/app/core/chat.store.ts`.

## T3 — feat: composer sheet, pick, pending preview, explicit Send

- [x] `composer.html`: un-disable `Add attachment`, wire it to open the sheet; add the
      `ActionSheet` binding; add two hidden file inputs (`accept="image/*"` photo, document) and the
      pending strip; `Emoji stickers`/`Record audio` stay `disabled`. (FR-001, FR-003, FR-004,
      FR-008)
- [x] `composer.ts`: `attachOpen`, `pending`, `decoding` signals; photo pick awaits
      `downscaleToJpegDataUrl` (null → empty pending, FR-002); document pick builds metadata
      FileInfo; remove keeps the draft; `canSend` includes pending; `sendAttachment` output
      `{ text, file }`; input values reset after read; sheet rows `Photos & Videos` / `Document`
      only (no Camera row). (FR-001–FR-005, FR-007)
- [x] `composer.scss`: pending strip styles, token-only, PROVISIONAL geometry recorded in spec.
- Files: `src/app/shared/components/composer/composer.{ts,html,scss}`.

## T4 — feat: wire chat-window → bubble render

- [x] `chat-window-page.html/.ts`: forward `(sendAttachment)` → `store.sendAttachment`.
      (FR-005)
- [x] `message-bubble.html/.ts`: inline `<img>` when `file.dataUrl`; caption line when `text`
      non-empty (image or file card); aria-label covers photo/caption. (FR-002, FR-005, FR-007)
- Files: `src/app/features/chat-window/chat-window-page.{ts,html}`,
      `src/app/shared/components/message-bubble/message-bubble.{ts,html}`.

## T5 — test: unit coverage (build + full suite green)

- [x] `chat.store.spec.ts`: `sendAttachment` — persists; refuses missing file / unsafe `dataUrl` /
      oversized `dataUrl` (nothing appended); trims caption; sets preview (`Photo`, `name.ext`,
      caption); reload of a file message with and without `dataUrl`; hydrate drops an unsafe loaded
      `dataUrl`; seed file messages load unchanged. (FR-005, FR-006)
- [x] `composer.spec.ts`: Add attachment opens the sheet; photo path decodes to a pending preview
      (seam-driven — see closure FR-002 deviation); non-decodable → empty pending;
      document path → metadata pending; remove-keeps-draft; Send with pending and no draft emits
      `{ text, file }`; caption sent alongside; stickers/voice still disabled. (FR-001
      –FR-004, FR-007, FR-008; no-overflow moved to the authored e2e — see closure)
- [x] `message-bubble.spec.ts`: photo bubble renders the image + caption; document card renders and
      gains a caption line; no-caption card unchanged. (FR-002, FR-005)
- [x] Full unit suite green, exact count reported (baseline 771). No sleeps; local storage cleared
      per suite.
- Files: `src/app/core/chat.store.spec.ts`,
      `src/app/shared/components/composer/composer.spec.ts`,
      `src/app/shared/components/message-bubble/message-bubble.spec.ts`.

## T6 — test: e2e authored (not executed)

- [ ] `tests/e2e/messaging.spec.ts` (authored; never run — pause directive 2026-09-26):
      open chat-006 → Add attachment → sheet → Photos & Videos → pick → preview strip → Send →
      inline photo bubble; Document path → file card; remove keeps draft; chat-list preview reflects
      the attachment; no overflow at 375px. **Deviation: `tests/e2e/chat.spec.ts` (plan reference)
      does not exist; the flow doc-spec frame already lives in the `messaging.spec.ts` describe**
      (`Composer attachment (feature 058)`), so it was authored there.
- [x] Playwright pause directive recorded (2026-09-26) — authored only, never run.
- Files: `tests/e2e/messaging.spec.ts`.

## T7 — docs(spec): drift notes + closure

- [x] `specs/046-inert-control-sweep/disposition.md`: `composer-add-attachment` row → RESOLVED by
      058, with a drift-note section. **Deviation: the `composer.html` F-046 pointer comment was
      removed by the T3 rewrite (no stub to point anywhere); the disposition note records that.**
- [x] `figma/design-map.md` row 2 note; `specs/design-gap-audit.md` changelog entry (2026-10-04).
- [x] `specs/058-composer-attachment/spec.md` Status → ✅ Implemented (counts); `tasks.md`
      checkboxes + closure section (checkpoint, FR → test-name traceability, blocked-gate record).
- Files: as listed; exact unit/test counts reported.

## Closure

Full unit suite **794/794 SUCCESS** (baseline 771 → +23; `npm run build` green). Full e2e
**paused** by owner directive (2026-09-26).

FR → test traceability (test name → file):

- FR-001 → `composer.spec.ts` "re-enables Add attachment and opens a sheet offering exactly photos
  and a document"
- FR-002 → `composer.spec.ts` "decodes a picked photo into a removable pending preview (FR-002,
  FR-004)", "leaves the pending state empty when a photo fails to decode (FR-002)";
  `message-bubble.spec.ts` "renders an inline photo for a message whose file carries a data URL" —
  **method deviation: the unit spec drives a `decodePhoto` seam instead of a canvas-made image
  fixture (§research 4/7). An `Image` load is a macrotask zone.js does not track, so the fixture
  cannot be awaited deterministically; the seam defaults to `downscaleToJpegDataUrl` in production
  and the real decode keeps end-to-end coverage in `status-photo.spec.ts`.**
- FR-003 → `composer.spec.ts` "holds a picked document as metadata only (FR-003)"; `chat.store.spec.ts`
  "splits a file name into card halves…", "formats sizes for the card", "appends a document as
  metadata only…"
- FR-004 → `composer.spec.ts` "removes the attachment but keeps the draft text (FR-004)"
- FR-005 → `composer.spec.ts` "sends the caption and file together and clears both", "sends a
  file-only message when the draft is blank"; `chat.store.spec.ts` "appends a photo message…",
  "accepts a file-only message…", "persists a file message across a reload…", "refuses a missing
  file…"; `message-bubble.spec.ts` "renders a caption line for a photo that was sent with one",
  "gains a caption line below the existing file card meanwhile"; e2e "sending a photo renders an
  inline photo bubble…"
- FR-006 → `chat.store.spec.ts` "only ever accepts inline image data URLs", "refuses an unsafe data
  URL before it can reach an img src", "refuses a data URL that cannot fit the persisted snapshot",
  "drops an unsafe data URL on hydrate but keeps the file card", "keeps the seed file messages
  loading unchanged"
- FR-007 → `message-bubble.spec.ts` "labels a photo bubble as a photo in the aria-label"
- FR-008 → `composer.spec.ts` "dismisses the sheet with Escape"
- No-overflow → e2e only ("the pending strip does not overflow the 375px canvas") — **method deviation:
  plan.md put a no-overflow case in the unit composer suite; the pending strip's geometry is only
  meaningful at a real 375px canvas, so it lives in the authored e2e.**

**Blocked (recorded, not skipped)**: G1 Figma capture — expired OAuth token `403` (2026-10-03); the
composer `0:8452` is verified but uncaptured and sheet/pending/bubble/preview have no seat node, so
all 058 chrome stays PROVISIONAL until the post-re-auth reconcile. Playwright paused (2026-09-26):
e2e authored only.
