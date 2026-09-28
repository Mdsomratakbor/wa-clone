# Design Research: WhatsApp Messaging Loop

**Source**: map-external behaviour slice (future work 2, item 1). Reuses design chrome:
composer `0:8452`, chat row `0:8115`, bubble group `0:8260`, Chat Actions bar `0:8524` (feature
003 edit bar), Read node `0:8121` (row read indicator).

## Research summary

- Composer is today a static toolbar (`Add`/input/`Sticker`/`Camera`/`Mic`); ChatWindowPage
  renders a fixed seed for `chat-006`; ChatsPage holds a local input list; no shared state.
- Introducing `ChatStore` (root, signal-based) is the minimal foundation enabling this slice and
  the remaining behavior items without a dependency injector overhaul.
- Read state today is implicit; the SMS-style goldens for rows 001/003/002 must not change for
  `read !== true` rows → render the tick only when read.

## Canonical artifacts

The plan and the task list that used to live in this file now live in the canonical
Speckit artifacts for this feature:

- `plan.md` - approach, phases, review gates, drift policy
- `tasks.md` - the delivery checklist (this file keeps the research record only)