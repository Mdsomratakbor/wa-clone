# Implementation Plan: WhatsApp Chat List — Edit Mode

**Branch**: `003-chats-edit` | **Date**: 2026-09-23 | **Spec**: `specs/003-chats-edit/spec.md`

**Input**: Feature specification from `/specs/003-chats-edit/spec.md` (draft — clarifications pending)

## Summary

Add **edit mode** to the existing Chats list (Figma node `0:8114`, 375×812): the feature-001 `Edit` nav action enters a mode where every chat row shows a leading 21px iOS selection circle (`#3C3C43` ring → filled `#007AFF` + white check when selected), the trailing action becomes `Done`, and the FAB + tab bar are replaced by a `#F6F6F6` **Chat Actions** bar (`Archive · Read All · Delete`; gray `#C7C7CC` disabled when nothing selected, blue/red enabled when ≥1 selected). `Delete`/`Archive` remove the selected rows from an in-memory copy of `CHAT_SEED`; `Read All` is a control-only no-op (owner decision). `Done` restores the 001 normal mode exactly. No routing, backend, or persistence.

## Technical Context

**Language/Version**: TypeScript 5.8 (strict) · Angular 20.1.3

**Primary Dependencies**: Angular Core/Router + Angular Material 20.2.14 + SCSS (existing stack; no new UI library)

**Storage**: None — in-memory working copy of the 001 static seed

**Testing**: Jasmine + Karma (unit, existing); Playwright E2E/visual (existing) with golden `0-8114-chats-edit.png`

**Target Platform**: Web SPA at 375×812 (mobile-first); responsive ≥600px per drift breakpoints

**Project Type**: Angular application (UI reproduction of a Figma design)

**Performance Goals**: Angular default budgets; no async data

**Constraints**: No backend/auth/persistence; no read/unread state; no archived screen; no undo; selection is single-tap toggle only. Edit mode must not alter normal mode or routes.

**Scale/Scope**: Third feature; extends `feature/chat-list` + one new shared component (`ChatActionsBar`), two input additions on `ChatListItem`.

## Constitution Check

*GATE: Must pass before implementation.*

| Constitution Principle | Status |
| ---------------------- | ------ |
| I. Specification First | ✅ Spec `003` drafted, clarified (7 decisions, 2026-09-23), approved for implementation |
| II. Figma Traceability | ✅ Node `0:8114` cited; design-map row 3; circles/nav/bar nodes recorded in `data-model.md` |
| III. Component Reusability | ✅ `ChatListItem` extended (not forked); `NavigationBar`/`UserAvatar`/`TabBar`/`Fab` reused; new `ChatActionsBar` shared for future lists |
| IV. Design Fidelity | ✅ Fills/geometry from node data; ⚠️ section bar 83→49px visible band + `#007AFF`/`#FF3B30` enabled colors are recorded, owner-approved drift (Clarifications 2, 5, 7) |
| V. Accessibility | ✅ `role="checkbox"` + `aria-checked`, disabled states, visible focus indicators, keyboard toggle |
| VI. Testability | ✅ Karma unit targets + Playwright E2E/visual vs Figma render |
| VII. No Unapproved Scope | ✅ No backend, storage, undo, read-state, navigation changes |
| VIII. Security | ✅ No credentials; interpolation-only rendering |

**Result: PASS** (fidelity caveats are recorded approved drift, not violations)

## Breakpoints (Owner-Approved Drift — carried from feature 001 decision 4)

| Breakpoint | Width | Layout behaviour (003) |
| ---------- | ----- | ---------------------- |
| `--wa-bp-mobile` | 0 – 599px | Edge-to-edge column, Figma fidelity (375×812 base) |
| `--wa-bp-tablet` | 600 – 1023px | `wa-app-shell` centres the column (max-width 480px) |
| `--wa-bp-desktop` | ≥ 1024px | Same centred shell; two-pane deferred |

Existing shell tokens are reused; no new breakpoints required.

## Project Structure

### Documentation (this feature)

```text
specs/003-chats-edit/
├── plan.md              # this file
├── research.md          # drift/stack decisions
├── data-model.md        # edit-mode geometry + node map
├── contracts/           # component contracts (ChatActionsBar, ChatListItem edit mode)
├── quickstart.md        # runnable validation guide
├── spec.md              # draft specification
└── tasks.md             # implementation task list
```

### Source Code (repository root)

```text
src/
├── shared/components/
│   ├── chat-list-item/   # EXTENDED — selectMode/checked inputs + selection circle
│   └── chat-actions-bar/ # NEW — Archive · Read All · Delete bar (49px @ #F6F6F6)
└── features/chat-list/   # ChatsPage edit-mode state (editing, selection, actions)
tests/e2e/                # Playwright specs + golden 0-8114-chats-edit.png
```

**Structure Decision**: mirrors feature 002. No new route — edit mode is a state of `ChatsPage`. The `ChatActionsBar` is a shared component because the same bar pattern (`Archive/Delete` affordances) logically belongs to future list screens.

## Complexity Tracking

> The selection-circle enabled state (filled `#007AFF` + white check) has no Figma source (frame shows only the idle ring). Implemented with the owner-approved iOS-style variant (Clarification 2) via inline SVG — no new assets. The action bar's 83px Figma height includes the home-indicator region (83 − 34 = 49px visible, `--wa-tab-bar-height`), reusing the feature-002 shell reasoning (Clarification 7).