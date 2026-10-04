# Tasks: Composer Attachment (feature 058)

Each task is one commit-sized unit. Commit order: `docs(spec)` → `feat` → `test` → `docs(spec)`
closure. Playwright stays paused (2026-09-26): **e2e authored, never executed** — recorded `[ ]`
with the directive date.

## T1 — docs(spec): spec, plan, research, tasks

- [x] `specs/058-composer-attachment/{spec,plan,research,tasks}.md` exist; clarify answers
  (2026-10-04) written into §Clarification; FR-001..FR-008 final; PROVISIONAL inventory recorded.
- Evidence: FR numbers trace to real code (§research), every consumer named.

## T2 — feat: additive model + store send path

- [ ] `chat-window.model.ts`: `FileInfo.dataUrl?: string` — additive, no other shape change.
- [ ] `chat.store.ts` pure helpers: `isSafeImageDataUrl`, `formatFileSize`, `splitFileName`,
      `filePreviewLabel(caption, file)` (PROVISIONAL `Photo` label recorded in spec).
- [ ] `ChatStore.sendAttachment(chatId, text, file): boolean` — refuses a missing file / unsafe
      `dataUrl` / `dataUrl` over `PHOTO_MAX_CHARS` (`false`, nothing persisted); appends the message
      (`nextMessageId()`, trimmed caption, `file`), persists, sets conversation preview via
      `filePreviewLabel`. (FR-005, FR-006)
- [ ] Hydrate sanitizes a loaded `file.dataUrl` that is not a safe image data URL (dropped, card
      stays). (FR-006)
- Files: `src/app/features/chat-window/chat-window.model.ts`, `src/app/core/chat.store.ts`.

## T3 — feat: composer sheet, pick, pending preview, explicit Send

- [ ] `composer.html`: un-disable `Add attachment`, wire it to open the sheet; add the
      `ActionSheet` binding; add two hidden file inputs (`accept="image/*"` photo, document) and the
      pending strip; `Emoji stickers`/`Record audio` stay `disabled`. (FR-001, FR-003, FR-004,
      FR-008)
- [ ] `composer.ts`: `attachOpen`, `pending`, `decoding` signals; photo pick awaits
      `downscaleToJpegDataUrl` (null → empty pending, FR-002); document pick builds metadata
      FileInfo; remove keeps the draft; `canSend` includes pending; `sendAttachment` output
      `{ text, file }`; input values reset after read; sheet rows `Photos & Videos` / `Document`
      only (no Camera row). (FR-001–FR-005, FR-007)
- [ ] `composer.scss`: pending strip styles, token-only, PROVISIONAL geometry recorded in spec.
- Files: `src/app/shared/components/composer/composer.{ts,html,scss}`.

## T4 — feat: wire chat-window → bubble render

- [ ] `chat-window-page.html/.ts`: forward `(sendAttachment)` → `store.sendAttachment`.
      (FR-005)
- [ ] `message-bubble.html/.ts`: inline `<img>` when `file.dataUrl`; caption line when `text`
      non-empty (image or file card); aria-label covers photo/caption. (FR-002, FR-005, FR-007)
- Files: `src/app/features/chat-window/chat-window-page.{ts,html}`,
      `src/app/shared/components/message-bubble/message-bubble.{ts,html}`.

## T5 — test: unit coverage (build + full suite green)

- [ ] `chat.store.spec.ts`: `sendAttachment` — persists; refuses missing file / unsafe `dataUrl` /
      oversized `dataUrl` (nothing appended); trims caption; sets preview (`Photo`, `name.ext`,
      caption); reload of a file message with and without `dataUrl`; hydrate drops an unsafe loaded
      `dataUrl`; seed file messages load unchanged. (FR-005, FR-006)
- [ ] `composer.spec.ts`: Add attachment opens the sheet; photo path decodes to a pending preview
      (canvas-made-image fixture, awaited — §research 4/7); non-decodable → empty pending;
      document path → metadata pending; remove-keeps-draft; Send with pending and no draft emits
      `{ text, file }`; caption sent alongside; stickers/voice still disabled; no-overflow. (FR-001
      –FR-004, FR-007, FR-008)
- [ ] `message-bubble.spec.ts`: photo bubble renders the image + caption; document card renders and
      gains a caption line; no-caption card unchanged. (FR-002, FR-005)
- [ ] Full unit suite green, exact count reported (baseline 771). No sleeps; local storage cleared
      per suite.
- Files: `src/app/core/chat.store.spec.ts`,
      `src/app/shared/components/composer/composer.spec.ts`,
      `src/app/shared/components/message-bubble/message-bubble.spec.ts`.

## T6 — test: e2e authored (not executed)

- [ ] `tests/e2e/chat.spec.ts`: open chat-006 → Add attachment → sheet → Photos & Videos →
      pick → preview strip → Send → inline photo bubble; Document path → file card; remove keeps
      draft; chat-list preview reflects the attachment; no overflow at 375px.
- [ ] Playwright pause directive recorded (2026-09-26) — authored only, never run.
- Files: `tests/e2e/chat.spec.ts`.

## T7 — docs(spec): drift notes + closure

- [ ] `specs/046-inert-control-sweep/disposition.md`: `composer-add-attachment` row → RESOLVED by
      058; `composer.html` F-046 comment updated to point at 058.
- [ ] `figma/design-map.md` row 2 note; `specs/design-gap-audit.md` changelog entry (2026-10-04).
- [ ] `specs/058-composer-attachment/spec.md` Status → ✅ Implemented (counts); `tasks.md`
      checkboxes + closure section (checkpoint, FR → test-name traceability, blocked-gate record).
- Files: as listed; exact unit/test counts reported.

## Closure

FR → test traceability (final), checkpoint, blocked gates — filled in at close of T7.

- FR-001 → `composer.spec.ts` … (T7 fill-in)
- FR-002 → `composer.spec.ts`, `message-bubble.spec.ts` … (T7 fill-in)
- FR-003 → `composer.spec.ts` … (T7 fill-in)
- FR-004 → `composer.spec.ts` … (T7 fill-in)
- FR-005 → `chat.store.spec.ts`, `chat-window-page`… (T7 fill-in)
- FR-006 → `chat.store.spec.ts` … (T7 fill-in)
- FR-007 → `composer.spec.ts`, `message-bubble.spec.ts` … (T7 fill-in)
- FR-008 → `composer.spec.ts` … (T7 fill-in)

**Blocked (recorded, not skipped)**: G1 Figma capture — expired OAuth token `403` (2026-10-03); the
composer `0:8452` is verified but uncaptured and sheet/pending/bubble/preview have no seat node, so
all 058 chrome stays PROVISIONAL until the post-re-auth reconcile. Playwright paused (2026-09-26):
e2e authored only.