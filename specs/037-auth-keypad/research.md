# Design Research + Plan + Tasks + Quickstart: auth keypad (feature 037)

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

## Plan

1. `_tokens.scss`: add `error` colour.
2. `auth-page.ts`: `phone` signal, `submitted` flag, `error` computed, `onKey`/`onDelete`/
   `onContinue`, `Router` injection.
3. `auth-page.html`: render digits + `aria-live`, add the conditional error paragraph.
4. `auth-page.scss`: `.auth__error` using `var(--wa-error)`.
5. Unit + e2e (paused); 021 drift note; build + unit green; commits (spec → feat → test).

**Gates**: G1 keypad + continue; G2 build/unit green + e2e authored; G3 close + drift note.

## Tasks

- [x] T001 — Spec set `specs/037-auth-keypad/`
- [x] T002 — Keypad entry + validation + Continue
- [x] T003 — Error token + styles
- [x] T004 — Unit tests + authored e2e
- [x] T005 — 021 drift note; build + unit green
- [x] T006 — Commits

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per owner directive
```