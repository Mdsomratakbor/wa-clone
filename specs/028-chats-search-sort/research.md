# Design Research + Plan + Tasks + Quickstart: Chats — search + sort (feature 028)

**Source**: backlog "chat-list search/sort" (future work 2). Reuses: `PrefsStore` (F-027),
`ChatsPage` (chat-list feature), the `items` effect that mirrors `ChatStore.conversations()`.

## Research summary

- Search/sort is **not** in the F-001 spec set (no design-map row): a map-external behaviour
  slice. Behaviour is well-defined by the WhatsApp product: case-insensitive search over names
  + previews, and Recent/Name/Unread ordering with the choice persisted.
- "Recent" must equal the store/seed order (which is already recency-sorted) to avoid churn and
  golden drift; Name/Unread are pure view re-orders over a copy.
- `PrefsStore` (v1) has a boolean-only `prefs` map — a string enum needs the snapshot shape
  extended. Bumping the envelope to **v2** with a tolerant hydrate (accept old v1 prefs, keep
  the chatSort default) avoids baking a migration shim into the boolean map.
- The chats tab currently renders `items()` directly in `@for`; search/sort slot in as a
  `visibleItems` computed so edit-mode, modal, FAB and tab flows are untouched.

## Plan

1. `PrefsStore` v2 `chatSort` + `setChatSort` + tolerant hydrate + units.
2. `ChatsPage`: `searchQuery`, `visibleItems`, `onSearchInput`/`clearSearch`/`onSort`, sort
   segment + search bar template/SCSS (hidden while editing).
3. Unit coverage; e2e authored (paused); build + unit validation.
4. Drift note in `specs/001-chat-list`; commits (spec → feat → test).

**Gates**: G1 golden re-capture pending Figma/playwright unblock (chrome is new); G2 build/unit
green + e2e authored; G3 close + drift note.

## Tasks

- [x] T001 — Spec set `specs/028-chats-search-sort/` (this set)
- [x] T002 — `PrefsStore` v2 (chatSort) + units
- [x] T003 — ChatsPage search + sort behaviour + chrome
- [x] T004 — Unit extension + authored e2e
- [x] T005 — 001 drift note; build green + unit green
- [x] T006 — Commits

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per owner directive
```