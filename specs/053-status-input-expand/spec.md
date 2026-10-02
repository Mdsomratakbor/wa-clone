# Feature Specification: WhatsApp Expanding Status Input (feature 053)

**Feature Branch**: `053-status-input-expand`

**Created**: 2026-10-02

**Status**: Shipped and closed (2026-10-02) — behaviour extension of the design-verified `0:9634`
compose field, owner-approved (2026-10-02). G2 gate passed: build green + full unit suite **710/710**.
The 5-line cap (228px) and internal scroll are PROVISIONAL (no Figma node shows a grown field); the
field's rest-state chrome stays the verified single-line design. The cap moved 3 → 5 lines by owner
decision in clarify session v3 (2026-10-02).

**Input**: design row 7 (`0:9634`, Status compose chrome) — the field, its typography and its
placement. No node shows the field grown past one line.

## Clarifications

### Session 2026-10-02

The owner asked that the status text input box "should be expand".

- Q: What does "expand" mean for the status input?
  A (**owner**): **auto-grow as I type** — the box starts at its current size and grows taller as
  the status wraps or gains lines, so the full status stays visible while composing, and reverts to
  one line when cleared.
- Q: How far may the input grow before it must stop?
  A (**owner**): **cap at 3 lines, then scroll inside the field** — a fixed max keeps the composer
  tidy and the keyboard is never overlapped; beyond the cap the content scrolls within the field.
- Q: Should multi-line statuses keep their line breaks after publishing?
  A (**owner**): **preserve line breaks** — the store keeps the newlines and the feed renders the
  status as composed (`white-space: pre-wrap`).

### Session 2026-10-02 (post-closure refinement)

The owner ran the shipped feature and flagged two artefacts of the approved treatment.

- Q: The scrollbar Chrome paints once the field is capped at three lines — should it show?
  A (**owner**): **hide it, keep scrolling** — the 3-line cap and internal scrolling stay; the
  scrollbar is visually hidden (`scrollbar-width: none`, `::-webkit-scrollbar { display: none }`)
  while wheel/touch scrolling still works.
- Q: The white box around the field is the focus ring (F-049's 2px white outline with a 2px
  offset). What should focus look like?
  A (**owner**): **keep a visible, less boxy focus** — an in-field bottom underline
  (`box-shadow: inset 0 -2px 0`) replaces the offset outline, so focus stays discoverable
  (the accessibility golden rule) without the rectangle border.

### Session 2026-10-02 (v3 — height increase)

The owner asked to "increase the height of the status box".

- Q: How tall may the composing field grow? One line measures 45.6px and the bound is currently 3
  lines, chosen so the field never overlaps the on-screen keyboard.
  A (**owner**): **5 lines (228px)** — the cap moves 3 → 5 lines and the v2 treatments are
  unchanged: past the cap the field scrolls internally with the scrollbar hidden, and the
  "never overlap the on-screen keyboard" bound still applies.

## Summary

The compose field is a fixed single-line `<input>` on a design-verified screen, so a status longer
than the 232px field is clipped by the `overflow: hidden` surface and never fully visible while
composing. F-053 turns the field into a single-row `textarea` that grows with its value (typed via
the OS keyboard *or* the F-051 on-screen keys — both write the same `value` signal), capped at five
lines with internal scrolling, and makes the feed render internal line breaks so a composed
multi-line status appears as composed. The store is untouched: `StatusStore.publish` already trims
outer whitespace and preserves internal `\n`, and JSON persistence keeps them.

## Functional Requirements

- **FR-001** Text compose mode renders a single-row `textarea` in place of the `<input>`, keeping
  the verified rest-state chrome: 232px wide, 38px/500 `Helvetica Neue`, centred, white, transparent
  background, white caret, `placeholder`/`aria-label` "Type a status",
  `data-testid="compose-input"`, and the owner-approved visible focus treatment — an in-field bottom
  underline (v2, 2026-10-02), not F-049's offset outline. The field grows to fit its content (a
  `\n` or wrapped line adds a line), capped at **5 lines (228px)**, above which it **scrolls
  internally with the scrollbar visually hidden** (wheel/touch still scroll — v2, 2026-10-02).
  Native `resize` is disabled; there is no horizontal scroll.
- **FR-002** Enter inserts a line break into the status value. The value stays the single source:
  text entered via the OS keyboard or the on-screen keys grows the field identically, and F-051
  backspace removes the last character including a `\n` (unchanged).
- **FR-003** Growth is driven by the `value` signal, not the key: the field is re-measured after
  every value change from either entry path and sized to `min(contentHeight, 228px)`. Clearing the
  value returns the field to one line (45.6px). Growth never reads the wall clock.
- **FR-004** Publishing preserves internal line breaks: `StatusStore.publish` is unchanged; the feed
  renders the status text with `white-space: pre-wrap` (the shared `__mine-text` rule; the tip's
  single sentence is unaffected by the shared style).
- **FR-005** Photo mode renders no field (unchanged); no token, model, route, or store change; the
  field keeps `data-testid`, `aria-label`, placeholder and focus behaviour.

## Non-Goals

- **No Enter key on the on-screen keyboard** (F-051 unchanged); newlines come from the physical/OS
  keyboard's Enter key.
- **No text length cap, no `max-width` change, no change to photo mode, no shared component or
  directive** — growth lives in the page component that already owns the `value` signal.
- **No change to the store**: `publish`'s trim + newline preservation is exactly what this feature
  relies on and nothing there changes.

## Review Gates

- **G1 (avoid claiming design verification)**: the field's rest-state is design-verified (`0:9634`),
  but **no Figma node shows a grown field**; the 5-line cap (228px), internal-scroll treatment and
  `pre-wrap`
  feed rendering are owner-approved hypotheses recorded in this spec for the post-capture pass. The
  keyboard/photo PROVISIONAL values from 051/052 are untouched.
- **G2**: `npm run build` green and the full unit suite green with the exact count reported.
- **G3**: closure commit, drift note where the F-049/051 specs claimed a single-line field, design-map
  row 7, gap-audit changelog, checklist + converge clean.

## Figma Reference

- Design row 7, Status compose (`0:9634`) — the field's rest-state chrome reused unchanged.
- **No node shows a grown field.** The cap and scroll treatment are the owner-approved hypothesis;
  no node ID is invented.

## UNKNOWN / NEEDS CLARIFICATION

- Line cap. **Hypothesis (owner-approved, v3 2026-10-02)** — 5 lines. One line of 38px `Helvetica
  Neue` at `line-height 1.2` measures 45.6px; the cap is 228px (raised from 136.8px). Recorded
  literally for the reconcile.
- Whether a composed paragraph should centre each line or be left-aligned past the first. **Recorded
  hypothesis (not clarified)** — centred like the single-line field; the design shows no multi-line
  example to source an alignment rule from.

## Assumptions

- A fixed vertical cap that scrolls is more honest than unbounded growth: the on-screen keyboard must
  never be overlapped, and real status composers stop growing.
- The value signal is the composition source of truth (F-051 FR-007); growth re-measures on it, so
  both entry paths are identical by construction.

## Out of Scope Changes

- `compose-page.html` — the `<input>` becomes a `rows="1"` `textarea`; nothing else in the template
  changes.
- `compose-page.ts` — growth effect driven by the `value` signal and the field element
  (`viewChild`); `onValue` reads a `HTMLTextAreaElement`. No store/clock/router change.
- `compose-page.scss` — `.compose__type` goes from fixed `height: 52px` to `min-height: 52px`;
  field `min-height: 45.6px`, `max-height: 228px`, `resize: none`, `overflow-wrap: anywhere`;
  typography/placement unchanged. Post-closure v2 (2026-10-02): `resize: none` is joined by the
  hidden-scrollbar rules and `:focus-visible` becomes the in-field bottom underline.
- `status-page.scss` — `white-space: pre-wrap` added to the shared `__tip-text, __mine-text` rule.
- `status.store.ts`, `status.model.ts`, tokens, routes: untouched.

## Validation Targets

### Unit

- `ComposePage`: the field is a `textarea`; typing wrapping content grows its measured height while
  remaining capped at 228px with internal scroll; clearing returns it to one line; a value holding
  `\n` from the physical keyboard is preserved in the signal and published with its line breaks;
  F-051 keys still type into the field and backspace removes a `\n`; photo mode renders no field.
- `StatusPage`: a published status containing `\n` renders with `white-space: pre-wrap`, so the feed
  shows the composed lines.

## Definition of Done

- [x] Every FR is covered by at least one named unit test
- [x] Text mode renders a growing single-row textarea capped at 5 lines with internal scroll (FR-001)
- [x] Newlines accepted and preserved through publish and the feed (FR-002, FR-004)
- [x] Growth follows the single value source from both entry paths; clear restores one line (FR-003)
- [x] Photo mode, store, model, tokens and routes untouched (FR-005)
- [x] PROVISIONAL cap/scroll and alignment recorded for the post-capture pass (G1)
- [x] Drift note added to the F-049/F-051 field footprint, design-map row 7, gap audit
- [x] `npm run build` green; full unit suite green — **709/709**
- [x] Playwright specs authored; execution deferred per the owner directive (2026-09-26)