# Tasks: Shared Groups (feature 048)

**Spec**: [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md)

**Total**: 9 implementation tasks · 3 capture-gated tasks (T010–T012)

## Implementation

- [ ] **T001** - `ChatStore.contactGroups(chatId)`: filter conversations to
      `kind === 'group' && participantIds.includes(chatId)`, returning `readonly ChatPreview[]`.
      **Tests first** in `chat.store.spec.ts`:
  - returns a group that contains the contact
  - excludes a group that does not contain the contact
  - **excludes a broadcast containing the contact** (FR-003 — the one regression nothing in the
        running app could catch, since F-042 ships `createBroadcast` with no UI caller)
  - excludes direct conversations
  - returns `[]` for an unknown id
  - does not mutate `conversations()` and does not persist
  - returns the store's conversation order

- [ ] **T002** - Route `contact/:id/groups` → `GroupsPage`, placed after `contact/:id/media` and
      before `contact/:id/edit`.

- [ ] **T003** - `groups-page.ts` / `.html` / `.scss`: read the `id` param, expose `groups` from
      `contactGroups()`, single `back` leading action rendering `/contact/:id`, empty state in a
      `role="status"` region, rows fed to the unmodified `chat-list-item`, OnPush, tokens only.

- [ ] **T004** - `groups-page.spec.ts`: **tests first**, asserting
  - one row per shared group, named by the group name
  - the empty state for a contact in no group, inside a `role="status"` region
  - the nav title is `Groups`
  - `Back` returns to `/contact/:id`
  - activating a row navigates to `/chat/<groupId>`
  - an unknown id shows the empty state rather than throwing
  - no horizontal overflow at 320px
  - the preview text is gated by `showPreviews` (inherited from `chat-list-item` / F-046 FR-006)

- [ ] **T005** - Wire `ContactPage.onRowActivate`: `contact-groups` → `/contact/:id/groups`, and
      **delete the now-false comment** asserting the row stays inert. `contact-page.spec.ts`: the
      `Groups` row routes to `/contact/:id/groups`, replacing F-044's "stays a no-op" assertion.

- [ ] **T006** - `tests/e2e/contact-groups.spec.ts` — contact → `Groups` → empty state; then, after
      creating a group including that contact via New Group, the group appears and opens its chat;
      `Back` returns to the contact. **Authored, not run** (Playwright paused, owner directive
      2026-09-26).

- [ ] **T007** - G2: `npm run build` green, then the **full** unit suite green with the exact count
      reported.

- [ ] **T008** - `/speckit.analyze` pass; resolve any contradiction rather than editing silently.

- [ ] **T009** - `/speckit.checklist` per FR with named test evidence; `/speckit.converge`.

## Capture - BLOCKED (Figma 429, reset 2026-10-02 18:38 UTC)

- [ ] T010 - Confirm from a capture whether a shared-Groups screen exists in the file at all, and
      record its node id (or record that there is none) in `research.md`
- [ ] T011 - Reconcile the nav title, the row treatment, the empty-state copy, the absence of a
      member-count subtitle and the ordering; replace the hypotheses in `spec.md` if the design
      differs
- [ ] T012 - Golden for the populated and empty Groups screens (blocked twice over: capture +
      Playwright pause)

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per owner directive
```

## Notes

- `[ ]` T010–T012 are capture-gated and stay open until the quota resets.
- The store gains **one pure accessor and nothing else** — no field, no seed, no snapshot change. It
  reads `this.conversations()`, so it is signal-friendly and recomputes when a group is created.
- `kind === 'group'` is load-bearing, not decorative: `createBroadcast()` (`chat.store.ts:143`) also
  fills `participantIds`, so a membership-only filter would report broadcasts as groups.
- All nine seeded contacts show the empty state on first run. This is the owner's explicit decision
  (derive, do not seed), not a defect and not an oversight.
- The row tap navigates to a chat that genuinely exists — the deliberate difference from F-044's
  media tiles, which are an observable no-op only because no viewer exists in this design.
- No shared component is edited. Adding a member-count variant to `chat-list-item` for a provisional
  screen is deferred, not forgotten.

## FR → test traceability

Filled in at closure with the exact suite count and named tests.

| FR | Test |
|----|------|
| FR-001 | T005 |
| FR-002 | T001 |
| FR-003 | T001 |
| FR-004 | T001 |
| FR-005 | T004 |
| FR-006 | T004 |
| FR-007 | T004 |
| FR-008 | T004 |
| FR-009 | T004 |
| FR-010 | T001, T004 |
| FR-011 | T004 |
| FR-012 | T004 |

## Analysis pass (the `/speckit.analyze` gate)

Run at closure; results appended here.

## Closure (G3)

Appended at closure.