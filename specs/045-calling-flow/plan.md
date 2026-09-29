# Implementation Plan: Calling Flow and In-Call Screen (feature 045)

**Input**: `specs/045-calling-flow/spec.md`, `specs/045-calling-flow/research.md`

**Gates**: G1 = **BLOCKED, and not clearable** — no design node exists for the in-call screen or the
picker, so the quota reset does not help; their chrome is provisional by construction. The four entry
points are already design-verified by existing rendered code. G2 = build + unit green, e2e authored
not run. G3 = closure + drift notes in F-043 and the gap audit.

## Approach

A call is a state machine, not a screen. `idle -> connecting -> connected -> ended`, held in a
signal on the in-call page, driven by an injected clock. Everything else follows from making that
machine honest: the log records what the machine actually did (FR-007, FR-008), the controls report
their own state (FR-006), and the screen says it is a simulation (FR-004).

Store changes are additive and normalized at load, following the `normalizeChats()` precedent and
the F-042 `hydrateDefaults()` lesson in `research.md` §3: **the v1-snapshot test is written before
the field it protects.**

### Files

| File | Change |
| ---- | ------ |
| `src/app/core/clock.ts` | **new** - injectable `Clock` service: `now()` + a tick source. No render-path wall-clock reads |
| `src/app/features/calls/calls.model.ts` | add optional `outcome: CallOutcome` to `CallEntry` |
| `src/app/core/call.store.ts` | `appendCall()`, monotonic `call-<n>`, `nextCallSeq` in the snapshot, `normalizeCalls()` at hydrate |
| `src/app/shared/components/chat-header/chat-header.{ts,html}` | two outputs (`call`, `videoCall`), click handlers, aria-labels lose "coming soon" |
| `src/app/features/chat-window/chat-window-page.{ts,html}` | wire the header's call outputs to the in-call route |
| `src/app/features/calls/call-picker-page.{ts,html,scss}` | **new** - `/calls/new`, search + list, follows `contacts-page.ts` |
| `src/app/features/calls/in-call-page.{ts,html,scss}` | **new** - `/calls/active`, the state machine and controls |
| `src/app/features/calls/calls-page.ts` | `new-call` branch, sheet's two call actions, origin remembered |
| `src/app/app.routes.ts` | `/calls/new` and `/calls/active` |

No new shared component (`research.md` §7). `call-info-modal.ts` is not edited: its actions already
emit ids and the page interprets them, per F-043.

### The origin round-trip

A call starts in one of three places and must return to it. Pass `?from=` and validate it against an
allow-list (`/calls`, `/chat/:id`) on read. An unvalidated query param is an open redirect into
whatever the router resolves, so the allow-list is not optional (`research.md` §8).

### Snapshot shape

`version` stays `1`. `outcome` is optional and normalized at load; `nextCallSeq` defaults. A
`version: 2` bump would discard every existing call log to ship an optional field, which is a bad
trade for this change.

### Styling

Tokens only, no raw hex. The in-call screen needs a dark field and a red hangup; if no existing token
covers them, they are added to `_tokens.scss` in the same change and noted here. **This is the
feature's one likely token addition** and it is called out rather than discovered in review.

## Drift Policy

This feature supersedes these earlier artifacts. Each gets a drift note **in the superseded file**,
written before closure:

| Superseded | What drifts |
| ---------- | ----------- |
| `specs/043-call-info/spec.md` | its deliberate "voice/video call are inert" non-goal is retired (FR-002) |
| `specs/002-chat-window/spec.md` | the header's call buttons stop being "coming soon" (FR-001) |
| `specs/design-gap-audit.md` | A6 and the B6 remainder are closed |
| `figma/design-map.md` | row 4 and row 2 gain the calling-flow note |

No earlier spec is edited to change its own requirements. The notes record what moved and why.

## Review Gates

- **G1**: **BLOCKED, and not clearable.** There is no Figma node for the in-call screen or the
  picker, so this gate cannot be satisfied by waiting for the 2026-10-02 quota reset. The screen
  chrome is provisional permanently. `tasks.md` must not leave capture tasks open in a way that
  implies they will close. What G1 *can* still check: that no node ID is invented for either
  screen, and that the four entry points are cited to real nodes (`0:10395`, row 2).
- **G2**: `npm run build` green; the **full** unit suite green with the exact count reported. A
  partial or filtered run is not a pass.
- **G3**: closure commit; drift notes present in every superseded spec; `checklist` satisfied per
  requirement with evidence; `converge` clean.

## Verification

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # full suite, report the exact count
```

Playwright specs are authored and **not executed** (owner directive 2026-09-26).

## Risks

1. **A convincing screen that lies.** Mitigated by FR-004's disclosure, FR-006's real toggles, and
   the Non-Goals. The test that matters: a reviewer must be able to tell from the screen that no
   call is happening.
2. **Snapshot break.** Mitigated by writing the v1-snapshot test first and by `normalizeCalls()`.
3. **Id collision after reload.** Mitigated by persisting `nextCallSeq` and asserting it in a test.
4. **Tick leak.** An uncleared interval survives navigation and keeps a destroyed component's signal
   alive. Mitigated by clearing on hangup **and** on destroy, asserted by a test that hangs up and
   then advances the clock expecting no change.
5. **Open redirect** via `?from=`. Mitigated by the allow-list, asserted by a test with a hostile
   value.
