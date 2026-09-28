# Design Research: WhatsApp Star Flow (long-press → starred list)

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

## Canonical artifacts

The plan and the task list that used to live in this file now live in the canonical
Speckit artifacts for this feature:

- `plan.md` - approach, phases, review gates, drift policy
- `tasks.md` - the delivery checklist (this file keeps the research record only)