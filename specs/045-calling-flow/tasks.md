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

- [ ] T001 - `call.store.spec.ts`: a v1 snapshot without `outcome` or `nextCallSeq` loads with every
      entry normalized and the counter defaulted; the session is not restored from a snapshot
      (FR-007, FR-008, FR-009)

## Phase 1 - model, store, the state machine

- [ ] T002 - `calls.model.ts`: `CallSession`, `CallOutcome`, optional `CallEntry.outcome`, the
      `RINGING_MS` constant, and a pure `nextState(session, elapsedMs)` reducer so the machine is
      testable without the store (FR-004, FR-008)
- [ ] T003 - `call.store.ts`: `normalizeCalls()` at hydrate; snapshot gains `nextCallSeq` with a
      default, `version` stays `1` (FR-007, FR-008)
- [ ] T004 - `call.store.ts`: session signal + `startCall()` (refuses a second call), `advance()`
      driven by the clock, `endCall()` returning a derived outcome, `appendCall()` with a monotonic
      `call-<n>` id; the session is excluded from the persisted snapshot (FR-004, FR-007, FR-009,
      FR-011)
- [ ] T005 - `call.store.spec.ts`: the machine advances `dialing -> ringing -> connected` on clock
      ticks only; it auto-answers after `RINGING_MS`; the duration counts from `connected`; hangup
      during ringing ends as `missed` and while connected as `completed`; exactly one entry is
      appended per call; the id is monotonic across a reload; a second call while active is refused
      and leaves the session untouched; `advance()` after the call ends is a no-op (FR-004, FR-006,
      FR-007, FR-010, FR-011)

## Phase 2 - the clock

- [ ] T006 - `core/clock.ts`: injectable `Clock` with `now()` and a tick source; no wall-clock read
      in any render path (FR-010)
- [ ] T007 - `clock.spec.ts`: the elapsed source advances only when the test advances it (FR-010)

## Phase 3 - the in-call screen

- [ ] T008 - `in-call-page.ts`: renders the live session from the store, drives `advance()` on ticks
      only while connected, `from` validated against an allow-list, hangup ends the session and
      returns to the origin, the tick is cleared on hangup **and** destroy (FR-005, FR-009, FR-010,
      FR-011, FR-014)
- [ ] T009 - `in-call-page.html` + `.scss`: nav, name + avatar, kind, duration in a `role="timer"`
      region, `Mute`/`Speaker`/`Video` as real `aria-pressed` toggles bound to session state,
      prominent `Hang up` (FR-005, FR-006, FR-013)
- [ ] T010 - `in-call-page.spec.ts`: each state renders; the duration advances only when connected;
      no tick before connected; hangup returns to the origin; toggles flip `aria-pressed` **and**
      mutate store session state; a second call is refused; the tick stops after hangup and after
      destroy; a hostile `?from=` cannot navigate out of the allow-list; unknown id shows the empty
      state; the duration region is `role="timer"` and carries no `aria-live` (FR-005 … FR-014)

## Phase 4 - the picker

- [ ] T011 - `call-picker-page.{ts,html,scss}`: `/calls/new`, `contactConversations()` filtered by
      search, empty state, select starts a voice call, `Back` to the Calls list, unknown id does not
      throw (FR-003, FR-014, FR-015)
- [ ] T012 - `call-picker-page.spec.ts`: list, filter, empty state, selection, Back, unknown id, and
      a live rename is reflected without a reload (FR-003, FR-014, FR-015)
- [ ] T012b - the no-match call path: a call whose contact matches no chat still starts, with a null
      avatar, and the in-call screen shows that name (FR-012)

## Phase 5 - wiring the four dead controls

- [ ] T013 - `chat-header.{ts,html}`: `call` / `videoCall` outputs, click handlers, aria-labels lose
      "coming soon" (FR-001)
- [ ] T014 - `chat-header.spec.ts`: each button emits, naming the contact; neither label says
      "coming soon" (FR-001)
- [ ] T015 - `chat-window-page.{ts,html}`: wire both header outputs to the in-call route (FR-001)
- [ ] T016 - `calls-page.ts`: `+ new call` opens the picker; the sheet's `Voice call` / `Video call`
      start a call; the origin is remembered (FR-002, FR-003)
- [ ] T017 - `calls-page.spec.ts`: `+ new call` opens the picker and returns on Back; both sheet
      actions start a call; the origin survives (FR-002, FR-003)
- [ ] T018 - `app.routes.ts`: `/calls/new`, `/calls/active` (FR-003, FR-005)

## Phase 6 - closure

- [ ] T019 - `tests/e2e/calling-flow.spec.ts` authored, not run
- [ ] T020 - Drift notes: `specs/043-call-info/spec.md`, `specs/002-chat-window/spec.md`,
      `specs/design-gap-audit.md` (A6 + B6), `figma/design-map.md` (rows 2 and 4)
- [ ] T021 - FR -> test traceability, checklist with evidence, converge
- [ ] T022 - G4 pass: every control in the feature's surface changes real state, verified by reading
      session state through the store, not by asserting a label changed

## G1 - permanently blocked, not open

These are **not** checkboxes. There is no Figma node for the in-call screen or the contact picker, so
no capture will ever verify their chrome, and leaving them as `[ ]` would falsely imply they will
close. The G1 obligations that *are* achievable are recorded as done:

- [x] G1-a - No node ID invented for the in-call screen or the picker; both are recorded as having no
      source (spec.md "Design Source", plan.md "Review Gates")
- [x] G1-b - The four entry points cited to real, existing nodes: row 4 `0:10395`, row 2 chat window
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
  F-046 introduces the backend seam; extracting it here would be a cross-store drive-by refactor.
