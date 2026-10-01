# Research: Status Publishing (feature 049)

## The gap, precisely

`compose-page.ts:18,22` — both handlers are empty with the comment *"F-007: publishing a status is a
later feature."* `specs/design-gap-audit.md` row 7 records it as open and names the blocker: *"Send /
Send-alt need the captured keyboard chrome and the design's segmented keyboard."*

## The compose screen cannot receive text today

`compose-page.html:55-58` renders the "type" area as a static pair of elements:

```html
<div class="compose__type" data-testid="compose-type" aria-hidden="true">
  <p class="compose__placeholder">Type a status</p>
  <span class="compose__caret"></span>
</div>
```

There is no `<input>`, no `<textarea>` and no `contenteditable`. The wrapper is
`aria-hidden="true"`, so the whole area is invisible to assistive technology as well. The keyboard is
`<img src="/status-compose-keyboard.png">` — a flat image.

So publishing is not one missing handler; it is a missing text-entry surface. That is why the
feature was never "one more control".

## Why the keyboard stays a PNG

The design's compose frame (`0:9634`) shows a **segmented** on-screen keyboard, not the QWERTY
layout. Reproducing it would require the key layout, each glyph's position, and the behaviour of its
special keys (space, backspace, return) — none of which exist in any captured artifact, and the
capture gate is still closed. Inventing those would be fabricating design under a screen that *is*
design-verified, which is worse than the honest limitation. Hence a real input plus the retained
provisional image.

## There is no status model and no store

`src/app/core/` contains exactly four stores — `chat`, `call`, `prefs`, and the persistence port's
adapter pair. Nothing models a status. The feed is a hardcoded tip:

```html
<div class="status-page__tip" data-testid="status-tip" role="status">
  <p class="status-page__tip-text">No recent updates to show right now.</p>
</div>
```

So F-049 creates the first store since F-047, and it must follow the pattern F-047 established.

## The store pattern, as established by F-045 and F-047

`call.store.ts` is the reference shape, and `ChatStore`/`PrefsStore` match it:

- `constructor(private readonly storage: PersistencePort)` — mandatory, and `hydrate()` is called
  from it.
- Versioned key: `wa.call-store.v1`, `wa.chat-store.v1`, `wa.prefs-store.v1`. F-049 uses
  `wa.status-store.v1`.
- A `version: 1` snapshot written through `storage.write`; `hydrate()` returns early on a version
  mismatch, a non-array payload or unparseable JSON, leaving the signal at its default.
- A **monotonic counter persisted in the snapshot** (`nextCallSeq`), because ids must not collide
  after a reload. F-049 carries `nextStatusSeq` for `status-<n>`.
- `Clock` (`core/clock.ts`) is the single source of "now"; stores and components pass `nowMs` in and
  never call `Date.now()`, which is what makes `fakeAsync` deterministic.

F-047 also established the normalizer discipline: a field added after `v1` shipped must be defaulted
on load, or an old snapshot renders a blank. F-049 ships at `v1` with a complete shape, so it needs
no normalizer — but the malformed-`myStatus` refusal in FR-006 is the same defensive intent.

## One entry, not a stack

Real WhatsApp lets a user post several statuses. The design has exactly **one** `My Status` row
(`status-page.html:12-39`), and the `Add to my status` subtitle is the empty variant of it. A list
would mean retaining entries nothing renders, which is dead data, and choosing which one the row
shows would be an unsourced rule. So the store holds one entry and a second publish replaces it.
Recorded in the spec as a Non-Goal rather than left implicit.

## Why the feed cannot show other people's statuses

Same reasoning as F-044's refusal and F-048's correction of it: showing other people would require
declaring who posted what and when. The owner ruled on 2026-10-01 that only the app's user's own
status renders, and that the existing tip stays for everyone else.

## Send-alt is messaging, not publishing

Real WhatsApp's "Type status" glyph opens a contact picker to choose who sees the status. That is
delivery, and delivery is a backend concern. F-046's rule — a control that does nothing must be
honestly disabled, never a click-through no-op — is the binding constraint, and it already has a
precedent in the five notification switches that were disabled rather than left live-but-dead.

## Reusable surface

Nothing needs to be added. `NavigationBar`, `TabBar` and `UserAvatar` already exist and are already
used by both pages; the input reuses the existing `.compose__placeholder` token styling so no new
value enters the token map. `Clock` and `PersistencePort` are both injectable.

## Risk: a screen with two keyboards

Retaining the PNG while the OS keyboard is up could look wrong. The alternative — removing the
image — would delete design-verified chrome (`0:9634` *is* the design's keyboard) on the strength of
a cosmetic guess. Keeping it and recording the overlap is the honest trade, and it is listed in the
spec's UNKNOWN section for the capture gate to settle.

## Risk: the existing suites encode the inert behaviour

Three assertions must change, and each is a real behaviour change rather than a test to be edited
into agreement:

- `compose-page.spec.ts` — *"send glyphs, placeholder and keyboard are no-ops"* asserts
  `router.navigate` was not called. `Send` now navigates.
- `compose-page.spec.ts` — the placeholder is asserted as a `.compose__placeholder` element's text.
  It becomes an input's `placeholder` attribute.
- `status-page.spec.ts` — *"renders the tip with the no-recent-updates message"* asserts the tip
  unconditionally. It becomes conditional.

Each is called out in `tasks.md` so the change is a spec consequence, not a test quietly relaxed.