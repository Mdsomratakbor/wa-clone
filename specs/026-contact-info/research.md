# Design Research: WhatsApp Contact Info — live wiring

**Source**: map-external behaviour slice (future work 2, item — completes F-015/F-019
non-goals). Reuses design chrome: Contact Info `0:10334`, Edit Contact `0:10659` (F-020 reuse),
Chats row `0:8115`, header `0:8257`.

## Research summary

- `ContactPage` name today comes from `CHAT_SEED` (static import); `Messages` is a no-op and
  rows are inert. `EditContactPage` Save is a no-op. Both should read/write `ChatStore` so the
  identity is a single source that F-024 persistence makes durable and that every surface
  (list, header, starred) already derives from.
- A `phone?: string` field on `ChatPreview` is additive (seed untouched → no golden impact)
  and gives Edit Contact a durable second field without inventing a full contacts model.

## Canonical artifacts

The plan and the task list that used to live in this file now live in the canonical
Speckit artifacts for this feature:

- `plan.md` - approach, phases, review gates, drift policy
- `tasks.md` - the delivery checklist (this file keeps the research record only)