# Design Research: WhatsApp Calls — persisted call log and live row activation

**Source**: gap audit ("Also worth fixing": `Clear` is the F-032 bug class) + tier-A row wiring.

## Research summary

- `CallsPage` keeps `items` in a local signal synced from a `calls` input by an `effect`. Every
  mutation (`clear`, edit-mode `remove`) is therefore lost on reload — the exact defect F-032 fixed
  in the chat list. The fix is a store, not another local signal.
- Store shape mirrors `chat.store.ts` (the repo's established persistence pattern): the same
  `readStorage`/`writeStorage` best-effort helpers, a `PERSISTENCE_KEY`, a `STORE_VERSION` guard and
  hydrate-in-constructor. A dedicated `CallStore` is used rather than extending `PrefsStore`,
  because `PrefsStore` is boolean toggles + sort, while the call log is a list of entries.
- Persisting the *list* (not removed ids) makes an empty log a first-class persisted state, so a
  cleared log stays cleared — the bug the audit flagged.
- `CallsPage.calls` is an `input()`, so the router must be passing `CALL_SEED` explicitly. Dropping
  the input removes the duplicate seed path; the store seeds it once. Checked: no other page binds
  `[calls]`, so the change is local.
- Row activation: WhatsApp opens the chat for the contact when a call-log entry is tapped. The call
  entry's `id` (`call-001`) is a log id, not a chat id, so the store resolves a conversation by
  `contactName` and the page navigates to that chat's id. When no conversation matches, the honest
  behaviour is to stay put rather than fabricate a chat.
- The info button and `New call` need surfaces the design map does not contain (tier B6), so they
  stay inert; the audit carries them forward.
- Golden safety: the first run hydrates the identical 12 seeded entries, so `0-8649-calls` and the
  edit-mode goldens are unchanged.

## Canonical artifacts

The plan and the task list that used to live in this file now live in the canonical
Speckit artifacts for this feature:

- `plan.md` - approach, phases, review gates, drift policy
- `tasks.md` - the delivery checklist (this file keeps the research record only)