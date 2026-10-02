# Feature Specification: WhatsApp Photo Status Preview (feature 052)

**Feature Branch**: `052-status-photo-preview`

**Created**: 2026-10-02

**Status**: ✅ Implemented (2026-10-02) — provisional presentation approved by the owner
(2026-10-02), G2 green (**702/702**); G1 capture still **BLOCKED** until 2026-10-02 18:38 UTC, so the
block's size is PROVISIONAL and carries a post-capture reconcile task.

**Input**: design row 6 (`0:8498`, Status feed). No node in the file shows a published photo.

## Clarifications

### Session 2026-10-02

The owner reported the published photo status preview is not informative and approved a change.

- Q: After publishing a photo status, the feed renders the photo as a thin 43px crop strip across
  the feed band, and the subtitle reads `A photo` (F-050 FR-008 PROVISIONAL). The owner called the
  strip uninformative.
  A (**owner**): **a real photo preview block** — show the actual photo in a proper rounded block
  (full feed width, capped height, cover-fit) instead of the strip. The subtitle stays `A photo`.

## Summary

F-050 drew the published photo through a 43px band so the feed's *text* layout was reused, which
turns a photo into a colour smear nobody can read. F-052 separates the photo presentation from the
text band: the photo gets a real preview block — full feed width inside the row's gutters, rounded
corners, `object-fit: cover`, capped height — so the published photo is actually visible. The text
status and the empty-state tip are untouched, and the obsolete band styles are removed rather than
left as dead CSS.

## Functional Requirements

- **FR-001** A published photo status renders as a preview block: rounded corners, `object-fit:
  cover`, spanning the feed's content width (the row's 16px gutters) with a capped height — not the
  43px crop strip. The subtitle stays `A photo`.
- **FR-002** The block retains the feed region's semantics: `role="status"` and
  `data-testid="status-mine"`; the image keeps `data-testid="status-mine-photo"`, `alt="Status
  photo"` and the persisted data URL as `src`.
- **FR-003** Text status and the no-status tip render exactly as before (F-049/F-050). The
  `.status-page__mine--photo` band modifier and its strip styles are deleted — dead CSS is not kept.
- **FR-004** No model, store, route, subtitle or alt change. Nothing re-reads the wall clock.
- **FR-005** PROVISIONAL values are recorded literally for the post-capture reconcile: radius 8px
  (the composer preview's radius), gutter 16px (the row's padding), max-height 280px.

## Non-Goals

- **Full-screen photo viewer, swipe navigation, play affordance, caption over photo, zoom, delete or
  edit from the feed** — none are built; the block is a static status region (it already is not
  interactive).
- **No change** to compose page photo mode, the store, the models, routes, or tokens file.
- **No new dependency.**

## Review Gates

- **G1 (BLOCKED - Figma)**: `429` (quota reset 2026-10-02 18:38 UTC). The feed chrome (`0:8498`)
  the block sits on is design-verified; **PROVISIONAL**: a published photo — its block size, radius,
  height cap — exists in no Figma node.
- **G2**: `npm run build` green and the full unit suite green with the exact count reported.
- **G3**: closure commit, drift note in the F-050 spec (feed photo presentation changed), design-map
  row 6, checklist + converge clean.

## Figma Reference

- Design row 6, Status feed (`0:8498`) — the feed, the row and the gutters the block uses.
- **No node shows a published photo.** The block's geometry is recorded under FR-005 for the capture
  reconcile; no node ID is invented.

## UNKNOWN / NEEDS CLARIFICATION

- Block height cap. **Hypothesis (approved provisional)** — 280px max-height with `object-fit:
  cover`, so a portrait photo keeps most of its composition visible while a panorama does not run
  the screen. Radius 8px matches the composer's preview; gutters match the row's 16px.

## Assumptions

- A static, non-interactive preview block is honest: there is no viewer to promise, so the block
  does not look or act like one.
- The subtitle `A photo` is unchanged by this feature; the owner asked for the *preview* to be
  informative, not the label.

## Out of Scope Changes

- `status-page.html` changes only inside the feed body's photo branch. Text status, tip, row,
  navigation and tab bar are untouched.
- `status-page.scss`: the shared `__tip`/`__mine` band rule stays for text and tip; the photo branch
  uses its own block styles. Removed: `__mine--photo` modifier and the strip `__mine-photo` rule.
- `_tokens.scss`, store, models, routes, other features: untouched.

## Implemented (2026-10-02) — recorded, not design-verified

- Block geometry (FR-005): `margin: 35px 16px 0`, `border-radius: 8px`, `overflow: hidden`,
  `max-height: 280px`, `object-fit: cover`, full width. Values are literal targets for the reconcile
  task.
- The `status-mine` data-testid and `role="status"` remain on the block so existing photo assertions
  stay meaningful (a user "sees" a photo there).
- F-050 FR-008's "43px band" presentation is superseded; the F-050 spec and the gap audit get a
  drift note.

## Validation Targets

### Unit

- `StatusPage`: a published photo renders inside a block whose computed style is `border-radius`
  8px with a capped height and full feed width; the `data-testid`/`role`/`src`/`alt` contract holds;
  the band modifier `.status-page__mine--photo` no longer exists in the DOM; text status and the tip
  render unchanged.

### E2E (authored, not run)

- `tests/e2e/status.spec.ts` — after publishing a photo, the feed shows the preview block rather
  than the text band.

## Definition of Done

- [x] Every FR is covered by at least one named unit test
- [x] A published photo renders as a real preview block, not the strip (FR-001)
- [x] Semantics, testids, src/alt and role are preserved (FR-002)
- [x] Text status and tip unchanged; band styles deleted (FR-003)
- [x] No store/model/route/token change; no wall-clock read (FR-004)
- [x] PROVISIONAL geometry recorded for the reconcile (FR-005)
- [x] Drift note added to the F-050 spec and design-map row 6
- [x] `npm run build` green; full unit suite green with the exact count reported
- [x] Playwright specs authored; execution deferred per the owner directive (2026-09-26)