# Design Research + Plan + Tasks + Quickstart: Chat — More menu (feature 031)

**Source**: the last chat-actions row that maps to store behavior without new capture. "More" in
the real product groups destructive/管理 actions; the two we can honestly support from existing
data are **Clear messages** and **Delete chat**.

## Research summary

- `CHAT_ACTIONS` is copy-only (F-010); the Mute row is now live (F-030), Wallpaper needs a new
  screen. `More` is therefore the natural host for store-backed conversation actions.
- Both actions are pure store operations on existing state: `threads`, `conversations`, `starred`
  (F-022–F-025 snapshot). No new screens, no new CSS: the submenu reuses the shared `ActionSheet`
  with a data-driven row list, exactly like the parent sheet.
- Stacked sheets would introduce z-index/focus ambiguity; replacing the parent sheet keeps one
  sheet in the DOM and preserves the F-010 focus contract (focus returns to the More trigger).
- Deleting the open conversation must leave the user somewhere valid → navigate to `/chats`
  (the same convention as the chat header back button).

## Plan

1. Store: `clearMessages(chatId)`, `deleteConversation(chatId)` (thread + starred cleanup).
2. Seed: `CHAT_MORE_ACTIONS` (`Clear messages`, `Delete chat`).
3. `ChatWindowPage`: `moreOpen` signal, submenu `ActionSheet`, `onChatAction('chat-more')` swaps
   sheets, `onMoreAction` applies + navigates, `onDismissMore()` restores focus.
4. Unit coverage (store + window page); e2e authored (paused).
5. Drift note (`specs/010`); build + unit validation; commits (spec → feat → test).

**Gates**: G1 submenu row set provisional (no capture needed for behavior); G2 build/unit green +
e2e authored; G3 close + drift note.

## Tasks

- [x] T001 — Spec set `specs/031-chat-more-menu/` (this set)
- [x] T002 — Store clear/delete + starred cleanup
- [x] T003 — Submenu sheet + handlers
- [x] T004 — Unit tests + authored e2e
- [x] T005 — 010 drift note; build + unit green
- [x] T006 — Commits

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per owner directive
```