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
- Snapshot version stays `1` and `normalizeChats()` is untouched. Hydration gained a separate
  `hydrateDefaults()` — the v1-snapshot test exposed that `hydrate()` set conversations raw, so a
  pre-F-040 snapshot came back with `kind === undefined`. `normalizeChats()` could not be reused
  there because it forces `read`/`muted`/`archived` false, which would wipe user state on every
  reload. The hydrate fix rides in the `test(042)` commit with a regression test for both halves.
- `broadcasts()` is not archived-filtered: `archived` is a Chats-list concept and a broadcast is
  never in that list.

## Closure - FR to test traceability

| FR | Test |
|----|------|
| FR-001 | `a v1 snapshot hydrates with no broadcast and keeps every other chat` |
| FR-002 | `createBroadcast makes a broadcast with recipients and an empty thread`, `a created broadcast persists across a reload` |
| FR-002a | `createBroadcast refuses a blank name` |
| FR-002b | `broadcastRecipients resolves current names and drops deleted contacts`, `broadcastRecipients is empty for an unknown chat` |
| FR-003 | `a broadcast is excluded from the Chats list, direct and group chats are not`, `a broadcast does not appear in the Chats list` (ChatsPage) |
| FR-004 | `broadcasts lists only broadcasts, in insertion order` |
| FR-005 | `renders the header: Back leading, Broadcast lists title`, `does not render the tab bar`, `navigates to /chats when Back is activated` |
| FR-006 | `renders one ChatListItem row per broadcast`, `shows the empty state when there are no broadcasts`, `follows a broadcast created after render` |
| FR-007 | `opening a row marks the broadcast read and navigates to the chat` |
| FR-008 | `Broadcast Lists opens the broadcast screen` (ChatsPage) |
| FR-009 | `the broadcast name is shown as the conversation title` |
| FR-010 | `broadcasts are excluded from contactConversations` |
| FR-011 | `carries the stored font scale` |
| FR-012 | `shows the empty state when there are no broadcasts` (empty case), `does not render direct or group chats` |
| regression | `the Chats list still hides archived chats`, `createBroadcast trims the name, allows no recipients and cannot collide`, `broadcast ids continue the shared counter without colliding with groups` |

**Result**: `npm run build` green; unit **440/440** (baseline 417, +23). E2E authored, not run.
Commits: `7f4986e` docs, `94a0603` feat, `a73beed` test.
