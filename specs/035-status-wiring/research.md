# Design Research + Plan + Tasks + Quickstart: Status wiring (feature 035)

**Source**: gap audit tier A (`specs/design-gap-audit.md`, A1/A2) — designed controls whose targets
already exist.

## Research summary

- `StatusPage.onNavAction` ignores its id and `onRowActivate` is empty, while the same component
  already routes camera/note circles to `/status/compose`. The fix is symmetric with existing code.
- The row is a `div[role="button"][tabindex="0"]` with `(click)` **and** `(keydown.enter)` /
  `(keydown.space)` (spec 006 keyboard parity), so keyboard and pointer paths both exist already —
  only the handler is missing.
- The two action circles are nested buttons inside/next to the row markup. If the row handler is on
  an ancestor, a circle click would also trigger it; both targets are the same route, so the
  observable result is identical, but the unit test must assert circles still work so a future
  divergence is caught.
- `Privacy` maps to `/settings` (not a new Privacy screen): the design has no Privacy screen, and
  the audit records that rather than inventing one.
- No store mutation, so no persistence concerns; no chrome, so no golden risk (`0:8257`-class
  captures for status are unaffected).

## Plan

1. `StatusPage`: `onNavAction('privacy')` → `/settings`; `onRowActivate()` → `/status/compose`.
2. Unit: replace the "stay no-ops" test with the four routing assertions.
3. E2E authored (paused).
4. Drift note (`specs/006`); build + unit validation; commits (spec → feat → test).

**Gates**: G1 behavior only; G2 build/unit green + e2e authored; G3 close + drift note.

## Tasks

- [x] T001 — Spec set `specs/035-status-wiring/` (this set)
- [x] T002 — Status page routing
- [x] T003 — Unit tests + authored e2e
- [x] T004 — 006 drift note; build + unit green
- [x] T005 — Commits

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per owner directive
```