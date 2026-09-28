# Design Research: WhatsApp Status — live row targets (Privacy / My Status)

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

## Canonical artifacts

The plan and the task list that used to live in this file now live in the canonical
Speckit artifacts for this feature:

- `plan.md` - approach, phases, review gates, drift policy
- `tasks.md` - the delivery checklist (this file keeps the research record only)