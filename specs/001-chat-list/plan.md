# Implementation Plan: WhatsApp Chats — Chat List

**Branch**: `001-chat-list` | **Date**: 2026-09-23 | **Spec**: `specs/001-chat-list/spec.md`

**Input**: Feature specification from `/specs/001-chat-list/spec.md` (clarified 2026-09-23)

## Summary

Build the WhatsApp Chats list screen (Figma node `0:8855`, 375×812) as the first feature: a scrollable conversation list, iOS-style navigation bar (`Chats` title + `Edit` / `Broadcast Lists` / `New Group`), a 5-item tab bar (active-state only in 001), floating `Actions` button, and an "No chats" empty placeholder. Data is static seed data mirroring the Figma content. Responsive adaptation beyond 375px is owner-approved drift (see Breakpoints). No routing shell, backend, chat logic, or persistence in this feature.

## Technical Context

**Language/Version**: TypeScript 5.8 (strict) · Angular 20.1.3

**Primary Dependencies**: Angular Core/Router/Forms + Angular Material 20.2.14 + SCSS (existing stack; no new UI library)

**Storage**: None — static seed data in feature code (no backend, no persistence)

**Testing**: Jasmine + Karma (unit, existing); Playwright added for E2E/visual (new dev-dependency)

**Target Platform**: Web SPA at 375×812 (mobile-first); responsive ≥600px per drift breakpoints

**Project Type**: Angular application (UI reproduction of a Figma design)

**Performance Goals**: Angular default budget limits; no async data — no perf-specific targets

**Constraints**: Static visual-fidelity focused; no backend/auth/chat logic; no persisted state; responsive breakpoints must be traceable to this plan; keep existing Angular + Material + SCSS stack

**Scale/Scope**: First of ~8 features; single screen + shared shell primitives

## Constitution Check

*GATE: Must pass before implementation.*

| Constitution Principle | Status |
| ---------------------- | ------ |
| I. Specification First | ✅ Spec `001` drafted, clarified (6 decisions), approved for planning |
| II. Figma Traceability | ✅ Node `0:8855` cited; design-map row 1; no fabricated IDs |
| III. Component Reusability | ✅ `chat-list-item`, `tab-bar`, `navigation-bar`, `avatar`, `status-bar`, `home-indicator`, `fab` shared components |
| IV. Design Fidelity | ✅ Values from `figma/design-analysis.md`; ⚠️ responsive breakpoints are owner-approved drift (decision 4) |
| V. Accessibility | ✅ Keyboard focus states, semantic list, aria on tab bar, visible focus |
| VI. Testability | ✅ Karma unit targets + Playwright E2E/visual vs Figma render |
| VII. No Unapproved Scope | ✅ No messaging, auth, backend, storage, calling, status posting |
| VIII. Security | ✅ No credentials; interpolation-only rendering |

**Result: PASS** (fidelity caveat is recorded approved drift, not a violation)

## Breakpoints (Owner-Approved Drift — decision 4, 2026-09-23)

| Breakpoint | Width | Layout behaviour (001) |
| ---------- | ----- | ---------------------- |
| `--wa-bp-mobile` | 0 – 599px | Edge-to-edge column, exact Figma fidelity (375×812 base) |
| `--wa-bp-tablet` | 600 – 1023px | `wa-app-shell` centers the column (max-width 480px) on neutral page backdrop `#E2E2E7`; no horizontal overflow |
| `--wa-bp-desktop` | ≥ 1024px | Same centred shell (max-width 480px); reserved tokens for future two-pane layout (out of scope for 001) |

Tokens live in `core/tokens` SCSS; the shell margin-inline `auto` + `max-width` realizes the drift. Validated by Playwright at 375, 800, and 1440 widths (no horizontal overflow).

## Project Structure

### Documentation (this feature)

```text
specs/001-chat-list/
├── plan.md              # this file
├── research.md          # drift/stack decisions
├── data-model.md        # entities + validation
├── contracts/           # component contracts + seed data schema
├── quickstart.md        # runnable validation guide
├── spec.md              # approved specification
└── tasks.md             # /speckit.tasks output (next step)
```

### Source Code (repository root)

```text
src/
├── core/
│   ├── tokens/               # SCSS custom-property tokens (design-analysis values)
│   └── layout/               # app-shell, status-bar, home-indicator
├── shared/components/
│   ├── avatar/
│   ├── chat-list-item/
│   ├── navigation-bar/
│   ├── tab-bar/
│   └── fab/
└── features/
    └── chat-list/            # chats screen (seed data, container, empty state)
tests/e2e/                    # Playwright specs + Figma reference screenshots
```

**Structure Decision**: Option 1 — single Angular application, feature-oriented folders under `src/app/`, reusing the existing Angular + SCSS conventions (prefix `app`, inlineLanguage scss). Shared components are justified by design repetition (nav bar and tab bar appear on every screen).

## Complexity Tracking

> Not required — no constitution violations. Chosen structure (single app + shared components) is the simplest that satisfies the specification.