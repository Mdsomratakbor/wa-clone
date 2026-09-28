# Feature Specification: WhatsApp Calls — persisted call log and live row activation

**Feature Branch**: `038-call-log`

**Created**: 2026-09-27

**Status**: **In progress — implementing (spec-driven).**

**Input**: `CallsPage` (spec 004/005) + `specs/design-gap-audit.md` ("Also worth fixing") +
`specs/038-call-log/research.md`

---

## Summary

The Calls screen is the F-032 bug class waiting to happen: `Clear` and edit-mode removal mutate a
local signal that is re-seeded from `CALL_SEED`, so a reload resurrects the whole call log. Rows are
also inert — tapping a call entry does nothing, even when a chat with that contact exists. F-038
moves the call log into a `CallStore` (persisted like the chat store) and makes row activation open
the matching chat.

## Functional Requirements

- **FR-001** `CallStore` owns the call log: `calls()` seeded from `CALL_SEED`, persisted under
  `wa.call-store.v1` (snapshot version `1`).
- **FR-002** `removeCall(id)` and `clearCalls()` mutate the store and persist; after a reload the
  cleared/removed entries stay gone.
- **FR-003** `CallsPage` renders the store's list (its `calls` input is dropped, so there is a single
  source of truth) and keeps the seeded order.
- **FR-004** The nav `Clear` action clears the log and keeps the disabled-when-empty contract; the
  existing empty state (`data-testid="empty-state"`) appears when the log is empty.
- **FR-005** Edit-mode removal persists like `clearCalls()`.
- **FR-006** Tapping a call row (not in edit mode) opens the chat with the same contact name
  (`/chat/:id`) when such a conversation exists; the call-log id is not used as a chat id.
- **FR-007** With no matching conversation, row activation is a no-op (no chat is invented).
- **FR-008** Row activation is ignored in edit mode; the info button and remove button keep their
  existing `stopPropagation` behaviour.
- **FR-009** `New call` and the call-info button stay no-ops (they need a call surface — audit tier
  B6), and the audit records that.
- **FR-010** Seeded renders are unchanged: the first run hydrates the same 12 entries in the same
  order, so `0-8649-calls` and the edit-mode goldens do not move.

## Non-Goals

- A call screen, in-call UI, or a call-info sheet (tier B6).

> **Drift note (F-043, 2026-09-28)**: The first Non-Goal is now split. The **call-info sheet is
> built** (`specs/043-call-info/spec.md`): it reuses `app-action-sheet`, shows Message / Voice call /
> Video call / Delete, and its `Delete` calls this feature's `removeCall()`, so the persistence
> guarantees here cover the sheet's delete path unchanged. Still not built: the **call screen and
> in-call UI** — which is why `+ new call` and the sheet's two call actions stay inert. The second
> and third Non-Goals here are unchanged.
- Adding call entries (no new-call flow), call durations, or avatars.
- Grouping the log by contact (the design's flat list is kept).

## User Stories

- **US1**: I clear the call log in edit mode and it stays cleared after a reload.
- **US2**: I tap a call entry for a contact I have a chat with and land in that chat.

## Acceptance Criteria (validation targets)

1. Unit `call.store.spec.ts` (new): seed, `removeCall`, `clearCalls`, persistence round-trip, an
   empty persisted list, version guard.
2. Unit `calls-page.spec.ts` (update): list from the store, `Clear` empties + persists, edit removal
   persists, row activation navigates to a matching chat, no-match is a no-op, edit mode ignores
   activation, `New call` stays inert.
3. E2E `tests/e2e/calls.spec.ts` (update): clear survives a reload; row opens the chat.
4. Build green + full unit suite green (playwright paused).

## Explicit deviations (documented drift)

1. `CallsPage.calls` input and its `effect` are removed in favour of the store (drift note in
   `specs/004-calls`).
2. The call-info button and `New call` remain no-ops (recorded in the audit as B6, not a drift).
