# Implementation Plan: WhatsApp Calls Edit Mode

**Branch**: `005-calls-edit` | **Date**: 2026-09-23 | **Spec**: `specs/005-calls-edit/spec.md`

**Input**: Feature specification from `/specs/005-calls-edit/spec.md` (draft - clarifications resolved)

## Summary

Wire the feature-004 `Edit` leading action on `/calls` into an interactive **edit mode** (Figma node `0:8597`, 375x812): the header flips to `Done` + `Clear`, every call row gains a leading 21px red-minus circle (`#FF3B30`) with content shifted right, the info button hides, and the tab bar stays visible with switches inert while editing. Per-row minus tap removes that row immediately; `Clear` removes all rows (disabled gray `#C7C7CC` at 0 rows); an emptied list shows a `No calls` placeholder. All mutations act on the page-owned in-memory working copy of `CALL_SEED`. `Done` restores the feature-004 rendering. Extends `CallListItem` (`editMode`/`remove`), `NavigationBar` + `NavAction` (`disabled`); no backend, no persistence, no bottom action bar.

## Technical Context

**Language/Version**: TypeScript 5.8 (strict) - Angular 20.1.3

**Primary Dependencies**: Angular Core/Router + SCSS (existing stack; no new UI library)

**Storage**: None - page-owned working copy seeded from `CALL_SEED`

**Testing**: Jasmine + Karma (unit, existing); Playwright E2E/visual (existing) with golden `0-8597-calls-edit.png`

**Target Platform**: Web SPA at 375x812 (mobile-first); responsive >=600px per drift breakpoints

**Project Type**: Angular application (UI reproduction of a Figma design)

**Performance Goals**: Angular default budgets; no async data

**Constraints**: No backend/persistence/undo/swipe; segmented control stays static; feature-004 rendering intact outside edit mode; no new libraries or raster assets (Clarifications 1-4).

**Scale/Scope**: Fifth feature; extends `feature/calls` in place (no new feature folder), extends `CallListItem` + `NavigationBar`/`NavAction`, updates `calls` unit/E2E specs for the `Edit` behaviour change.

## Constitution Check

*GATE: Must pass before implementation.*

| Constitution Principle | Status |
| ---------------------- | ------ |
| I. Specification First | Spec `005` drafted, clarified (4 decisions, 2026-09-23), approved for implementation |
| II. Figma Traceability | Node `0:8597` cited; design-map row 5; row/nav/remove-icon nodes recorded in `data-model.md` |
| III. Component Reusability | `CallListItem` extended in place (editMode + remove), never forked; `NavigationBar`/`NavAction` extended with `disabled`; `TabBar`, `SegmentFilter` markup (page-owned), `UserAvatar` reused |
| IV. Design Fidelity | Geometry from node data (minus x17, avatar x47, name x99, no info); approved drift: `Done` weight regular (003 precedent), photo avatars initials fallback, empty state `No calls` |
| V. Accessibility | Minus buttons labelled (`Remove call for <name>`), visible focus rings, disabled `Clear` non-actionable |
| VI. Testability | Karma unit targets + Playwright E2E/visual vs Figma render |
| VII. No Unapproved Scope | No backend, selection mode, action bar, filter behaviour, swipe, or cross-route navigation beyond existing `chats`<->`calls` |
| VIII. Security | No credentials; interpolation-only rendering |

**Result: PASS** (fidelity caveats are recorded approved drift, not violations)

## Breakpoints (Owner-Approved Drift - carried from feature 001 decision 4)

| Breakpoint | Width | Layout behaviour (005) |
| ---------- | ----- | ---------------------- |
| `--wa-bp-mobile` | 0 - 599px | Edge-to-edge column, Figma fidelity |
| `--wa-bp-tablet` | 600 - 1023px | `wa-app-shell` centres the column (max-width 480px) |
| `--wa-bp-desktop` | >= 1024px | Same centred shell |

Existing shell tokens reused; no new breakpoints required.

## Project Structure

### Documentation (this feature)

```text
specs/005-calls-edit/
├── plan.md              # this file
├── research.md          # drift/stack decisions
├── data-model.md        # edit-mode geometry + node map + remove glyph
├── contracts/           # component contracts (CallListItem, NavigationBar disabled, CallsPage state machine)
├── quickstart.md        # runnable validation guide
├── spec.md              # draft specification
└── tasks.md             # implementation task list
```

### Source Code (repository root - all extensions, no new folders)

```text
src/
├── shared/components/
│   ├── call-list-item/    # EXTENDED - editMode input + remove output + red minus; hides info
│   └── navigation-bar/    # EXTENDED - render disabled actions (attr + style)
├── features/
│   ├── chat-list/chat.model.ts   # NavAction + disabled?: boolean
│   └── calls/                    # CallsPage: editMode signal, items working copy, guards
tests/e2e/                 # + calls-edit.spec.ts (+ golden 0-8597-calls-edit.png); calls.spec.ts Edit remap
```

**Structure Decision**: feature 005 is a *mode of the existing screen*, so it lives entirely inside `feature/calls` + its shared components - the same pattern feature 003 used for Chats (no new folders).

## Complexity Tracking

- Edit-mode geometry (minus x17, avatar x47, name x99) reproduces Figma via a single padding shift (16 -> 47px) + absolutely positioned minus - mirrors `chat-list-item--selectable`.
- `Clear` disabled state needs a `NavAction.disabled` extension on the shared nav bar (first disabled nav action in the app; mirrors the 003 `ChatActionsBar` disabled pattern).
- Cross-feature test swaps: feature-004 assertions that treated `Edit` as a no-op must be updated (only `Edit`; all other 004 no-ops stand). Enumerated in `tasks.md` (swap list).
- Golden comp: photo avatars + washed-overlay artifact expected; measure baseline (see `research.md`).