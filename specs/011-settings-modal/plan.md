# Plan: WhatsApp Settings Modal (feature 011)

**Input**: `specs/011-settings-modal/{spec,research}.md`

**Gate**: Figma 429 clears (~2026-09-28) → node payload capture (`0:9778`) → owner approval of
spec Clarifications (entry affordance + row content) → write-first tests → implementation.
Structural implementation approved pre-capture (owner directive `2026-09-24`; host = Settings stub).

## External dependency: Figma 429 (hard blocker for visual facts)

- Node GET **and** downloads are 429 until ~2026-09-28 (re-confirmed 2026-09-24 on the local MCP,
  retry-after ≈ 345k s). The `0:9778` payload (rows, entry glyph, geometry, colors) is unknowable
  until then.
- Like 010, the shared `action-sheet` already exists and is green; 011 is a lean slice: Settings
  entry trigger + row seed + wiring + US3. Row set and entry glyph stay hypothesis-mocked until G1.
- Strategy (proven 007-010): retry the local MCP on/after the retry date; download golden + glyphs
  into `tests/e2e/golden`.

## Scope

- Shared `action-sheet`: **reused unchanged** (from 009) — no contract churn; verify against
  `0:9075` at capture.
- Settings entry: trailing trigger on the Settings stub (`features/starred-messages/
  settings-stub-page`) opening the sheet; rows data-driven; selection emits/calls back (row targets
  are later features — real host is row 13).
- Shared shell unchanged; modal overlays the routed Settings page inside `app-shell` content.

## Approach

- `features/settings/settings-modal.{ts,html,scss,spec.ts}` (+ `settings.seed.ts`) wraps
  `app-action-sheet` with the `0:9778` rows (provisional hypothesis seed; ids stable). Row 13 will
  reuse this folder for the real screen.
- Stub pages: add the trigger (a11y label + `data-testid`), open/dismiss/focus-return wiring
  (mirrors 010's `ChatWindowPage` pattern).
- Geometry/typography/colors: from the node inventory once captured, same measurement pipeline as
  007/008/009/010.

## Phases

1. **Capture** (deferred ~09-28): node inventory `0:9778`; verify `0:9075` reuse; golden
   `0-9778-settings-modal.png`; glyph SVGs (rows + entry). Fill research.md "Node inventory".
2. **Contracts/confirm** (G1): entry affordance + row content approved; seed finalized.
3. **Entry + wiring**: stub trigger → open sheet; dismiss/focus-return; row id emission.
4. **US3**: a11y + focus + responsive (no-overflow at 3 breakpoints) + golden
   `0-9778-settings-modal.png` (measure baseline, `maxDiffPixelRatio = measured + 0.05`).
5. **Closure**: design-map row 11 -> `011` + implemented; spec/tasks statuses; session report;
   commit `feat(settings-modal): implement WhatsApp Settings Modal (feature 011)`.

## Review gates

- **G1**: node inventory recorded + owner approval of Clarifications (entry affordance, row
  content). No exact visual facts claimed before G1.
- **G2**: build + unit + e2e (incl. golden) green; baseline recorded; drift register updated.
- **G3**: closure commit + traceability (design-map/spec/tasks).

## Drift policy

Reuse the shared `action-sheet` exactly as shipped; any visual deviation required by the `0:9778`
payload goes through the drift register with owner approval. The Settings trigger is an additive
nav-bar change on the stub page (kept a11y-clean); no layout reflow of existing elements. The stub
remains the host until row 13 replaces it — the modal contract must not depend on stub internals.