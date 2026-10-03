# Plan: Informative Profile (055)

**Feature**: `055-profile-informative` · **Spec**: [`spec.md`](./spec.md)

## Approach

Extends F-054's description treatment to the profile surfaces with no new token, model or route:

- **Settings header** (`settings-page.ts`): the `profile` computed already merges the seed, so it
  gains `about: this.prefs.profile().about`. The template adds, inside the existing identity block,
  an `@if (profile().about)` line that reuses the F-054 `.settings__row-description` style (already
  defined in `settings-page.scss` with the exact 13px/`--wa-text-secondary`/regular treatment). The
  identity block's 2px column stack already matches the row-description gap, so no SCSS change is
  needed for the header.
- **Edit Profile** (`profile-page.html/scss`): each field renders a `.profile__hint` element after
  its input; the SCSS adds `.profile__hint` with the same typography as `.settings__row-description`
  plus a small top margin so it reads as a caption under the input. Hints live inside the field
  `label` (normal label behaviour: clicking focuses the input). Copy is a literal const in
  `profile-page.html` (two literal strings), recorded in the spec appendix.

### Why this shape

- Reusing `.settings__row-description` in the header means the new header line and the F-054 rows
  share one style; the `.profile__hint` class exists because the profile page is a different
  component and the caption sits under an input, not a stacked row label.
- The `@if` guard keeps the fresh-install header (empty about) byte-identical to today, honouring
  "keep the hint, add the About text".
- `aria-label` values are untouched, so the pins in the existing suites stay valid; the new text is
  pure content inside existing controls.

## Review Gates

- **G1 — capture**: **blocked** — the OAuth token expired (`403 Token expired`, 2026-10-03), so
  rows 13 (`0:9198`) and 20 (`0:10659`) cannot be fetched. Treatment and copy are owner-approved
  PROVISIONAL hypotheses recorded in the spec; reconcile after re-auth alongside F-054.
- **G2 — build + unit**: `npm run build` green; full `ng test` suite green (exact count) before the
  feat and test commits.
- **G3 — closure**: drift notes in specs 013 and 020, design-map rows 13 and 20, gap-audit
  changelog entry, traceability, converge.

## Drift Policy

- F-013 describes the header identity block as name + hint only; F-020 describes the Edit Profile
  form without captions. Both gain a drift note: the header gains an About line when set, and the
  form gains caption lines under its inputs (F-055), geometry capture-gated.
- New copy values always go through `/speckit.clarify` first; the appendix is amended with the
  answer, never silently.

## Risks

- **Header height**: adding a line when About is set grows the header; the list still scrolls
  beneath the pinned header, and nothing else measures the header, so no layout regression.
- **Label/hint a11y**: the hint is inside the `label`, so it is part of the field's label text for
  assistive tech — desired (presentational content), and the explicit `aria-label` on each input
  keeps the accessible name exactly `Name`/`About`.
- **Empty-about default**: covered by asserting the current default header renders with no About
  line and unchanged `aria-label`.