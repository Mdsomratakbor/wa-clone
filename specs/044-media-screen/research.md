# Research: Media, Photos and Links (feature 044)

## Gap audit B7

`Media, photos and links` on Contact Info (row 15, `0:9486`). Seeded in F-015 as
`contact-info.seed.ts` row `contact-media` and left inert by `contact-page.ts`:

```ts
protected onRowActivate(row: SettingsRowSeed): void {
  // F-015: media/groups targets are later features (spec Non-Goals).
  if (row.id === 'contact-starred') {
    void this.router.navigate(['/starred-messages']);
  }
}
```

The same comment covers `contact-groups`, which is B8 and stays inert.

## The row list and who sees it

`contact-page.html` renders the info rows only in the `@else` branch of `@if (isGroup())`. A group
shows a participants list instead. So `/contact/:id/media` is reachable only from a direct contact —
FR-007's claim needs no extra guard, but the spec states it so a future change to the row list
cannot silently expose a group path to an unbuilt screen.

## Where media data actually lives

`Message.file` is `FileInfo | null` (`src/app/features/chat-window/chat-window.model.ts`). The
thread seed (`chat-window.seed.ts`) has **four** file messages:

| Message | File | In thread |
|---------|------|-----------|
| `msg-005` | `IMG_0475.png` 2.4 MB | `chat-006` |
| `msg-006` | `IMG_0481.png` 2.8 MB | `chat-006` |
| `msg-012` | `IMG_0483.png` 2.8 MB | `chat-006` |
| `msg-013` | `IMG_0484.png` 2.6 MB | `chat-006` |

`chat.store.ts` seeds exactly one thread: `{ [THREADED_CONTACT_ID]: THREAD_SEED }` where
`THREADED_CONTACT_ID = 'chat-006'` (Martha Craig). Every other chat resolves through
`conversationMessages()`'s `this.threads()[chatId] ?? []`.

Consequence: the media screen is populated for one of nine contacts. That is why the empty state is
the default shipped state, and why the spec treats it as a first-class requirement (FR-004) rather
than an edge case.

## Why no store method

`conversationMessages(chatId)` already returns `readonly Message[]` and already has the `?? []`
fallback that FR-011 wants. A `mediaFor(chatId)` store method would be a pure pass-through of
`messages.filter(m => m.file !== null).reverse()` with no persistence involvement — and adding it
would put a derived, throwaway view into a store whose snapshot is versioned and audited. The
derivation belongs in the page's `computed`, which also gets memoization for free and recomputes
when the thread changes.

This differs from the F-041/F-042 pattern, where a store method existed because the data was itself
persisted. Here nothing new is persisted, so nothing new belongs in the store.

## Reusable surface

- `NavigationBar` with a `back` leading action — same as `starred-page.ts` and `broadcasts-page.ts`.
- `UserAvatar` — not needed on a media screen; the title carries the identity.
- The file glyph in `message-bubble.html` is an inline SVG scoped to that component's template. F-044
  inlines an equivalent 20x24 file glyph in its own template rather than extracting a shared
  component: one more consumer does not meet the "real repetition or clear behavioural ownership"
  bar in `AGENTS.md`, and extracting would mean touching a component shared by every chat.

## Precedent for a read-only pushed sub-screen

`starred-page.ts` is the closest shipped analogue: a `computed` from the store, a `Back` action that
returns to its origin, and a `role="status"` empty region. F-044 follows it. The difference is
`starred` is globally flat while media is scoped to one contact, hence the route param.

## Design availability

`figma/design-analysis.md` §6.1 lists 24 frames. Contact Info (`0:9486`) is present, so the row's
label and position are design-verified. No media grid frame exists. The Figma API is `429` until
2026-10-02 18:38 UTC regardless.

## Risk: the screen looks broken to a user

Nine of ten contacts land on an empty screen. That is correct behaviour, not a bug, but it is worth
being explicit: the spec ships no seed media precisely because seeding per-contact media would
contradict the chat window, which is the surface the user can compare against.
