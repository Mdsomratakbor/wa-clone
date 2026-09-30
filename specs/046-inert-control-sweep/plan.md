# Implementation Plan: Inert Control Sweep (F-046)

**Input**: `specs/046-inert-control-sweep/spec.md`, `specs/046-inert-control-sweep/research.md`

**Gates**: G1 = not applicable to the honesty fixes; no node ID is invented and every control this
feature *wires* is cited to a node it already renders against. G2 = build + full unit green, e2e
authored not run. G3 = closure + the disposition table complete with a named destination for every
deferral. G4 = no control in the shipped surface swallows activation silently (project directive,
2026-09-29) — this feature's own definition of done.

## Approach

The directive is "every control must be functional, not display-only", and the temptation is to read
that as "make everything work". The owner narrowed scope to **honesty fixes** (`spec.md`
Clarification 2), and that narrowing is the whole design. The question this feature answers is not
"what should this button do" but "**is this control telling the truth about itself**".

That reframing yields exactly two valid outcomes per control, and no third:

- **Wired** — the control changes real, observable state.
- **Honestly disabled** — the user cannot activate it, and it says so.

The third outcome, which is what ships today, is the defect. Notably, "honestly disabled" is a real
outcome rather than a formality, because the large destinations (attachment pipeline, voice notes,
stickers, notification delivery) are each a full feature, and the owner explicitly declined to fold
them in. Pretending otherwise would produce a spec whose implementation quietly half-ships — which is
how this state was reached.

### The disposition table is the deliverable

FR-009 requires a per-control record. The table is not documentation garnish: it is what converts
~30 accidents into scheduled work, and it is the only thing that stops the next feature from
re-deferring the same control a sixth time. Every `// F-009: … is a later feature` comment in the
codebase resolves to a row here, with a destination feature named.

### Two findings reshaped this plan

Both came from re-reading source during planning, after the audit's first pass:

1. **`isMissedCall` is already live**, not dead (`call-list-item.ts:2,19`). The Calls filter is
   therefore a `computed` over existing state plus one signal — no store change, no model change.
   FR-008 is the cheapest requirement in the feature.
2. **The unread prefs are read once, in their own template**, to render `[checked]`
   (`notifications-page.html:20`, `chats-settings-page.html:20`). They are not "read by nothing";
   they are read only to display themselves. That is a sharper statement of the same defect and it
   matters for disposition: displaying a value is not consuming it.

The audit's first pass also produced three wrong claims, all caught by re-reading source during
planning: a citation that a non-recursive PowerShell glob turned up in the wrong file (§2a), an
`isMissedCall` "zero callers" claim that `call-list-item.ts` disproves (§7), and an inference that
`Action` already supports `disabled` when that flag belongs to `NavAction` (§5). All three are
corrected in place in `research.md` rather than quietly dropped, and the corrected findings are the
ones used below. The corrections are worth stating plainly: an audit that says "this control lies"
invites a reviewer to trust it, so the citations have to survive being checked.

### Dispositions

| Control | Disposition | Destination |
| ------- | ----------- | ----------- |
| Chat actions `Wallpaper` | **honestly disabled** | Wallpaper picker (blocked: no capturable imagery until 2026-10-02 18:38 UTC) |
| Add modal `New community` | **honestly disabled** | Broadcast/communities create flow (B3) |
| Settings overflow `More` | **honestly disabled** | Overflow destination list (B-tier settings) |
| Composer `Camera` | **wired** → `/camera` | — (destination exists, F-012) |
| Composer `Add attachment` | **honestly disabled** | Attachment pipeline (media picking, send) |
| Composer `Emoji stickers` | **honestly disabled** | Sticker picker |
| Composer `Record audio` | **honestly disabled** | Voice notes (record + upload) |
| `showPreviews` | **wired** → chat-list preview visibility | — |
| `sound`, `vibrate`, `popup`, `light` | **honestly disabled** | Notification delivery pipeline |
| `mediaVisibility` | **honestly disabled** | Media-privacy filtering of message bubbles |
| Calls `All` / `Missed` | **wired** → real filter | — |
| `createBroadcast`, `broadcastRecipients`, `setConversations` | **removed** | Broadcast create feature re-adds what it needs |
| Notifications `onRowActivate` + dead `<button>` | **removed** | none — toggles confirmed intended |
| Account 4 rows, B11 7 rows, `chats-wallpaper`, `chats-keyboard`, `contact-groups`, Status `Send`, Camera `Shutter`/`Flip` | **deferred, disabled, destination named** | each row names its destination in the spec's FR-009 table |

Two dispositions are judgment calls the owner should sanity-check, and both are visible in tests
rather than buried:

- **`showPreviews` is wired to chat-list preview visibility.** It is a pref named
  "Show message previews" sitting on the Notifications screen; gating the chat list's preview line on
  it is the smallest honest consumer that matches the label. The alternative (disable it) would mean
  shipping a false statement on a live toggle.
- **Composer `Camera` is wired to `/camera`.** The camera screen already exists and is reachable from
  the tab bar, so navigation is real behaviour with no new screen. Sending a captured photo back to
  the composer remains the attachment pipeline's work; this feature does not pretend that is done.

### The three "honest" files

`chat-actions.seed.ts`, `new-chat-modal.seed.ts` and `settings.seed.ts`-derived action lists all feed
`ActionSheet`. The dishonest rows are exactly the ones that carry no opt-out, so the fix is per-row
metadata plus a `reason` in the disposition table — not a template change per screen.
`calls-page.ts:127-129` already documents the "close the sheet unconditionally" safety that
`chat-window-page.ts` and `chat-list/chats-page.ts` lack; FR-001/002/003 adopt that pattern so an
unknown future id can never again swallow a tap with the sheet open.

**`ActionSheet` must grow a `disabled` flag first, and this is the feature's one shared-component
change.** Planning found that `Action` (`action-sheet.model.ts`) is `{ id, label, icon? }` with **no**
`disabled` field, and `action-sheet.html:23-30` renders every row as an unconditionally activatable
`<button>`. The `disabled` property seen on sheet actions elsewhere belongs to `NavAction` (the
navigation bar), not `Action` — the two models are unrelated despite the similar name. So "render
this row honestly disabled" is not available today and has to be added once, properly:

- `Action.disabled?: boolean`
- `action-sheet.html` renders `[disabled]="item.disabled"` on the row button, and the row `<li>`
  carries a `action-sheet__row--disabled` class for styling
- `ActionSheet.onAction` stays as-is, because a natively `disabled` button cannot fire a click — the
  guard is the platform's, not a runtime check

`AGENTS.md` requires a disabled control to be genuinely disabled and not reachable as an active
control, and a native `disabled` attribute is the only way to get that for free at the accessibility
layer. This is extending an existing shared component, not adding one, and it is the minimum
enabling change for FR-001/002/003 — three separate screens need exactly this behaviour, which is the
"real repetition" bar in `AGENTS.md` §3.

### Files

| File | Change |
| ---- | ------ |
| `src/app/shared/components/action-sheet/action-sheet.model.ts` | `Action.disabled?: boolean` — **enabling change, first task** |
| `src/app/shared/components/action-sheet/action-sheet.{ts,html,scss}` | render disabled rows as native `disabled` buttons + `--disabled` row class |
| `src/app/shared/components/composer/composer.{ts,html}` | bind `Camera` to `/camera`; mark the other three `disabled` with `aria-disabled` |
| `src/app/shared/components/composer/composer.spec.ts` | rewritten: each control asserted wired-or-disabled (FR-004) |
| `src/app/features/chat-window/chat-actions.seed.ts` | `chat-wallpaper` gets `disabled: true` |
| `src/app/features/chat-window/chat-window-page.ts` | `onChatAction` dismisses on unknown ids (FR-001) |
| `src/app/features/new-chat-modal/new-chat-modal.seed.ts` | `new-community` gets `disabled: true` |
| `src/app/features/chat-list/chats-page.ts` | `onAddModalAction` dismisses on unknown ids (FR-002) |
| `src/app/features/settings/settings.seed.ts` | `settings-more` gets `disabled: true` |
| `src/app/features/settings/settings-page.ts` | `onSettingsAction` dismisses on unknown ids (FR-003) |
| `src/app/features/settings/notifications-page.{ts,html}` | remove `onRowActivate` and the dead `<button>` branch (FR-011) |
| `src/app/features/chat-list/chats-page.{ts,html}` | `showPreviews` gates the preview line (FR-006) |
| `src/app/features/settings/chats-settings-page.ts` / `notifications-page.ts` | disable the 4 delivery prefs + `mediaVisibility` (FR-006) |
| `src/app/core/prefs.store.ts` | drop the 5 keys that gain no consumer (FR-006) |
| `src/app/core/chat.store.ts` | delete the 3 caller-less methods (FR-007) |
| `src/app/features/calls/calls-page.{ts,html}` | real `All` / `Missed` filter (FR-008) |
| `specs/046-inert-control-sweep/disposition.md` | **new** — the FR-009 table |

**Removing a pref key is additive-safe, not a version bump.** `hydrate()` already merges
`{ ...DEFAULT_PREFS, ...envelope.prefs }` (`prefs.store.ts:157`), so a persisted snapshot carrying a
removed key is normalized away on load, and the `PrefsKey` union shrinking is a compile-time change
only. A `version` bump would discard every user's stored prefs to remove five booleans, which is a
bad trade. The removed keys keep their `true` default semantics: `showPreviews` is the only one
kept, because it is wired.

### Drift Policy

| Superseded | What drifts |
| ---------- | ----------- |
| `specs/009-new-chat/spec.md` | its "New community is a later feature" non-goal is now an *honestly disabled* control with a named destination |
| `specs/011-settings/spec.md` | the `More` overflow row is disabled rather than a silent no-op |
| `specs/027-chats-settings/spec.md` | "behaviors beyond Enter key sends are later targets" becomes explicit: 1 of 7 wired here, 5 removed, `showPreviews` wired |
| `specs/017-notifications/spec.md` | the sub-target non-goal is retired as **not intended**; flat toggles confirmed, dead branch removed |
| `specs/004-calls/spec.md` | "static in feature 004" filter is retired — the filter now works |
| `specs/042-broadcast-lists/spec.md` | `createBroadcast` / `broadcastRecipients` removed from the store; the create UI is a named future feature |
| `specs/design-gap-audit.md` | B10 corrected (already done); B4/B8/B9/B11/B12 disposition recorded |
| `figma/design-map.md` | rows 2 and 14 gain the honesty note |

No earlier spec is edited to change its own requirements; each note records what moved and why.

## Review Gates

- **G1**: **not applicable.** No new chrome is designed here. What it must check: no node ID is
  invented, and the two controls that become *wired* (`Camera` → `/camera`, the Calls filter) are
  cited to real nodes — `0:10395` row 2 for the composer, row 2 for the calls list. The four
  composer buttons and the Calls filter are on **design-verified** rows, so their shape is not in
  question; only their wiring is.
- **G2**: `npm run build` green; the **full** unit suite green with the exact count reported. A
  partial or filtered run is not a pass.
- **G3**: closure; disposition table complete; every deferral names a destination feature; drift
  notes present in all eight superseded artifacts.
- **G4**: **the real gate, and it is scoped.** Every control in this feature's disposition set must
   end wired or genuinely disabled — never a third state. It is verified by a test asserting each
   control is *either* bound to a state change *or* natively disabled, not by checking that a label
   changed. It does **not** assert the whole surface is clean: per Clarification 2 the ~20
   empty-handler rows stay inert for their own features, and `disposition.md` names each one's
   destination. The gate claims the sweep is honest about what it swept, not that the sweep is
   total — claiming the latter would contradict the scope the owner set.

## Verification

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # full suite, report the exact count
```

Playwright specs are authored and **not executed** (owner directive 2026-09-26).

## Risks

1. **"Honestly disabled" becomes a dumping ground.** The biggest risk, and it is why the disposition
   table carries a named destination: disabling all 16 deferred rows would technically satisfy every
   functional requirement while shipping a more thoroughly disabled app. Mitigation: each disabled
   control must be *more* informative than before (genuinely non-activatable, and named in
   `disposition.md`), and G4 asks whether the control now tells the truth, not whether it is useful.
2. **A disabled control reading as broken.** Real UX risk, mitigated by keeping disabled rows
   visible and correctly styled rather than hiding them, so the app's information architecture is
   unchanged and the destination work has somewhere to land.
3. **Deleting tests to make the suite pass.** FR-010 forbids it. The four inertness assertions
   (`contact-page.spec.ts:114`, `chats-settings-page.spec.ts:57`, `font-size-page.spec.ts:137`,
   `notifications-page.spec.ts:56`) must be **rewritten** to the new disposition — that is how the new
   decision gets recorded. `font-size-page.spec.ts:137` in particular guards F-041's FR-007, which
   stays true; only its sibling rows change.
4. **Removing pref keys breaks a persisted snapshot.** Mitigated by the existing normalize-at-load
   merge; asserted by a test that hydrates a snapshot containing the removed keys and expects the
   defaults.
5. **Scope creep back into the destinations.** Any pull toward building the attachment pipeline or
   notification delivery is a new feature, and the plan is explicit that this one stops at the
   disposition.
6. **The audit was wrong three times.** Every claim in `research.md` has now been re-derived from
   source, and three did not survive (§2a, §5, §7). Mitigation: every disposition names a file and
   line, so the next reader can check it; the corrections stay in `research.md` rather than being
   deleted. An audit that says "this control lies" invites trust, so its citations must be
   checkable rather than authoritative.
