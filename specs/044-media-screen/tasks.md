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

- [x] T001 - `spec.md` + `research.md` + `plan.md` + `tasks.md` + `contracts/ui-contracts.md`;
      scope recorded from the owner's two answers (B7 only; derive from thread files)
- [x] T002 - `media-page.ts`: route param, `media` computed (filter + reverse a copy + map),
      `MediaTile` local interface, `Back` to `/contact/:id` (FR-002, FR-005, FR-007, FR-008, FR-011)
- [x] T003 - `media-page.html` + `.scss`: nav bar titled with the contact's live name, `role="status"`
      empty state, `ul` grid of keyboard-reachable tiles with an inline file glyph (FR-003, FR-004,
      FR-006, FR-008, FR-010)
- [x] T004 - `app.routes.ts`: `/contact/:id/media`; `contact-page.ts`: one branch in
      `onRowActivate`, `contact-groups` still inert (FR-001)
- [x] T005 - `media-page.spec.ts`: title, tile count and names, empty state, unknown id, Back,
      tile activation does not navigate, tile order newest-first, thread not mutated, no overflow
      (FR-001 … FR-011)
- [x] T006 - `contact-page.spec.ts`: the `contact-media` row navigates; `contact-groups` is still a
      no-op (FR-001, and the B8 non-goal)
- [x] T007 - `tests/e2e/media.spec.ts` authored, not run
- [x] T008 - Drift note in 015; design-map row 15; gap audit B7/B8; closure

### Implementation deviation from the task text (deliberate)

T002 originally read "filter + `toReversed` + map". `toReversed()` does not compile — the project
does not target `lib` es2023 — and bumping `tsconfig` for one call site is not this feature's change
to make. Shipped as `[...messages].filter(...).reverse()`. Recorded in `plan.md` and in the `feat`
commit body; the reason for the spread is that `conversationMessages()` hands back the store's own
array, so reversing in place would render the chat window's thread backwards.

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

## FR → test traceability

Unit suite: **469/469** (456 baseline + 12 `media-page.spec.ts` + 1 from splitting the old combined
`contact-page.spec.ts` test). Build green. All names in `MediaPage` unless stated.

| FR | Test |
|----|------|
| FR-001 | `contact-page.spec.ts` → 'the Media row routes to /contact/:id/media (feature 044)' |
| FR-002 | 'renders one tile per file message, newest first', 'excludes messages with no file' |
| FR-003 | 'a tile is labelled with its filename and size' |
| FR-004 | 'shows the empty state for a contact with no thread' |
| FR-005 | 'the thread is not reordered in the store' + the newest-first test |
| FR-006 | 'a tile is keyboard reachable', 'activating a tile does not navigate, by mouse or keyboard' |
| FR-007 | 'Back returns to the contact' |
| FR-008 | 'the nav title is the contact name', 'the title follows a rename' |
| FR-009 | 'the grid is three columns and does not overflow' (read-only: no other control is asserted to exist) |
| FR-010 | 'the grid is three columns and does not overflow' |
| FR-011 | 'shows the empty state for an unknown contact id rather than throwing' |
| B8 non-goal | `contact-page.spec.ts` → 'the Groups row stays a no-op (B8 is not built)' |

## Analysis pass (the `/speckit.analyze` gate, run at closure)

One contradiction found between spec and shipped code, and it was **not** fixed silently:

- FR-007 claimed the screen is reachable only from a direct contact, but `ContactPage.isGroup()` is
  `kind === 'group'`, so a broadcast also renders the row list. Raised as a clarify question
  (2026-09-28); **owner chose to narrow FR-007, no code change** — `createBroadcast()` has no UI
  caller and no seed, so no broadcast can exist in the running app, and enforcing the invariant in
  code would be an unrelated behaviour change to F-015/F-042. Recorded in `spec.md` Clarifications.
- Also corrected: the Unit validation target listed the derived list under `ChatStore`, which
  contradicts FR-005 and the "no store change" scope. The derivation is in the page, so the
  assertions are page tests.

No unresolved contradictions remain across spec, plan, tasks and contracts.

## Closure (G3)

- `spec.md` status → Implemented; FR-007 and the Unit validation target reconciled with the code.
- Drift note appended to `specs/015-contact-info/spec.md` (its F-026 note still claimed
  "Media/Groups rows remain no-ops").
- `figma/design-map.md` row 15 and `specs/design-gap-audit.md` B7/B8 updated.
- `tests/e2e/media.spec.ts` authored (5 specs), **not run** per the Playwright pause.
- Commits: `14e687f` docs(spec) · `b5b4785` feat · `1b08826` test · closure docs.
- **Still blocked, not skipped**: G1. The media screen's own chrome is PROVISIONAL; no node ID is
  cited or invented for it. T009–T011 stay open.
