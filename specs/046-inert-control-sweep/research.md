# Research: Inert Control Sweep (F-046)

**Date**: 2026-09-29
**Method**: forward-only sweep of the shipped surface, per the owner project directive
("every feature must be functional rather than display-only"). Findings were produced by an
exploration pass and then **independently re-verified by hand** before being written here — the
highest-impact claims were re-read in the source, and the two cross-cutting claims
(the composer buttons, the prefs consumers) were confirmed with a direct grep.

This is not a spec. It is the evidence the spec's requirements rest on, with citations so a later
feature can check whether a finding still holds.

## 0. Numbering

This feature was originally drafted as F-046, colliding with the backend persistence seam that
F-045's spec reserved for F-046. The owner resolved the collision on 2026-09-29: **the audit sweep
is F-046, the backend seam becomes F-047.** All nine F-046 references in `specs/045-calling-flow`
were renumbered, and `research.md` §9 carries the reason.

## 1. Why the audit exists

The defect is structural, not accidental. F-042 left a create form out of scope, F-043 left two
sheet rows inert, F-044 left a tile focusable-but-inert, and F-012 left the camera shutter empty.
Each was individually defensible and each is documented in its own spec as a later feature. But no
author could see the whole set, so five feature generations accumulated ~30 controls that render,
look interactive, and do nothing. F-045 closed five of them. This audit is the first full sweep.

## 2. Findings, by severity

### 2a. Silent no-ops — a control that swallows activation and gives no feedback

The worst class. The user is told the control exists, the app accepts the input, and nothing
acknowledges it. `AGENTS.md` already forbids the adjacent failure ("A disabled button must be
actually disabled — never a click-through no-op"); these are exactly that violation, already shipped.

| Control | Location | Why inert |
| ------- | -------- | --------- |
| Chat actions `Wallpaper` | `chat-window-page.ts:132-141` | `onChatAction` branches on `chat-mute` and `chat-more` only; `chat-wallpaper` (in `CHAT_ACTIONS`, `chat-actions.seed.ts:5`) matches neither, and the sheet is not dismissed. **On design-verified row 2.** |
| Add modal `New community` | `chat-list/chats-page.ts:194-208` | Handles `new-contact` and `new-group`, then falls through with a comment. Unlike `calls-page.ts`, it does **not** dismiss the modal, so the sheet stays open. |
| Settings overflow `More` | `settings-page.ts:119-133` | Handles `settings-notifications` and `settings-storage`; `settings-more` (in `SETTINGS_ACTIONS`) matches neither, sheet stays open. |

Contrast `calls-page.ts:127-129`, which carries an explicit comment explaining why it closes the
sheet unconditionally. The add-modal and settings paths lack that safety, which is why the fall-through
is visible to the user rather than merely quiet.

### 2b. Unbound buttons — focusable, activatable, no handler at all

`src/app/shared/components/composer/composer.html` — verified by reading the file:

| Line | `aria-label` | Handler |
| ---- | ------------ | ------- |
| 2 | `Add attachment` | **none** |
| 18 | `Emoji stickers` | **none** |
| 28 | `Camera` | **none** |
| 49 | `Record audio` | **none** |

These are not bound to an empty method — there is no `(click)` attribute at all, and `composer.ts`
has no method for any of the four. They are keyboard-focusable and respond to `Enter`/`Space` with
nothing. The Send button (line 37) and `onEnter` (line 16) are live.

These sit in the **chat window composer**, the app's primary surface, on design-verified row 2.

### 2c. Empty handlers awaiting a later feature

| Area | Location | Rows |
| ---- | -------- | ---- |
| Account sub-screens (B9) | `account-page.ts:29-31` | `security`, `two-step-verification`, `change-number`, `delete-account` — 4 |
| Data and storage (B11) | `data-storage-page.ts:29-31` | `ds-storage-usage`, `ds-auto-download`, `ds-images`, `ds-audio`, `ds-videos`, `ds-documents`, `ds-network-usage` — 7 |
| Chats settings | `chats-settings-page.ts:48-53` | `chats-wallpaper` (B4), `chats-keyboard` (B12) — 2, falling through past the `chats-font-size` branch |
| Contact info `Groups` (B8) | `contact-page.ts:55-68` | `contact-groups` — needs shared-group membership the store does not hold |
| Status publish | `compose-page.ts:18-24` | `onSend`, `onSendAlt` — the composer is decorative (`compose-page.html:55-65` renders a literal `<p>` and a static keyboard PNG, no input) |
| Camera | `camera-page.ts:55-61` | `onShutter`, `onFlip` — need `getUserMedia`; audit A5 moved `Flip` to tier C for exactly this reason |

B11 is the largest single block of dead rows in the app: 7 chevron buttons, no toggle branch in the
template, so there is no partial functionality anywhere on that screen.

## 3. The inverse defects

### 3a. Dead store methods — no production caller

Grepped across `src/`, excluding specs:

| Method | Location | Callers |
| ------ | -------- | ------- |
| `ChatStore.createBroadcast` | `chat.store.ts:143` | specs only — **see the correction below** |
| `ChatStore.broadcastRecipients` | `chat.store.ts:276` | specs only |
| `ChatStore.setConversations` | `chat.store.ts:370` | specs only |

> **F-047 drift note (2026-10-01) — line numbers are stale.** `chat.store.ts:370` now points at a
> different method: F-047 deleted three private storage helpers and injected a `PersistencePort`, so
> every line after that point shifted. `createBroadcast` and `broadcastRecipients` were both removed by
> F-046; `setConversations` survived F-046 but its line number is no longer 370. Likewise
> `prefs.store.ts:14-22` / `:128` and `call.store.ts:53` / `:130-137` below have moved, and
> `prefs.store.ts`'s three storage helpers no longer exist at all. No finding here is invalidated — only
> the coordinates are. Re-run the grep rather than trusting any line number in this file.

`createBroadcast` is the F-042 create-form gap showing up as code: the store can create a broadcast
and nothing in the app ever asks it to, so `/broadcasts` shows its empty state permanently. The gap
audit already records this ("createBroadcast() ships without a UI caller").

**Correction, made during T7 implementation.** The "specs only" column was not enough to act on.
`createBroadcast` has ~15 call sites across `chat.store.spec.ts`, `broadcasts-page.spec.ts` and
`chats-page.spec.ts`, because it is the only way to get a broadcast into the store — and it is
F-042's own mandated deliverable (its FR-002). Deleting it would have meant rewriting an unrelated
suite to reach past the store's public API, while fixing nothing a user can see: the empty state
stays empty either way, because the real gap is the create *form* (B3), already deferred. It is
retained, with the reason recorded in the store and in `disposition.md`.

The other two are genuinely dead and were deleted: `broadcastRecipients` was a **byte-identical
duplicate** of `groupParticipants` (`return this.resolveContactNames(chatId)` in both), and
`setConversations` overwrote the whole list and persisted — a test seam that had become public API.
Its one test-fixture use was repointed at the public `deleteConversation`.

The lesson generalises: "no production caller" is a signal to look, not a conclusion. Counting
callers is not the same as knowing whether a method is load-bearing.

### 3b. Prefs written but read by nothing — verified

`DEFAULT_PREFS` (`prefs.store.ts:14-22`) has 7 booleans. A recursive search of every non-spec file
under `src/` for `prefs()` returns 4 hits:

```
prefs.store.ts:128                     // persist(): writing the envelope
chats-settings-page.html:20            // [checked]="prefs()[prefsKey]"
notifications-page.html:20             // [checked]="prefs()[prefsKey]"
composer.ts:32                         // if (!this.prefs.prefs().enterKeySends)
```

So `enterKeySends` is the **only** pref whose value is consulted by behaviour. The other two template
hits read the value only to render the switch's own `checked` state — that is displaying the
setting, not acting on it. `mediaVisibility`, `sound`, `vibrate`, `popup`, `light`, and
`showPreviews` are set by live toggles, persisted across reload, and change nothing anywhere: no
message preview, no notification, no ring, no flash consults them. A user who disables
`Popup notification` has been told their phone will be quiet and it will not be.
`chats-settings-page.ts:37` and `notifications-page.ts:41` are honest in comments ("behaviors beyond
Enter key sends are later targets"), but a comment is not a consumer.

`showPreviews` was subsequently wired to the chat-list preview (FR-006); the other five were
disabled and their keys removed.

### 5a. `isMissedCall` was live but semantically stale — found while wiring the filter

`plan.md` called `isMissedCall` "live" evidence that missed-call styling already worked, and
instructed T8 to build the filter on it. Live, yes — but wrong, and checking call sites would not
have shown it. The two `CallDirection` and `CallOutcome` fields had been allowed to disagree:

| Source | `direction` | `outcome` | `isMissedCall` (old) |
| ------ | ----------- | --------- | -------------------- |
| `calls.seed.ts` missed rows | `missed` | absent | `true` ✓ |
| `endCall` after connecting | `outgoing` | `completed` | `false` ✓ |
| `endCall` hung up before connect | `outgoing` | `missed` | **`false` ✗** |

The last row is the defect: a call this app placed that rang out unanswered — the single call the
Missed filter most needs to surface — was reported as not missed, because `endCall` writes
`direction: 'outgoing'` unconditionally (`call.store.ts:130-137`) and puts the truth in `outcome`.
Wiring the filter to the old helper would have produced an enabled, correctly-styled control that
displayed nothing, which is a worse failure than the disabled one it replaced: the disabled filter
was at least honest about being unfinished.

The same staleness had been silently degrading `call-list-item`'s missed styling since F-045, for
every call the app placed itself.

Fixed in FR-008, with a fallback to `direction` for un-normalized entries (`hydrate()` sets
`outcome` from `direction` for pre-F-045 snapshots, `call.store.ts:53`). Both new tests were
verified to fail against the old implementation before being committed — a green test that cannot
fail proves nothing.

This is the same defect class as the inert rows: a control that looks functional, is functional in
the narrow sense that it updates a signal, and changes nothing observable.

## 4. A contradiction the audit found — Notifications (resolved)

The gap audit lists B10 as "3 sub-screens" (`Sound`, `Vibrate`, `Popup notification`). The shipped
code does not do that: `TOGGLE_PREFS` (`notifications-page.ts:9-15`) maps **all five** notification
row ids, so every row takes the `@if (prefsKey)` branch in `notifications-page.html:11` and renders
as `app-toggle`.

Consequences:

- `onRowActivate` (`notifications-page.ts:51`) is **unreachable** — no row id reaches the `@else`
  branch, so the `<button>` block at `notifications-page.html:26-37` is dead markup.
- `notifications-page.spec.ts:56` (`'row activation is a no-op'`) queries `notifications-row` and
  clicks index 0, which is a `<div>` wrapper, not a button. The test passes without ever exercising
  the handler it is named after.

Asked of the owner on 2026-09-29: are sub-screens or toggles intended? **Answer: toggles.** The
gap audit's "3 sub-screens" wording described a shape that was never intended, so B10 is not real
work and is not a destination for any deferral. The cleanup is FR-011: remove the unreachable
handler and its dead template block, and replace the vacuous test with one covering the toggle
behaviour that actually ships.

## 5. `ActionSheet` cannot currently express "disabled" — the enabling gap

The obvious way to make an inert sheet row honest is to mark it disabled. That is **not possible
today**:

```
src/app/shared/components/action-sheet/action-sheet.model.ts
  export interface Action { id: string; label: string; icon?: string; }
```

No `disabled` field. And `action-sheet.html:23-30` renders every row as an unconditionally
activatable `<button>` with `(click)="onAction(item.id)"`.

A tempting wrong inference is that sheet actions already support `disabled`, because
`calls-page.ts:58` does contain `{ id: 'clear', label: 'Clear', disabled: this.items().length === 0 }`.
That is **`NavAction`** — the navigation bar's model — not `Action`. The two are unrelated despite
similar names, and only the navigation bar honours the flag. Verified by reading
`action-sheet.model.ts` and `action-sheet.html` directly.

Consequence: FR-001/002/003 need `Action.disabled?: boolean` added, plus native `[disabled]` on the
row button, **once**, before any row can be made honest. This is the feature's only shared-component
change and it is an *extension*, not a new component.

## 6. Tests that pin the current inertness

These assert the status quo and must be **rewritten to the new disposition**, not deleted:

| Test | Location |
| ---- | -------- |
| `'the Groups row stays a no-op (B8 is not built)'` | `contact-page.spec.ts:114` |
| `'row activation is a no-op'` | `chats-settings-page.spec.ts:57` |
| `'the other chevron rows stay inert (FR-007)'` | `font-size-page.spec.ts:137` |
| `'row activation is a no-op'` | `notifications-page.spec.ts:56` |

They are legitimate regression guards for the decisions they encode, and this feature is revisiting
those decisions. Rewriting them records the new decision; deleting them would just erase the
evidence.

## 7. Controls that are hard-disabled rather than inert

| Control | Location | Note |
| ------- | -------- | ---- |
| Calls `All` / `Missed` filter | `calls-page.html:14-24` | Both carry literal `disabled`, no handler, and `Missed` never becomes enabled. This satisfies `AGENTS.md`'s "actually disabled" rule literally, but the control set can never filter. `specs/004-calls/spec.md:21` called it "static in feature 004" and nothing revisited it. |

Wiring the Calls filter is cheaper than it looks: `isMissedCall` (`calls.model.ts:67`) is already
exported and **already live** — `call-list-item.ts` uses it to render the missed icon. It simply has
no consumer on the list itself, so the filter is a `computed` over the existing `items()` plus the
active-filter signal, with no store change.

An earlier draft of this section claimed `isMissedCall` had zero callers. That came from a PowerShell
`src\app\**\*.ts` search that did not recurse, and it was wrong; `call-list-item.ts:2,19` are live
callers. The same unreliable glob made the add-modal citation above wrong. Both were re-derived with
`Get-ChildItem -Recurse`.

`MediaPage.onTileActivate` (`media-page.ts:58-62`) is also empty, but it is **F-044's declared
FR-006 behaviour** — a focusable tile with no viewer behind it because the design has no media
viewer. Treated as accepted, not a defect, and out of scope here.

## 8. Verified already-functional (so the sweep does not redo it)

Each was re-read, not assumed:

- **Calls**: row tap, `ⓘ` info, `New call`, sheet `Message` / `Delete` / `Voice call` / `Video call`
  — all live (F-038, F-043, F-045).
- **Chat window**: header `Call` / `Video call` (F-045), `Mute`, `More`, and the More sheet's
  `Clear messages` / `Delete chat` — all live. Back and identity both route.
- **In-call screen**: `Mute` / `Speaker` / `Video` mutate `CallSession`; `End call` writes a log
  entry with a derived outcome (F-045).
- **Call picker**: contact tap starts a voice call (F-045).
- **Settings main screen**: all five rows (`Account`, `Chats Settings`, `Notifications`,
  `Data and Storage`, `Contacts`) route. **This screen has no inert rows.**
- **Chats settings**: `Font size` opens the picker and the four scales persist and apply via
  `data-font-scale` (F-041); `Enter key sends` is the one pref with a real consumer.
- **Status**: `Privacy` nav action, `My Status` row, camera circle, note circle — all route.
- **Contact info**: `Messages`, `Media photos and links`, `Starred messages`, `Edit` — all route.
- **Also live**: profile `Save`, edit-contact `Save`, archived row open, contacts rows, new-group
  create, chats edit-mode actions, sort, search, starred rows, auth keypad + `Continue`, camera
  `Close`.

## 9. Sequencing rationale

Two questions went to the owner on 2026-09-29:

1. **Numbering.** The sweep was drafted as F-046, colliding with the backend seam. Answer: the sweep
   is **F-046**, the backend seam becomes **F-047**.
2. **Scope.** Options were honesty-fixes-only, also-build-the-sub-screens, or the whole audit.
   Answer: **honesty fixes only.** The large destination features (Account's 4 sub-screens, B11's 7,
   the broadcast create form, the Wallpaper picker, Keyboard settings, B8 membership, status
   publishing, the camera pipeline) each become their own spec with a named destination.

The second answer is what keeps this feature specifiable. A feature that must simultaneously fix an
unbound button and build a storage-management subsystem has no coherent test strategy, and would
almost certainly ship the small half while quietly deferring the large half — which is how the
current state was reached.

A third question resolved the Notifications contradiction in §4: **toggles are intended**, so B10
is not a missing feature.
