# Plan: WhatsApp Chat Actions Modal (feature 010)

**Input**: `specs/010-chat-actions-modal/{spec,research}.md`

**Gate**: Figma 429 clears (~2026-09-28) → node payload capture (`0:10087`) → owner approval of
spec Clarifications (entry affordance + row content) → write-first tests → implementation.
Structural implementation may start pre-capture only with owner approval (precedent: 009).

## External dependency: Figma 429 (hard blocker for visual facts)

- Node GET **and** downloads are 429 until ~2026-09-28 (re-confirmed 2026-09-24, retry-after
  ≈ 345k s). The `0:10087` payload (rows, entry glyph, geometry, colors) is unknowable until then.
- Unlike 009, the shared `action-sheet` component **already exists and is green**; 010 is a lean
  slice: entry affordance + row seed + wiring + US3. What stays unknowable pre-capture is exactly
  the row set and the entry glyph (both hypothesis-mocked until G1).
- Strategy (proven 007/008/009): retry MCP then Composio on/after the retry date; whichever clears
  first wins; download golden + glyphs into `tests/e2e/golden`.

## Scope

- Shared `action-sheet`: **reused unchanged** (from 009) — no contract churn; verify against
  `0:9075` at capture.
- Chat Window entry: header More-options affordance (hypothesis; exact glyph/label pending the
  payload) opening the sheet; rows data-driven; selection emits/calls back (row targets are later
  features).
- Shared shell unchanged; modal overlays the routed chat page inside `app-shell` content.

## Approach

- `features/chat-window/chat-actions.{seed.ts,modal.ts,modal.html,modal.scss,modal.spec.ts}` (or a
  sibling `features/chat-actions-modal/`) wraps `app-action-sheet` with the `0:10087` rows
  (provisional hypothesis seed; ids stable).
- Add a trailing icon button to `chat-header` emitting an `actions` output (shared component
  change — flagged in the swap list; a11y label + `data-testid`).
- Open/dismiss/focus-return mirrors 009 (`ChatsPage`-style signal host in `ChatWindowPage`).
- Geometry/typography/colors: from the node inventory once captured, same measurement pipeline as
  007/008/009.

## Phases

1. **Capture** (deferred ~09-28): node inventory `0:10087`; verify `0:9075` reuse; golden
   `0-10087-chat-actions.png`; glyph SVGs (rows + entry). Fill research.md "Node inventory".
2. **Contracts/confirm** (G1): entry affordance + row content approved; seed finalized.
3. **Entry + wiring**: header affordance → open sheet; dismiss/focus-return; row id emission.
4. **US3**: a11y + focus + responsive (no-overflow at 3 breakpoints) + golden
   `0-10087-chat-actions.png` (measure baseline, `maxDiffPixelRatio = measured + 0.05`).
5. **Closure**: design-map row 10 -> `010` + implemented; spec/tasks statuses; session report;
   commit `feat(chat-actions-modal): implement WhatsApp Chat Actions Modal (feature 010)`.

## Review gates

- **G1**: node inventory recorded + owner approval of Clarifications (entry affordance, row
  content). No exact visual facts claimed before G1.
- **G2**: build + unit + e2e (incl. golden) green; baseline recorded; drift register updated.
- **G3**: closure commit + traceability (design-map/spec/tasks).

## Drift policy

Reuse the shared `action-sheet` exactly as shipped; any visual deviation required by the `0:10087`
payload goes through the drift register with owner approval. The header affordance is a shared
component edit — keep it additive and a11y-clean (icon + label, no layout reflow of existing
elements).