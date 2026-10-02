# Plan: Expanding Status Input (053)

**Feature**: `053-status-input-expand` · **Spec**: [`spec.md`](./spec.md)

## Approach

The page already owns the single `value` signal (F-051 FR-007), so growth needs no new component,
store, or clock. Change the field to a `textarea`, then re-measure it whenever the `value` signal
changes and set its height to `min(contentHeight, 5 lines)`, flipping `overflow-y` to `auto` past the
cap. Both entry paths — the OS keyboard and the F-051 on-screen keys — change the same signal, so a
single effect covers them by construction. Line-break preservation is a one-line feed CSS change
(`white-space: pre-wrap`); the store already trims outer whitespace and persists internal `\n`.

### Growth mechanism

- `compose-page.ts` adds `viewChild('statusInput')` and a constructor `effect` that reads
  `value()` then the field element and sets:
  - `height` to `Math.min(el.scrollHeight, 228)` (measuring with `height: 0` first),
  - `overflowY` to `auto` when `scrollHeight > 228`, else `hidden`.
- `compose-page.html` swaps `<input type="text">` → `<textarea rows="1" #statusInput …>`, keeping
  `[value]`, `(input)`, `data-testid="compose-input"`, `aria-label`, `placeholder`, and the visible
  focus rule.
- `compose-page.scss`: `.compose__type` keeps `top: 211px` but `height` → `min-height: 52px`;
  field gains `min-height: 45.6px`, `max-height: 228px`, `resize: none`, `overflow-wrap: anywhere`.

### Why this shape

- A directive would be a new project pattern with one consumer; the page already owns the signal, so
  the effect is co-located and needs no new API.
- `field-sizing: content` was considered, but an explicit height + `min/max` pair is deterministic in
  the Karma unit suite and needs no CSS feature support.
- The feed change is inside the existing shared `__tip-text, __mine-text` rule; the tip's single
  sentence renders identically under `pre-wrap`.

## Review Gates

- **G1 — capture**: blocked/incomplete for the *grown* presentation: no Figma node shows a field past
  one line. Rest-state chrome is design-verified; the 5-line cap (raised 3 → 5 lines by owner decision
  2026-10-02), scroll and centered multi-line
  alignment are recorded owner-approved hypotheses (spec FR-001, G1). The 051/052 PROVISIONAL values
  are untouched.
- **G2 — build + unit**: `npm run build` green; full `ng test` suite green with the exact count
  reported before the feat and test commits.
- **G3 — closure**: docs commit with traceability, drift note on the F-049/F-051 claim that the
  compose field is a fixed single-line input, design-map row 7 (`053` link), gap-audit changelog
  entry, converge.

## Drift Policy

- Specs that describe the compose field as a fixed single-line `<input>` (F-049 FR-001, F-051 FR-007
  wording "the field stays focusable") gain a drift note: the field is now a growing multiline
  `textarea`; the shared-value contract is unchanged.
- If the capture reconcile later provides a different line cap or alignment, this spec is amended
  through `/speckit.clarify`, with both the old and new provisional values recorded.

## Risks

- **Measurement timing**: the effect must measure after the `[value]` binding renders; effects run
  after change detection, so `scrollHeight` reflects the new text. The indeterminate-risk test suites
  use `autoDetectChanges`, keeping the zone turn honest.
- **Cap collision**: `max-height` + a tall value must yield an internal scrollbar, never horizontal
  overflow or clipped Send state. Covered by T006.
- **Photo mode**: no field renders there, so the effect must tolerate `viewChild === undefined`
  (guard exits). Covered by T006.