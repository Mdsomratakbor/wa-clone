# Tasks: WhatsApp Broadcast Lists (broadcast kind + list screen) (feature 042)

**Input**: `specs/042-broadcast-lists/plan.md`, `specs/042-broadcast-lists/spec.md`,
`specs/042-broadcast-lists/research.md`, `specs/042-broadcast-lists/contracts/ui-contracts.md`

- **Gates**: G1 = capture BLOCKED (2026-09-28 `429`, reset 2026-10-02 18:38 UTC) - screen chrome,
  nav title, empty copy and row treatment are PROVISIONAL; G2 = build + unit green, e2e authored,
  no overflow; G3 = close + drift notes (001, 003, 032, 040).
- **Tests**: `npx ng test --watch=false --reporters=progress` green before each commit; output goes
  to `logs/` (gitignored). Playwright specs are authored but **not executed** (paused by owner
  directive 2026-09-26).

## Implementation

- [x] T001 - `spec.md` + `research.md` + `plan.md` + `tasks.md` + `contracts/ui-contracts.md`
- [x] T002 - Scope decisions recorded (list + entry only; hidden from Chats; no seed) after the
      owner dismissed the clarify prompt with "continue"
- [x] T003 - `chat.model.ts`: `ChatKind` += `'broadcast'` (FR-001)
- [x] T004 - `chat.store.ts`: `createBroadcast()` with the blank-name guard and `broadcast-<n>`
      ids (FR-002, FR-002a), `broadcastRecipients()` (FR-002b), `broadcasts()` (FR-004)
- [x] T005 - `chat.store.ts`: exclude `broadcast` from the Chats list and from
      `contactConversations()` (FR-003, FR-010)
- [x] T006 - `broadcasts-page.{ts,html,scss}`: nav bar, `role="status"` empty state, `ChatListItem`
      rows (FR-005, FR-006, FR-007, FR-011)
- [x] T007 - `app.routes.ts` lazy route + `chats-page.ts` nav wiring (FR-005, FR-008)
- [x] T008 - Unit tests: store create/throw/persist/recipients/unknown-ids/filters/v1-snapshot
      normalization, page empty state/rows/activation/Back/no tab bar (all FRs)
- [x] T009 - e2e spec authored (not run): nav entry, chrome, empty state, seeded-via-store row
- [x] T010 - Drift notes in 001, 003, 032, 040; G1 capture tasks left open; build + unit green;
      commits

## Capture - BLOCKED (Figma 429, reset 2026-10-02 18:38 UTC)

- [ ] T011 - Confirm from a capture whether a broadcast screen exists in the file at all, and
      record its node id (or record that there is none) in `research.md`
- [ ] T012 - Reconcile the provisional nav title, empty-state copy and row treatment; replace the
      hypotheses in `spec.md` and the ui contract if the design differs
- [ ] T013 - Golden for `/broadcasts` empty + populated states (blocked twice over: capture +
      Playwright pause)

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per owner directive
```

## Notes

- `[ ]` items are capture-gated and stay open until the quota resets.
- `createBroadcast()` ships **without a UI caller** on purpose (Non-Goals); the create flow is a
  later feature and must not be smuggled in here.
- `normalizeChats()` and snapshot version `1` are deliberately untouched, so F-040 and earlier
  snapshots keep hydrating.
- `broadcasts()` is not archived-filtered: `archived` is a Chats-list concept and a broadcast is
  never in that list.
