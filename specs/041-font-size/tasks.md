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

## Closure

- [x] Spec committed before any code: `docs(spec)` `555c1cc`
- [x] Feature committed as one `feat` unit: `fc10969`
- [x] `npm run build` green after the feature commit
- [x] Full unit suite green: **417/417** (was 390/390; 27 added, 0 removed)
- [x] e2e spec `tests/e2e/font-size.spec.ts` authored, **not executed** (directive 2026-09-26)
- [x] Drift notes added to `specs/016-chats-settings/spec.md` (FR-004) and
      `specs/027-settings-toggles/spec.md` (FR-004 + envelope v4)

## FR -> test traceability

| FR | Test |
| -- | ---- |
| FR-001 default `'default'`, `FontScale` union | `prefs.store.spec.ts` "starts with the default font scale"; `font-size-page.spec.ts` "defaults to Default with no stored value" |
| FR-002 version 3 -> 4, hydrate 1-4, invalid fallback | `prefs.store.spec.ts` "persists a version 4 envelope", "hydrates a v3 envelope...", "falls back to the default font scale for an unknown stored value" |
| FR-003 `setFontScale` persists, `reset()` restores | `prefs.store.spec.ts` "setFontScale persists the step across reloads", "reset restores the default font scale"; `font-size-page.spec.ts` "activating a step stores it..." |
| FR-004 route + nav chrome + Back target | `font-size-page.spec.ts` "renders the header...", "does not render the tab bar", "navigates to /settings/chats when Back is activated" |
| FR-005 four options in order in a radiogroup | `font-size-page.spec.ts` "renders the four size options in order inside a radiogroup" |
| FR-006 checked state + activation | `font-size-page.spec.ts` "checks the stored step on render...", "activating a step stores it, re-checks it and persists it" |
| FR-007 row navigates, others inert | `font-size-page.spec.ts` "the Font size row navigates...", "the other chevron rows stay inert"; `chats-settings-page.spec.ts` "row activation is a no-op" (Wallpaper) |
| FR-008 chats + archived carry the attribute | `chats-page.spec.ts` "carries the stored font scale on the list body" + default case; `archived-page.spec.ts` "carries the stored font scale..." |
| FR-009 chat window carries the attribute | `chat-window-page.spec.ts` "carries the stored font scale on the chat window root" + default case |
| FR-010 default step == captured values | `font-scale.spec.ts` "emits the captured chat-text values at the root", "renders the default step identically to the unscoped value" |
| FR-011 single multiplier map, monotonic steps | `font-scale.spec.ts` "resolves every scaled token inside a scale scope", "scales monotonically" |
| FR-012 chrome not rescaled | `font-scale.spec.ts` "leaves non-chat chrome tokens alone in a scale scope" |
| FR-013 no overflow at extra large | `tests/e2e/font-size.spec.ts` "no horizontal overflow at extra large" (authored, not run) |
| FR-014 survives a reload | `prefs.store.spec.ts` "setFontScale persists the step across reloads", "keeps a stored font scale when hydrating a v4 envelope"; e2e "the choice survives a reload..." |

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
