# Plan: WhatsApp Settings (feature 013)

**Input**: `specs/013-settings/{spec,research}.md`

**Gate**: Figma 429 clears (~2026-09-28) → node payload capture (`0:9198`) → owner approval of
spec Clarifications (profile/rows/011 entry) → write-first tests → implementation. Structural
implementation approved pre-capture (owner directive `2026-09-24`).

## Approach

- New `features/settings/settings-page.{ts,html,scss,spec.ts}`; route `settings` → it; delete
  `starred-messages/settings-stub-page.*`.
- Structure: `NavigationBar` (Back leading → `/starred-messages`, title "Settings"); body with
  profile header (`settings-profile`/`settings-avatar`/`settings-name`) + options trigger
  (`settings-options`, 011 contract) + row list (`settings-list`, `settings-row`s from
  `SETTINGS_ROWS`); `TabBar` active Settings, tabs route away; 011 Settings Modal block.
- Data-driven: `SETTINGS_PROFILE` + `SETTINGS_ROWS` in `settings.seed.ts` so G1 edits data only.
- Replaces stub spec with `settings-page.spec.ts`; keeps 011 behavior tests 1:1.

## Phases

1. **Capture** (deferred ~09-28): node inventory `0:9198`; golden `0-9198-settings.png`; row/
   chevron glyphs. Fill research.md.
2. **Screen**: seed profile/rows; `settings-page` component + units.
3. **Routing/host**: `/settings` route swap; delete stub; `starred.spec.ts` update; responsive
   re-label.
4. **US3**: 011 re-host regression + golden (measure baseline, `maxDiffPixelRatio = measured + 0.05`).
5. **Closure**: design-map row 13 -> `013` + implemented; spec/tasks statuses; session report;
   commits (spec set / feat / docs).

## Review gates

- **G1**: node inventory + owner approval (profile header, row list/order, 011 entry).
- **G2**: build + unit + e2e (incl. 011 regression + golden) green; baseline recorded.
- **G3**: closure commit + traceability (design-map/spec/tasks).

## Drift policy

Removal of the "coming soon" stub content and the move of the 011 host are spec'd, owner-approved
changes (not silent drift). Seed values are provisional and replaced at G1. UI contracts
(`settings-page`, `settings-options`, settings-modal behavior) are frozen.