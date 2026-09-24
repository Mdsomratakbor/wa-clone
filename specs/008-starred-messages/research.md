# Design Research: WhatsApp Starred Messages

**Source**: Figma `WhatsApp UI Screens (Community)`, fileKey `PcGX72lSWkYIk3pL5V8PS3`,
node `0:8820` "WhatsApp Starred Messages" (design-map row 8).

Captured `2026-09-23` via the local Figma MCP node fetch (metadata + geometry) and the Composio
Figma connection. The REST download endpoint is rate-limited again (HTTP 429, retry after ~382871s
≈ **4.4 days**, roughly `2026-09-28T~05:00Z`) — the golden render, avatar raster and chevron SVG are
therefore **deferred** (see Asset manifest). Pixel sampling is pending the golden capture; all
geometry below is derived from node payloads (exact).

## Node inventory (from frame `0:8820`, 375x812)

```
[FRAME] "WhatsApp Starred Messages" #0:8820    375x812  fills #EFEFF4 (flat)
 ├─ [FRAME] "Navigation Bar" #0:8821    (0,0) 375x88  bg #F6F6F6 (rect #0:8822) + hairline
 │  │  shadow "0 0.33px rgba(166,166,170,1)"
 │  ├─ [FRAME] "Back" #0:8823    x9 y54 81x22
 │  │   ├─ [IMAGE-SVG] "Shape" #0:8825   chevron 11.84x21 @ rel(0,1) -> abs (9,55)  #007AFF
 │  │   └─ [TEXT] #0:8824  "Settings" @ rel(17,0) -> abs (26,54) 64x22
 │  │        SF Pro Text Regular 400 17px ls -0.0235em #007AFF (LEFT)
 │  └─ [TEXT] #0:8826  "Starred Messages" @ x114 y54 146x22
 │        SF Pro Text Semibold 600 17px ls -0.0235em #000000 (CENTER)
 ├─ [FRAME] "Bars / Status Bar / iPhone X" #0:8827  375x44  LIGHT variant (over nav bar)
 │   - time "9:41" #0:8847  SF Pro Text Semibold 15px #171717 @ (21,14) 54x18
 │   - Battery #0:8829 (25x11 @336,18), Wifi #0:8838 (15.3x11 @315.7,17.3), Signal #0:8842 (17x10.7 @293.7,17.7)
 ├─ [IMAGE-SVG] "Bars / Home Indicator" #0:8848  (0,778) 375x34
 └─ [FRAME] "Tip" #0:8851    x24 y336 327x230
     ├─ [IMAGE-SVG] "Oval" #0:8852  132x132 @ rel(98,0) -> abs (122,336)
     │    IMAGE fill (WhatsApp-logo avatar) + strokes #636366 0.5px
     │    + boxShadow "0 2px 4px rgba(0,0,0,0.2)"
     ├─ [TEXT] #0:8854  "No Starred Messages" @ rel(82,157) -> abs (106,493) 163x21
     │     SF Pro Text Semibold 600 16px ls -0.0188em #57575C (rgba(60,60,67,0.6))
     └─ [TEXT] #0:8853  "Tap and hold on any message to star it, so you can easily find it later."
           @ rel(0,188) -> abs (24,524) 327x42 (2 lines x 21px)
           SF Pro Text Regular 400 14px ls -0.0112em #57575C (rgba(60,60,67,0.6)) CENTER, line 21px
```

## Abs geometry summary (content-only, status bar y0-44 shared)

- Nav bar occupies the top of the content area (frame y44-132): `#F6F6F6` + hairline. Back action
  glyphs at abs y54-ish; title centered "Starred Messages" (x114-260, 146px wide).
- Tip: outer frame x24 y336 327x230; avatar circle center (188, 402) r66; title y493; body y524
  (two 21px lines, wraps within 327px).
- Home indicator y778-812 (standard shell overlay).

## Decisions

- The frame contains **only the empty state** — no populated starred list, no rows, no cell frames.
  Feature 008 implements the empty-state screen (a later feature would model starred conversations).
- Nav bar is the shared `app-navigation-bar`; leading Back is a chevron + "Settings" label, i.e. a
  new `back` icon affordance (the shared component currently only has `new-call`) and a real
  navigation target.
- Status bar is the **Light** variant (#171717 time) — consistent with the shared in-app
  `app-status-bar`, **no drift expected** (unlike 007's Dark frame).
- Tip avatar is an IMAGE fill (WhatsApp-logo circle): reproduce as a cached raster
  (`public/starred-messages-avatar.png`) like `status-compose-keyboard.png`; `app-user-avatar`
  fallback (initials) if capture is impossible.
- Back chevron glyph uses exact vector path from the captured SVG (deferred).
- Golden = full-frame render `0-8820-starred-messages.png` at 375x812 (native, scale 1).

## Drift register

- **D1 (accepted, none-expected)**: frame status bar is Light => matches in-app shared bar. Verify
  via golden; recorded here only to note the contrast with 007 (Dark).
- **D2 (expected)**: SF Pro Text (16/17px semibold, 14px regular) vs in-app system font metrics;
  letter-spacing preserved.
- **D3 (expected)**: hairline `0.33px` shadow and avatar `0.5px` stroke render thin/AA in-app;
  absorbed by threshold.
- **D4 (by design)**: tip avatar is a static raster (WhatsApp logo), not a live element.

## Asset manifest

| Asset | Source | Status |
| ----- | ------ | ------ |
| `tests/e2e/golden/0-8820-starred-messages.png` | node `0:8820` export, 375x812 native | **pending — Figma 429 (~09-27)** |
| `tests/e2e/golden/starred-messages-back-chevron.svg` | node `0:8825` export (vector) | **pending — Figma 429 (~09-27)** |
| `tests/e2e/golden/starred-messages-avatar.png` | node `0:8852` export (raster) | **pending — Figma 429 (~09-27)** |
| `public/starred-messages-avatar.png` | runtime copy of avatar raster | pending capture |

Figma-delivery note: the REST download endpoint (`figma_download_figma_images`) and the user token
both returned HTTP 429 on `2026-09-23` (retry-after ~382871s ≈ 4.4 days). Same as the 007 cycle,
use whichever of the MCP / Composio `FIGMA_DOWNLOAD_FIGMA_IMAGES` endpoints clears first; retry on
and after `2026-09-28`.