# Plan: WhatsApp Settings — overflow sheet navigation (feature 029)

**Input**: `specs/029-settings-overflow/spec.md` + `specs/029-settings-overflow/research.md` (original: **Input**: `SettingsPage` / `SettingsModal` (F-011 sheet, `SETTINGS_ACTIONS`) + existing)

**Gate**: G1 needs no capture - the 011 sheet and 013 rows already exist; this feature wires them.

## Approach

1. Wire `onSettingsAction` (notifications/storage dismiss+route; more no-op).
2. Update spec: replace the all-no-op row test with per-row expectations.
3. E2E authored (paused); drift notes (011/013); build + unit validation.
4. Commits (spec → feat → test).

## Phases

The approach above is executed in order; each numbered step is one commit-sized unit (docs -> feat -> test).

## Review gates

- **G1**: no-op;
- **G2**: build/unit green + e2e authored;
- **G3**: close + drift notes.

## Drift policy

The 011 / 013 `more`, `notifications` and `storage` rows stop being no-ops (drift notes in both). The all-no-op row test was replaced with per-row expectations, which is a spec-visible test change.

## Structure

Single project (repo root):

```text
specs/029-settings-overflow/
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