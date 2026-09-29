# Tasks: Calling Flow and In-Call Screen (feature 045)

**Input**: `specs/045-calling-flow/plan.md`, `specs/045-calling-flow/spec.md`,
`specs/045-calling-flow/research.md`

- **Gates**: G1 = **BLOCKED and not clearable** — no Figma node exists for the in-call screen or the
  picker, so the quota reset does not help; their chrome is provisional by construction. G2 = build
  + full unit green, e2e authored not run. G3 = closure + drift notes in F-043, chat-window, the gap
  audit and design-map.
- **Tests**: `npx ng test --watch=false --reporters=progress` green before each commit; output to
  `logs/` (gitignored). Playwright specs authored but **not executed** (owner directive 2026-09-26).
- **Baseline**: 469/469 entering this feature.

## Phase 0 - tests before the field they protect

`research.md` §3: `CallStore.hydrate()` has no normalizer, so an optional field added without one
loads as `undefined` — the same defect class F-042's v1-snapshot test caught. Write these first.

- [ ] T001 - `call.store.spec.ts`: a v1 snapshot without `outcome` loads with every entry
      normalized; `nextCallSeq` defaults; the id counter keeps incrementing after a reload (FR-007,
      FR-008)

## Phase 1 - store and model

- [ ] T002 - `calls.model.ts`: add optional `outcome: CallOutcome`; `normalizeCalls()` in
      `call.store.ts`; snapshot gains `nextCallSeq` with a default, `version` stays `1` (FR-007,
      FR-008)
- [ ] T003 - `call.store.ts`: `appendCall()` with a monotonic `call-<n>` id and an `outcome`;
      persists (FR-007)
- [ ] T004 - `call.store.spec.ts`: append persists across a reload; a connect-then-hangup records
      `completed`; a hangup before connect records `missed` (FR-007, FR-008)

## Phase 2 - the clock

- [ ] T005 - `core/clock.ts`: injectable `Clock` with `now()` and a tick source; no wall-clock read
      in any render path (FR-010)
- [ ] T006 - `clock.spec.ts`: the elapsed source advances only when the test advances it (FR-010)

## Phase 3 - the in-call screen

- [ ] T007 - `in-call-page.ts`: the `idle -> connecting -> connected -> ended` machine, `elapsed` as
      a signal, `from` validated against an allow-list, second-call refusal, tick cleared on hangup
      **and** destroy (FR-004, FR-005, FR-009, FR-010, FR-011, FR-014)
- [ ] T008 - `in-call-page.html` + `.scss`: nav, name + avatar, kind, duration, `Mute`/`Speaker` as
      real `aria-pressed` toggles, labelled-unavailable video affordance, prominent `Hang up`, and
      the simulation disclosure (FR-004, FR-006, FR-013)
- [ ] T009 - `in-call-page.spec.ts`: state machine, duration advances only when connected, no tick
      before connected, hangup returns to the origin, toggles flip `aria-pressed`, a second call is
      refused, the tick stops after hangup **and** after destroy, a hostile `?from=` does not navigate
      out of the allow-list, unknown id shows the empty state, the duration region is `role="timer"`
      and not a live region (FR-004 … FR-014)

## Phase 4 - the picker

- [ ] T010 - `call-picker-page.{ts,html,scss}`: `/calls/new`, `contactConversations()` filtered by
      search, empty state, select starts a voice call, `Back` to the Calls list, unknown id does not
      throw (FR-003, FR-014, FR-015)
- [ ] T011 - `call-picker-page.spec.ts`: list, filter, empty state, selection, Back, unknown id
      (FR-003, FR-014)
- [ ] T011b - the no-match call path: a `CallEntry` whose `contactName` matches no chat still starts a
      call, with a null avatar, and the in-call screen shows that name (FR-012)

## Phase 5 - wiring the four dead controls

- [ ] T012 - `chat-header.{ts,html}`: `call` / `videoCall` outputs, click handlers, aria-labels lose
      "coming soon" (FR-001)
- [ ] T013 - `chat-header.spec.ts`: each button emits, naming the contact; neither label says
      "coming soon" (FR-001)
- [ ] T014 - `chat-window-page.{ts,html}`: wire both header outputs to the in-call route (FR-001)
- [ ] T015 - `calls-page.ts`: `+ new call` opens the picker; the sheet's `Voice call` / `Video call`
      start a call; the origin is remembered (FR-002, FR-003)
- [ ] T016 - `calls-page.spec.ts`: `+ new call` opens the picker and returns on Back; both sheet
      actions start a call; the origin survives (FR-002, FR-003)
- [ ] T017 - `app.routes.ts`: `/calls/new`, `/calls/active` (FR-003, FR-004)

## Phase 6 - closure

- [ ] T018 - `tests/e2e/calling-flow.spec.ts` authored, not run
- [ ] T019 - Drift notes: `specs/043-call-info/spec.md`, `specs/002-chat-window/spec.md`,
      `specs/design-gap-audit.md` (A6 + B6), `figma/design-map.md` (rows 2 and 4)
- [ ] T020 - FR -> test traceability, checklist with evidence, converge

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

- No WebRTC, no `getUserMedia`, no audio, no video stream. The duration is a counter. The screen
  discloses this.
- `Mute` and `Speaker` toggle real state and affect nothing else. Silent dead buttons are the exact
  defect this audit exists to remove, so they must not ship as no-ops.
- A call started from the chat window returns to the chat window; from the picker, to the Calls list.
- `CallEntry.outcome` is optional and normalized at load. The call log is not bumped to `version: 2`,
  which would discard every user's existing log to ship an optional field.
- `call-info-modal.ts` is not edited; its actions already emit ids and the page interprets them.
