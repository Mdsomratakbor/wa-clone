# Implementation Plan: WhatsApp Calls Screen

**Branch**: `004-calls` | **Date**: 2026-09-23 | **Spec**: `specs/004-calls/spec.md`

**Input**: Feature specification from `/specs/004-calls/spec.md` (draft - clarifications resolved)

## Summary

Create the WhatsApp Calls screen (Figma node `0:10395`, 375x812): a 12-row call history list (40px avatar, name in `#000000` / `#FF3B30` when missed, arrow glyph + `outgoing`/`incoming`/`missed` label, right-aligned date, blue info button), a header with leading `Edit`, a centred static `All | Missed` segmented control (`All` active), and a trailing `+ new call` icon (no title), all wired to the existing app shell. This is the first real tab route: the shared tab bar's `Calls` tab navigates to `/calls` and back (`Chats`). All header/row controls are no-ops until their owning features land (`Edit` -> feature 005; calling flows -> later). The `CallListItem` is a new shared component; `NavigationBar` gains an optional title + centre-content slot + icon actions; `TabBar`/`UserAvatar`/`app-shell` are reused unchanged. No backend, persistence, or calling flows.

## Technical Context

**Language/Version**: TypeScript 5.8 (strict) - Angular 20.1.3

**Primary Dependencies**: Angular Core/Router + SCSS (existing stack; no new UI library)

**Storage**: None - static `CALL_SEED`

**Testing**: Jasmine + Karma (unit, existing); Playwright E2E/visual (existing) with golden `0-10395-calls.png`

**Target Platform**: Web SPA at 375x812 (mobile-first); responsive >=600px per drift breakpoints

**Project Type**: Angular application (UI reproduction of a Figma design)

**Performance Goals**: Angular default budgets; no async data

**Constraints**: No calling flows, filters, edit mode, backend, or persistence (clarifications 2-3). Keeps the feature-001 tab order and the shipped Chats screen unchanged (clarification 1).

**Scale/Scope**: Fourth feature; one new feature folder (`features/calls`), one new shared component (`CallListItem`), extensions only to `NavigationBar` (+`NavAction.icon`), one new route, one changed handler on `ChatsPage`.

## Constitution Check

*GATE: Must pass before implementation.*

| Constitution Principle | Status |
| ---------------------- | ------ |
| I. Specification First | Spec `004` drafted, clarified (6 decisions, 2026-09-23), approved for implementation |
| II. Figma Traceability | Node `0:10395` cited; design-map row 4; header/rows/tab nodes recorded in `data-model.md` |
| III. Component Reusability | `CallListItem` new shared (reused by 005); `NavigationBar` extended (title optional + centre slot + icon action), never forked; `TabBar`/`UserAvatar`/`Fab` reused |
| IV. Design Fidelity | Fills/geometry from node data; approved drift: tab order per 001, `Avatar` initials fallback, avatar 40px from Figma; photo avatars n/a |
| V. Accessibility | `role="button"` rows + labelled info buttons, static control honour, visible focus, keyboard activation |
| VI. Testability | Karma unit targets + Playwright E2E/visual vs Figma render |
| VII. No Unapproved Scope | No calling flows, filters, edit mode, backend, storage, or navigation beyond `chats`<->`calls` |
| VIII. Security | No credentials; interpolation-only rendering |

**Result: PASS** (fidelity caveats are recorded approved drift, not violations)

## Breakpoints (Owner-Approved Drift - carried from feature 001 decision 4)

| Breakpoint | Width | Layout behaviour (004) |
| ---------- | ----- | ---------------------- |
| `--wa-bp-mobile` | 0 - 599px | Edge-to-edge column, Figma fidelity (375x812 base) |
| `--wa-bp-tablet` | 600 - 1023px | `wa-app-shell` centres the column (max-width 480px) |
| `--wa-bp-desktop` | >= 1024px | Same centred shell; two-pane deferred |

Existing shell tokens are reused; no new breakpoints required.

## Project Structure

### Documentation (this feature)

```text
specs/004-calls/
├── plan.md              # this file
├── research.md          # drift/stack decisions
├── data-model.md        # calls geometry + node map
├── contracts/           # component contracts (CallListItem, NavigationBar extensions, CallsPage)
├── quickstart.md        # runnable validation guide
├── spec.md              # draft specification
└── tasks.md             # implementation task list
```

### Source Code (repository root)

```text
src/
├── shared/components/
│   ├── call-list-item/    # NEW - name/date/arrow/direction + info button, 56px rows
│   └── navigation-bar/    # EXTENDED - optional title, [data-nav-center] slot, icon actions
├── features/
│   ├── calls/             # NEW - calls.model.ts, calls.seed.ts, calls-page component
│   └── chat-list/         # ChatsPage: Calls tab navigates to /calls
└── app.routes.ts          # + { path: 'calls', loadComponent: CallsPage }
tests/e2e/                 # + calls.spec.ts (+ a golden 0-10395-calls.png)
```

**Structure Decision**: mirrors features 001-003 (feature-folder pages, shared chrome/list components). The `NavigationBar` gains a content-projection centre slot so the segmented control can sit in the title band without forking the header; optional `title` keeps Chats/Chat-window unaffected.

## Complexity Tracking

- The row geometry is novel: 56px rows (chat rows are 68px), 40px avatars, a two-line right-side column (name + arrow/direction), and `x68` inset separators. A new `--wa-call-row-height` token is added rather than overloading `--wa-row-height`.
- Segmented control: border `rgba(0,122,255,0.756)` 1px radius 8, active half `#007AFF`, per Clarification 2 it is static (both segments non-actionable).
- Golden comp: the Figma render has photo avatars (initial fallback in-app) and a washed overlay artifact (documented for feature 001). Measured baseline diff ratio ~0.10 (2026-09-23); threshold 0.15.