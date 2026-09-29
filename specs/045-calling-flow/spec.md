# Feature Specification: Calling Flow and In-Call Screen (feature 045)

**Feature ID**: 045
**Slug**: `calling-flow`
**Created**: 2026-09-29
**Status**: **Specified** (clarify pass recorded below; plan + tasks pending)
**Gap audit item**: **B6** (remainder) + **A6**

## Clarifications

### Session 2026-09-29

The owner answered three scope questions directly, before any code.

- Q: B6 needs an in-call screen, but the design file has no such screen — rows 4 and 5 are the Calls
  list and edit mode only. How should the calling flow be built?
  A (**owner**): **full in-call screen, chrome provisional.** Wire all four inert controls to it: the
  chat header's `Call` and `Video call`, the call-info sheet's `Voice call` and `Video call`, and
  Calls `+ new call`. Chrome is entirely **PROVISIONAL** since no Figma node exists, the same posture
  F-042 and F-044 took.
- Q: Should placing a call write a new entry to the persisted call log?
  A (**owner**): **yes, append an outgoing entry on connect.** The log must reflect that a call
  happened. A monotonic counter supplies the id; the entry's outcome follows what the user does, so
  the log cannot claim a completed call that never connected.
- Q: `AGENTS.md` forbids wall-clock reads in render paths and requires determinism in tests. The
  in-call screen needs a call timer. How should time advance?
  A (**owner**): **injectable clock service, 1s ticks.** The page advances a counter on an interval;
  the elapsed *source* is injected, so `fakeAsync` drives it deterministically and the render path
  reads a signal rather than `Date.now()`.

## Summary

Complete the calling flow. Today four controls across three screens render and do nothing, all
because the same destination does not exist: the chat header's `Call` and `Video call`
(`src/app/shared/components/chat-header/chat-header.html:63,75`, both labelled "coming soon", audit
**A6**), the call-info sheet's `Voice call` and `Video call` (F-043 left them inert by design), and
Calls `+ new call` (F-043 left it inert by design).

This feature adds a contact picker for `+ new call` and an in-call screen, and points all four
controls at them. Placing a call appends a persisted outgoing entry to `CallStore`, so the call log
agrees with the call flow instead of quietly disagreeing with it.

The call is a **UI simulation**: no WebRTC, no media, no network. The screen models the *states* a
real call passes through — connecting, connected with a running duration, ended — and that
distinction is stated in the spec rather than hidden behind a convincing-looking screen.

## Actors and User Stories

- As a user in a chat, I want to start a voice call so the header's call button is not a lie.
- As a user in a chat, I want to start a video call from the same place.
- As a user on the Calls list, I want `+ new call` to let me pick a contact, so the last inert Calls
  control goes live.
- As a user on the Calls list, I want a call I placed to appear in the log, so the log is a record of
  what I did.
- As a user on a call, I want a running duration, mute, speaker and a hangup I cannot miss.
- As a user who ends a call, I want the log entry to say how it ended, so a missed call is not
  recorded as a completed one.

## Scope Boundaries

### In Scope

- A **contact picker** for `+ new call` (route `/calls/new`).
- An **in-call screen** (route `/calls/active`) with connecting, connected and ended states.
- A **persisted outgoing call-log entry** on connect, with an outcome that reflects what happened.
- Wiring the four currently inert controls to the flow.
- A monotonic id counter, following the `group-<n>` convention already in `ChatStore`.

### Out of Scope

- **Real calling.** No WebRTC, no `getUserMedia`, no audio, no video stream. The duration is a
  counter, not a measured call length.
- Camera preview, front/back flip, or a self-view. That is audit **C** work and depends on the camera
  pipeline; the in-call screen's video affordance is a labelled control with no stream behind it, and
  the spec says so.
- Ringing, incoming-call UI, call waiting, or a second call in progress. A second call while one is
  active is not modelled; see Non-Goals.
- Real elapsed time surviving a reload. See FR-009.
- Any change to `ChatStore`, the message model, or the chat window.
- The call-info sheet's own chrome (F-043, provisional and closed).

### Non-Goals

- **Do not** present the duration as a real call length. The screen must make clear it is a
  simulation, because a screen that looks and behaves exactly like a real call invites the user to
  believe a call is happening.
- **Do not** add a `CallEntry` for an incoming call. Nothing in the app receives calls.
- **Do not** rewrite the Calls list or the call-info sheet beyond the wiring this feature requires.
- **Do not** add a second-call flow. If a user taps call while one is active, that is a spec'd,
  observable outcome, not an unhandled case.

## Design Source

- **There is no design source for the in-call screen or the contact picker.** The file has no such
  frames. `figma/design-map.md` rows 4 and 5 are the Calls list and Calls edit mode, and neither
  contains an in-call screen. **No node ID is cited, and none is invented.**
- The four **entry points** are design-verified, because they already exist as rendered controls:
  the Calls list `+ new call` (row 4, `0:10395`), and the chat-window header buttons (row 2, from
  `chat-header.html`). The F-043 sheet's rows are provisional (F-043's own gate).
- Therefore: **every pixel of the in-call screen and the contact picker is PROVISIONAL.** The state
  model and the wiring are not — they follow from the controls that already exist and are already
  dead.

## Functional Requirements

- **FR-001** The chat header's `Call` button starts a **voice** call to the chat's contact, and its
  `Video call` button starts a **video** call. The "coming soon" aria-labels are removed; each
  button's accessible name names the action and its target.
- **FR-002** The call-info sheet's `Voice call` and `Video call` actions start the same call. This
  retires the deliberate F-043 non-goal, so F-043 gets a drift note.
- **FR-003** Calls `+ new call` opens a **contact picker** at `/calls/new` listing
  `ChatStore.contactConversations()`, with a search field and `Back`. Choosing a contact starts a
  voice call to them. An empty search with no contacts shows an empty state, not a blank screen.
- **FR-004** The in-call screen shows a **connecting** state, then a **connected** state with the
  contact's name and avatar, the call kind (voice or video), a running duration, and the controls
  `Mute`, `Speaker`, a video affordance and `Hang up`. The video affordance is present but labelled
  unavailable, since there is no stream. The simulation is disclosed on the screen.
- **FR-005** `Hang up` ends the call, returns to the screen the call started from, and is the only
  way to leave the in-call screen. There is no implicit timeout.
- **FR-006** `Mute` and `Speaker` are **toggles with observable state**: each is a real
  `aria-pressed` toggle that changes label or state when activated. They affect nothing else — there
  is no audio — and the spec says so rather than implying they mute something.
- **FR-007** On connect, a **persisted outgoing `CallEntry`** is appended to `CallStore` with a
  monotonic id, the contact's name and avatar, and an outcome of `completed`. The entry appears in
  the Calls list and survives a reload.
- **FR-008** A call that is hung up before connecting completes records outcome **`missed`**, not
  `completed`. The log must not claim a call connected when it did not. `CallEntry` gains an
  **optional** `outcome` field, defaulting per `normalizeCalls()` at load, so pre-existing v1
  snapshots keep working.
- **FR-009** The duration is **not persisted**. On reload, an in-progress call is not restored and no
  duration survives. The log entry records the outcome, not the length.
- **FR-010** Time advances from an **injected clock**, in 1-second ticks, only while the call is
  connected. No wall-clock read occurs in a render path. The tick is cleared on hangup **and on
  destroy**, so neither a hung-up nor a navigated-away screen leaves a running interval.
- **FR-011** Starting a call while one is already active is refused: the in-call screen is a
  single-call surface, and the second request is an observable no-op rather than a silent overwrite
  or a stacked screen.
- **FR-012** A contact with no matching chat (`CallStore` holds only names) still calls, using the
  `CallEntry` name and a null avatar — the same no-match path the Calls row tap already has
  (`calls-page.ts:140-146`).
- **FR-013** The in-call screen's controls are keyboard reachable, the hangup control is
  `aria-label`led, and the video affordance is labelled as unavailable rather than presented as
  working. The duration sits in a **`role="timer"`** region, never a live region: a duration that
  changes every second must not be announced every second, and `role="status"` would do exactly
  that.
- **FR-014** An unknown or malformed id in `/calls/new` or `/calls/active` shows the empty state
  rather than throwing, matching the store's existing `?? []` fallbacks.
- **FR-015** The picker and in-call screen read live from the stores, so a contact rename made while
  the picker is open is reflected immediately — the same live-read posture as F-044's media title.

## Non-Functional Requirements

- **Tokens only** in the new SCSS. No raw hex, no ad-hoc spacing. If a genuinely new value is
  needed, it is added to `_tokens.scss` in the same change and noted in the plan.
- **Accessibility**: semantic elements, `aria-label` on icon-only controls, `aria-pressed` on
  toggles, visible focus, contrast. The hangup is the visually dominant control.
- **Determinism**: no `setTimeout` sleeps in tests; use `fakeAsync` + `tick()` or `whenStable()`.
- **Additive models**: `CallEntry.outcome` is optional and normalized at load.
- **Test hooks**: stable kebab-case `data-testid` on the picker rows, the in-call controls and the
  duration, mirrored by the e2e spec.
- **No wall-clock reads in render paths**, per `AGENTS.md`.

## Review Gates

- **G1 (BLOCKED - Figma)**: the Figma REST API returned `429` (`Retry after 375849s`, quota reset
  **2026-10-02 18:38 UTC**). There is **no node for the in-call screen or the picker**, so G1 cannot
  be satisfied for their chrome by waiting — there is nothing to wait for. Their chrome is
  **PROVISIONAL** by construction, not merely pending capture. Capture tasks stay open in
  `tasks.md`. The four entry points are already design-verified by existing code.
- **G2**: `npm run build` green, and the full unit suite green with the exact count reported.
- **G3**: closure commit, drift notes in F-043's spec and in the gap audit, checklist + converge
  clean.

## Figma Reference

- Design row 4, Calls (`0:10395`) — the `+ new call` entry point, already rendered.
- Design row 2, Chat window — the header's `Call` and `Video call` buttons, already rendered in
  `chat-header.html`.
- Design row 5, Calls edit mode (`0:8597`) — context for the Calls list; unchanged by this feature.
- **No Figma node exists for an in-call screen or a contact picker.** No node ID is cited for either
  and none is invented.

## UNKNOWN / NEEDS CLARIFICATION

- **In-call screen layout.** **Hypothesis** — the conventional WhatsApp arrangement: the contact
  name and avatar on a dark field, duration beneath, then a two-row control grid with the red hangup
  largest and lowest. No source in the file. Mirrors how the camera screen treats its unverified
  chrome.
- **Control set.** **Hypothesis** — `Mute`, `Speaker`, `Video` (toggle), `Hang up`. Real WhatsApp also
  offers adding participants and switching the audio device; those are omitted because the picker
  and multi-party calling are out of scope.
- **Wording of the simulation disclosure.** **Hypothesis** — a small line reading `Simulated call`.
  Its exact copy is unconfirmed; that it exists is not optional, per FR-004 and the Non-Goals.
- **Contact picker layout.** **Hypothesis** — reuse the Contacts screen's search-and-list structure
  (`contacts-page.ts`) rather than invent a second pattern. The picker's chrome is provisional in the
  same way.
- **Where `+ new call` leads back to.** **Hypothesis** — the Calls list, since that is where the
  action lives. A call started from the chat window returns to the chat window.
- **Whether a hung-up call's log entry is editable or deletable from the in-call screen.**
  **Hypothesis** — neither. It becomes an ordinary log entry, removable with the existing
  `removeCall` from the sheet. Adding controls to the in-call screen for a call that is over would be
  noise.

## Assumptions

- `CallEntry.direction` `'outgoing'` already exists and is what a placed call records, so no new
  direction value is needed — only the optional `outcome`.
- The `group-<n>` monotonic-counter convention in `ChatStore` is the precedent for the call id
  (`call-<n>`).
- A call-log entry's `date` is a display string, like the existing seed's, not a parsed timestamp —
  so this feature does not need to invent a date format or read the wall clock to produce one.
- The picker lists **direct contacts only**. Groups and broadcasts are not callable from this
  feature; calling a group is a real WhatsApp feature with no representation here, and inventing it
  would be inventing group-call semantics.

## Out of Scope Changes

- No edits to `chat.store.ts`, `chat-window.model.ts`, `chat-window.seed.ts`, or the chat window's
  messages.
- `chat-header.ts` gains two outputs and two click handlers; the header's existing back, identity
  and More actions are untouched.
- `calls-page.ts` gains one `new-call` branch and a return-target field; its tab, edit, clear, row
  tap and sheet behaviour are untouched.
- `call-info-modal.ts` is **not** edited — the sheet's actions already emit an id, and the page
  interprets it, as F-043 established.

## Validation Targets

### Unit

- `CallStore`: an outgoing entry is appended on connect with a monotonic `call-<n>` id; a hangup
  before connect records `outcome: 'missed'`; `outcome` defaults for a v1 snapshot that lacks the
  field; persistence survives a reload; the id counter keeps incrementing after a reload.
- `ChatHeader`: `Call` emits a voice call and `Video call` emits a video call, each naming the
  contact; neither is labelled "coming soon" any more.
- `CallsPage`: `+ new call` opens the picker and returns to the Calls list on Back; the sheet's
  `Voice call` / `Video call` start a call; the return target is remembered.
- `CallPickerPage`: lists contacts, filters on search, starts a voice call on selection, empty state
  when no contact matches, Back returns to the Calls list, unknown id does not throw.
- `InCallPage`: connecting then connected states, duration advances on clock ticks only, no tick
  before connected, `Hang up` ends and returns to the call's origin, `Mute` and `Speaker` toggle
  `aria-pressed`, starting a call while one is active is refused, the tick is cleared on hangup, the
  video affordance is labelled unavailable, no wall-clock read in the render path.
- `Clock`: the injected clock advances only when the test advances it.

### E2E (authored, not run)

- `tests/e2e/calling-flow.spec.ts` — header call starts the in-call screen, `+ new call` opens the
  picker, a placed call appears in the Calls list and survives a reload, hangup returns to the
  originating screen.

## Definition of Done

- [x] Every FR is covered by at least one named unit test
- [x] The simulation is disclosed on the screen, and the disclosure is spec'd, not implied
- [x] A hung-up-before-connect call is recorded as missed, not completed
- [x] Time comes from an injected clock; no wall-clock read in a render path
- [x] The blocked G1 gate is recorded, not skipped, and the absence of a design source is stated as
      a permanent property of this screen rather than a pending capture
- [x] Drift notes are planned for F-043's spec and the gap audit
