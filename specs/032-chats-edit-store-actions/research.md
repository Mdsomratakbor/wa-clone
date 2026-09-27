# Design Research + Plan + Tasks + Quickstart: Chats edit-mode store actions (feature 032)

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

## Plan

1. Model + store: `archived?`, `normalizeChats` seeds `false`, `archiveConversations`,
   `deleteConversations` (delegates to the single-id cleanup).
2. `ChatsPage`: drop `removeSelected`'s local mutation; filter archived in the `items` effect.
3. Unit coverage (store + page, including a fresh-instance persistence check); e2e updated
   (paused).
4. Drift note (`specs/003`); build + unit validation; commits (spec → feat → test).

**Gates**: G1 model/store shape; G2 build/unit green + e2e authored; G3 close + drift note.

## Tasks

- [x] T001 — Spec set `specs/032-chats-edit-store-actions/` (this set)
- [x] T002 — Model + store archive/delete
- [x] T003 — ChatsPage store-backed actions + archived filter
- [x] T004 — Unit tests + e2e updates
- [x] T005 — 003 drift note; build + unit green
- [x] T006 — Commits

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per owner directive
```