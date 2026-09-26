# Design Research + Plan + Tasks + Quickstart: Contact Info — live wiring (feature 026)

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

## Plan

1. `ChatPreview.phone?` + `ChatStore` `updateContact` / `contactName` / `contactPhone`.
2. `ContactPage`: store name; Messages → open+route; Starred row → route.
3. `EditContactPage`: store-prefilled drafts; Save → `updateContact` + back.
4. Unit updates; e2e authored (paused); build + unit validation.
5. Drift notes (015, 019); commits (spec → feat → test).

**Gates**: G1 no-op (no new Figma data needed); G2 build/unit green + e2e authored (runs
paused); G3 close + drift notes.

## Tasks

- [x] T001 — Spec set `specs/026-contact-info/` (this set)
- [x] T002 — `ChatPreview.phone?` + store `updateContact`/`contactName`/`contactPhone`
- [x] T003 — `ContactPage` store wiring + Messages + Starred row
- [x] T004 — `EditContactPage` save → store + back
- [x] T005 — Unit updates; e2e authored
- [x] T006 — build green + unit green
- [x] T007 — 015/019 drift notes + commits

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per owner directive
```