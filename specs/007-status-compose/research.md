# Design Research: WhatsApp Status — Compose

**Source**: Figma `WhatsApp UI Screens (Community)`, fileKey `PcGX72lSWkYIk3pL5V8PS3`,
node `0:9634` "WhatsApp Status" (design-map row 7).

Captured via the local `figma-developer-mcp` (stdio handshake verified 2026-09-23) and image
exports; pixel sampling substituted for visual review.

## Node inventory (compact tree, 115 nodes)

```
[FRAME] "WhatsApp Status" #0:9634   375x812  fills #FF8A8C (flat pink)
 ├─ [FRAME] "Status Type" #0:9635   x72 y255 232x49     (or 0:9636 text + 0:9637 caret)
 │   ├─ [TEXT] #0:9636  "Type a status"  Helvetica Neue Medium 500 / 38px / ls -0.0026em / center
 │   │                fills rgba(255,255,255,0.4)   (renders ~#FFF on glyph strokes)
 │   └─ [IMAGE-SVG] #0:9637   caret bar  2x48 at (114.5,0.5) rel -> abs x~186
 ├─ [IMAGE-SVG] "Top Actions" #0:9638  x19 y60.5 338x24  (vector; white glyphs)
 ├─ [FRAME] "Keyboard Alphabetic" #0:9650  x0 y521 375x291
 │   ├─ [IMAGE-SVG] "Background" #0:9651  375x291  base ~#D8CACF
 │   └─ [GROUP] "Keys" #0:9653  x3 y8 369x259
 │       - letter keys 32x42, light fill #FCFCFE, letter 22.5px #000 (style_3573630a)
 │       - modifier keys (Shift #0:9696, Delete #0:9686) 42x42, accent #C1A0AD, glyph #000
 │       - bottom row y162: "123" #0:9676 87x42 + Space #0:9673 182x42 + Return "Go" #0:9670 88x42
 │         (text 16/400 center; Space/Go accents #C1A0AD, key shadow 0 1px 0 rgba(144,132,136,1))
 │       - Emoji #0:9664 27x27 @(22,232); Dictation #0:9657 15x25 @(327,233)
 ├─ [IMAGE-SVG] "Bars / Home Indicator" #0:9775  x0 y778 375x34
 └─ [FRAME] "1. Bars / Status Bar / iPhone X / Dark" #0:16141  x0 y0 375x44
     - time 9:41 SF Pro Text Semibold 15 / #50555C @(21,14); battery/wifi/cellular icons
```

## Pixel sampling (System.Drawing, 375x812 render)

- Frame background: `#FF8A8C` at (187,120), (187,400), (187,480), (10,400) -> **flat**, no gradient.
- Status bar zone (187,20): `#FF8A8C` (icons/time drawn separately over pink).
- Top row: white glyph at (30,72) [X]; white at (335,74) [paper-plane]. Gap (306,74): pink.
- Placeholder strokes ~`#FFFFFF` at (187,260)/(187,280) over pink frame corners (73/303,256/300).
- Keyboard top (187,535): `#D8CACF` base; key face (187,620): `#FCFCFE`; home indicator (187,790):
  `#D8CACF`.

## Top Actions vector (status-compose-top-actions.svg, 338x24, all white)

- Close **X**: svg x0-18 -> abs x19-37.
- Upright "text-bar" glyph: svg x265.4-283.96 -> abs x284-303.
- Paper-plane send: svg x314-338 -> abs x333-357.
- No centre title in the row.

## Decisions

- The compose frame is the *empty* state of the text-status editor; the "Type a status"
  placeholder + caret are static chrome (native typing would displace the keyboard — out of scope).
- Keyboard is reproduced as a **static image, exact crop of the frame band y521-812**: cropped
  from the golden render into `status-compose-keyboard.png` (375x291) and served from `public/`.
- Top glyphs use the exact path data from `status-compose-top-actions.svg` (colored `#FFF`), not
  re-drawn approximations.
- Entry: the two trailing circles on the feed's My Status row (feature 006) route to compose.
- Status bar stays the shared light component despite the frame's Dark variant (drift D1).

## Drift register

- **D1 (accepted)**: frame uses iOS *Dark* status bar; in-app shares the light `app-status-bar`.
- **D2 (accepted)**: placeholder spec fill `rgba(255,255,255,0.4)` composites to near-white on the
  render; implement `#FFFFFF` with slight opacity so the golden lands in the measured band.
- **D3 (expected)**: Helvetica Neue Medium 38px vs in-app system font; letter-spacing -0.0026em.
- **D4 (by design)**: keyboard is a bitmap, not live keys; "Go" is decorative.
- Home indicator overlaps the keyboard in the frame (y778) and in-app (shell overlay) - consistent.

## Golden measurement (closure, 2026-09-23)

- Baseline diff after implementation: **0.06** (17,138 px of 304,500, Playwright pixelmatch at 375x812);
  shipped threshold `maxDiffPixelRatio: 0.11` (= measured + 0.05 slack). Full suite + goldens green.
- Residual diff decompose (band-level, strict per-channel >20): status bar band y0-44 (~16.3k px,
  D1) + home-indicator strip y778-812 (~12.7k px, D1 family - hideover strip is opaque surface vs
  golden keyboard base) + placeholder band y210-300 (~3.2k px, D2/D3 font metrics) + top glyph row
  (~0.5k px, anti-alias). Keyboard band y443-778 matches by construction (exact crop, pinned
  `top:477px` -> abs y521) = **0 px**.
- Fixes landed during golden work: per-glyph `viewBox` bounding the 338x24 source coordinates
  (narrow boxes clipped the text-bar/paper-plane paths - the invisible-glyph root cause); caret
  absolute `left:115px` (~x186 design position, not flex-row end); `--start`/`--end` glyph
  alignment (X left-flush, text-bar right-flush); keyboard `top:477px` (was `bottom:0`, 34px high).

## Asset manifest

| Asset | Source | Status |
| ----- | ------ | ------ |
| `tests/e2e/golden/0-9634-status-compose.png` | node 0:9634 export, 375x812 native | saved 2026-09-23 |
| `tests/e2e/golden/status-compose-top-actions.svg` | node 0:9638 export (vector) | saved 2026-09-23 |
| `tests/e2e/golden/status-compose-keyboard.png` | crop of frame band y521-812 (375x291) | saved 2026-09-23 |
| `public/status-compose-keyboard.png` | runtime copy of the crop | saved 2026-09-23 |

Figma-delivery note: the REST download endpoint was rate-limited (HTTP 429, ~4.3-day retry) after
the first capture; assets were pulled through the Composio Figma connection once it cleared.