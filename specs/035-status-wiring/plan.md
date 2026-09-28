# Plan: WhatsApp Status — live row targets (Privacy / My Status) (feature 035)

**Input**: `specs/035-status-wiring/spec.md` + `specs/035-status-wiring/research.md` (original: **Input**: `StatusPage` (spec 006) + `/settings` (013) + `/status/compose` (007) +)

**Gate**: G1 needs no capture - rows 006 / 013 / 007 already exist; this feature only wires them.

## Approach

1. `StatusPage`: `onNavAction('privacy')` → `/settings`; `onRowActivate()` → `/status/compose`.
2. Unit: replace the "stay no-ops" test with the four routing assertions.
3. E2E authored (paused).
4. Drift note (`specs/006`); build + unit validation; commits (spec → feat → test).

## Phases

The approach above is executed in order; each numbered step is one commit-sized unit (docs -> feat -> test).

## Review gates

- **G1**: behavior only;
- **G2**: build/unit green + e2e authored;
- **G3**: close + drift note.

## Drift policy

006 `Privacy` and `My Status` stop being no-ops (drift note in 006). `Call history` and the status entries themselves stay as designed; no chrome changes.

## Structure

Single project (repo root):

```text
specs/035-status-wiring/
- spec.md          # requirements (canonical)
- research.md      # Phase 0 research + assumptions
- plan.md          # this file (Phase 1)
- tasks.md         # Phase 2 task list
- contracts/ui-contracts.md
src/app/core/        # stores (ChatStore, PrefsStore, CallStore)
src/app/features/    # one folder per screen
src/app/shared/components/  # nav bar, list item, action sheet, toggles
tests/e2e/           # playwright specs (authored; runs paused)
```