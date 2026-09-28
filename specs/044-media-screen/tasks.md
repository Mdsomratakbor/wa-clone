# Tasks: Media, Photos and Links (feature 044)

**Input**: `specs/044-media-screen/plan.md`, `specs/044-media-screen/spec.md`,
`specs/044-media-screen/research.md`

- **Gates**: G1 = capture BLOCKED (Figma `429`, reset 2026-10-02 18:38 UTC). Entry row verified
  (`0:9486`); grid geometry, tile treatment and empty copy PROVISIONAL. G2 = build + unit green,
  e2e authored not run. G3 = closure + drift note in 015.
- **Tests**: `npx ng test --watch=false --reporters=progress` green before each commit; output goes
  to `logs/` (gitignored). Playwright specs are authored but **not executed** (paused by owner
  directive 2026-09-26).
- **Baseline**: 456/456 entering this feature.

## Implementation

- [ ] T001 - `spec.md` + `research.md` + `plan.md` + `tasks.md` + `contracts/ui-contracts.md`;
      scope recorded from the owner's two answers (B7 only; derive from thread files)
- [ ] T002 - `media-page.ts`: route param, `media` computed (filter + `toReversed` + map),
      `MediaTile` local interface, `Back` to `/contact/:id` (FR-002, FR-005, FR-007, FR-008, FR-011)
- [ ] T003 - `media-page.html` + `.scss`: nav bar titled with the contact's live name, `role="status"`
      empty state, `ul` grid of keyboard-reachable tiles with an inline file glyph (FR-003, FR-004,
      FR-006, FR-008, FR-010)
- [ ] T004 - `app.routes.ts`: `/contact/:id/media`; `contact-page.ts`: one branch in
      `onRowActivate`, `contact-groups` still inert (FR-001)
- [ ] T005 - `media-page.spec.ts`: title, tile count and names, empty state, unknown id, Back,
      tile activation does not navigate, tile order newest-first, thread not mutated, no overflow
      (FR-001 … FR-011)
- [ ] T006 - `contact-page.spec.ts`: the `contact-media` row navigates; `contact-groups` is still a
      no-op (FR-001, and the B8 non-goal)
- [ ] T007 - `tests/e2e/media.spec.ts` authored, not run
- [ ] T008 - Drift note in 015; design-map row 15; gap audit B7/B8; closure

## Capture - BLOCKED (Figma 429, reset 2026-10-02 18:38 UTC)

- [ ] T009 - Confirm from a capture whether a media grid screen exists in the file at all, and record
      its node id (or record that there is none) in `research.md`
- [ ] T010 - Reconcile the grid geometry, tile treatment, empty-state copy and the omitted
      `Media / Docs / Links` filter chips; replace the hypotheses in `spec.md` if the design differs
- [ ] T011 - Golden for the populated and empty media screens (blocked twice over: capture +
      Playwright pause)

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per owner directive
```

## Notes

- `[ ]` T009–T011 are capture-gated and stay open until the quota resets.
- No store, model or seed change. `conversationMessages()` already returns `readonly Message[]` with
  the `?? []` fallback FR-011 needs, so a `mediaFor()` store method would be a pure pass-through of a
  derived view that nothing persists.
- The tile no-op (FR-006) is the honesty risk in this feature: it looks interactive and does nothing
  because this design has no media viewer. It is spec'd, not hidden, and asserted by a test.
- Only `chat-006` (Martha Craig) has a thread, so the empty state is the default shipped state.
