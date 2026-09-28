# Research: Call Info Sheet (feature 043)

## Gap audit B6

B6 lists three dead controls on the Calls screen: `New call`, row tap, call info. Row tap went live
in F-038 (`specs/038-call-log`), so B6's remaining surface is `+ new call` and the `ⓘ` button.

## Current state of the Calls screen

`src/app/features/calls/calls-page.ts`:

- `onCallInfo(_call)` — empty, comment: "F-038: call info stays inert - it needs a call-info surface
  (audit B6)."
- `onNavAction` — `new-call` falls through with "stays inert - it needs a call surface (audit B6)."
- `onCallSelected` — resolves `chatIdForContactName(call.contactName)`, returns early on `null`,
  else navigates to `/chat/:id`. This is the behaviour `Message` reuses.

`CallListItem` (`src/app/shared/components/call-list-item/call-list-item.ts`):

- Outputs `selected`, `info`, `remove`. `onInfo` and `onRemove` call `event.stopPropagation()`, so
  the row's own `onActivate` does not fire — the stop-propagation risk is already handled at the
  source.
- The `ⓘ` button is inside an `@if (!editMode())` guard, so it is already hidden in edit mode.
- `infoLabel` = `Call info for {contactName}`.

`CallStore` (`src/app/core/call.store.ts`): `calls` signal, `removeCall(id)`, `clearCalls()`,
persisting to `wa.call-store.v1` version `1`. `removeCall()` already persists — F-043 needs no
store change.

## Reusable surface

`app-action-sheet` (`src/app/shared/components/action-sheet/action-sheet.ts`) takes `title`,
`actions`, emits `action` / `dismiss`, and renders `role="dialog"` + `aria-modal` + a `Close`
backdrop button. It renders nothing when `actions()` is empty. Already used by three features:

| Consumer | File |
|----------|------|
| Add Modal | `src/app/features/new-chat-modal/add-modal.ts` |
| Chat Actions | `src/app/features/chat-window/chat-actions-modal.ts` |
| Settings Modal | `src/app/features/settings/settings-modal.ts` |

Each of those three is a thin wrapper that adds the `Escape` `HostListener` and re-emits. F-043
follows that exact pattern rather than lifting the listener into `ActionSheet` — changing a shared
component used by three shipped features is out of scope for this feature.

## Design availability

`figma/design-analysis.md` §6.1 lists the file's screens. The Calls entries are
`0:10395` / `0:8597` — the list and its edit mode. There is **no call screen and no call-info sheet**
among the 24 frames. `figma/design-map.md` has no row for either.

`design-analysis.md` §6.1 note 7 reads "Calls → Info/Actions: call row tap → contact/call actions",
which is the design file's own annotation of intent for the `ⓘ` button but carries no node ID and no
layout. So the four action labels and their order are hypotheses, and the Figma API is `429` until
2026-10-02 18:38 UTC anyway.

## Precedent for inert-but-focusable controls

F-004 decision 3 approved `+ new call`, row activation and the info button as "focusable, no effect",
explicitly citing the `Broadcast Lists` / `Read All` no-op precedent. F-043 therefore keeps
`Voice call` / `Video call` rendered and focusable rather than dropping rows the real app shows.
AGENTS.md requires a disabled control to be genuinely disabled and forbids click-through no-ops, and
these are neither: they are real buttons whose effect is a dismissal.

## Decision: no store change

A sheet is view state. Putting `infoCall` in `CallStore` would mean persisting it in the
`wa.call-store.v1` snapshot, which should hold call history only. The page already owns `editing`
as a local signal, so a second local signal is the consistent choice.
