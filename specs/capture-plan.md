# Capture Plan — Future Work 1 (rows 8-21)

**Status**: PREPARED, WAITING on Figma quota reset (~2026-09-28 02:00 UTC).

The Figma starter plan hard-limits the REST API (HTTP 429, retry ≈38h). The two successful
fetches on 2026-09-26 were quota-window residue; `/v1/files` and `/v1/images` are both blocked
until the reset. Everything below is automated so the reset run is one command.

## What remains (the gap)

1. **Golden PNGs** for 14 screens (rows 8-21) — none exist in `tests/e2e/golden` yet.
2. **Node geometry** (labels, rows, counts, keypad, toggles, dimensions) — dependency for
   aligning the structural (hypothesis) implementations to exact Figma content.
3. **Glyph SVGs** — action-sheet icons, keypad backspace, settings chevrons, brand glyphs.

## Runbook (at reset)

```powershell
node scripts/capture-figma.mjs                 # 1. data -> specs/<n>/capture/*.json + *.txt inventory
```

Then export goldens via the Figma download tool — the exact batch:
```powershell
node scripts/capture-figma.mjs --manifest
```
(14 nodes, pngScale 1, localPath `tests/e2e/golden`, filenames per manifest.)

Then:

1. **Align** the 14 structural screens to `capture/*.txt` inventories (labels/rows/counts/
   titles) — update seeds + templates + aria-labels.
2. **Glyphs**: download named SVG nodes (icons) per inventory into the glyph directories used
   by components.
3. **Goldens**: unskip the 14 gated golden e2e tests, run them with a tight
   `maxDiffPixelRatio`, record measured baseline, ship `measured + 0.05` (feature 007 practice).
4. **Design-map**: update rows 8-21 (drop "deferred to capture" notes), spec sets: mark T001-T00n
   done, close gates.
5. Commit per-feature as `feat(chore)/docs(0nn)` or grouped `chore(021-capture)`.

## Retry etiquette

- Script aborts per-node on 429 and prints `Retry after N`; re-run later, it skips nothing
  (idempotent overwrite).
- Do not hammer the API: one batch per reset window, then let it settle before `--manifest`
  downloads (image endpoint quota is separate but tighter).