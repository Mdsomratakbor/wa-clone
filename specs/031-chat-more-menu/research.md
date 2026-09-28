# Design Research: WhatsApp Chat — More menu (clear messages / delete chat)

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

## Canonical artifacts

The plan and the task list that used to live in this file now live in the canonical
Speckit artifacts for this feature:

- `plan.md` - approach, phases, review gates, drift policy
- `tasks.md` - the delivery checklist (this file keeps the research record only)