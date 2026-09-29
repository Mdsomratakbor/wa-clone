# Research: Calling Flow and In-Call Screen (feature 045)

**Input**: `specs/045-calling-flow/spec.md`. Written before any code, to establish what exists,
what is missing, and what the honest limits are.

## 1. The four inert controls, located

B6 is not one dead button; it is four, in three files, all blocked on one missing destination.

| Control | Location | State today | Audit |
| ------- | -------- | ----------- | ----- |
| Chat header `Video call` | `src/app/shared/components/chat-header/chat-header.html:63` | `aria-label="Video call, coming soon"`, no `(click)` | A6 |
| Chat header `Call` | `src/app/shared/components/chat-header/chat-header.html:75` | `aria-label="Call, coming soon"`, no `(click)` | A6 |
| Sheet `Voice call` | `src/app/features/calls/call-info.seed.ts` id `voice-call` | rendered, focusable, `calls-page.ts:131` falls through | B6 |
| Sheet `Video call` | `src/app/features/calls/call-info.seed.ts` id `video-call` | rendered, focusable, same fall-through | B6 |
| Calls `+ new call` | `src/app/features/calls/calls-page.ts:99-101` | comment: "stays inert" | B6 |

The two header buttons are worth naming separately, because the audit understated them: they are
the **only** remaining dead controls on the chat window, and their aria-labels literally say
"coming soon" — a design-confession baked into the accessibility tree. F-043 and F-042 each
deliberately left their inert rows in place with an in-code comment naming the missing destination;
the header buttons have no such comment, so nothing in the code explains why they are dead.

## 2. What the design file actually contains

`figma/design-map.md` has two Calls rows:

- Row 4, Calls (`0:10395`) — the list, with `+ new call` in the nav.
- Row 5, Calls edit mode (`0:8597`) — `Done` / `Clear`.

Neither is an in-call screen, and no other row is one. **The in-call screen has no design source
and never will**, because it is not in the file. This is a different situation from F-041, F-042,
F-043 and F-044, where G1 was blocked and the chrome would become verifiable at the quota reset
(2026-10-02 18:38 UTC). Here there is nothing to wait for. The chrome is provisional by
construction, and the capture tasks for this feature will never verify it. `tasks.md` must say so
rather than leaving `T0xx` open in a way that implies they eventually close.

## 3. Store shape

`CallStore` (`src/app/core/call.store.ts`) is small and complete for its current job:

- `calls: signal<CallEntry[]>` seeded from `CALL_SEED`, hydrated from `wa.call-store.v1`.
- `removeCall(id)`, `clearCalls()` — both persist.
- `hydrate()` is a bare `snapshot.calls` set: **no normalization layer exists**, unlike
  `ChatStore.normalizeChats()`.

`CallEntry` (`calls.model.ts`) is `{ id, contactName, direction, date, avatarRef }`, with
`direction: 'incoming' | 'outgoing' | 'missed'`.

Two consequences for this feature:

- `direction` already has `'outgoing'`, so a placed call needs no new direction value. FR-008 needs
  an **outcome** that is orthogonal to direction: an outgoing call can complete or be missed before
  connecting, and `direction: 'missed'` cannot express both.
- Because `hydrate()` does not normalize, adding `outcome` **requires** adding a normalizer, or a
  pre-F-045 snapshot will load with `outcome: undefined` and the Calls list will render a blank
  status. This is the same defect class as F-042's `hydrateDefaults()` finding, where the v1
  snapshot test caught `kind === undefined`. The lesson carries: **write the v1-snapshot test first.**

## 4. Id convention

`ChatStore` uses monotonic counters for generated ids (`group-<n>`, and broadcasts by the same
shape). `CallStore` has none, because nothing generates a call id today. FR-007 needs one, so it
must persist alongside the calls or a reload will reissue `call-1` and collide with an existing
entry. That is a snapshot-shape change: `version` stays `1` with `outcome` optional and a
`nextCallSeq` default, rather than a `version: 2` bump that would discard every user's existing
log. Discarding the log to ship an optional field would be a bad trade.

## 5. Time

`AGENTS.md`: "no wall-clock reads in render paths", and tests must not depend on the real clock.
The in-call screen needs a running duration, so:

- A `Clock` service is injectable, with `now()` (for the start instant) and a tick source the page
  advances.
- The page holds `elapsed` as a **signal** and reads it in the template. No `Date.now()` in the
  template or in a computed.
- Tests use `fakeAsync` + `tick(1000)`. No `setTimeout` sleeps.

The alternative — a static `00:00` — was rejected: it makes the timer a lie in a different way, and
the owner chose the injected clock.

## 6. The honesty problem, stated plainly

A convincing in-call screen with a running timer, an avatar and a red hangup invites a user to
believe a call is happening. Nothing is. Three mitigations are in the spec rather than left to the
implementation:

1. The screen **discloses** the simulation (FR-004).
2. `Mute` / `Speaker` are real `aria-pressed` toggles that change state but affect nothing, and the
   spec says so — not silent dead buttons (the defect class this whole audit is about).
3. Non-Goals forbid presenting the duration as a measured call length.

Without these, this feature would reproduce the exact bug it exists to fix: a control that looks
live and is not.

## 7. Reuse

- `app-action-sheet` for the sheet (already used, F-043).
- `NavigationBar`, `UserAvatar`, `CallListItem`, `TabBar` — all exist.
- `contacts-page.ts` already has the search-and-list shape the picker needs (`searchQuery`,
  `emptyLabel`, `onSearch`, `onClearSearch`). The picker should follow it rather than invent a
  second pattern.
- No new shared component. The in-call screen is one screen, used by one flow; a shared
  "in-call control" component would be speculative.

## 8. Return target

A call can start from the chat window, the Calls picker, or the call-info sheet. Each must return
somewhere. A route cannot carry that implicitly, so the origin is passed as a query param
(`?from=/chat/chat-001`) and validated against an allow-list of known origins on read — an
unvalidated param is an open redirect into whatever the router resolves.

## 9. Test strategy

- `CallStore`: append, outcome default on a v1 snapshot, counter survives reload, persistence.
  Write the snapshot test **first** (see §3).
- `ChatHeader`: the two buttons emit, and the "coming soon" labels are gone.
- `CallsPage`: `new-call` opens the picker; the sheet's two call actions start a call; origin is
  remembered.
- `CallPickerPage`: list, filter, empty state, select, Back, unknown id.
- `InCallPage`: state machine, clock-driven duration, no tick before connected, hangup clears the
  tick, toggles, second-call refusal, unknown id, no wall-clock read.
- e2e authored, not run (Playwright paused by owner directive 2026-09-26).
