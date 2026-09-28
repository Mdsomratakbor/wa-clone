# Design Research: WhatsApp Chats — search + sort

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

## Canonical artifacts

The plan and the task list that used to live in this file now live in the canonical
Speckit artifacts for this feature:

- `plan.md` - approach, phases, review gates, drift policy
- `tasks.md` - the delivery checklist (this file keeps the research record only)