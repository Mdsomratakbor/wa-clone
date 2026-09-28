# Implementation Plan: Call Info Sheet (feature 043)

**Input**: `specs/043-call-info/spec.md`, `specs/043-call-info/research.md`

**Gates**: G1 = capture BLOCKED (Figma `429`, reset 2026-10-02 18:38 UTC) — action labels, order
and sheet chrome are PROVISIONAL. G2 = build + unit green, e2e authored not run. G3 = closure +
drift notes in 004, 005, 038.

## Approach

Reuse, do not build. The sheet is `app-action-sheet` — the same component behind the Add Modal,
Chat Actions and Settings modals — so this feature adds one small wrapper component and a little
page state. F-043 deliberately does not add a route, a store method, or a model field.

### Files

| File | Change |
|------|--------|
| `src/app/features/calls/call-info-modal.ts` | **new** — wrapper over `ActionSheet`: builds the four actions, hosts the Escape `HostListener` |
| `src/app/features/calls/call-info-modal.html` | **new** — 5 lines, `<app-action-sheet>` with `(action)` / `(dismiss)` |
| `src/app/features/calls/call-info-modal.scss` | **new** — empty-by-default; the overlay geometry belongs to `action-sheet.scss` |
| `src/app/features/calls/call-info-modal.spec.ts` | **new** — wrapper-level tests (action set, order, Escape) |
| `src/app/features/calls/calls-page.ts` | `infoCall = signal<CallEntry \| null>(null)`; `onCallInfo` opens, `onSheetAction` dispatches, `onSheetDismiss` closes |
| `src/app/features/calls/calls-page.html` | render `<app-call-info-modal>` when `infoCall()` is set |
| `src/app/features/calls/calls-page.spec.ts` | sheet tests |
| `src/app/core/call.store.ts` | comment only — `removeCall()` already persists |
| `tests/e2e/call-info.spec.ts` | **new** — authored, not run |

### State shape

One signal, `CallEntry | null`, on the page. Not a separate store: a sheet is view state, it must
not survive a reload, and putting it in `CallStore` would mean persisting something the snapshot
should never hold. The page already owns `editing` as a local signal, so this matches the file.

### Action dispatch

```ts
protected onSheetAction(id: string): void {
  const call = this.infoCall();
  if (call === null) return;
  this.infoCall.set(null);              // every action dismisses first
  if (id === 'message') { this.openChatFor(call); return; }
  if (id === 'delete') { this.callStore.removeCall(call.id); return; }
  // 'voice-call' / 'video-call': no destination until the in-call screen exists (F-044+).
}
```

`openChatFor(call)` is the F-038 row-tap body, extracted so both paths share it — one resolution
rule, one place that can regress. It returns early when `chatIdForContactName()` yields `null`, so
`Message` on an unknown contact closes the sheet and stays put (FR-004).

### Ordering and the inert rows

`voice-call` / `video-call` are **not** `disabled` and **not** removed: they are real buttons that
dismiss and change nothing else, asserted by a test (FR-006). F-004 approved inert-but-focusable
controls, so this follows precedent instead of inventing a new pattern. They are listed in the
spec's UNKNOWN block, so their provisional status is documented, not implied.

## Ordering

1. `call-info-modal.{ts,html,scss}` + its spec — the sheet in isolation, before the page knows
   about it.
2. `calls-page.ts` / `.html` — state + dispatch + render.
3. `calls-page.spec.ts` — the eight behavioural tests.
4. `call.store.ts` comment, e2e spec, drift notes, closure.

Each step is commit-sized: `feat` for 1–2, `test` for 3–4.

## Risks

- **The `ⓘ` click bubbling.** `CallListItem.onInfo` calls `event.stopPropagation()`, so opening the
  sheet must not also trigger row tap. The existing `onCallSelected` stays wired; the test asserts
  the URL is still `/calls` after opening the sheet.
- **Deleting the row the sheet is bound to.** The sheet closes before `removeCall()`, so the `@if`
  guard is already false by the time the list re-renders. `ActionSheet` also renders nothing when
  `actions()` is empty, so a dangling sheet cannot survive.
- **Edit mode.** `ⓘ` is hidden in edit mode by `CallListItem`, and `onCallInfo` returns early when
  `editing()` — belt and braces, because FR-007 requires the sheet be unreachable while editing.
- **Provisional copy drifting into a golden.** No golden is captured for this feature (G1 blocked),
  so there is nothing to re-baseline later.

## Drift policy

- `specs/004-calls` — the `+ new call` / info-button "no effect" decision is superseded.
- `specs/005-calls-edit` — the info button is hidden in edit mode; unchanged, but the sheet's
  reachability is now specified.
- `specs/038-call-log` — its Non-Goals listed the call-info sheet as deferred; note the split.
- `specs/design-gap-audit.md` — B6 partially done.
- `figma/design-map.md` — row 4 note.
