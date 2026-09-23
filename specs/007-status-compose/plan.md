# Implementation Plan: WhatsApp Status — Compose

**Input**: `specs/007-status-compose/spec.md` (FR-001..009, US1-US3, Clarifications 1-5)

**Scope**: `/status/compose` route + `ComposePage` (empty state) + feed entry wiring
(camera/note -> compose) + swap list (status-page camera/note "no-op" tests).

## Constitution Check (feature-006 review gates)

| Principle | Impact | Pass |
| --------- | ------ | ---- |
| Progressive — one screen at a time in map order | Row 7 is next after 006 | ✓ |
| Pixel fidelity with recordable, minimal drift | Flat pink surface + top glyphs reconstructed; keyboard embedded 1:1 crop (guaranteed region match); shared light status bar vs frame Dark variant (D1), font rendering — all recorded | ✓ |
| Reuse shell chrome + tokens | `app-shell` status-bar/home-indicator reused; no shared nav/tab components needed (compose is chrome-less by design) | ✓ |
| Runtime-typed specs, no new deps | One route + component + one static PNG in `public/`; no runtime deps | ✓ |
| Tests + visual guard required | Unit per page + e2e + golden + responsive | ✓ |
| Accessible interactions | Top glyphs are labelled buttons; keyboard `img` decorative; focus indicators reused | ✓ |

## Complexity & Parallelisation

Difficulty: **low** — a static full-bleed page (empty compose state) plus a 2-line routing touch
in the existing `StatusPage`. No new shared component. The keyboard is a single static image.

Parallel groups: none needed; sequential US chain with fast checkpoints.

## Structure

1. **Phase 1 (setup)**: golden `tests/e2e/golden/0-9634-status-compose.png` (375x812) present;
   `status-compose-top-actions.svg` (vector source for the glyphs) + `status-compose-keyboard.png`
   (375x291 crop) captured; clarifications recorded; swap list enumerated. *(Done during launch.)*
2. **Phase 2 (route + asset)**:
   - `src/app/app.routes.ts`: add `{ path: 'status/compose', loadComponent: ComposePage }`.
   - Copy `tests/e2e/golden/status-compose-keyboard.png` -> `public/status-compose-keyboard.png`
     (served at `/status-compose-keyboard.png`, base href `/`).
3. **Phase 3 (US1) ComposePage + unit**:
   - `src/app/features/status/compose-page.ts`: `onClose()` -> `router.navigate(['/status'])`;
     `onSend()`/`onSendText()` no-ops.
   - `compose-page.html`: full-bleed `.compose` (flat `#FF8A8C`); top row with three white glyph
     buttons (X + text-bar + paper-plane, path data from `status-compose-top-actions.svg`);
     centred placeholder `Type a status` + caret; `<img>` keyboard pinned bottom.
   - `compose-page.scss`: body/`.compose` background `#FF8A8C`, `overflow: hidden`; top row at
     ~16.5px below status bar, x margins 19; placeholder 38px semibold white centred at ~y211
     (content coords); keyboard `position: absolute; bottom: 0; width: 100%; height: auto`.
   - `compose-page.spec.ts`: chrome/empty-state render, glyphs present, no tab bar/FAB/title,
     Close navigates `/status`, sends no-op.
4. **Phase 4 (US2) feed entry + swaps**:
   - `status-page.ts`: `onCamera()`/`onNote()` -> `router.navigate(['/status/compose'])`.
   - Unit swaps: `status-page.spec.ts` camera/note no-op cases -> navigation `['/status/compose']`;
     keep Privacy + row no-ops.
   - E2E swaps: `tests/e2e/status.spec.ts` "camera/note/row are no-ops" case -> camera/note now
     navigate; row stays no-op.
5. **Phase 5 (US3) focus + responsive + golden**:
   - `tests/e2e/status-compose.spec.ts`: US1 chrome/empty-state, US2 entry (`/status` camera &
     note -> `/status/compose`) + Close back + no-ops, US3 focus rings + golden
     `0-9634-status-compose.png` 375x812.
   - `tests/e2e/responsive.spec.ts`: append `/status/compose` no-overflow case.
   - Measure golden baseline (temp tight threshold), set `maxDiffPixelRatio` from baseline +0.05.
6. **Phase 6 (closure)**: full suite (build + unit + e2e); update design-map row 7 -> implemented;
   spec status Implemented; commit.

## Validation commands

- Build: `npm run build`
- Unit: `$env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'; npx ng test --watch=false --browsers ChromeHeadless`
- E2E: `npx playwright test --reporter=line` (all tests, all 3 projects)

## Risks

- **Golden baseline**: keyboard region is an exact image crop (matches by construction); top half
  drift = status-bar variant (D1) + font/metrics for the 38px placeholder + top-glyph path
  rendering. Expected ratio lower than 004/005 (~0.04-0.08); threshold set from measured baseline
  (+0.05 slack).
- **Keyboard asset scaling**: the `<img>` must render at exactly 375x291 CSS px on the 375px
  breakpoint; keep `width:100%; height:auto` and confirm no sub-pixel scaling at other breakpoints
  (non-overflow contract).
- **Camera/note swap completeness**: remove every "camera/note are no-ops" assertion in
  `status-page.spec.ts` and `tests/e2e/status.spec.ts` (dead-code check before commit).