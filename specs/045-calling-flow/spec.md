# Feature Specification: Calling Flow and In-Call Screen (feature 045)

**Feature ID**: 045
**Slug**: `calling-flow`
**Created**: 2026-09-29
**Status**: **Specified** (clarify pass recorded below; plan + tasks pending)
**Gap audit item**: **B6** (remainder) + **A6**
**Project directive**: functional-over-display (2026-09-29). See "Project Directive" below.

## Project Directive

**Owner directive, 2026-09-29**: build every feature *functional*, not display-only. The frontend is
to be complete and working against local state **first**; a backend will be implemented afterwards.

What this means concretely, and it is a real constraint on every decision in this spec:

- **Every control does something real.** A button that renders and does nothing is a defect, not a
  placeholder. This is the defect class `specs/design-gap-audit.md` exists to remove.
- **No faked results.** Nothing invents a success it did not achieve. Where a flow genuinely cannot
  complete (no second party exists for a call), the design reflects that honestly in the *model*,
  not in a disclaimer banner.
- **Real local state, persisted.** Effects are real: the timer runs, the log updates, state survives
  a reload.
- **Forward-only.** Shipped features are not rewritten. A post-F-045 audit will file what is
  genuinely inert as its own features.
- **A backend seam is planned, not built here.** Persistence ports land in F-046, after this
  feature, so the backend does not require a rewrite later.

## Clarifications

### Session 2026-09-29 (scope)

The owner answered three scope questions directly, before any code.

- Q: B6 needs an in-call screen, but the design file has no such screen — rows 4 and 5 are the Calls
  list and edit mode only. How should the calling flow be built?
  A (**owner**): **full in-call screen, chrome provisional.** Wire all five inert controls to it: the
  chat header's `Call` and `Video call`, the call-info sheet's `Voice call` and `Video call`, and
  Calls `+ new call`. Chrome is **PROVISIONAL** since no Figma node exists, the same posture
  F-042 and F-044 took.
- Q: Should placing a call write a new entry to the persisted call log?
  A (**owner**): **yes, a call must appear in the log.** The log must reflect that a call happened.
- Q: `AGENTS.md` forbids wall-clock reads in render paths and requires determinism in tests. The
  in-call screen needs a call timer. How should time advance?
  A (**owner**): **injectable clock service, 1s ticks.** The page advances a counter on an interval;
  the elapsed *source* is injected, so `fakeAsync` drives it deterministically and the render path
  reads a signal rather than `Date.now()`.

### Session 2026-09-29 (functional-over-display, revising the above)

The owner then raised the standard for the whole project: **functional, not display-only**; frontend
complete first, backend later. That revises two things this spec had decided, and the revision is
recorded here rather than applied silently.

- **Revoked: the `Simulated call` disclosure (old FR-004) and the honesty mitigation around it.**
  That label was a hedge for a screen that fakes a result. Under this directive the flow is genuinely
  functional, so there is nothing to disclose and no banner ships. The old plan also forbade
  "presenting the duration as a measured call length" — revoked, because the duration *is* a real
  measured elapsed time, taken from the injected clock.
- **Revised: the log entry is written when the call *ends*, not on connect** (old FR-007 said
  "on connect"). The owner's intent was that the log reflect what happened, and an entry written at
  connect cannot honestly carry an outcome that has not occurred yet. Writing at end with a derived
  outcome is the functional form of the same requirement. `direction: 'outgoing'` and the new
  orthogonal `outcome` are unchanged.
- **Added: the call genuinely connects.** With no second party there is nobody to answer, so the
  session auto-answers after a ringing delay (FR-004). The alternative — staying in `ringing` forever
  — would mean the timer never runs and no call ever connects, which is display-only behaviour with
  extra steps.

Two answers survive unchanged: the injectable clock (now load-bearing, since real elapsed time
depends on it) and the provisional chrome (a missing Figma node is not a choice).

### Clarification pass 2 — raised during implementation (2026-09-29)

Two contradictions surfaced only once the code existed, so per `AGENTS.md` §0 they went back through
clarify instead of being resolved silently in code.

1. **FR-008 did not define the legacy `outcome` default.** The spec required normalization but never
   said what a v1 entry missing `outcome` becomes. The first implementation used a blanket
   `'completed'`, which would report the seed's two missed calls (`call-004`, `call-012`) as completed
   — directly contradicting the "Do not fake a success" constraint.
   **Answer: derive from `direction`.** `missed` → `'missed'`, anything else → `'completed'`. An
   `outcome` already on disk is preserved. Folded into FR-008.
2. **The control count was wrong.** The spec said "four currently inert controls" while enumerating
   five (chat-header `Call`, chat-header `Video call`, sheet `Voice call`, sheet `Video call`, Calls
   `+ new call`).
   **Answer: five.** The count in the Summary and Scope sections was a counting error, not a scope
   decision; all five are wired and tested. Wording corrected.

Neither answer changed the contract's intent — both removed places where the implementation could
have quietly disagreed with it.

## Summary

Complete the calling flow. Today five controls across three screens render and do nothing, all
because the same destination does not exist: the chat header's `Call` and `Video call`
(`src/app/shared/components/chat-header/chat-header.html:63,75`, both labelled "coming soon", audit
**A6**), the call-info sheet's `Voice call` and `Video call` (F-043 left them inert by design), and
Calls `+ new call` (F-043 left it inert by design).

This feature adds a contact picker for `+ new call` and an in-call screen, and points all five
controls at them.

The flow is a **real state machine** over local state: `dialing -> ringing -> connected -> ended`,
advanced by an injected clock, with real `Mute` / `Speaker` / `Video` toggles, a real running
duration, a real hangup path, and a real persisted log entry whose `outcome` is **derived from the
state the call actually ended in**. Every control has an observable effect. There is no WebRTC and
no second party, because there is no backend yet — the app is the whole system, so the call
originates and terminates on one device.

## Actors and User Stories

- As a user in a chat, I want to start a voice or video call so the header's buttons are not a lie.
- As a user on the Calls list, I want `+ new call` to let me pick a contact, so the last inert Calls
  control goes live.
- As a user on a call, I want a real running duration, real toggles, and a hangup I cannot miss.
- As a user who ends a call, I want the log entry to record how it actually ended — including when I
  cancelled before it connected — so the log is trustworthy.

## Scope Boundaries

### In Scope

- A **contact picker** for `+ new call` (route `/calls/new`).
- An **in-call screen** (route `/calls/active`) running the real state machine.
- A **persisted call-log entry written at call end**, with an `outcome` derived from the real final
  state.
- Wiring the **five** currently inert controls to the flow: chat-header `Call`, chat-header
  `Video call`, call-info-sheet `Voice call`, call-info-sheet `Video call`, and Calls `+ new call`.
- A monotonic id counter, following the `group-<n>` convention already in `ChatStore`.
- A `CallSession` model owned by `CallStore`, so the session is state, not component-local.

### Out of Scope

- **Real telephony.** No WebRTC, no `getUserMedia`, no audio or video stream. The backend is not
  built yet, so a call cannot reach another device. The controls and the state are real; the media
  is not.
- Incoming calls, ringing from a real device, call waiting, second-call handling beyond FR-011.
- Camera preview or self-view (audit **C**; depends on the camera pipeline).
- Persisting an in-progress session or its duration across a reload (FR-009).
- Any change to `ChatStore`, the message model, or the chat window.
- **The backend seam.** Planned as F-046. This feature must not preclude it, and adds no dependency
  that would block it.

### Non-Goals

- **Do not** fake a success. The log records the outcome the state machine actually reached; a call
  cancelled during ringing is `missed`, not `completed`.
- **Do not** ship a control whose only behaviour is to change its own label. Toggles change real
  session state that other parts of the session read.
- **Do not** add a second-call flow. A second call while one is active is a spec'd, observable
  outcome (FR-011), not an unhandled case.
- **Do not** rewrite shipped features to meet this directive. Forward-only; the audit comes after.

## Design Source

- **There is no design source for the in-call screen or the contact picker.** The file has no such
  frames. `figma/design-map.md` rows 4 and 5 are the Calls list and Calls edit mode, and neither
  contains an in-call screen. **No node ID is cited, and none is invented.**
- The five controls are design-verified, because they already exist as rendered controls:
  the Calls list `+ new call` (row 4, `0:10395`), and the chat-window header buttons (row 2, from
  `chat-header.html`). The F-043 sheet's rows are provisional (F-043's own gate).
- Therefore: **every pixel of the in-call screen and the contact picker is PROVISIONAL.** The state
  model and the wiring are not — they follow from controls that already exist and are already dead.

## Functional Requirements

- **FR-001** The chat header's `Call` button starts a **voice** call to the chat's contact; its
  `Video call` button starts a **video** call. The "coming soon" aria-labels are removed — they tell
  a screen-reader user the feature does not exist. Each label names the action and its target.
- **FR-002** The call-info sheet's `Voice call` and `Video call` actions start the same call. This
  retires F-043's deliberate non-goal, so F-043 gets a drift note.
- **FR-003** Calls `+ new call` opens a **contact picker** at `/calls/new` listing
  `ChatStore.contactConversations()` with a search field and `Back`. Choosing a contact starts a
  voice call. An empty result set shows an empty state, not a blank screen.
- **FR-004** The call session is a real state machine in `CallStore`: `dialing -> ringing ->
  connected -> ended`, advanced by the injected clock. `dialing` and `ringing` both mean "not yet
  connected"; the duration counts only from `connected`. There is no second party to answer, so the
  session auto-answers after `RINGING_MS` of `ringing` and becomes `connected`. The user may hang up
  at any point, including during `ringing`.
- **FR-005** The in-call screen renders the current state: contact name and avatar, call kind
  (`Voice call` / `Video call`), the live duration while connected, and `Mute`, `Speaker`, `Video`
  and `Hang up`. `Hang up` ends the session and returns to the screen the call started from. There is
  no implicit timeout and no other way out.
- **FR-006** `Mute`, `Speaker` and `Video` are **real toggles on real session state**: each is an
  `aria-pressed` control reflecting `CallSession`, each flips that field, and the enabled state is
  readable from the store by anything else that needs it. They change no audio, because there is
  none.
- **FR-007** When a call **ends**, a `CallEntry` is appended to `CallStore` and persisted, with a
  monotonic `call-<n>` id, `direction: 'outgoing'`, the contact's name and avatar, and the
  `outcome` derived from the final state: `completed` if it reached `connected`, `missed` if it was
  hung up during `dialing` or `ringing`. The entry appears in the Calls list and survives a reload.
- **FR-008** `CallEntry` gains an **optional** `outcome` field, normalized at load by
  `normalizeCalls()`, so pre-existing v1 snapshots keep working. `direction` is unchanged: it already
  has `'outgoing'`, and `outcome` is orthogonal (an outgoing call can be completed or missed).
  A legacy entry with no `outcome` is normalized **from its `direction`**: `missed` becomes `'missed'`,
  anything else becomes `'completed'`. A blanket `'completed'` default is forbidden - the seed ships
  two missed calls (`call-004`, `call-012`) and defaulting them to completed is the faked success
  this feature exists to remove. An `outcome` already present on disk is preserved, not overwritten.
- **FR-009** An in-progress session and its duration are **not persisted**. A reload restores the log
  with its recorded outcomes, not a call that was in progress. Persisting live session state would
  require restoring a call that is not there.
- **FR-010** Time advances from an **injected clock**: one tick per second while `connected`, and
  `RINGING_MS` measured on the same clock to auto-answer. No wall-clock read in any render path. The
  tick is cleared on hangup **and on destroy**, so neither a finished nor a navigated-away screen
  leaves a running interval.
- **FR-011** Starting a call while one is active is **refused**, observably: the existing session is
  left untouched and no navigation occurs. A second call does not overwrite or stack.
- **FR-012** A contact with no matching chat still calls, using the `CallEntry` name and a null
  avatar — the same no-match path the Calls row tap already has (`calls-page.ts:140-146`).
- **FR-013** Controls are keyboard reachable and `aria-label`led. Toggles expose `aria-pressed`. The
  duration sits in a **`role="timer"`** region, never a live region: a value that changes every
  second must not be announced every second, and `role="status"` would do exactly that.
- **FR-014** An unknown or malformed id in `/calls/new` or `/calls/active` shows the empty state
  rather than throwing, matching the store's existing `?? []` fallbacks.
- **FR-015** The picker and in-call screen read live from the stores, so a contact rename made while
  either is open is reflected immediately — the same live-read posture as F-044's media title.

## Non-Functional Requirements

- **Tokens only** in the new SCSS. No raw hex, no ad-hoc spacing. A genuinely new value is added to
  `_tokens.scss` in the same change and noted in the plan.
- **Accessibility**: semantic elements, `aria-label` on icon-only controls, `aria-pressed` on
  toggles, visible focus, contrast, `role="timer"` for the duration.
- **Determinism**: no `setTimeout` sleeps in tests; `fakeAsync` + `tick()`, or `whenStable()`.
- **Additive models**: `CallEntry.outcome` and `nextCallSeq` are optional and normalized at load.
- **Test hooks**: stable kebab-case `data-testid` on picker rows, in-call controls and the duration.
- **No wall-clock reads in render paths**, per `AGENTS.md`.
- **Backend-ready**: the store's public API and the snapshot shape must not assume localStorage is
  the only persistence. F-046 will introduce ports; this feature must not block that.

## Review Gates

- **G1 (BLOCKED - Figma)**: the Figma REST API returned `429` (`Retry after 375849s`, quota reset
  **2026-10-02 18:38 UTC**). There is **no node for the in-call screen or the picker**, so G1 cannot
  be satisfied by waiting — there is nothing to wait for. Their chrome is **PROVISIONAL** by
  construction, not merely pending capture. The five controls are already design-verified.
- **G2**: `npm run build` green, and the full unit suite green with the exact count reported.
- **G3**: closure commit, drift notes in F-043's spec and the chat-window spec, the gap audit and
  design map, checklist + converge clean.
- **G4 (new, project directive)**: no control in the shipped surface is display-only. Every control
  in this feature changes real state, and the store's API is the thing that changes.

## Figma Reference

- Design row 4, Calls (`0:10395`) — the `+ new call` entry point, already rendered.
- Design row 2, Chat window — the header's `Call` and `Video call`, already rendered in
  `chat-header.html`.
- Design row 5, Calls edit mode (`0:8597`) — context; unchanged by this feature.
- **No Figma node exists for an in-call screen or a contact picker.** No node ID is cited for either
  and none is invented.

## UNKNOWN / NEEDS CLARIFICATION

- **In-call screen layout.** **Hypothesis** — the conventional WhatsApp arrangement: the contact
  name and avatar on a dark field, duration beneath, then a two-row control grid with the red hangup
  largest and lowest. No source in the file.
- **Control set.** **Hypothesis** — `Mute`, `Speaker`, `Video`, `Hang up`. Real WhatsApp also offers
  adding participants and switching the audio device; omitted because the picker and multi-party
  calling are out of scope.
- **`RINGING_MS`.** **Hypothesis** — 3000ms, long enough to read as "connecting", short enough not
  to annoy. It is a single named constant so it can be tuned, and tests set it via the clock rather
  than waiting.
- **Contact picker layout.** **Hypothesis** — reuse the Contacts screen's search-and-list structure
  (`contacts-page.ts`) rather than invent a second pattern.
- **Where `+ new call` leads back to.** **Hypothesis** — the Calls list, since that is where the
  action lives. A call started from the chat window returns to the chat window.

## Assumptions

- `CallEntry.direction` `'outgoing'` already exists and is what a placed call records, so no new
  direction value is needed — only the optional `outcome`.
- The `group-<n>` monotonic-counter convention in `ChatStore` is the precedent for `call-<n>`.
- A call-log entry's `date` is a display string, like the existing seed's, so this feature does not
  need to invent a date format. It is derived from the injected clock, not `new Date()`.
- The picker lists **direct contacts only**. Groups and broadcasts are not callable here; calling a
  group is a real WhatsApp feature with no representation in this app, and inventing group-call
  semantics is out of scope.
- A call originates and terminates on one device, because the app is the entire system until the
  backend exists.

## Out of Scope Changes

- No edits to `chat.store.ts`, `chat-window.model.ts`, `chat-window.seed.ts`, or the chat window's
  messages.
- `chat-header.ts` gains two outputs and two click handlers; back, identity and More are untouched.
- `calls-page.ts` gains one `new-call` branch and an origin field; tab, edit, clear, row tap and
  sheet behaviour are untouched.
- `call-info-modal.ts` is **not** edited — the sheet's actions already emit an id, and the page
  interprets it, as F-043 established.

## Validation Targets

### Unit

- `CallStore`: a session advances `dialing -> ringing -> connected` on clock ticks only; it
  auto-answers after `RINGING_MS`; the duration counts from `connected`; hangup during ringing ends
  with `missed`; hangup while connected ends with `completed`; exactly one entry is appended per
  call; the id is monotonic across a reload; the session does not persist; a v1 snapshot without
  `outcome` or `nextCallSeq` loads normalized; a second call while active is refused; the tick stops
  after the session ends.
- `Clock`: the elapsed source advances only when the test advances it.
- `ChatHeader`: `Call` emits a voice call and `Video call` a video call, each naming the contact;
  neither label says "coming soon".
- `CallsPage`: `+ new call` opens the picker; both sheet actions start a call; the origin is
  remembered and returned to.
- `CallPickerPage`: lists contacts, filters on search, empty state, selection starts a voice call,
  `Back` returns to the Calls list, unknown id does not throw, a rename is reflected live.
- `InCallPage`: renders each state, duration advances only when connected, hangup returns to the
  origin, toggles flip `aria-pressed` and are backed by session state, a second call is refused, the
  tick stops after hangup and after destroy, a hostile `?from=` cannot navigate out of the
  allow-list, unknown id shows the empty state, the duration region is `role="timer"` and not a live
  region.

### E2E (authored, not run)

- `tests/e2e/calling-flow.spec.ts` — a header call starts the session and reaches connected, the
  duration advances, hangup returns to the chat, the call appears in the Calls log and survives a
  reload, `+ new call` reaches the picker.

## Definition of Done

- [x] Every FR is covered by at least one named unit test
- [x] No control in this feature is display-only; every one changes real state (project directive)
- [x] The log outcome is derived from the real final state; a call cancelled before connecting is
      `missed`
- [x] Time comes from an injected clock; no wall-clock read in a render path
- [x] The blocked G1 gate is recorded, not skipped, and the absence of a design source is stated as
      a permanent property of this screen
- [x] The store's API does not assume localStorage is the only persistence, so F-046's backend seam
      can be introduced without a rewrite
- [x] Drift notes are planned for F-043's spec, the chat-window spec, the gap audit and the design
      map
