# Feature Specification: WhatsApp Data & Storage

**Feature Branch**: `018-data-storage`

**Created**: 2026-09-24

**Status**: **In progress — structural scope landed pre-capture (owner directive `2026-09-24`).**
The Settings "Data and Storage" row opens `/settings/data-storage`, rendering the Data & Storage
pushed screen (Back → `/settings`, title "Data & Storage", seeded hypothesis rows, no tab bar).
All rows are no-ops this feature. Exact rows, sections, glyphs and golden remain PENDING the
Figma capture (~2026-09-28) and are gated at G1; provisional/hypothesis values in place.

**Input**: `figma/design-map.md` row 18 (`0:10894`) + `specs/018-data-storage/research.md`

---

## Summary

Data & Storage is a pushed Settings sub-page reached from the Settings "Data and Storage" row.
This feature wires that row and renders the screen with a seeded row list (hypothesis: Storage
usage, Media auto-download, Images, Audio, Videos, Documents, Network usage). Storage/network/
auto-download behaviour is later features / map-external; rows are no-ops here.

## PENDING design inventory (capture on ~2026-09-28)

- [ ] Section/row set + labels + glyphs + grouping
- [ ] Auto-download option-row treatment
- [ ] Nav title confirmation ("Data & Storage" vs "Data and Storage Usage")

## Owner Clarifications (proposed — confirm at G1)

1. **Entry**: Settings → Data and Storage row → `/settings/data-storage`.
2. **Rows**: hypothesis list replaced from the payload at G1.
3. **Title**: "Data & Storage" in the pushed header (PENDING).

## Functional Requirements

- **FR-001**: Settings "Data and Storage" row navigates to `/settings/data-storage`.
- **FR-002**: `/settings/data-storage` renders the screen (title + rows from
  `DATA_STORAGE_ROWS` seed), no tab bar.
- **FR-003**: Back returns to `/settings`.
- **FR-004**: All rows are no-ops (later features / map-external).
- **FR-005**: No horizontal overflow at any breakpoint.

## Non-Goals

- Real storage/network stats; auto-download toggles; usage charts.

## User Stories

- **US1 (entry)**: On Settings I tap Data and Storage and land on `/settings/data-storage`.
- **US2 (screen)**: I see the pushed header (Back + title), labelled rows, no tab bar.
- **US3 (chroming)**: Back returns to `/settings`; rows are no-ops; no horizontal overflow;
  matches the Figma render within the measured golden threshold.

## Acceptance Criteria (validation targets)

1. Unit — `data-storage-page.spec.ts` (new); `settings-page.spec.ts` row activation update;
   no-op probe moves to the final row (Contacts).
2. E2E `tests/e2e/data-storage.spec.ts`: US1/US2/US3 (+ golden `0-10894-data-storage.png`
   gated). `settings.spec.ts` US2 updated.
3. Responsive: no-overflow cases for `/settings/data-storage`.
4. `figma/design-map.md` row 18 spec → `018` + implemented at closure.

## Closing note (deliberately incomplete)

Until T001 lands, `data-storage-page` renders structural rows (stable testids/aria-labels) —
replaced at G1 with the captured design.