# Plan: WhatsApp Data & Storage (feature 018)

**Input**: `specs/018-data-storage/spec.md` + `specs/018-data-storage/research.md` (original: **Input**: `figma/design-map.md` row 18 (`0:10894`) + `specs/018-data-storage/research.md`)

**Gate**: Figma 429 clears (~2026-09-28) -> node payload capture (`0:10894`) -> owner approval -> test-first -> implementation. Structural implementation approved pre-capture (owner directive `2026-09-24`).

## Approach

1. **Screen**: `DATA_STORAGE_ROWS` seed (hypothesis) + `features/settings/data-storage-page` +
   units.
2. **Entry**: Settings row activation + settings e2e US2 update (no-op probe → Contacts row).
3. **US3**: Back routing + responsive + gated golden (measure baseline, ship measured + 0.05).
4. **Closure**: design-map row 18 -> `018` + implemented; commits (spec/feat/docs).

## Phases

The approach above is executed in order; each numbered step is one commit-sized unit (docs -> feat -> test).

## Review gates

- **G1**: capture + owner approval;
- **G2**: build/unit/e2e green;
- **G3**: closure commit.

## Drift policy

The `Data and Storage` row stops being a no-op and navigates - spec`d, not silent. `DATA_STORAGE_ROWS` is a declared hypothesis until G1 capture replaces it; the `/settings/data-storage` chrome is provisional.

## Structure

Single project (repo root):

```text
specs/018-data-storage/
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