# Implementation Plan: WhatsApp Chat — Chat Window

**Branch**: `002-chat-window` | **Date**: 2026-09-23 | **Spec**: `specs/002-chat-window/spec.md`

**Input**: Feature specification from `/specs/002-chat-window/spec.md` (draft — clarifications pending)

## Summary

Build the WhatsApp chat window (Figma node `0:8257`, 375×812) as the second feature: a wallpaper-backed message thread of 13 static seeded messages (outgoing green `#DCF7C5` with read ticks, incoming white `#FAFAFA`), a centered `Fri, Jul 26` date chip, the iOS-style contact header (`Back` · avatar · `Martha Craig` · `tap here for contact info` · video/call), and the composer (`＋` · input · emoji · camera · mic). Route `/chat/:id`, reached from the Chats list row; `Back` returns to `/chats`. No messaging/send logic, backend, or persistence. Thread data is static seed content replicating Figma exactly.

## Technical Context

**Language/Version**: TypeScript 5.8 (strict) · Angular 20.1.3

**Primary Dependencies**: Angular Core/Router/Forms + Angular Material 20.2.14 + SCSS (existing stack; no new UI library)

**Storage**: None — static seed data in feature code (no backend, no persistence)

**Testing**: Jasmine + Karma (unit, existing); Playwright E2E/visual (existing) with golden `0-8257-chat.png`

**Target Platform**: Web SPA at 375×812 (mobile-first); responsive ≥600px per drift breakpoints

**Project Type**: Angular application (UI reproduction of a Figma design)

**Performance Goals**: Angular default budgets; no async data

**Constraints**: Static visual-fidelity focused; no messaging/send/voice/media; no persisted state; shared components where repeated; existing stack only

**Scale/Scope**: Second of ~8 features; one screen + 2–3 shared components (bubble, header, composer)

## Constitution Check

*GATE: Must pass before implementation.*

| Constitution Principle | Status |
| ---------------------- | ------ |
| I. Specification First | ✅ Spec `002` drafted, clarified (5 decisions, 2026-09-23), approved for implementation |
| II. Figma Traceability | ✅ Node `0:8257` cited; design-map row 2; all 13 message nodes/IDs recorded in `data-model.md` |
| III. Component Reusability | ✅ `message-bubble`, `chat-header`, `composer` components; reuse `status-bar`/`home-indicator`/`user-avatar`/`app-shell` |
| IV. Design Fidelity | ✅ Fills/tokens from node data; ⚠️ wallpaper `#EFEFF4` + avatar initials + content-driven bubble heights are recorded, owner-approved drift (Clarifications 1–2, 4) |
| V. Accessibility | ✅ Keyboard focus states, aria labels on icons, visible focus |
| VI. Testability | ✅ Karma unit targets + Playwright E2E/visual vs Figma render |
| VII. No Unapproved Scope | ✅ No messaging, send, voice, media, auth, backend, storage |
| VIII. Security | ✅ No credentials; interpolation-only rendering |

**Result: PASS** (fidelity caveats are recorded approved drift, not violations)

## Breakpoints (Owner-Approved Drift — carried from feature 001 decision 4)

| Breakpoint | Width | Layout behaviour (002) |
| ---------- | ----- | ---------------------- |
| `--wa-bp-mobile` | 0 – 599px | Edge-to-edge column, exact Figma fidelity (375×812 base) |
| `--wa-bp-tablet` | 600 – 1023px | `wa-app-shell` centers the column (max-width 480px) on `#E2E2E7` |
| `--wa-bp-desktop` | ≥ 1024px | Same centred shell (max-width 480px); two-pane deferred |

Existing shell tokens are reused; no new breakpoints required.

## Project Structure

### Documentation (this feature)

```text
specs/002-chat-window/
├── plan.md              # this file
├── research.md          # drift/stack decisions
├── data-model.md        # message seed + geometry
├── contracts/           # component contracts + thread layout spec
├── quickstart.md        # runnable validation guide
├── spec.md              # draft specification
└── tasks.md             # /speckit.tasks output (next step)
```

### Source Code (repository root)

```text
src/
├── core/layout/         # app-shell, status-bar, home-indicator (reused)
├── shared/components/
│   ├── message-bubble/  # NEW — text + file variants, side, timestamp, ticks
│   ├── chat-header/     # NEW — back/avatar/name/subtitle/video/call
│   ├── composer/        # NEW — ＋ input emoji camera mic
│   └── avatar/          # reused (initials fallback)
└── features/
    └── chat-window/     # chat-window page, seed, route, router wiring
tests/e2e/               # Playwright specs + golden 0-8257-chat.png
```

**Structure Decision**: mirrors feature 001 (single Angular app, feature-oriented folders). The three new components are justified: `message-bubble` repeats 13× per screen and will appear on every future conversation screen; `chat-header`/`composer` are whole-screen primitives reused by the same screens.

## Complexity Tracking

> Wallpaper and avatar are non-embeddable Figma image fills (no render/export scope). Resolved via owner-approved approximation (Clarifications 1–2), not by adding export infrastructure. Bubble geometry is content-derived where the design is inconsistent (Behaviour 2) — implementation must not hardcode per-row heights.