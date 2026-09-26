# Design Research + Plan + Tasks + Quickstart: Star Flow (feature 025)

**Source**: map-external behaviour slice (future work 2, item — completes F-008 non-goals).
Reuses design chrome: message bubble group `0:8260`, chat window `0:8257`, Starred Messages
tip `0:8820`.

## Research summary

- F-008 shipped only the empty-state tip with non-goals "populated list" + "starring /
  unstarring interactions". The design never frames a populated list → keep the tip as the
  empty state and render a compact row list when starred.
- `ChatStore` is the single source of truth and persists (F-024) → starred keys are cheap and
  fully testable; entries derive from `threads` + `conversations` so dangling refs drop
  naturally.
- `MessageBubble` is a dumb component: add a `star` output (right-click + pointer hold),
  a `starred` input (badge), and let `ChatWindowPage` bridge to the store.

## Plan

1. `ChatStore`: `starred` signal, `toggleStarred`/`isStarred`/`starredEntries`, snapshot v1
   field, hydrate/reset.
2. `MessageBubble`: hold gesture + `contextmenu` → `star` output; `starred` input + badge.
3. `ChatWindowPage`: `(star)` → store; `[starred]="isStarred(id)"` helper.
4. `StarredPage`: store entries list + row tap → chat; tip preserved for empty.
5. Unit updates; e2e authored (paused); build + unit validation.
6. Drift note in `specs/008-starred-messages/spec.md`; commits (spec → feat → test).

**Gates**: G1 no-op (no new Figma data needed); G2 build/unit green + e2e authored (runs
paused); G3 close + drift notes.

## Tasks

- [x] T001 — Spec set `specs/025-starred-flow/` (this set)
- [x] T002 — `ChatStore` star state + persistence
- [x] T003 — `MessageBubble` star gesture + badge
- [x] T004 — `ChatWindowPage` bridging
- [x] T005 — `StarredPage` list + row navigation
- [x] T006 — Unit updates; e2e authored
- [x] T007 — build green + unit green
- [x] T008 — 008 drift note + commits

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per owner directive
```