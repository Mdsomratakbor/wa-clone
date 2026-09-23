# Research — Feature 002: WhatsApp Chat Window

Phase 0 output. Resolves every technical unknown from the Technical Context.

## Decision 1 — Wallpaper background

**Approved (Clarification 1, 2026-09-23):** the wallpaper is a Figma image fill (`imageRef 351acdb5ea7901e17f7cb0d61068f0f1d8f1f95d`, node `0:8258`, 375×724). It cannot be embedded (no render/export scope). The thread area behind the bubbles renders the neutral approximation **solid `#EFEFF4`** (frame-bg tone), with the header/composer remaining `#F6F6F6`. Recorded approved drift.

**Alternatives rejected**: (b) CSS pattern — unnecessary complexity for an approximation; (c) render export — requires API scope/credentials not available.

## Decision 2 — Header avatar

**Approved (Clarification 2, 2026-09-23):** `Martha Craig`'s avatar is a Figma image fill (`imageRef fe10b423a179f6612bd6b395294a31af333e0bb6`, node `0:8449`, 36px) and is not embeddable. Reuse `UserAvatar` with `name="Martha Craig"` → initials `MC` fallback (36px). Consistent with feature 001; no new asset pipeline. Recorded approved drift.

## Decision 3 — Typography from text-node bounds

**Decision**: The simplified Figma JSON omits `style`/`fontSize` entirely (verified: no `fontSize`/`fontFamily` keys present). Type sizes are derived from text-node `bounds.height` using the feature-001 method and verified against the golden render, not claimed as exact:

| Element | bounds height | derived size |
| ------- | ------------- | ------------ |
| Message text (bubbles) | 19px | 16px/400 |
| Bubble timestamp / file info row | 13px | 11px/400 |
| Header name `Martha Craig` | 19px | 16px/600 |
| Subtitle `tap here for contact info` | 16px | 14px/400 `#8E8E93` |
| Date chip `Fri, Jul 26` | 14px | 12px/500 `#3C3C43` |
| File filename `IMG_0481` | 19px | 16px/500 `rgba(0,0,0,0.70)` |

**Rationale**: consistent with feature 001; bounds are the only authoritative metric available.

## Decision 4 — Bubble geometry (content-driven)

**Decision**: Bubble height/width are content-driven, not hardcoded per node: left/right padding ≈ 8/9px, top pad 5px, text line ≈ 19px, timestamp 11px at bottom-right. Single-line bubbles = 34px; two-line text = 50px with the timestamp dropped to its own bottom row. Width caps as in Figma (max ~262px / ~80% of thread).

**Rationale**: the design itself is inconsistent (incoming `0:8405` `Do you know what time is it?` is 34→50px tall but single-line; most single-line bubbles are 34px). Content-driven rendering reproduces both variants from one formula and avoids hardcoding 13 rows. Recorded drift in spec Behaviour 2.

## Decision 5 — File-card bubbles

**Decision**: File messages render a rounded `File` rect (`rgba(118,118,128,0.12)`) inset 3px, a document icon (inline SVG — no embedded raster), filename `16px/500 rgba(0,0,0,0.70)`, and a bottom info row `size · ext` with a round `rgba(0,0,0,0.20)` separator, on the bubble fill (`#DCF7C5`). Time + read ticks share the bottom row, right-aligned.

**Rationale**: all file content (names, sizes, ext) is plain Figma text with no image dependencies except the reusable document icon, drawn as SVG. Matches nodes `0:8301`, `0:8327`, `0:8353`, `0:8379`.

## Dependency audit note

- No new runtime or dev dependencies required. Playwright, `pngjs`, Material, and the SCSS token pipeline from feature 001 are reused.
- Golden PNG for `0:8257` is produced from the Figma render (same pipeline as `0:8855`).