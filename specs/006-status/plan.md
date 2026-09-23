# Implementation Plan: WhatsApp Status — Feed

**Input**: `specs/006-status/spec.md` (FR-001..010, US1-US3, Clarifications 1-5)

**Scope**: `/status` route + `StatusPage` + tab routing (Status from Chats/Calls) + swap list.

## Constitution Check (feature-005 review gates)

| Principle | Impact | Pass |
| --------- | ------ | ---- |
| Progressive — one screen at a time in map order | Row 6 is next after 005 | ✓ |
| Pixel fidelity with recordable, minimal drift | Photo avatar -> initials, washed overlay (001), tab physical order drift — all recorded | ✓ |
| Reuse shell chrome + tokens | status-bar/home-indicator via `app-shell`; nav/tab via shared components; tokens `--wa-*` and explicit `#EFEFF4`/`#EDEDFF` | ✓ |
| Runtime-typed specs, no new deps | No runtime/build changes beyond a route + component | ✓ |
| Tests + visual guard required | Unit per page + e2e + golden + responsive | ✓ |
| Accessible interactions | Buttons labelled; rows `role="button"`; focus indicators reused | ✓ |

## Complexity & Parallelisation

Difficulty: **low** — a static read-mostly page plus 3-line routing touches in two existing pages.
No new shared component is required (the My Status row is a unique, page-local layout).

Parallel groups: none needed; sequential US chain with fast checkpoints.

## Structure

1. **Phase 1 (setup)**: golden asset present (`tests/e2e/golden/0-8498-status.png`); clarifications
   recorded; swap list enumerated. *(Done during launch.)*
2. **Phase 2 (route)**:
   - `src/app/app.routes.ts`: add `{ path: 'status', loadComponent: StatusPage }`.
3. **Phase 3 (US1) StatusPage + unit**:
   - `src/app/features/status/status-page.ts`: active-tab signal (`status`), leading actions
     `[Privacy]`, no trailing, `onNavAction('privacy')` no-op, row/camera/note no-op guards.
   - `status-page.html`: `app-navigation-bar title="Status" [leading]="leadingActions"`; body with
     My Status row (avatar + badge + name + subtitle + camera/note buttons) + tip; `app-tab-bar`.
   - `status-page.scss`: body `#EFEFF4`; row hairline separators `rgba(60,60,67,0.29)`; 76px row,
     padding-left 13/gap 9; 58px avatar + absolute 20px badge (right/bottom corner); 36px
     `#EDEDFF` circles for camera/note; tip 43px with 35px gap.
   - `status-page.spec.ts`: chrome/feed render, avatar initials, buttons render, no FAB,
     tab active = status.
4. **Phase 4 (US2) routing + no-ops**:
   - `chats-page.onTabSelect`: `status` -> `router.navigate(['/status'])` (edit guard first).
   - `calls-page.onTabSelect`: same.
   - Unit: StatusPage tab navigation (Chats->/chats, Calls->/calls, Camera/Settings stub, Status
     no-op); no-op handlers; remap Chats/Calls "Status tab" unit tests to `/status`.
5. **Phase 5 (US3) focus + responsive + golden**:
   - `tests/e2e/status.spec.ts`: US1 chrome/feed, US2 routing (`/status` <-> `/chats`/`/calls`,
     stub for Camera/Settings, no-ops), US3 focus rings + golden `0-8498-status.png` 375x812.
   - `tests/e2e/responsive.spec.ts`: append `/status` no-overflow case.
   - Measure golden baseline (temp tight threshold like 005), set `maxDiffPixelRatio` (~0.11 band).
6. **Phase 6 (closure)**:
   - Full suite: `npm run build` + unit (`npx ng test --watch=false --browsers ChromeHeadless` with
     `CHROME_BIN`) + `npm run e2e`.
   - Update `figma/design-map.md` row 6 to implemented; set spec status; commit.

## Validation commands

- Build: `npm run build`
- Unit: `$env:CHROME_BIN='C:\Program Files\Google\Chrome\Application\chrome.exe'; npx ng test --watch=false --browsers ChromeHeadless`
- E2E: `npx playwright test --reporter=line` (all tests, all 3 projects)

## Risks

- **Golden baseline**: photo-avatar drift (58px circle) + washed overlay + fonts. Expected ratio
  ~0.10-0.12 like 004/005; threshold set from measured baseline (+0.05 slack).
- **Tab-position drift**: Status is rightmost in-app (recorded, Clarification 5) — do not attempt
  to reorder the shared tab bar.
- **"coming soon" stub for Status** must be fully removed from Chats/Calls (swap list) to avoid
  dead-code assertions.