# Implementation Plan: Shared Groups (feature 048)

**Spec**: [`spec.md`](./spec.md) · **Research**: [`research.md`](./research.md)

## Approach

Add one pure accessor to `ChatStore`, one pushed route, and one read-only page that composes
existing shared components. Nothing is persisted, no model field is added, no seed is added, and no
shared component is modified.

The derivation is deliberately the *whole* feature: `Groups` is inert today only because nothing
reads `participantIds` across conversations. Once `contactGroups()` exists, the row has honest data
to show.

### Files

| File | Change |
|---|---|
| `src/app/core/chat.store.ts` | +1 pure accessor `contactGroups(chatId)` |
| `src/app/core/chat.store.spec.ts` | +tests for the accessor |
| `src/app/app.routes.ts` | +1 route `contact/:id/groups` → `GroupsPage` |
| `src/app/features/contact-info/groups-page.ts` | new component |
| `src/app/features/contact-info/groups-page.html` | new template |
| `src/app/features/contact-info/groups-page.scss` | new styles (tokens only) |
| `src/app/features/contact-info/groups-page.spec.ts` | new page tests |
| `src/app/features/contact-info/contact-page.ts` | +1 branch in `onRowActivate`; replace the now-false inert comment |
| `tests/e2e/contact-groups.spec.ts` | new spec (authored, **not run**) |
| `figma/design-map.md` | row 15: `Groups` live as of F-048 |
| `specs/design-gap-audit.md` | B8 closed |

Not touched: every file in `shared/components/`, `contact-info.seed.ts`, `chat.model.ts`,
`chat-list.seed.ts`, and all persistence wiring from F-047.

### Derivation

```ts
contactGroups(chatId: string): readonly ChatPreview[] {
  return this.conversations().filter(
    (chat) => (chat.kind ?? 'direct') === 'group' && (chat.participantIds ?? []).includes(chatId),
  );
}
```

It is a `computed`-friendly signal read (`this.conversations()`), so it recomputes when groups are
created. It uses `chat.kind ?? 'direct'` rather than `conversationKind()` to avoid a second array
scan, and keeps the store's existing defensive `??` normalisation so a pre-`kind` snapshot degrades
to "no groups" instead of throwing — consistent with `hydrateDefaults`.

The `kind === 'group'` conjunct is load-bearing: `createBroadcast()` also fills `participantIds`
(`chat.store.ts:143`), so a membership-only filter would surface broadcasts as groups.

### Page

`GroupsPage` mirrors `MediaPage`'s shape exactly — `ActivatedRoute` param `id`, `NavigationBar` with
a single `back` leading action, OnPush, and an empty state in a `role="status"` region — and swaps
the grid for `chat-list-item` fed straight from the accessor.

`chat-list-item` emits `selected` with the whole `ChatPreview`, so activation navigates to
`/chat/<group.id>` with no mapping layer and no second lookup.

### Route

`contact/:id/groups`, placed immediately after `contact/:id/media` and before `contact/:id/edit` so
the contact sub-routes stay contiguous and reviewable.

## Ordering

1. Store accessor + its tests (the only logic; proves FR-002/003 before any UI exists).
2. Route.
3. Page + template + styles + page tests.
4. Wire `ContactPage` and delete the stale inert comment.
5. Drift notes, design map, gap audit.
6. G2 build + full suite, then checklist/converge and the closure commit.

Tests are written before the code they cover within each step, per the tasks gate.

## Risks

- **Shipped default is empty for all nine seeded contacts.** Accepted by owner decision. The
  mitigation is an explicit empty state, not seed data.
- **`chat-list-item` shows the last message preview, not a member count.** Real WhatsApp shows a
  member count here. Recorded as a non-goal so the difference is a decision on the record rather than
  an unnoticed mismatch; revisit when the capture gate clears.
- **Preview text is gated on `showPreviews` via `PrefsStore`,** so the Groups screen inherits F-046
  FR-006 behaviour for free. That is desired, but it means the page has a second injected dependency
  it does not own — covered by a test rather than assumed.
- **A broadcast regression would be invisible in the running app,** because F-042 ships
  `createBroadcast` with no UI caller and no seed. This is the single highest-value test in the
  feature and it is called out in `tasks.md`.
- **Stale participant ids** (contact removed) resolve to nothing via `resolveContactNames()`'s
  existing `Map` lookup; no new failure mode is introduced.

## Drift policy

| Superseded artifact | What it currently claims | Correction |
|---|---|---|
| `specs/015-contact-info/spec.md` | `Groups` row seeded but inert | Row is live since F-048; derivation is `contactGroups()` |
| `specs/044-media-screen/spec.md` | Non-Goal: "The `Groups` row (gap audit B8)" | Non-goal discharged by F-048; its "needs membership data" rationale is superseded by `research.md` |
| `specs/046-inert-control-sweep/disposition.md` | `contact-groups` listed inert/wired | Now wired; B8 closed |
| `specs/design-gap-audit.md` | B8 open | B8 closed by F-048 |
| `figma/design-map.md` row 15 | "`Groups` still inert" | `Groups` live since F-048 (provisional chrome) |

No earlier spec is edited except to add these drift notes. F-047 is untouched — this feature adds a
pure reader and changes no store construction.