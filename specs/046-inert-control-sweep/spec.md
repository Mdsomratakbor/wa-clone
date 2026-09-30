# Feature Specification: Inert Control Sweep (F-046)

**Feature Branch**: `feature/inert-control-sweep`
**Created**: 2026-09-29
**Status**: Draft — requires `/speckit.clarify` before planning
**Input**: Forward-only inert-control audit of the shipped surface, per the owner project directive
of 2026-09-29 ("every control must be functional, not display-only"). Evidence and citations in
`research.md`.

## Project Directive

The owner directive governs this feature and is binding:

> Every feature must be functional rather than display-only. Every control must do something real.

This directive is what makes the audit in `research.md` a defect list rather than a wish list.

## Clarifications

The owner answered two questions on 2026-09-29, before any code.

1. **Q: This sweep was drafted as F-046, but F-046 was already reserved for the backend persistence
   seam. How should the collision resolve?**
   A (**owner**): **the audit sweep is F-046; the backend seam becomes F-047.** The sweep is the more
   urgent work, since it removes controls that currently lie to the user. All nine F-046 references
   in `specs/045-calling-flow` were renumbered to F-047, and its `research.md` §9 records the reason.
2. **Q: How much should F-046 do?** The audit found roughly 30 inert controls spanning very
   different sizes — from "a button that silently swallows a tap" to "needs a whole
   storage-management subsystem". Options were honesty-fixes-only, also-build-the-sub-screens, or the
   entire audit.
   A (**owner**): **honesty fixes only.** The three silent no-ops, the four unbound composer buttons,
   the three dead store methods, the six unread prefs, and the Calls filter. The large destination
   features each become their own spec with a named destination, recorded in the disposition table.

The second answer is what keeps this feature specifiable. A feature that must simultaneously fix an
unbound button and build a storage subsystem has no coherent test strategy, and would almost
certainly ship the small half while quietly deferring the large half — which is precisely how the
current state was reached.

A third question was asked during specification, after the audit found a contradiction between the
gap audit and the shipped code.

3. **Q: `design-gap-audit.md` records B10 as three Notifications sub-screens, but the code renders
   all five notification rows as flat toggles, which makes `onRowActivate` unreachable and its
   `<button>` template dead markup. Are sub-screens or toggles intended?**
   A (**owner**): **toggles are intended.** The flat-toggle rendering stays. This feature removes the
   unreachable `onRowActivate` and its dead `<button>` block, rewrites the vacuous
   `notifications-page.spec.ts` test that was clicking a `<div>` rather than a button, and records
   that the gap audit's B10 wording is wrong. The "3 sub-screens" destination is therefore **not**
   real work and is dropped from the disposition table.

4. **Q (raised during implementation, T7): FR-007 said all three caller-less `ChatStore` methods
   must be deleted. `createBroadcast` turned out to have ~15 call sites across 3 spec files and to be
   F-042's own mandated capability. Delete it or keep it?**
   A (**implementation, ratified**): **keep `createBroadcast`, delete the other two.** The audit's
   "no production caller" finding was true but too thin to act on: the method is F-042 FR-002's
   deliverable and the only way to put a broadcast into the store, so deleting it would have meant
   rewriting an unrelated suite to reach past the store's API. The real defect is the missing
   *create form* (B3), which the owner already deferred. FR-007 was corrected to cover only the two
   genuinely dead methods, with the reason recorded in the store.

## Problem

After F-035…F-045, a forward-only sweep of the shipped surface found that most screens are clean
but a substantial set of controls still render, look interactive, are focusable, and do nothing.
Three shapes of defect, in increasing severity:

1. **The silent no-op.** A handler with a chain of `if (id === …)` branches that no branch matches,
   and which does not dismiss the sheet. The user taps, nothing happens, and the sheet stays open.
   The click is swallowed with no feedback at all. Examples: chat-actions `Wallpaper`
   (`chat-window-page.ts:132`), add-modal `New community` (`chat-list/chats-page.ts:194`),
   settings-overflow `More` (`settings-page.ts:119`).
2. **The unbound button.** A real `<button>` with no `(click)` attribute and no corresponding
   component method — so it is focusable and keyboard-activatable but swallows activation.
   Example: the four composer icons (`composer.html:2,18,28,49`).
3. **The empty handler.** A handler whose body is only a comment, awaiting a later feature.
   Examples: Account's four sub-screen rows (`account-page.ts:29`), Data-and-storage's seven rows
   (`data-storage-page.ts:29`), Status `Send`/`Send-alt` (`compose-page.ts:18`).

There is also an inverse defect: three `ChatStore` methods (`createBroadcast`,
`broadcastRecipients`, `setConversations`) have **no production caller** — only specs. And six of
seven `PrefsStore` booleans are written by live toggles and read by nothing at all
(`composer.ts:32` is the only read of `prefs()` in the entire non-spec codebase). Those toggles
persist across a reload and change no behaviour anywhere, which is display-only state wearing the
costume of a setting.

Severity note: the three silent no-ops and the four unbound composer buttons are the worst of these
defects, because they are not merely missing features — they are controls that lie. The user is told
a thing can be done, the app accepts the input, and nothing acknowledges it. That is worse than not
rendering the control at all, and `AGENTS.md` already forbids the adjacent failure ("A disabled
button must be actually disabled — never a click-through no-op").

## Scope

This feature is deliberately **not** an attempt to close every gap in the audit. The audit contains
tiers of work that differ by orders of magnitude in size and in whether they are buildable at all.
Bundling "make 4 unbound buttons behave" with "build a storage-management subsystem with 7
sub-screens" into one feature would produce an unspecifiable blob.

The scope below is the **honest-lie fix**: make every control that currently lies stop lying, and
decide — deliberately, in writing, per control — whether it becomes functional or is genuinely
disabled. Controls whose full behaviour is a large new feature are not silently removed; they are
either disabled with a stated reason, or left for their own spec.

### In Scope

- **The three silent no-ops** (severity 1): `chat-wallpaper`, `new-community`, `settings-more`. Each
  currently swallows a tap with the sheet left open.
- **The four unbound composer buttons** (severity 2): attachment, sticker, camera, record-audio.
- **The three dead `ChatStore` methods**: wire a caller or remove them.
- **The six unread `PrefsStore` booleans**: give each a real consumer, or convert the control to an
  honestly-disabled row, or remove it.
- **The inert Calls filter** (`All` / `Missed`), which is hard-disabled with no path to enabled.
- A per-control disposition record, so that "still inert" is a **stated decision with a named owner
  and destination**, not an accident.

### Out of Scope

- Building the large destination features themselves (Account's 4 sub-screens, Data-and-storage's 7
  sub-screens, the broadcast create form, the Wallpaper picker, the Keyboard settings, shared-group
  membership for B8, status publishing, the camera capture pipeline). Each is a separate spec, and
  each is named in the disposition table.
- Tier C work, blocked until the Figma quota reset (**2026-10-02 18:38 UTC**) or blocked on
  `getUserMedia` (Camera) or on imagery no capture can supply (Wallpaper, B4).
- Anything the audit found already functional. The audit lists its verified-live areas explicitly so
  this feature does not touch them.
- `MediaPage.onTileActivate`'s empty handler — F-044's declared FR-006 behaviour, treated as accepted
  rather than a defect.

## Key Terms

- **Honest disabled**: a control the user cannot activate, rendered as genuinely disabled, with the
  reason recorded. Contrast with a live-looking control that swallows input.
- **Silent no-op**: a control that accepts activation and produces no visible effect whatsoever.
- **Destination**: the specific screen, store mutation, or state change that makes a control live.
- **Disposition**: this feature's decision, per control, of one of: wired / disabled / removed /
  deferred-with-named-destination.

## User Stories

### US1 — As a user, I want tapping a control to always acknowledge me

**Why this matters**: the highest-severity defects are silent. Priority: P1.

**Independent test**: "open the chat actions sheet, tap `Wallpaper`, and the app must visibly respond
— either by navigating, or by the control not being tappable at all. There is no third outcome."

**Acceptance scenarios**:

1. **Given** a sheet with a control whose destination does not exist, **when** the user taps it,
   **then** the app must do exactly one of: navigate to a real destination, or the control is
   rendered disabled — never neither.
2. **Given** any focusable button in the app, **when** the user activates it by click, `Enter`, or
   `Space`, **then** some visible state must change, or the button was already disabled and must
   not have been focusable/activatable.

### US2 — As a user, I want my settings to actually change behaviour

**Why this matters**: six prefs are written and read by nothing. A user who turns off
`Popup notification` has been told their phone will be quiet, and it will not be.

**Independent test**: "toggle each of the seven prefs, and for each one name the observable
behaviour that changed. A pref with no observable effect is a defect, not a setting."

**Acceptance scenarios**:

1. **Given** a pref toggle that has a consumer, **when** the user flips it, **then** the consumer's
   behaviour changes observably.
2. **Given** a pref toggle with no possible consumer today, **when** the user flips it, **then** the
   control is disabled with a recorded reason, or it is removed — it is not a live toggle over
   nothing.

### US3 — As a maintainer, I want inert controls to be a stated decision, not a discovered accident

**Why this matters**: this audit exists because controls were rendered and left inert across
five feature generations, each with a comment deferring it to "a later feature". No single author
could see the whole set.

**Independent test**: "grep the codebase for `inert`, `coming soon`, `later feature`, and empty
handler bodies; every hit resolves to a row in this feature's disposition table, and every row has a
destination or an owner."

**Acceptance scenarios**:

1. **Given** a control deferred to "a later feature", **when** the sweep runs, **then** the later
   feature is named, or the control is disabled with a reason.
2. **Given** a store method with no production caller, **when** the sweep runs, **then** it is wired
   to a caller or deleted — it does not survive as spec-only code.

## Requirements

### Functional Requirements

- **FR-001** The chat-actions `Wallpaper` row must not silently swallow activation. It either
  navigates to a wallpaper destination or is rendered honestly disabled.
- **FR-002** The add-modal `New community` row must not silently swallow activation.
- **FR-003** The settings-overflow `More` row must not silently swallow activation.
- **FR-004** The four composer icon buttons must each either perform a real action or be rendered
  honestly disabled. A `<button>` with no handler is not an acceptable end state.
- **FR-005** Each of the four Account sub-screen rows and each of the seven Data-and-storage rows
  must be wired, honestly disabled, or recorded in the disposition table with a named destination
  feature. An empty handler with only a comment does not satisfy this.
- **FR-006** Each of the six consumer-less `PrefsStore` booleans must gain a real consumer, or its
  control must become honestly disabled, or the key must be removed. A live toggle over state that
  nothing reads is not an acceptable end state.
- **FR-007** `ChatStore.broadcastRecipients` and `ChatStore.setConversations` must be deleted.
  `broadcastRecipients` was a byte-identical duplicate of `groupParticipants`; `setConversations`
  overwrote the whole list and looked like a test seam that had become public API.
  `ChatStore.createBroadcast` is **retained, not deleted** — see Clarification 4, which corrected
  this requirement after implementation showed the audit's evidence was too thin.
- **FR-008** The Calls `All` / `Missed` filter must either filter the list for real, or be rendered
  honestly disabled. `Missed` must not be permanently disabled with no path to enabled.
- **FR-009** The feature must produce a disposition table covering every control the audit found,
  with one of: wired / honestly disabled / removed / deferred, and a named destination feature for
  every deferral.
- **FR-010** This feature is forward-only. It must not rewrite shipped features to satisfy the
  directive; it fixes controls and records decisions. Existing tests that assert inertness
  (`chats-settings-page.spec.ts` "row activation is a no-op", `contact-page.spec.ts` "the Groups row
  stays a no-op", `font-size-page.spec.ts` "the other chevron rows stay inert",
  `notifications-page.spec.ts` "row activation is a no-op") must be **updated to the new
  disposition**, not deleted to make a suite pass.
- **FR-011** Notifications keeps its flat-toggle rendering, per the owner's clarification. The
  unreachable `NotificationsPage.onRowActivate` and the dead `<button>` block it can never reach
  (`notifications-page.html:26-37`) must be **removed**, and `notifications-page.spec.ts:56`'s
  "row activation is a no-op" test — which clicks a `<div>` wrapper and so never exercised the
  handler it is named after — must be replaced with a test of the toggle behaviour that actually
  ships. The gap audit's B10 "3 sub-screens" entry is recorded as superseded: it described a shape
  that was never intended, and it is not a destination for any deferral.

### Non-Functional Requirements

- **Accessibility is part of done**: a disabled control is genuinely disabled and not focusable as
  an active control; every live control has an `aria-label`; no control is focusable while
  swallowing activation.
- **No new dependencies** without owner approval.
- **Tokens only** in any styling; no raw values.
- **Deterministic tests**: no `setTimeout`; no dependence on the real clock; no shared state.
- **Full suite green** before each commit, with the exact count reported.

## Review Gates

- **G1** — Figma: not applicable to the honesty fixes. For any control that becomes *wired* to
  design-verified chrome, the existing node is the reference. No node ID is invented.
- **G2** — `npm run build` green; **full** unit suite green with the exact count reported.
- **G3** — Closure with the disposition table complete, and every deferral naming a destination
  feature.
- **G4** — The functional directive, **scoped to this feature's disposition set**: every control F-046
  touches must end in one of exactly two states — wired to real state, or genuinely disabled. There
  is no third state, and no control may be left swallowing activation while still looking live.
  This gate deliberately does **not** claim the whole surface is clean: per Clarification 2 the
  ~20 empty-handler rows (Account, Data-and-storage, Chats settings, Contact info, Status, Camera)
  are left for their own features and will still be inert. They are recorded in `disposition.md`
  with a named destination so the remainder is tracked work, not a forgotten gap.

## Out of Scope Changes

- Adding `HttpClient`, a repository layer, or any HTTP client dependency. That is the F-047
  persistence-port seam discussed in `specs/045-calling-flow/research.md` §9, and is deliberately a
  separate feature.
- Any change to `ChatStore` chat/message semantics, or to the call flow shipped in F-045.

## Risks

- **Scope creep into a rewrite.** Making prefs real could cascade (e.g. `mediaVisibility` touches
  message rendering). Mitigation: FR-006 permits honest-disabling as a valid outcome precisely so
  this feature can be bounded. Disposition must be a real option, not a formality.
- **Deleting tests to pass.** FR-010 forbids it explicitly; the inertness assertions encode real
  decisions that this feature is now revisiting, so they must be rewritten, not removed.
- **"Honestly disabled" becoming a dumping ground.** Mitigation: FR-009 requires a named destination
  for every deferral, so a disabled control is a scheduled item rather than a quiet regression. The
  risk is real for the six unread prefs, where disabling every one of them would technically satisfy
  FR-006 while leaving the user's settings screen no more honest than before.

## Dependencies

- None blocking. This feature reads the existing stores and templates only.
- Related: `specs/045-calling-flow/research.md` §9 (backend seam, renumbered F-047).

## Review Notes

- The audit that motivated this feature is recorded in `research.md` for this spec, with per-area
  findings, file/line citations, and a verified-live list so the sweep does not redo finished work.
