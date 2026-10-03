# Feature Specification: Informative Profile (055)

**Feature Branch**: `055-profile-informative`

**Created**: 2026-10-03

**Status**: In progress — owner-approved follow-on to F-054 (2026-10-03). G2 gate: build + full unit
suite green. The header About line and the Edit Profile hints are **owner-approved but
design-unverified**: the capture gate is blocked by the expired OAuth token
(`{"status":403,"err":"Token expired"}`, 2026-10-03), so the Settings header (`0:9198`) and Edit
Profile row (`0:10659`) cannot be fetched until the owner re-authenticates. Copy is recorded
literally in this spec for the post-capture reconcile alongside the F-054 strings.

**Input**: design rows 13 (`0:9198` Settings — the profile header row `settings__profile`) and 20
(`0:10659` Edit Profile). No capture is currently available; both treatments are hypotheses until
G1 clears.

## Clarifications

### Session 2026-10-03

The owner asked to make the profile "more informative" too, extending F-054.

- Q: Which profile surface carries the informative treatment?
  A (**owner**): **Edit Profile screen fields** — WhatsApp-style helper hints under the Name and
  About fields on `/settings/profile`.
- Q: What about the Settings profile header row?
  A (**owner**): **keep the hint, add the About text** — keep "Tap to edit profile" and show the
  user's About text as an additional informative line beneath it (when set).
- Q: Styling for the added text?
  A (**owner**): **same treatment as F-054** — `--wa-fs-control` size, `--wa-text-secondary`
  colour, regular weight, stacked text.

## Summary

F-054 made every Settings row informative. This feature extends the same treatment to the profile
surfaces. The profile header keeps its "Tap to edit profile" hint and additionally shows the user's
About text as a third line; the Edit Profile screen adds a helper-caption line under each of its
Name and About inputs. No store, model, route or token change.

## Functional Requirements

- **FR-001** The Settings profile header identity block renders the user's About text as a line
  beneath "Tap to edit profile", reusing the F-054 description styling (`--wa-fs-control`,
  `--wa-text-secondary`, 2px stack). When `about` is empty (the default profile has `about: ''`),
  the line is **not** rendered, so a fresh install shows the header exactly as before.
- **FR-002** The Edit Profile screen (`/settings/profile`) renders a hint line under each field's
  input, stacked below the input inside the field, reusing the same description styling. Copy is
  listed literally in the [Appendix](#appendix-provisional-copy) and is owner-approved:
  - Name → `Your name is visible to everyone` (mirrors the real WhatsApp caption)
  - About → `Shown next to your name in chats` (drafted)
- **FR-003** Behaviour is unchanged: the header button keeps `aria-label="Edit profile"`, routes and
  `onSave` are untouched, and the inputs keep their `aria-label`s (`Name`, `About`). The added text
  is presentational row/field content — screen readers hear it as field content, never as the
  control's accessible name.
- **FR-004** The copy and treatment are PROVISIONAL: a drift note is added to specs 013 and 020,
  design-map rows 13 and 20 record the treatment, and the gap-audit changelog carries an entry. No
  Figma node ID is invented.

## Non-Goals

- No change to the profile store shape or persistence (`ProfileSnapshot`, `DEFAULT_PROFILE`,
  `updateProfile`), no new tokens, no changes to the inputs/labels/Save styling.
- No caption under the header in any other context (tab bar, chat headers). No change to the
  Settings rows from F-054.

## Review Gates

- **G1 (avoid claiming design verification)**: the About line and both hints are owner-approved
  hypotheses; the capture gate is blocked by the expired token. Reconcile against rows `0:9198`
  / `0:10659` after token re-auth.
- **G2**: `npm run build` green and the full unit suite green with the exact count reported.
- **G3**: closure commit with drift notes in specs 013 and 020, design-map rows 13 and 20,
  gap-audit changelog, checklist + converge clean.

## UNKNOWN / NEEDS CLARIFICATION

- Whether the real row-20 design shows captions under the fields. Recorded hypothesis
  (owner-approved): yes, WhatsApp-style. Reconcile post-token-re-auth.
- The About caption is drafted (no real WhatsApp caption exists for the About field); recorded
  verbatim for the reconcile.

## Assumptions

- The header About line reuses the existing `.settings__row-description` style (F-054) rather than
  a new class + style, since the file already defines the exact treatment.
- The hints render inside the existing field `label` after the input; clicking them still focuses
  the input through normal label behaviour.

## Appendix — Provisional copy

| Surface | Text |
|---|---|
| Settings header | `{{ profile().about }}` (verbatim user content, when non-empty) |
| Edit Profile · Name hint | `Your name is visible to everyone` |
| Edit Profile · About hint | `Shown next to your name in chats` |

Owner-approved 2026-10-03. Reconcile against the real design after token re-auth.

## DoD

- [x] `spec.md` + plan/tasks exist and match the shipped behaviour
- [ ] Clarify answers written back into the spec; no open contradiction
- [ ] Drift notes in specs 013 and 020
- [ ] `npm run build` green
- [ ] Full unit suite green, exact count reported
- [ ] E2E authored (execution deferred)
- [ ] Checklist satisfied per requirement with evidence
- [ ] Commits as docs(spec) / feat / test
- [ ] Nothing shipped that no spec authorizes