# Implementation Plan: Calling Flow and In-Call Screen (feature 045)

**Input**: `specs/045-calling-flow/spec.md`, `specs/045-calling-flow/research.md`

**Gates**: G1 = **BLOCKED, and not clearable** — no design node exists for the in-call screen or the
picker, so the quota reset does not help; their chrome is provisional by construction. The four entry
points are already design-verified by existing rendered code. G2 = build + full unit green, e2e
authored not run. G3 = closure + drift notes. G4 = no control in the shipped surface is
display-only (project directive, 2026-09-29).

## Approach

A call is a state machine, not a screen. `dialing -> ringing -> connected -> ended`, held as a
signal in `CallStore` and advanced by an injected `Clock`. Putting the machine in the store rather
than in the component is the load-bearing decision: under the functional-over-display directive, a
call the store cannot see is a call the UI invented, and FR-011's "refuse a second call" is only
enforceable in one place.

Everything else follows from taking the state machine seriously:

- The log entry is written **at call end**, with an `outcome` derived from the state actually
  reached (FR-007). A call cancelled during ringing is `missed`.
- Toggles mutate real session state, readable from the store by anything that needs it (FR-006).
- The duration is real elapsed time from the injected clock, starting at `connected` (FR-010).
- Nobody can answer, so the session auto-answers after `RINGING_MS` (FR-004) — the alternative is a
  screen that never completes anything.

### Files

| File | Change |
| ---- | ------ |
| `src/app/core/clock.ts` | **new** - injectable `Clock`: `now()` + a tick source. No render-path wall-clock reads |
| `src/app/features/calls/calls.model.ts` | `CallSession` interface, `CallOutcome`, optional `outcome` on `CallEntry`, `RINGING_MS` |
| `src/app/core/call.store.ts` | session signal + state machine, `startCall()`, `endCall()`, `appendCall()` with monotonic `call-<n>`, `nextCallSeq`, `normalizeCalls()`; session excluded from the snapshot |
| `src/app/shared/components/chat-header/chat-header.{ts,html}` | `call` / `videoCall` outputs, click handlers, aria-labels lose "coming soon" |
| `src/app/features/chat-window/chat-window-page.{ts,html}` | wire the header's call outputs to the in-call route |
| `src/app/features/calls/call-picker-page.{ts,html,scss}` | **new** - `/calls/new`, search + list, follows `contacts-page.ts` |
| `src/app/features/calls/in-call-page.{ts,html,scss}` | **new** - `/calls/active`, renders the session |
| `src/app/features/calls/calls-page.ts` | `new-call` branch, sheet's two call actions, origin remembered |
| `src/app/app.routes.ts` | `/calls/new` and `/calls/active` |

No new shared component (`research.md` §7). `call-info-modal.ts` is not edited: its actions already
emit ids and the page interprets them, per F-043.

### The origin round-trip

A call starts in one of three places and must return to it. Pass `?from=` and validate it against an
allow-list (`/calls`, `/chat/:id`) on read. An unvalidated query param is an open redirect into
whatever the router resolves, so the allow-list is not optional (`research.md` §8).

### Snapshot shape

`version` stays `1`. `outcome` and `nextCallSeq` are optional and normalized at load; the **session
is excluded** (FR-009). A `version: 2` bump would discard every existing call log to ship an
optional field, which is a bad trade for this change.

### Backend readiness

F-046 will introduce a typed persistence port per store. This feature keeps `CallStore`'s API
persistence-agnostic and its snapshot serializable, and adds no dependency that would block the
port. The duplicated `readStorage`/`writeStorage` try/catch in all three stores is **deliberately
left in place** — extracting it here would be a drive-by refactor across three stores, which
`AGENTS.md` forbids and the owner sequenced after this feature.

### Styling

Tokens only, no raw hex. The in-call screen needs a dark field and a red hangup; if no existing token
covers them they are added to `_tokens.scss` in the same change and noted here. **This is the
feature's one likely token addition** and is called out rather than discovered in review.

## Drift Policy

This feature supersedes these earlier artifacts. Each gets a drift note **in the superseded file**,
written before closure:

| Superseded | What drifts |
| ---------- | ----------- |
| `specs/043-call-info/spec.md` | its deliberate "voice/video call are inert" non-goal is retired (FR-002) |
| `specs/002-chat-window/spec.md` | the header's call buttons stop being "coming soon" (FR-001) |
| `specs/design-gap-audit.md` | A6 and the B6 remainder are closed |
| `figma/design-map.md` | rows 4 and 2 gain the calling-flow note |

No earlier spec is edited to change its own requirements. The notes record what moved and why.

## Review Gates

- **G1**: **BLOCKED, and not clearable.** There is no Figma node for the in-call screen or the
  picker, so this gate cannot be satisfied by waiting for the 2026-10-02 quota reset. The screen
  chrome is provisional permanently. `tasks.md` must not leave capture tasks open in a way that
  implies they will close. What G1 *can* still check: that no node ID is invented for either screen,
  and that the four entry points are cited to real nodes (`0:10395`, row 2).
- **G2**: `npm run build` green; the **full** unit suite green with the exact count reported. A
  partial or filtered run is not a pass.
- **G3**: closure commit; drift notes present in every superseded spec; `checklist` satisfied per
  requirement with evidence; `converge` clean.
- **G4**: every control in this feature's surface changes real state. A control that only changes its
  own label fails this gate, even if a unit test passes.

## Verification

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # full suite, report the exact count
```

Playwright specs are authored and **not executed** (owner directive 2026-09-26).

## Risks

1. **A call the store cannot see.** Mitigated by putting the machine in `CallStore`; asserted by
   tests that read session state through the store rather than through the component.
2. **Snapshot break.** Mitigated by writing the v1-snapshot test first and by `normalizeCalls()`.
3. **Id collision after reload.** Mitigated by persisting `nextCallSeq` and asserting it in a test.
4. **Tick leak.** An uncleared interval survives navigation and keeps a destroyed component's signal
   alive. Mitigated by clearing on hangup **and** on destroy, asserted by a test that ends the call
   and then advances the clock expecting no change.
5. **Open redirect** via `?from=`. Mitigated by the allow-list, asserted with a hostile value.
6. **Auto-answer reads as fake.** It is the honest consequence of there being no second party. The
   call *does* connect, the duration *does* run, the log *does* record the real outcome. What is
   absent is media, which is absent because the backend does not exist yet.
