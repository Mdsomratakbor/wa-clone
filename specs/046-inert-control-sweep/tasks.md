# Tasks: Inert Control Sweep (F-046)

**Input**: `specs/046-inert-control-sweep/spec.md`, `plan.md`, `research.md`
**Prerequisites**: `plan.md` complete, all three clarifications answered and written back

**Gate legend**: G1 Figma · G2 build + full unit green · G3 closure + disposition table · G4 no
control swallows activation silently

**Ordering**: T1 enables T4–T6 (it adds the `disabled` capability the sheets need). T2–T3 and T7–T9
are independent of each other and of T1. T10 is the closure gate and depends on all of the above.

---

## Phase 1: Enabling change

- [x] **T1** `Action.disabled?: boolean` + native `[disabled]` on `ActionSheet` rows
  - **Spec**: FR-001/002/003 (enabling prerequisite), `plan.md` "The three honest files"
  - **Files**: `src/app/shared/components/action-sheet/action-sheet.model.ts`,
    `action-sheet.html`, `action-sheet.scss`
  - **Do**: add the optional field; bind `[disabled]="item.disabled"` on
    `action-sheet.html:23-30`'s row button; add `action-sheet__row--disabled` on the `<li>` and a
    token-only style for it. Do **not** add a runtime guard in `onAction` — a natively disabled
    button cannot fire a click, and the platform's guard is the accessible one.
  - **Tests**: a disabled row renders `<button disabled>` and does not emit `action` when clicked;
    an enabled row still emits.
  - **Verify**: `npm run build`; suite green.
  - **Commit**: `feat` — one shared-component change, its own commit because three features depend on it.

## Phase 2: The three silent no-ops

- [x] **T2** FR-001 — chat-actions `Wallpaper` honestly disabled, sheet never left open
  - **Spec**: FR-001
  - **Files**: `src/app/features/chat-window/chat-actions.seed.ts`,
    `src/app/features/chat-window/chat-window-page.ts`
  - **Do**: `chat-wallpaper` gets `disabled: true`. `onChatAction` (`:132-141`) dismisses the sheet
    on any id it does not handle, adopting the `calls-page.ts:127-129` pattern and its comment.
  - **Tests**: tapping `Wallpaper` does not emit navigation and leaves no sheet open; `Mute` still
    toggles and keeps the sheet's existing behaviour; `More` still opens the second sheet.
  - **Verify**: build; suite green.
  - **Commit**: `feat`.

- [x] **T3** FR-002 / FR-003 — add-modal `New community` and settings `More` honestly disabled
  - **Spec**: FR-002, FR-003
  - **Files**: `src/app/features/new-chat-modal/new-chat-modal.seed.ts`,
    `src/app/features/chat-list/chats-page.ts`,
    `src/app/features/settings/settings.seed.ts`,
    `src/app/features/settings/settings-page.ts`
  - **Do**: `new-community` and `settings-more` get `disabled: true`; both handlers
    (`chats-page.ts:194-208`, `settings-page.ts:119-133`) dismiss their sheet on unhandled ids.
  - **Tests**: each disabled row is inert **and** leaves no sheet open; the sibling rows
    (`new-group`, `new-contact`, `settings-notifications`, `settings-storage`) still navigate
    unchanged — the F-040 and F-029 behaviour must not regress.
  - **Verify**: build; suite green.
  - **Commit**: `feat`.

## Phase 3: The composer

- [x] **T4** FR-004 — four composer controls wired or honestly disabled
  - **Spec**: FR-004
  - **Files**: `src/app/shared/components/composer/composer.ts`, `composer.html`
  - **Do**: `Camera` (`:28`) navigates to `/camera` — the route exists at `app.routes.ts:36` and the
    screen is already reachable from the tab bar, so this is real navigation, not a stub. The other
    three (`Add attachment` `:2`, `Emoji stickers` `:18`, `Record audio` `:49`) get native `disabled`.
    Keep them rendered; hiding them would change the design-verified row 2 layout.
  - **Tests**: `Camera` navigates to `/camera`. Each of the other three is `<button disabled>` and
    emits nothing. Assert via the rendered attribute, not by calling a private method.
  - **Verify**: build; suite green.
  - **Commit**: `feat`.

## Phase 4: The prefs

- [x] **T5** FR-006 — `showPreviews` wired to chat-list preview visibility
  - **Spec**: FR-006
  - **Files**: `src/app/features/chat-list/chats-page.ts`, `chats-page.html`, chat-list item template
  - **Do**: gate the preview line on `prefs().showPreviews`. This is the only pref whose label
    ("Show message previews") matches a behaviour we can actually deliver today.
  - **Tests**: with `showPreviews` false the chat list shows no preview text and still shows
    contact names and timestamps; with it true the previews return. Assert the visible difference.
  - **Verify**: build; suite green.
  - **Commit**: `feat`.

- [x] **T6** FR-006 — the 5 consumer-less prefs disabled, then removed from the store
  - **Spec**: FR-006
  - **Files**: `src/app/core/prefs.store.ts`,
    `src/app/features/settings/chats-settings-page.ts`,
    `src/app/features/settings/notifications-page.ts`
  - **Do**: disable the rows for `sound`, `vibrate`, `popup`, `light`, `mediaVisibility` first, then
    delete those keys from `PrefsKey`, `DEFAULT_PREFS` and `TOGGLE_PREFS`. Order matters: disabling
    before deleting means no live toggle is ever left pointing at a removed key.
  - **Do not** bump `PREFS_VERSION`. `hydrate()` merges `{ ...DEFAULT_PREFS, ...envelope.prefs }`
    (`prefs.store.ts:157`), so a persisted snapshot carrying the removed keys normalizes away.
  - **Tests**: hydrating a v4 snapshot that still contains the removed keys yields the defaults and
    does not throw; `showPreviews` and `enterKeySends` survive a reload unchanged; the disabled rows
    emit nothing.
  - **Verify**: build; suite green.
  - **Commit**: `feat`.

## Phase 5: Dead store methods, the filter, and Notifications

- [x] **T7** FR-007 — remove the 2 genuinely dead `ChatStore` methods, keep `createBroadcast`
  - **Spec**: FR-007 (as corrected by Clarification 4), research.md §3a
  - **Files**: `src/app/core/chat.store.ts`, `src/app/core/chat.store.spec.ts`,
    `src/app/features/chat-list/chats-page.spec.ts`
  - **Do**: delete `broadcastRecipients` (a byte-identical duplicate of `groupParticipants`) and
    `setConversations` (a test seam masquerading as public API). **Keep** `createBroadcast` — it is
    F-042 FR-002's mandated capability, the only way to put a broadcast in the store, and 15 test
    call sites depend on it. The missing *UI* caller is recorded in `disposition.md` as the B3
    create-form gap.
  - **Tests**: repoint the two `broadcastRecipients` assertions at `groupParticipants` — the
    behaviour is real, only the duplicate name is gone. Replace `setConversations([])` in
    `chats-page.spec.ts` with the public `deleteConversation` loop, which exercises real store code
    rather than reaching past it. Delete `setConversations overrides the list` outright: its subject
    no longer exists, which is not the FR-010 case (that rule covers tests pinning *inertness*).
  - **Verify**: build; suite green; no non-spec caller remains for the two deleted methods.
  - **Commit**: `feat`.

- [x] **T8** FR-008 — the Calls `All` / `Missed` filter actually filters
  - **Spec**: FR-008, Clarification 5, research.md §5a
  - **Files**: `calls-page.ts`, `calls-page.html`, `calls-page.spec.ts`, `calls.model.ts`,
    `../../shared/components/call-list-item/call-list-item.spec.ts`
  - **Do**: remove the literal `disabled` from both buttons; add a `filter` signal
    (`'all' | 'missed'`) and derive `items` from it. **Do not persist the filter** — F-046 has no
    persistence scope, so the original "the filter survives a reload" line was wrong and is not
    implemented. Fix `isMissedCall` to consult `outcome` first, falling back to `direction`
    (Clarification 5). Unknown filter id falls back to `all`. `Clear` keys off the unfiltered log,
    so it stays available from an empty filtered slice instead of offering to wipe calls the user is
    not currently looking at.
  - **Tests**: rewrite the two tests asserting `disabled === true` (spec:42, spec:119) to assert the
    pills are enabled and track `aria-pressed`. New: All default; Missed narrows; All restores;
    **a call this app placed that was never answered appears under Missed**; an answered one does
    not; an empty filtered slice shows the empty state; unknown id falls back. Add a
    `call-list-item` guard for outcome-driven missed styling.
  - **Verify**: revert `isMissedCall` and confirm exactly the 2 outcome tests fail, then restore.
    Build; suite green.
  - **Commit**: `feat`.

- [x] **T9** FR-011 — remove Notifications' unreachable handler and dead `<button>` branch
  - **Spec**: FR-011 (owner clarification 3)
  - **Files**: `src/app/features/settings/notifications-page.ts`, `notifications-page.html`,
    `notifications-page.spec.ts`
  - **Do**: delete `onRowActivate` (`:51-53`) and the `@else` `<button>` block
    (`notifications-page.html:25-38`). Toggles are confirmed intended. Replace the vacuous
    `notifications-page.spec.ts:56` "row activation is a no-op" test — it clicked a `<div>` wrapper
    and never exercised the handler it was named after — with tests of the toggle behaviour that
    actually ships, merged with T6's expectations.
  - **Tests**: each of the 5 rows renders an `app-toggle`; toggling `Show previews` changes the
    chat-list preview (the T5 behaviour, asserted from the Notifications screen as the entry point);
    no `<button data-testid="notifications-row">` remains.
  - **Verify**: build; suite green.
  - **Commit**: `feat`.

## Phase 6: Closure

- [x] **T10** FR-005 / FR-009 / FR-010 — disposition table, the 11 deferred settings rows, drift notes, closure
  - **Spec**: FR-005, FR-009, FR-010, G3, G4
  - **Files**: **new** `specs/046-inert-control-sweep/disposition.md`; drift notes in all eight
    superseded artifacts listed in `plan.md` "Drift Policy"
  - **Do**:
    1. Write the FR-009 table — every control the audit found, each with
       wired / honestly disabled / removed / deferred **and a named destination feature**. Every
       `// F-009: … later feature` comment in the codebase must resolve to a row.
    2. **FR-005, explicitly**: record all 11 settings rows — the 4 Account rows
       (`security`, `two-step-verification`, `change-number`, `delete-account`) and the 7
       Data-and-storage rows (`ds-storage-usage`, `ds-auto-download`, `ds-images`, `ds-audio`,
       `ds-videos`, `ds-documents`, `ds-network-usage`) — as **deferred**, each naming its
       destination feature. This is the third option FR-005 permits, and it is the one the owner's
       Clarification 2 chose. These rows are **not** disabled in code by this feature; that is a
       deliberate scope decision, not an oversight, and the table must say so.
    3. Rewrite the four tests that pin the old inertness:
       `contact-page.spec.ts:114`, `chats-settings-page.spec.ts:57`, `font-size-page.spec.ts:137`,
       `notifications-page.spec.ts:56` (the last handled in T9). **Rewrite, never delete** (FR-010).
       Note: `font-size-page.spec.ts:137` guards F-041's FR-007, which remains true — only its
       sibling rows change.
  - **Tests**: none new; this task is verification and record.
  - **Verify**: `npm run build`; **full** suite green with the exact count reported; G4 re-read
    against `research.md` §7 to confirm nothing **in this feature's disposition set** still swallows
    activation. The ~20 empty-handler rows are expected to remain inert (owner Clarification 2) —
    G4 does not cover them, and `disposition.md` is what tracks them.
  - **Commit**: `test` for the spec rewrites, then `docs(spec)` for the closure — split per
    `AGENTS.md` §2 cadence.

## Closure: FR → test traceability

Every FR has at least one named assertion. "Vacuous" means the test named in the spec has been
rewritten to a stronger form; each is called out rather than quietly replaced.

| FR | Requirement | Test(s) |
| -- | ----------- | ------- |
| FR-001 | `Wallpaper` honestly disabled; unknown chat action dismisses | `chat-window-page.spec.ts` "F-046 FR-001: the Wallpaper row is honestly disabled, not a silent no-op" + "F-046 FR-001: an unknown chat action dismisses the sheet" |
| FR-002 | `New community` honestly disabled; unknown add-modal action dismisses | `chats-page.spec.ts` "F-046 FR-002: New community is honestly disabled, not a silent no-op" + unknown-id dismissal test |
| FR-003 | Settings `More` honestly disabled; unknown action dismisses | `settings-page.spec.ts` "F-046 FR-003: the More row is honestly disabled, not a silent no-op" + unknown-id dismissal test |
| FR-004 | Composer: `Camera` wired, other 3 disabled | `composer.spec.ts` "F-046 FR-004: Camera navigates and the other three controls are honestly disabled" |
| FR-005 | 11 Account/Data-storage rows recorded as deferred | `account-page.spec.ts` "Account rows are still inert: deferred to the Account & privacy feature (F-046 G4)"; `data-storage-page.spec.ts` "Data & storage rows are still inert: deferred to the storage feature (F-046 G4)"; plus `disposition.md` |
| FR-006 | `showPreviews` wired; 5 consumer-less prefs disabled + keys removed | `chat-list-item.spec.ts` "F-046 FR-006: showPreviews gates the preview text" (4 tests); `notifications-page.spec.ts` "F-046 FR-006: four rows have no consumer and are disabled"; `chats-settings-page.spec.ts` media-visibility test; `prefs.store.spec.ts` v4-snapshot normalization + surviving-key tests |
| FR-007 | 2 dead `ChatStore` methods removed, `createBroadcast` kept | `chat.store.spec.ts` "groupParticipants resolves current names and drops deleted contacts (F-046 FR-007)" + "groupParticipants is empty for an unknown chat (F-046 FR-007)"; `chats-page.spec.ts` "renders an empty placeholder when the store has no conversations" (now via `deleteConversation`) |
| FR-008 | Calls `All`/`Missed` filter actually filters | `calls-page.spec.ts` "F-046 FR-008: the All/Missed filter" (8 tests, incl. the unanswered-call regression); `call-list-item.spec.ts` "F-046 FR-008: missed styling follows outcome, not direction" (3 tests) |
| FR-009 | Disposition table complete, every deferral names a destination | `disposition.md` (G3 artifact; no unit test — it is a record, not behaviour) |
| FR-010 | Inertness tests rewritten, not deleted | 5 retitled with an explicit deferral note: `contact-page.spec.ts`, `chats-settings-page.spec.ts`, `font-size-page.spec.ts`, `account-page.spec.ts`, `data-storage-page.spec.ts`; plus the two rewritten Notifications tests. Zero tests deleted to make a suite pass |
| FR-011 | Notifications dead handler + `<button>` branch removed | `notifications-page.spec.ts` "renders a live switch for Show previews and a disabled switch for the rest" (replaces the vacuous "row activation is a no-op") |

### Gates

- **G1** — not applicable. F-046 wires no new chrome; every control that became live targets an
  existing node. No Figma node ID was invented.
- **G2** — `npm run build` green; full unit suite **588/588** green, run twice to confirm no
  dependence on test order. Counts by task: 549 → 553 (T1) → 554 (T2) → 556 (T3) → 562 (T4) →
  566 (T5) → 578 (T6) → 577 (T7, one test deleted with its subject) → 588 (T8) → 588 (T10, no
  new tests: record and retitles).
- **G3** — `disposition.md` complete; every deferral names a destination feature; all 8 drift notes
  written. **Done.**
- **G4** — scoped to this feature's disposition set. Every control F-046 touches is wired or
  genuinely disabled. The ~20 empty-handler rows in Account, Data & storage, Contact info, Status,
  and Camera are **expected to remain inert** (owner Clarification 2) and are tracked in
  `disposition.md`, not claimed as covered. **Done, within scope.**

### Blocked

- **Playwright** — paused by owner directive 2026-09-26. E2E specs are authored and updated, never
  executed. No e2e file changed in this feature; no control it targets moved.
- **Figma capture** — `design-gap-audit.md` holds the authoritative reset timestamp, 2026-10-02
  18:38 UTC. The Wallpaper picker (B4) and Camera capture remain blocked behind it. Neither is in
  this feature's scope; both are recorded as deferrals.

## Explicitly not in these tasks

- Building the destination features: attachment pipeline, voice notes, stickers, notification
  delivery, media-privacy filtering, Wallpaper picker, Account/B11 sub-screens, Keyboard settings,
  B8 shared-group membership, status publishing, camera capture. Each is named in
  `disposition.md` with a destination feature.
- F-047's typed persistence ports. The duplicated `readStorage`/`writeStorage` try/catch in all three
  stores is left in place — extracting it here would be a cross-store drive-by refactor.

## Blocked / deferred

- [ ] **G1 Figma** — **not applicable**, not blocked. No new chrome is designed. What is checked: no
  node ID is invented, and the two newly-wired controls are cited to the nodes they already render
  against (`0:10395` row 2 for the composer, row 2 for the calls list). No capture task is opened,
  because nothing here waits on the 2026-10-02 quota reset.
- [ ] **Playwright** — specs authored, execution **paused** by owner directive 2026-09-26. Do not run
  `npm run e2e:fast` to "check once".
- [ ] **F-045 G1** — remains blocked and permanently so (no node exists for the in-call screen or
  picker). Unchanged by this feature; recorded here only so it is not mistaken for newly blocked.
