# Design Research + Plan + Tasks + Quickstart: call log (feature 038)

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

## Plan

1. `core/call.store.ts` (new) + spec: `calls`, `removeCall`, `clearCalls`, persistence, `hasChat`-
   free (chat lookup stays in `ChatStore`).
2. `ChatStore`: add `chatIdForContactName(name)` (returns `string | null`).
3. `calls-page.ts`: read the store, drop the input/effect, `clear` → `clearCalls()`, remove →
   `removeCall()`, row activation → chat navigation.
4. Unit: new store spec + updated page spec. E2E updated (paused).
5. 004 drift note; build + unit green; commits (spec → feat → test).

**Gates**: G1 store + page; G2 build/unit green + e2e authored; G3 close + drift note.

## Tasks

- [x] T001 — Spec set `specs/038-call-log/`
- [x] T002 — `CallStore` + `ChatStore` contact lookup
- [x] T003 — `CallsPage` store wiring and row activation
- [x] T004 — Unit tests + authored e2e
- [x] T005 — 004 drift note; build + unit green
- [x] T006 — Commits

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per owner directive
```