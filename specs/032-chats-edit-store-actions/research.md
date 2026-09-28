# Design Research: WhatsApp Chats — edit-mode Archive / Delete backed by the store

**Source**: spec 003 explicitly shipped Archive/Delete as in-memory list mutations ("archived
view is out of scope"). F-024 later made persistence a project principle, so those two actions
became the last in-memory-only mutations in the app — and a reload resurrected deleted chats.

## Research summary

- `ChatsPage.removeSelected()` filtered a local `items` signal only; `items` is itself an effect
  mirror of `store.conversations()`, so any store change flows back — the local mutation was both
  redundant and unpersisted.
- Two distinct intents share one control pair: **Delete** (gone) and **Archive** (kept, hidden).
  Modelling archive as a store flag preserves data and leaves a clean future home for an Archived
  screen; modelling it as a delete loses data irreversibly.
- Archived rows must be filtered from the *list source*, not per-render, so search (`visibleItems`)
  and the unread sort inherit the filter for free.
- `deleteConversation` (F-031) already handles thread + starred cleanup for one id; bulk actions
  reuse it to keep one cleanup path.
- No new chrome, no new copy: the captured `Archive · Read All · Delete` bar and the placeholder
  state are untouched, so goldens are unaffected.

## Canonical artifacts

The plan and the task list that used to live in this file now live in the canonical
Speckit artifacts for this feature:

- `plan.md` - approach, phases, review gates, drift policy
- `tasks.md` - the delivery checklist (this file keeps the research record only)