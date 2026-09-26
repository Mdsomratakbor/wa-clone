# Feature Specification: WhatsApp Chats — search + sort

**Feature Branch**: `028-chats-search-sort`

**Created**: 2026-09-26

**Status**: **In progress — implementing (spec-driven).**

**Input**: `ChatsPage` (chat-list feature) + `PrefsStore` (F-027) + backlog "chat-list
search/sort" + `specs/028-chats-search-sort/research.md`

---

## Summary

F-028 makes the Chats tab (and only it) live-browsable: a **search bar** filters the
conversation list by contact name or preview text, and a compact **sort segment** (Recent /
Name / Unread) re-orders it. The sort choice persists via `PrefsStore` (envelope v2). Searching
or editing a chat navigates into the thread as usual; the standard empty/"No chats found"
states render for zero results.

## Functional Requirements

- **FR-001** `PrefsStore` v2: `chatSort` signal (`'recent' | 'name' | 'unread'`, default
  `'recent'`), `setChatSort(value)` persisted; `reset()` restores default; `hydrate` accepts v2
  and tolerates v1 (prefs only) snapshots.
- **FR-002** Chats tab (non-editing) renders a search input (`data-testid="chat-search"`,
  placeholder "Search") + clear button when non-empty, above the list.
- **FR-003** Search matches `contactName` or `preview`, case-insensitive, trimmed.
- **FR-004** Sort segment (`data-testid="chat-sort"`, Recent/Name/Unread) re-orders the list;
  Recent = store order; Name = case-insensitive alphabetical; Unread = unread first, store order
  within a group.
- **FR-005** Filtered/no-match → `search-empty` ("No chats found"); no conversations at all →
  existing `empty-state` ("No chats"). Search/sort controlled by the page; store data never
  mutated by search/sort.
- **FR-006** Search/sort hidden in edit mode and on other tabs; FAB/tab bar unchanged.
- **FR-007** Sort preference survives reload (persisted).

## Non-Goals

- Archived row / broadcast lists filtering; search of message text or files; sticky sort
  buttons; multi-select search shortcuts. The chats golden (`0-8855`) is a **G1 re-capture**:
  the new search/sort chrome shifts the list surface (e2e golden re-verified when capture
  unblocks and playwright is re-enabled).

## User Stories

- **US1 (find)**: I type in Search and the conversation list narrows instantly; clearing
  restores everything.
- **US2 (order)**: I pick Name/Unread and the list re-orders; my choice sticks after reload.
- **US3 (enter)**: Tapping a filtered chat still opens that thread, marked read.

## Acceptance Criteria (validation targets)

1. Unit `prefs.store.spec.ts` (extend): chatSort default; setChatSort persists across reload;
   reset restores; v1 envelope hydrate accepted with default chatSort.
2. Unit `chats-page.spec.ts` (extend): search present + default Recent; typing filters rows by
   name/preview; clear restores; no-match shows "No chats found"; Name sort alphabetical; Unread
   sort unread-first; persisted sort reflected on creation.
3. E2E `tests/e2e/search-sort.spec.ts` (authored, runs paused): search narrows; clear restores;
   filtered chat opens; sort Name alphabetical; sort persists across reload.
4. Build green + unit green (playwright paused).

## Explicit deviations (documented drift)

1. Search/sort chrome is map-external (F-001 specs have no search/sort row): provisional
  layout, marker hypothesis; the chats golden needs re-capture when Figma/playwright unblock.
2. "Recent" keeps store/insertion order (no timestamp-based re-sort): stable with the seeded
  recency order and new-message in-place updates.
3. Search is per-page state (not persisted); only the sort choice persists.

## Caveat (deliberately incomplete until G1)

Exact search-bar height/positioning and sort segment metric from Figma chats row `0:8855` —
deferred to capture; coarse golden guard (`maxDiffPixelRatio 0.3`) may absorb provisional
chrome only when e2e resumes.