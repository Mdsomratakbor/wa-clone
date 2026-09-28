# Tasks: WhatsApp Font size (chat text scale) (feature 041)

**Input**: `specs/041-font-size/plan.md`, `specs/041-font-size/spec.md`,
`specs/041-font-size/research.md`, `specs/041-font-size/contracts/ui-contracts.md`

- **Gates**: G1 = capture BLOCKED (2026-09-28 `429`, reset 2026-10-02 18:38 UTC) - picker chrome,
  step labels and multipliers are PROVISIONAL; G2 = build + unit green, e2e authored, no overflow at
  `extra-large`; G3 = close + drift notes (016, 027).
- **Tests**: `npx ng test --watch=false --reporters=progress` green before each commit; Playwright
  specs are authored but **not executed** (paused by owner directive 2026-09-26).

## Implementation

- [x] T001 - `spec.md` + `research.md` + `plan.md` + `tasks.md` + `contracts/ui-contracts.md`
- [x] T002 - `/speckit.clarify` pass: B5 target, chat-text-only scope, provisional-chrome policy
- [x] T003 - `prefs.store.ts`: `FontScale`, `fontScale` signal, `setFontScale()`, version 3 -> 4,
  hydrate accepts 1-4 with `'default'` fallback, `reset()` (FR-001, FR-002, FR-003)
- [x] T004 - `_tokens.scss`: `$wa-font-scale` map + `--wa-font-scale` in `:root` + per-step
  `[data-font-scale]` block re-declaring the five chat-text tokens via `calc()`
  (FR-010, FR-011, FR-012)
- [x] T005 - `font-size-page.{ts,html,scss}`: nav bar, `radiogroup` of four steps, checked state,
  activation, Back (FR-004, FR-005, FR-006)
- [x] T006 - `app.routes.ts` lazy route + `chats-settings-page.ts` row routing (FR-007)
- [x] T007 - `[attr.data-font-scale]` on chats / archived / chat-window roots (FR-008, FR-009, FR-012)
- [x] T008 - Unit tests: store persistence + versions + reset, page render/check/activate/back,
  wiring rows, scoped computed font size, non-chat chrome unscaled (all FRs)
- [x] T009 - e2e spec authored (not run) - navigation, four options, selection, overflow guard
  (AC-10)
- [x] T010 - Drift notes in 016 + 027; G1 capture task left open; build + unit green; commits

## Capture - BLOCKED (Figma 429, reset 2026-10-02 18:38 UTC)

- [ ] T011 - Capture `0:9973` rows at full depth: exact row labels/ordering (the 2026-09-28 payload
  shows 4 row groups = 6 rows vs the 5-row seed) and the `Font size` label
- [ ] T012 - Reconcile the provisional step labels/multipliers and the picker chrome against the
  capture; replace the hypotheses in `spec.md` and `_tokens.scss` if the design specifies
  discrete sizes or different copy
- [ ] T013 - Golden for `/settings/chats` + `/settings/chats/font-size`, then re-baseline the
  chat-list/chat-window goldens at `extra-large` (blocked twice over: capture + Playwright pause)

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per owner directive
```

## Notes

- `[ ]` items are capture-gated and stay open until the quota resets.
- The scale is a **scoped descendant override**: no consumer stylesheet changes; only the three
  chat roots carry the attribute.
- `default` re-declares the captured values, so the default rendering is unchanged.
- The 6-row-vs-5-row finding belongs to F-016's inventory, not to this feature.
