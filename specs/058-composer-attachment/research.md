# Research: Composer Attachment (feature 058)

Gathered from the working tree (build 771/771 baseline, F-057 landed). No web sources needed: every
claim here was verified by reading the file named.

## 1. The control to re-enable

`src/app/shared/components/composer/composer.html` (design-verified row 2, group `Send Message`
`0:8452`):

```html
<button class="composer__control composer__add" type="button" aria-label="Add attachment" disabled>
```

F-046 FR-004 disabled it with an honest comment: *"three controls below are honestly disabled… Each
has no destination feature yet, and the camera screen (F-012) supplies no way to send a capture back
to the composer."* `composer.ts` has no handler for it and no file input. The other two disabled
controls are `Emoji stickers` (in the field) and `Record audio` (mic slot shown when no draft).
`composer.ts` currently wires only `Camera` → `/camera` and `Send`.

## 2. The message model already supports files

`chat-window.model.ts`:

```ts
interface FileInfo { filename: string; ext: string; size: string; }
interface Message { id; sender; text; time; file: FileInfo | null; }
```

Three consumers already derive from `Message.file`:
- `message-bubble.html` renders a file card (`filename`, `size`, `ext`) when `message().file` is set;
  it has no image renderer and no caption line.
- `media-page.ts` (F-044) maps every `message.file !== null` entry to a tile (`name = filename.ext`,
  `size`); a sent attachment is automatically visible there.
- `chat.store.ts:180` `starredEntries()` falls back `message.text || message.file?.filename`.

Seed `chat-window.seed.ts` has four file-only messages (`msg-005/006/012/013`, `IMG_0475` etc.,
`file: { filename, ext: 'png', size }`) — file messages already hydrate and render. Any change must
keep them loading unchanged (spec FR-006).

## 3. Store shape and persistence

`chat.store.ts` snapshot `wa.chat-store.v1` = `{ version, conversations, threads, starred,
messageSequence, newChatCounter }`. `sendMessage` builds a `Message` via `nextMessageId()` (starts
1001), appends to `threads[chatId]`, sets the conversation `preview` to the body trmmed, persists.
Hydrate does **not** deep-normalize `Message` (additive-safe). `reset()` restores the seed.

The F-047 `LocalStorageAdapter.write` **swallows quota errors by design** — the F-050 precedent
(`StatusStore.publishPhoto`) is that the *store* enforces the size budget, because only the store can
keep the visible message and the persisted one identical. Reuse `PHOTO_MAX_CHARS` (400_000) from
`core/status-photo.ts` for photo `dataUrl`s; one-per-message (clarify Q3) bounds the cumulative
snapshot cost, and the F-050 640px edge cap makes the budget reachable.

## 4. The photo pipeline to reuse

`core/status-photo.ts` `downscaleToJpegDataUrl(file, maxEdge = 640, quality = 0.72)` → `Promise<
string | null>`, **never rejects**; `null` for a non-decodable image. `status.store.ts` guards with
`isPhotoDataUrl` — must start `data:image/` and never `data:image/svg`, so a "local" URL cannot be a
network fetch or attacker markup behind `<img src>`. The attachment store guard mirrors this exact
predicate (spec FR-006).

Producer pattern (`compose-page.ts`): a labelled `<input type="file" accept="image/*">` hidden by
CSS; `onFileChosen` reads `files.item(0)`, sets `decoding`, awaits the helper, sets the result; the
decode is awaited in the page and nowhere else. Test-relevant note in `compose-page.ts`: *an `Image`
load is not a task zone.js tracks*, so tests must **await the decode promise** — `whenStable()` alone
returns before the decode lands. `status-photo.spec.ts` builds real image files from a canvas
(`makeImageFile(width, height)`) because Karma runs a real Chrome; the composer photo tests should
use the same fixture pattern and `await` the promise.

## 5. The sheet surface

`shared/components/action-sheet` (`ActionSheet`) is the established bottom sheet for choices
(call-info F-043, chat More, F-057 flows): `actions: Action[]` with `{ id, label, disabled? }`,
`role="dialog"` `aria-modal`, backdrop dismiss, tracked by seed ids. Compos in chat-window already
imports it. Reuse — the composer's sheet is the same surface, not a new component.

## 6. Candidates rejected / deferred

- **Storing document bytes**: rejected. Arbitrary documents could exceed localStorage's budget and
  there is no delivery pipeline; metadata-only is the honest reference (spec FR-003).
- **`Camera` sheet row**: rejected — F-056 `/camera` cannot return a capture into the composer, so
  the row would dead-end; already excluded by the composer's own F-046 note (FR-001).
- **Multi-photo selection / thumbnail strip**: deferred (clarify Q3 = one per message).
- **Sticker picker, voice notes, live capture, real delivery**: separate deferrals, unchanged.

## 7. Determinism and hygiene for tests

No `setTimeout` sleeps; the decode promise is awaited explicitly. `localStorage` cleared in
`beforeEach` and the store reset (F-013 reset convention) so suites pass in any order. `data-testid`
on the sheet, strip, and both inputs; toggling the same file twice re-fires because the input value
is reset after read.