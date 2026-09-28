# Implementation Plan: Media, Photos and Links (feature 044)

**Input**: `specs/044-media-screen/spec.md`, `specs/044-media-screen/research.md`

**Gates**: G1 = capture BLOCKED (Figma `429`, reset 2026-10-02 18:38 UTC). The **entry row is
design-verified** (`0:9486`); the media screen's own chrome is PROVISIONAL. G2 = build + unit green,
e2e authored not run. G3 = closure + drift notes in 015 + gap audit.

## Approach

Derive, don't store. The screen is a `computed` over `ChatStore.conversationMessages(chatId)`. No
store change, no model change, no seed, no new shared component.

### Files

| File | Change |
|------|--------|
| `src/app/features/contact-info/media-page.ts` | **new** — route param, `media` computed, `Back` to `/contact/:id` |
| `src/app/features/contact-info/media-page.html` | **new** — nav bar, `role="status"` empty state, `ul` grid of tiles |
| `src/app/features/contact-info/media-page.scss` | **new** — `grid-template-columns: repeat(3, minmax(0, 1fr))` |
| `src/app/features/contact-info/media-page.spec.ts` | **new** — screen tests |
| `src/app/features/contact-info/contact-page.ts` | one branch in `onRowActivate`; `contact-groups` stays inert |
| `src/app/features/contact-info/contact-page.spec.ts` | the new navigation assertion + the still-inert groups row |
| `src/app/app.routes.ts` | `/contact/:id/media` **before** `/contact/:id/edit`? No — order is irrelevant, these are distinct literal segments; placed next to the other contact routes |
| `tests/e2e/media.spec.ts` | **new** — authored, not run |

### Derivation

```ts
protected readonly media = computed<MediaTile[]>(() =>
  this.store
    .conversationMessages(this.chatId())
    .filter((m) => m.file !== null)
    .toReversed()
    .map((m) => ({
      messageId: m.id,
      name: `${m.file?.filename}.${m.file?.ext}`,
      size: m.file?.size ?? '',
      time: m.time,
    })),
);
```

`MediaTile` is a page-local interface in `media-page.ts`. The optional chaining is honest about
`FileInfo | null` without an `any` or a cast-to-silence; the filter above has already narrowed the
value, so the `?? ''` fallbacks are unreachable rather than misleading.

`toReversed()` rather than `.reverse()` — the former does not mutate, and `conversationMessages()`
returns a stored array that must not be reordered in place.

### Grid

`repeat(3, minmax(0, 1fr))` with `minmax(0, …)` so a long filename shrinks its track instead of
forcing overflow (FR-010). Filename text is `overflow-wrap: anywhere` so `IMG_0475.png` cannot push a
tile wider than its track. Square tiles via `aspect-ratio: 1` on the tile, which is what FR-003's
glyph sits in.

### Tile activation

FR-006 makes a tile tap an observable no-op: there is no media viewer in this design. The tile is a
`role="button"` with `tabindex="0"` and a `(keydown.enter)` handler that does nothing, so the
no-op is real and testable rather than an unlabelled `<div>`. Recorded in `spec.md`, not left as a
silent hole.

### Route

`/contact/:id/media` sits alongside `/contact/:id/edit`. Angular matches full segments, so
`media` and `edit` cannot collide, and `:id` is captured identically by both.

## Ordering

1. `media-page.{ts,html,scss}` — the screen, with a stub route so it compiles.
2. `app.routes.ts` + the `contact-page.ts` branch.
3. `media-page.spec.ts` and the `contact-page.spec.ts` additions.
4. e2e spec, drift notes, closure.

Steps 1–2 are one `feat` commit; 3–4 are the `test` commit and the closure commit.

## Risks

- **Nine of ten contacts see an empty screen.** Correct, but it reads as broken. Mitigated by making
  the empty state explicit and tested (FR-004), and by not seeding fake media (research.md).
- **A tile that looks interactive but does nothing.** The biggest honesty risk in this feature. The
  spec names it (FR-006) and the test asserts navigation is not attempted.
- **Mutating the stored thread.** `toReversed()` avoids it; the test asserts the chat window still
  renders the thread in chronological order after visiting the media screen.
- **Provisional grid geometry.** 3 columns is a hypothesis. Nothing is captured, so there is no
  golden to re-baseline later.

## Drift policy

- `specs/015-contact-info` — the "Media/Groups rows remain no-ops" note is superseded for Media.
- `specs/design-gap-audit.md` — B7 done, B8 explicitly still open.
- `figma/design-map.md` — row 15 note.
