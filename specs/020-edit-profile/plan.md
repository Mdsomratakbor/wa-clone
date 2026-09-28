# Plan: WhatsApp Edit Profile (feature 020)

**Input**: `specs/020-edit-profile/spec.md` + `specs/020-edit-profile/research.md` (original: **Input**: `figma/design-map.md` row 20 (`0:10659`) + `specs/020-edit-profile/research.md`)

**Gate**: Figma 429 clears (~2026-09-28) -> node payload capture (`0:10659`) -> owner approval -> test-first -> implementation. Structural implementation approved pre-capture (owner directive `2026-09-24`).

## Approach

1. **Entry**: Settings profile header `section` → labelled button tap → `['/settings/profile']`.
2. **Screen**: `features/settings/profile-page` (Name prefilled from `SETTINGS_PROFILE` + About +
   Save no-op) + units.
3. **US3**: Back routing + responsive + gated golden (measured + 0.05 at capture).
4. **Closure**: design-map row 20 -> `020` + implemented; commits (spec/feat/docs).

## Phases

The approach above is executed in order; each numbered step is one commit-sized unit (docs -> feat -> test).

## Review gates

- **G1**: capture + approval;
- **G2**: build/unit green (e2e runs paused per owner directive);
- **G3**: closure commit.

## Drift policy

The Settings profile header tap and the `/settings/profile` route are declared hypotheses; the profile fields (Name, About) are provisional until G1 capture.

## Structure

Single project (repo root):

```text
specs/020-edit-profile/
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