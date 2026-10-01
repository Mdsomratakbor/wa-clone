# Tasks: Shared Groups (feature 048)

**Spec**: [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md)

**Total**: 9 implementation tasks · 3 capture-gated tasks (T010–T012)

## Implementation

- [x] **T001** - `ChatStore.contactGroups(chatId)`: filter conversations to
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

- [x] **T002** - Route `contact/:id/groups` → `GroupsPage`, placed after `contact/:id/media` and
      before `contact/:id/edit`.

- [x] **T003** - `groups-page.ts` / `.html` / `.scss`: read the `id` param, expose `groups` from
      `contactGroups()`, single `back` leading action rendering `/contact/:id`, empty state in a
      `role="status"` region, rows fed to the unmodified `chat-list-item`, OnPush, tokens only.

- [x] **T004** - `groups-page.spec.ts`: **tests first**, asserting
  - one row per shared group, named by the group name
  - the empty state for a contact in no group, inside a `role="status"` region
  - the nav title is `Groups`
  - `Back` returns to `/contact/:id`
  - activating a row navigates to `/chat/<groupId>`
  - an unknown id shows the empty state rather than throwing
  - no horizontal overflow at 320px
  - the preview text is gated by `showPreviews` (inherited from `chat-list-item` / F-046 FR-006)

- [x] **T005** - Wire `ContactPage.onRowActivate`: `contact-groups` → `/contact/:id/groups`, and
      **delete the now-false comment** asserting the row stays inert. `contact-page.spec.ts`: the
      `Groups` row routes to `/contact/:id/groups`, replacing F-044's "stays a no-op" assertion.

- [x] **T006** - `tests/e2e/contact-groups.spec.ts` — contact → `Groups` → empty state; then, after
      creating a group including that contact via New Group, the group appears and opens its chat;
      `Back` returns to the contact. **Authored, not run** (Playwright paused, owner directive
      2026-09-26).

- [x] **T007** - G2: `npm run build` green, then the **full** unit suite green with the exact count
      reported.

- [x] **T008** - `/speckit.analyze` pass; resolve any contradiction rather than editing silently.

- [x] **T009** - `/speckit.checklist` per FR with named test evidence; `/speckit.converge`.

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

Unit suite: **635/635** (620 baseline + 4 `chat.store.spec.ts` + 11 `groups-page.spec.ts`; the
`contact-page.spec.ts` deferral test was re-titled in place, not added). Build green. All names in
`GroupsPage` unless stated.

| FR | Test |
|----|------|
| FR-001 | `contact-page.spec.ts` → 'the Groups row routes to /contact/:id/groups (F-048 FR-001)' |
| FR-002 | store: 'contactGroups lists only the groups a contact belongs to (F-048 FR-002)' |
| FR-003 | store: 'contactGroups excludes a broadcast containing the contact (F-048 FR-003)' |
| FR-004 | store: 'contactGroups is read-only and returns the store conversation order (F-048 FR-004)' |
| FR-005 | 'lists one row per shared group, named by the group (FR-005)', 'the row preview is gated by showPreviews, inherited from chat-list-item (FR-005)' |
| FR-006 | 'shows the empty state in a live region for a contact in no group (FR-006)' |
| FR-007 | 'activating a row opens the group chat (FR-007)', 'a row can be opened by keyboard, not only by mouse (FR-007, FR-009)' |
| FR-008 | 'Back returns to the contact (FR-008)' |
| FR-009 | 'the nav title is Groups (FR-009)', 'a row is keyboard reachable and labelled with the group name (FR-009)' |
| FR-010 | 'shows the empty state for an unknown contact id rather than throwing (FR-010)' |
| FR-011 | 'does not overflow horizontally (FR-011)' |
| FR-012 | 'shows the empty state in a live region for a contact in no group (FR-006)' — no create/add/leave control is asserted to exist |

Two extras beyond the FRs, both recorded deliberately: the `showPreviews` gating test, because
`GroupsPage` hosts a component that reads `PrefsStore` but does not own it; and the
`data-font-scale` test, for the same reason.

## Analysis pass (the `/speckit.analyze` gate, run at closure)

One divergence between spec and shipped code, recorded rather than fixed silently:

- **The font scale was missing from the spec.** Implementation revealed that `chat-list-item` does
  not read the font scale itself — every screen that hosts it applies `data-font-scale`
  (`chats-page`, `broadcasts-page`, per F-041). Without it, the font size setting would be silently
  inert on the Groups screen, which is a new instance of exactly the defect class F-046 exists to
  kill. `GroupsPage` therefore applies it, with a test. This is recorded as an addition, not a
  silent one: `spec.md` FR-005 and `plan.md` are annotated below rather than rewritten.

Two spec claims were confirmed against the code rather than assumed:

- FR-012's "no create control" needed no negative code, because no template element for one exists;
  the assertion is the empty-state test plus the absence of any such control.
- The `role="status"` requirement in FR-006 matches the `broadcasts-page` precedent, so the empty
  state is consistent with the other two list screens.

No unresolved contradictions remain across spec, plan, tasks and code.

### Amendments applied

- `plan.md` §Files and §Page: noted that the page injects `PrefsStore` for `data-font-scale`.
- `spec.md` FR-005: annotated that hosting `chat-list-item` implies honouring the font scale.

## Closure (G3)

- `spec.md` status → Implemented; 635/635 unit, build green.
- Drift notes appended to `specs/015-contact-info/spec.md` and `specs/044-media-screen/spec.md`.
- `specs/design-gap-audit.md` B8 closed + a 2026-10-01 changelog entry; `figma/design-map.md` row 15
  updated; `specs/046-inert-control-sweep/disposition.md` `contact-groups` marked resolved.
- `tests/e2e/contact-groups.spec.ts` authored (6 specs), **not run** per the Playwright pause.
  `tests/e2e/media.spec.ts` lost its now-false "Groups row is still inert" test.
- Commits: `684b891` docs(spec) · `e3fc341` feat (store) · `aaa66cf` feat (page + route + wiring) ·
  `ebd22b3` test · `ba033a4` test (e2e) · closure docs.
- **Still blocked, not skipped**: G1. The sub-screen chrome is PROVISIONAL; no node ID is cited or
  invented for it. T010–T012 stay open until the Figma quota resets (**2026-10-02 18:38 UTC**).