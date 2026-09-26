# Design Research + Plan + Tasks + Quickstart: Messaging Loop (feature 022)

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

## Plan

1. `ChatStore` (signals: `conversations`, `threads`; `sendMessage`, `markAllRead`,
   `openConversation`, `setConversations`, `reset`).
2. `Composer` draft + `(send)` output, mic↔Send swap, Enter-to-send.
3. `ChatWindowPage` → store messages + `onSend`, scroll-to-latest, open→read.
4. `ChatListItem` read tick; `ChatsPage` conversations from store.
5. Specs/unit updates; e2e authored (paused); build + unit validation.
6. Commit (spec → feat → docs).

**Gates**: G1 no-op (no new Figma data needed — map-external); G2 build/unit green + e2e
authored (runs paused); G3 close + drift notes.

## Tasks

- [x] T001 — Spec set `specs/022-messaging-loop/` (this set)
- [x] T002 — `ChatStore` service + unit spec
- [x] T003 — `Composer` draft/send/mic↔Send/Enter + unit updates
- [x] T004 — `ChatWindowPage` store wiring + `onSend` + scroll + open→read + unit updates
- [x] T005 — `ChatListItem` read tick + `ChatsPage` store-driven + unit updates
- [x] T006 — E2E `messaging.spec.ts` authored; drift notes (003 Read All)
- [x] T007 — build green + unit green
- [x] T008 — design-map / quickstart note + commits

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per owner directive
```