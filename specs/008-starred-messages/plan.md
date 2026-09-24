# Plan: WhatsApp Starred Messages (feature 008)

**Input**: `specs/008-starred-messages/{spec,research}.md`

**Gate**: Owner approval of spec Clarifications 1-5 (write-first tests + goldens come after).

## Scope (small — one screen, empty state)

New `StarredPage` (lazy) + minimal `/settings` stub + a `back` icon affordance on the shared
`app-navigation-bar`. No new model; no seeded data; no tab/FAB. Geometry is fully known from node
payloads; only 3 rasters are deferred to the Figma rate-limit retry.

## External dependency: Figma 429 (blocks only asset capture)

- `figma_download_figma_images` (local MCP) and the user's Figma token both return 429
  (retry-after ~382871s ≈ **4.4 days**, i.e. ~2026-09-28). Affected assets:
  - golden `tests/e2e/golden/0-8820-starred-messages.png` (375x812, scale 1)
  - `starred-messages-back-chevron.svg` (node 0:8825)
  - `starred-messages-avatar.png` (node 0:8852 raster)
- Strategy (proven in 007): retry MCP + Composio `FIGMA_DOWNLOAD_FIGMA_IMAGES` on and after the
  retry date; whichever clears first wins. Everything else proceeds immediately from node geometry.

## Approach

Represent the chrome with existing components:
- Shared shell + `app-navigation-bar`. Extend `NavAction.icon` with `'back'` and render the chevron
  SVG in the nav bar (path from the captured SVG; until capture, land the component with a
  temporary path and swap in the exact vector — or gate the glyph commit on capture).
- Tip block: page-local markup + styles; avatar via `app-user-avatar` (src from
  `public/starred-messages-avatar.png`) or a plain `<img>` with the same crop.
- `/settings` stub: tiny lazy page (nav bar "Settings" + body placeholder) so Back has a target.

## Phases

1. **Assets** (deferred to ~09-28): golden, chevron SVG, avatar raster; crop avatar -> `public/`.
2. **Route + chrome**: `/starred-messages` lazy route; `StarredPage` with `app-navigation-bar`
   (title "Starred Messages", leading back id `back` label "Settings", icon `back`); Back ->
   `/settings`.
3. **Settings stub**: `/settings` lazy route; stub page with nav bar "Settings" and a back to
   `/starred-messages`.
4. **Tip (US2)**: avatar circle + header + helper copy, exact geometry (see research.md).
5. **US3**: a11y labels + focus ring; responsive no-overflow append; golden
   `0-8820-starred-messages.png` — measure baseline, set `maxDiffPixelRatio = measured + 0.05`.
6. **Closure**: design-map row 8 -> `008` + implemented; spec/tasks statuses; session report;
   commit `feat(starred-messages): implement WhatsApp Starred Messages empty state (feature 008)`.

## Review gates

- **G1**: Owner approval of Clerifications 1-5 (spec.md). No implementation before G1.
- **G2**: build + unit + e2e (incl. golden) green; baseline recorded; drift accepted per register.
- **G3**: closure commit + traceability updates (design-map/spec/tasks).

## Drift policy

Reuse the shared shell and nav bar *without* modifying shared surfaces. Golden threshold absorbs
D2/D3 (font metrics, hairline/AA). No new recorded drifts expected beyond the register in
research.md; any new drift is owner-flagged before the golden threshold is locked.