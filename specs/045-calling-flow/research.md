# Research: Calling Flow and In-Call Screen (feature 045)

**Input**: `specs/045-calling-flow/spec.md`. Written before any code, to establish what exists,
what is missing, and what the honest limits are.

## 1. The five inert controls, located

B6 is not one dead button; it is five, in three files, all blocked on one missing destination. (The
prose here originally said "four" against a five-row table — a counting error corrected in the
implementation-time clarify pass; the table was always right.)

| Control | Location | State today | Audit |
| ------- | -------- | ----------- | ----- |
| Chat header `Video call` | `src/app/shared/components/chat-header/chat-header.html:63` | `aria-label="Video call, coming soon"`, no `(click)` | A6 |
| Chat header `Call` | `src/app/shared/components/chat-header/chat-header.html:75` | `aria-label="Call, coming soon"`, no `(click)` | A6 |
| Sheet `Voice call` | `src/app/features/calls/call-info.seed.ts` id `voice-call` | rendered, focusable, `calls-page.ts:131` falls through | B6 |
| Sheet `Video call` | `src/app/features/calls/call-info.seed.ts` id `video-call` | rendered, focusable, same fall-through | B6 |
| Calls `+ new call` | `src/app/features/calls/calls-page.ts:99-101` | comment: "stays inert" | B6 |

The two header buttons are worth naming separately, because the audit understated them: they are
the **only** remaining dead controls on the chat window, and their aria-labels literally say
"coming soon" — a design-confession baked into the accessibility tree. F-042 and F-043 each
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

## 3. Store shape, and why the session belongs in the store

`CallStore` (`src/app/core/call.store.ts`) is small and complete for its current job:

- `calls: signal<CallEntry[]>` seeded from `CALL_SEED`, hydrated from `wa.call-store.v1`.
- `removeCall(id)`, `clearCalls()` — both persist.
- `hydrate()` is a bare `snapshot.calls` set: **no normalization layer exists**, unlike
  `ChatStore.normalizeChats()`.

`CallEntry` (`calls.model.ts`) is `{ id, contactName, direction, date, avatarRef }`, with
`direction: 'incoming' | 'outgoing' | 'missed'`.

Four consequences:

- `direction` already has `'outgoing'`, so a placed call needs no new direction value. FR-008 needs
  an **outcome** orthogonal to direction: an outgoing call can complete or be missed before
  connecting, and `direction: 'missed'` cannot express both.
- Because `hydrate()` does not normalize, adding `outcome` **requires** a normalizer, or a
  pre-F-045 snapshot loads with `outcome: undefined` and the Calls list renders a blank status.
  Same defect class as F-042's `hydrateDefaults()` finding, where the v1 snapshot test caught
  `kind === undefined`. **The lesson carries: write the v1-snapshot test first.**
- The **session** should be a store signal, not component state. Under the project's
  functional-over-display directive, a call the store cannot see is a call the UI invented. Putting
  the state machine in `CallStore` is what makes "the toggle changed real state" true rather than
  asserted, and it is also what lets FR-011 (refuse a second call) be enforced in one place.
- The session must be **excluded from the persisted snapshot** (FR-009). Reloading should not
  restore a call that is not there.

## 4. Id convention

`ChatStore` uses monotonic counters for generated ids (`group-<n>`). `CallStore` has none, because
nothing generates a call id today. FR-007 needs one, so it must persist alongside the calls or a
reload reissues `call-1` and collides with an existing entry. That is a snapshot-shape change:
`version` stays `1` with `outcome` optional and `nextCallSeq` defaulted, rather than a `version: 2`
bump that would discard every user's existing log. Discarding the log to ship an optional field is
a bad trade.

## 5. Time

`AGENTS.md`: "no wall-clock reads in render paths", and tests must not depend on the real clock.
Under the functional directive the duration is **real elapsed time**, so this is load-bearing, not
cosmetic:

- A `Clock` service is injectable, with `now()` (for the start instant) and a tick source.
- The page holds `elapsed` as a **signal** and reads it in the template. No `Date.now()` in the
  template or in a computed.
- The same clock measures `RINGING_MS` for auto-answer, so a test can reach `connected` instantly
  by advancing the clock rather than waiting.
- Tests use `fakeAsync` + `tick(1000)`. No `setTimeout` sleeps.

The alternative — a static `00:00` — is exactly the display-only behaviour the owner ruled out.

## 6. No second party: what that actually means

There is no backend and no other user, so a call cannot reach another device. That is a property of
the current system, not a shortcut. The consequences are concrete:

- The call **originates and terminates on one device**. The app is the whole system.
- Nobody is there to answer, so the session **auto-answers** after `RINGING_MS`. The alternative is
  to sit in `ringing` forever, where the duration never starts and no call ever completes — which
  would be a screen that does nothing, i.e. the defect this feature exists to remove.
- The user can hang up during `ringing`, which ends the call as **`missed`**. That is a real,
  reachable outcome, not an edge case, and the log must record it truthfully.

An earlier draft of this spec hedged with a "Simulated call" banner. Under the owner's
functional-over-display directive that banner is **revoked**: it existed to disclose a faked
result, and there is no faked result left to disclose.

## 7. Reuse

- `app-action-sheet` for the sheet (already used, F-043).
- `NavigationBar`, `UserAvatar`, `CallListItem`, `TabBar` — all exist.
- `contacts-page.ts` already has the search-and-list shape the picker needs (`searchQuery`,
  `emptyLabel`, `onSearch`, `onClearSearch`). The picker follows it rather than inventing a second
  pattern.
- No new shared component. The in-call screen is one screen used by one flow; a shared "in-call
  control" component would be speculative.

## 8. Return target

A call can start from the chat window, the Calls picker, or the call-info sheet. Each must return
somewhere. A route cannot carry that implicitly, so the origin is passed as a query param
(`?from=/chat/chat-001`) and validated against an allow-list on read — an unvalidated param is an
open redirect into whatever the router resolves.

## 9. Backend seam (F-046, not this feature)

All three stores hand-roll the same `readStorage` / `writeStorage` / `clearStorage` try/catch:

- `chat.store.ts:60,68,76`
- `call.store.ts:16,24`
- `prefs.store.ts:59,67,75`

There is no HTTP layer, no `HttpClient`, no repository, and `package.json` has no HTTP client
dependency. So "backend later" currently has no seam to land in — the backend would be hand-wired
into three stores.

The owner chose to land that as **F-046, after this feature**. Therefore this feature must:

- keep `CallStore`'s public API persistence-agnostic (no method that only makes sense against
  localStorage),
- keep the snapshot shape serializable and versioned, so a port can be swapped beneath it,
- **not** introduce a dependency that would block the port.

F-046 will introduce a small typed persistence port per store, a localStorage adapter now and an
HTTP adapter later, with no component changes.

## 10. Test strategy

- `CallStore`: state machine on clock ticks, auto-answer after `RINGING_MS`, duration from
  `connected`, `missed` vs `completed`, exactly one entry per call, monotonic id across a reload,
  session not persisted, v1 snapshot normalization, second-call refusal, tick stops after end.
  Write the snapshot test **first** (see §3).
- `Clock`: advances only when the test advances it.
- `ChatHeader`: the two buttons emit, and the "coming soon" labels are gone.
- `CallsPage`: `new-call` opens the picker; both sheet call actions start a call; origin remembered.
- `CallPickerPage`: list, filter, empty state, select, Back, unknown id, live rename.
- `InCallPage`: each state renders, duration only when connected, hangup returns to origin, toggles
  flip and are store-backed, second call refused, tick stops after hangup and destroy, hostile
  `?from=` contained, unknown id, `role="timer"` not a live region.
- e2e authored, not run (Playwright paused by owner directive 2026-09-26).
