# Plan: WhatsApp Camera (feature 012)

**Input**: `specs/012-camera/{spec,research}.md`

**Gate**: Figma 429 clears (~2026-09-28) → node payload capture (`0:9155`) → owner approval of
spec Clarifications (topology/control set) → write-first tests → implementation. Structural
implementation approved pre-capture (owner directive `2026-09-24`).

## External dependency: Figma 429 (hard blocker for visual facts)

- Node GET **and** downloads are 429 until ~2026-09-28 (re-confirmed 2026-09-24 on the local MCP,
  retry-after ≈ 345k s). The `0:9155` payload (viewport chrome, control set, glyphs, colors) is
  unknowable until then.
- Unlike 009-011, the Camera screen is not a shared `action-sheet` consumer; it is a new top-level
  screen. Pre-capture structure: dark viewport + Close/Shutter/Flip hypothesis controls + tab-bar
  navigation. G1 replaces structure with the captured design (drift-approved if needed).
- Strategy (proven 007-011): retry the local MCP on/after the retry date; download golden + glyphs
  into `tests/e2e/golden`.

## Scope

- New `features/camera/camera-page` + `/camera` lazy route (top-level screen inside the shared
  shell).
- Camera-tab navigation wired in chats/calls/status (`onTabSelect` swap list) + their unit tests.
- Shared shell/tab-bar unchanged; Camera page consumes the tab bar like sibling top-level screens.

## Approach

- `features/camera/camera-page.{ts,html,scss,spec.ts}`: dark viewport (`data-testid="camera-page"`)
  + controls (Close `camera-close`, Shutter `camera-shutter`, Flip `camera-flip` hypothesis,
  aria-labelled). Close → `router.navigate(['/chats'])`; shutter/flip control-only this feature.
- `onTabSelect` mirrors chats-page: `chats`→/chats, `calls`→/calls, `status`→/status,
  `settings` = local stub (existing convention), `camera` = no-op (already there).
- Captured geometry/colors/glyphs from the node inventory once available (research.md), same
  measurement pipeline as 007-011.

## Phases

1. **Capture** (deferred ~09-28): node inventory `0:9155`; golden `0-9155-camera.png`; control
   glyph SVGs. Fill research.md "Node inventory".
2. **Screen** (pre-capture structure): `/camera` route + viewport + hypothesis controls + units.
3. **Tab wiring**: chats/calls/status camera branch + unit updates + e2e.
4. **US3**: tab routing/Close + responsive no-overflow + golden `0-9155-camera.png` (measure
   baseline, `maxDiffPixelRatio = measured + 0.05`).
5. **Closure**: design-map row 12 -> `012` + implemented; spec/tasks statuses; session report;
   commit `feat(camera): implement WhatsApp Camera screen (feature 012)`.

## Review gates

- **G1**: node inventory recorded + owner approval of Clarifications (topology/control set).
- **G2**: build + unit + e2e (incl. golden) green; baseline recorded; drift register updated.
- **G3**: closure commit + traceability (design-map/spec/tasks).

## Drift policy

Top-level screen matches sibling screen conventions (shell + tab bar). Tab-bar visibility on
Camera and the control set are provisional and become explicit drift candidates at G1. Existing
"Camera — coming soon" stub behavior in chats/calls/status is replaced by navigation — a
deliberate, spec'd change (not silent drift).