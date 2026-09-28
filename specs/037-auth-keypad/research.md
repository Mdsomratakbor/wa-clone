# Design Research: WhatsApp Authorization — working keypad and Continue

**Source**: gap audit tier A (`specs/design-gap-audit.md`, A4) — a fully designed screen whose every
control is inert.

## Research summary

- `AuthPage` already renders the design's chrome exactly (spec 021) and exposes stable testids
  (`auth-key`, `auth-key-delete`, `auth-continue`, `auth-phone`, `auth-country`), so F-037 is pure
  behaviour: three handlers, one signal, one error flag.
- Golden safety: `0-11030-auth.png` is capture-gated and the seeded state has an empty phone region.
  Keeping the error element absent (not merely transparent) and Continue visually unchanged while
  empty means the default render does not move.
- Entry-point safety: spec 021 FR-005 deliberately keeps `/` → `/chats`. F-037 does not touch the
  default redirect, so Continue is only reachable by navigating to `/auth` deliberately — the
  shipped feature set stays reachable either way.
- Validation bounds: 15 digits matches E.164 without `+`; 7 is the shortest plausible national
  number, so a shorter entry is refused rather than navigating. The design's own copy for the invalid
  state is map-external, so the wording is recorded as a caveat rather than presented as measured.
- Colour: the token file has no error colour; `--wa-text-secondary` is grey, which would not read as
  an error. Adding one `error: #ff3b30` entry to `$wa-colors` follows the existing token pattern
  (the `:root` block auto-emits every map entry) and is reusable by later tier-B screens.
- No store involvement: nothing about the entered number is persisted (no session identity exists).

## Canonical artifacts

The plan and the task list that used to live in this file now live in the canonical
Speckit artifacts for this feature:

- `plan.md` - approach, phases, review gates, drift policy
- `tasks.md` - the delivery checklist (this file keeps the research record only)