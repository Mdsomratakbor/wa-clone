# Tasks: Calling Flow and In-Call Screen (feature 045)

**Input**: `specs/045-calling-flow/plan.md`, `specs/045-calling-flow/spec.md`,
`specs/045-calling-flow/research.md`

- **Gates**: G1 = **BLOCKED and not clearable** — no Figma node exists for the in-call screen or the
  picker, so the quota reset does not help; their chrome is provisional by construction. G2 = build
  + full unit green, e2e authored not run. G3 = closure + drift notes. G4 = no control in this
  feature is display-only (project directive 2026-09-29).
- **Tests**: `npx ng test --watch=false --reporters=progress` green before each commit; output to
  `logs/` (gitignored). Playwright specs authored but **not executed** (owner directive 2026-09-26).
- **Baseline**: 469/469 entering this feature.

## Phase 0 - tests before the field they protect

`research.md` §3: `CallStore.hydrate()` has no normalizer, so an optional field added without one
loads as `undefined` — the same defect class F-042's v1-snapshot test caught. Write these first.

- [x] T001 - `call.store.spec.ts`: a v1 snapshot without `outcome` or `nextCallSeq` loads with every
      entry normalized and the counter defaulted; the session is not restored from a snapshot
      (FR-007, FR-008, FR-009)

## Phase 1 - model, store, the state machine

- [x] T002 - `calls.model.ts`: `CallSession`, `CallOutcome`, optional `CallEntry.outcome`, the
      `RINGING_MS` constant, and a pure `nextState(session, elapsedMs)` reducer so the machine is
      testable without the store (FR-004, FR-008)
- [x] T003 - `call.store.ts`: `normalizeCalls()` at hydrate; snapshot gains `nextCallSeq` with a
      default, `version` stays `1` (FR-007, FR-008)
- [x] T004 - `call.store.ts`: session signal + `startCall()` (refuses a second call), `advance()`
      driven by the clock, `endCall()` returning a derived outcome, `appendCall()` with a monotonic
      `call-<n>` id; the session is excluded from the persisted snapshot (FR-004, FR-007, FR-009,
      FR-011)
- [x] T005 - `call.store.spec.ts`: the machine advances `dialing -> ringing -> connected` on clock
      ticks only; it auto-answers after `RINGING_MS`; the duration counts from `connected`; hangup
      during ringing ends as `missed` and while connected as `completed`; exactly one entry is
      appended per call; the id is monotonic across a reload; a second call while active is refused
      and leaves the session untouched; `advance()` after the call ends is a no-op (FR-004, FR-006,
      FR-007, FR-010, FR-011)

## Phase 2 - the clock

- [x] T006 - `core/clock.ts`: injectable `Clock` with `now()` and a tick source; no wall-clock read
      in any render path (FR-010)
- [x] T007 - `clock.spec.ts`: the elapsed source advances only when the test advances it (FR-010)

## Phase 3 - the in-call screen

- [x] T008 - `in-call-page.ts`: renders the live session from the store, drives `advance()` on ticks
      only while connected, `from` validated against an allow-list, hangup ends the session and
      returns to the origin, the tick is cleared on hangup **and** destroy (FR-005, FR-009, FR-010,
      FR-011, FR-014)
- [x] T009 - `in-call-page.html` + `.scss`: nav, name + avatar, kind, duration in a `role="timer"`
      region, `Mute`/`Speaker`/`Video` as real `aria-pressed` toggles bound to session state,
      prominent `Hang up` (FR-005, FR-006, FR-013)
- [x] T010 - `in-call-page.spec.ts`: each state renders; the duration advances only when connected;
      no tick before connected; hangup returns to the origin; toggles flip `aria-pressed` **and**
      mutate store session state; a second call is refused; the tick stops after hangup and after
      destroy; a hostile `?from=` cannot navigate out of the allow-list; unknown id shows the empty
      state; the duration region is `role="timer"` and carries no `aria-live` (FR-005 … FR-014)

## Phase 4 - the picker

- [x] T011 - `call-picker-page.{ts,html,scss}`: `/calls/new`, `contactConversations()` filtered by
      search, empty state, select starts a voice call, `Back` to the Calls list, unknown id does not
      throw (FR-003, FR-014, FR-015)
- [x] T012 - `call-picker-page.spec.ts`: list, filter, empty state, selection, Back, unknown id, and
      a live rename is reflected without a reload (FR-003, FR-014, FR-015)
- [x] T012b - the no-match call path: a call whose contact matches no chat still starts, with a null
      avatar, and the in-call screen shows that name (FR-012)

## Phase 5 - wiring the five dead controls

- [x] T013 - `chat-header.{ts,html}`: `call` / `videoCall` outputs, click handlers, aria-labels lose
      "coming soon" (FR-001)
- [x] T014 - `chat-header.spec.ts`: each button emits, naming the contact; neither label says
      "coming soon" (FR-001)
- [x] T015 - `chat-window-page.{ts,html}`: wire both header outputs to the in-call route (FR-001)
- [x] T016 - `calls-page.ts`: `+ new call` opens the picker; the sheet's `Voice call` / `Video call`
      start a call; the origin is remembered (FR-002, FR-003)
- [x] T017 - `calls-page.spec.ts`: `+ new call` opens the picker and returns on Back; both sheet
      actions start a call; the origin survives (FR-002, FR-003)
- [x] T018 - `app.routes.ts`: `/calls/new`, `/calls/active` (FR-003, FR-005)

## Phase 6 - closure

- [x] T019 - `tests/e2e/calling-flow.spec.ts` authored, not run
- [x] T020 - Drift notes: `specs/043-call-info/spec.md`, `specs/002-chat-window/spec.md`,
      `specs/design-gap-audit.md` (A6 + B6), `figma/design-map.md` (rows 2 and 4)
- [x] T021 - FR -> test traceability, checklist with evidence, converge
- [x] T022 - G4 pass: every control in the feature's surface changes real state, verified by reading
      session state through the store, not by asserting a label changed

## G1 - permanently blocked, not open

These are **not** checkboxes. There is no Figma node for the in-call screen or the contact picker, so
no capture will ever verify their chrome, and leaving them as `[ ]` would falsely imply they will
close. The G1 obligations that *are* achievable are recorded as done:

- [x] G1-a - No node ID invented for the in-call screen or the picker; both are recorded as having no
      source (spec.md "Design Source", plan.md "Review Gates")
- [x] G1-b - The five controls cited to real, existing nodes: row 4 `0:10395`, row 2 chat window
- [x] G1-c - Provisional chrome labelled as such in the spec, the plan, this file, and the shipped
      code comments
- [x] G1-d - The quota reset (2026-10-02 18:38 UTC) is **not** presented as able to clear this gate

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # full suite; playwright runs paused per directive
```

## Notes

- **No "Simulated call" banner.** An earlier draft specified one. It was revoked under the owner's
  functional-over-display directive: the banner existed to disclose a faked result, and there is no
  faked result left to disclose. The call connects, the duration runs, the log records what actually
  happened. What is absent is media, because the backend does not exist yet.
- No WebRTC, no `getUserMedia`. The state machine is real; the media would be the backend's job.
- `Mute` / `Speaker` / `Video` mutate real `CallSession` fields. Silent no-ops are the defect this
  audit exists to remove, so G4 fails if a toggle only changes its own label.
- The session auto-answers after `RINGING_MS` because there is no second party to answer. Hanging up
  during ringing is a real outcome and records `missed`.
- A call started from the chat window returns to the chat window; from the picker, to the Calls list.
- `CallEntry.outcome` is optional and normalized at load. The call log is not bumped to `version: 2`,
  which would discard every user's existing log to ship an optional field.
- The duplicated `readStorage`/`writeStorage` try/catch in all three stores is left alone on purpose.
  F-047 introduces the backend seam; extracting it here would be a cross-store drive-by refactor.

## Closure (2026-09-29)

### Results

- `npm run build` — green, no warnings.
- Full unit suite — **549/549 SUCCESS**, no skipped tests, no `fdescribe`/`xit`. Baseline before this
  feature was 494, so **55 tests added**.
- `npx tsc --noEmit` — clean.
- E2E authored, **not run** (Playwright paused by owner directive 2026-09-26).
- G1 remains **blocked by construction** — there is no Figma node for either new screen, so the
  quota reset cannot clear it. Chrome is labelled PROVISIONAL in the spec, the plan, the contracts,
  this file, and in the shipped code comments of both new screens.

### FR -> test traceability

| FR | Test names (file) |
| -- | ----------------- |
| FR-001 | `emits videoCall (F-045 T014)`, `emits voiceCall (F-045 T014)`, `the two call outputs are independent (F-045 T014)`, `neither call label says "coming soon" any more` (`chat-header.spec.ts`); `the header Call button starts a real voice call and opens the in-call screen` (`chat-window-page.spec.ts`) |
| FR-002 | `the header Call button starts a real voice call…`, `the header Video call button starts a real video call`, `a call started from the header carries the contact avatar` (`chat-window-page.spec.ts`) |
| FR-003 | `new-call opens the contact picker` (`calls-page.spec.ts`); `selecting a contact starts a real voice call and opens the in-call screen`, `a row starts the call on Enter` (`call-picker-page.spec.ts`) |
| FR-004 | `the sheet Voice call row starts a real voice call`, `the sheet Video call row starts a real video call`, `the sheet closes after a call starts` (`calls-page.spec.ts`) |
| FR-005 | `renders the contact name and the call kind`, `shows a video call kind for a video session`, `Hang up ends the call, records it, and returns to the origin`, `Hang up returns to the Calls list when no origin is given`, and the 5 `a from= that only looks like the allow-list is rejected: …` cases, plus `a valid chat origin is still honoured after hardening` (`in-call-page.spec.ts`) |
| FR-006 | `Mute toggles real session state and aria-pressed`, `Speaker toggles real session state`, `Video toggles real session state` (`in-call-page.spec.ts`) |
| FR-007 | `normalizes a legacy entry with no outcome`, `defaults the id counter so a legacy log does not reissue call-1`, `Hang up during ringing records a missed call, not a completed one`, `a hung-up call survives a reload` (`call.store.spec.ts`, `in-call-page.spec.ts`) |
| FR-008 | `derives a legacy missed entry as missed, never completed`, `derives an incoming legacy entry as completed`, `an outcome already on disk is preserved, not overwritten` (`call.store.spec.ts`) |
| FR-009 | `the tick stops after hangup` (`in-call-page.spec.ts`); session is not in the snapshot (`call.store.spec.ts`) |
| FR-010 | `advances the duration only once connected`, `the started session is created from the injected clock` (`in-call-page.spec.ts`, `call-picker-page.spec.ts`); clock suite (`clock.spec.ts`) |
| FR-011 | `a second call while one is active is refused and the session is untouched` (`in-call-page.spec.ts`); `a second header call while one is live changes nothing` (`chat-window-page.spec.ts`); `selecting while a call is active neither replaces it nor navigates` (`call-picker-page.spec.ts`); `the sheet call rows are refused while a call is already live` (`calls-page.spec.ts`) |
| FR-012 | `a sheet call row starts a call even when the contact has no chat` (`calls-page.spec.ts`); `the header call button still works for an unknown chat id` (`chat-window-page.spec.ts`) |
| FR-013 | `the duration is a timer region, not a live region`, `the video affordance is labelled unavailable`, `every control is a labelled button, keyboard reachable` (`in-call-page.spec.ts`); `a row is reachable by keyboard, not click only` (`call-picker-page.spec.ts`) |
| FR-014 | `renders without a session and does not throw`, `hides the call controls when there is no session`, `a no-session in-call screen is not a dead end` (`in-call-page.spec.ts`); `a search with no match shows No results` (`call-picker-page.spec.ts`) |
| FR-015 | `lists every contact`, `filters by contact name`, `filtering is case-insensitive` (`call-picker-page.spec.ts`); `Back returns to the Calls list` (`call-picker-page.spec.ts`) |
| FR-016 | `a search with no match shows No results, not an empty box`, `clearing the search restores the full list`, `an empty search does not render the clear button` (`call-picker-page.spec.ts`) |

### G4 — the functional directive, verified

Every control in the feature's surface was checked by reading **store state**, not by checking that a
label changed:

| Control | Real state read by its test |
| ------- | ---------------------------- |
| Header `Call` | `CallStore.session()` → `kind: 'voice'`, `state: 'dialing'` |
| Header `Video call` | `CallStore.session()` → `kind: 'video'` |
| Picker row | `CallStore.session()` created + navigation to `/calls/active` |
| `+ new call` | navigation to `/calls/new` |
| Sheet `Voice call` / `Video call` | `CallStore.session()` → correct `kind` |
| `Mute` | `session().muted === true` |
| `Speaker` | `session().speakerOn === true` |
| `Video` | `session().videoOn === true` |
| `End call` | new persisted `CallEntry` with a derived `outcome` |

No control in this feature changes only its own label.

### Two defects the work surfaced

1. **F-043 FR-005 regression, caught by an existing test.** Reordering `onSheetAction` to close the
   sheet per-branch left `Delete` returning before `infoCall.set(null)`, so the sheet stayed open.
   The F-043 test failed, and the original "close on every action" behaviour was restored. Recorded
   because it is the reason the F-043 suite still earns its keep.
2. **Two latent G4 holes, closed.** `CallsPage.startCall` and `ChatWindowPage.onCall` both bailed out
   when a chat lookup failed, which would have left the sheet rows and header buttons dead for
   exactly the contacts F-043 left inert. Both now start the call from the name/avatar they already
   have (FR-012), and each has a test.

### Clarify pass run during implementation

Two spec/implementation contradictions were routed back through clarify rather than resolved in
code (see `spec.md` § Clarification pass 2):

1. FR-008 did not define the legacy `outcome` default → **derive from `direction`**.
2. The control count said "four" while enumerating five → **five**.

### Process deviation, recorded honestly

T001's task text claims the v1-snapshot test was "written before the field existed". The actual
sequence in commit `c5259e3` was model/store first, then the test. The test does cover the case and
the claim in that commit message is inaccurate; recording it rather than leaving a false provenance
claim in the history.
