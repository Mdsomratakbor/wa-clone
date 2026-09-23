# UI Contracts - Feature 005: Calls Edit Mode

Shared-component contracts and the page state machine. Implemented exactly as specified; verify against Figma `0:8597`.

## `CallListItem` (extended, `src/app/shared/components/call-list-item/`)

| Input | Type | Default | Meaning |
| ----- | ---- | ------- | ------- |
| `call` | `CallEntry` | required | unchanged (004) |
| `editMode` | `boolean` | `false` | new: renders the leaded 21px red-minus + shifted content, hides the info button |

| Output | Type | When |
| ------ | ---- | ---- |
| `selected` | `CallEntry` | row body activated (unchanged emission; the page ignores it in edit mode) |
| `info` | `CallEntry` | info button activated (normal mode only - button not rendered in edit mode) |
| `remove` | `CallEntry` | NEW: the red minus activated |

Rendering deltas when `editMode()` is true:
- Row gains class `call-list-item--edit`: `padding-left: 47px` (avatar sits at Figma x47); `position: relative`.
- A 21x21 button `.call-list-item__remove` renders absolutely at `left: 17px`, vertically centred; `data-testid="call-remove"`, `aria-label = "Remove call for <name>"`, `(click)` -> `remove.emit(call)`.
- Inside it the red-minus SVG (path re-exported from Figma `0:8606`, `tests/e2e/golden/calls-edit-remove-icon.svg`): `#FF3B30` disc + white bar, `aria-hidden="true"`.
- The trailing info button is conditionally hidden: `@if (!editMode())`.
- The row keeps `role="button"`/`tabindex 0`/existing `aria-label`; focus ring applies to the row and the minus button.
- Separator inset derives from content shift (row already owns its `::after`; allow a `--edit` override so the inset becomes 99px to match Figma).

Normal mode (`editMode=false`) rendering is byte-identical to feature 004.

## `NavigationBar` + `NavAction` (extended)

`NavAction` (`src/app/features/chat-list/chat.model.ts`) gains optional `disabled?: boolean`.

| NavAction field | Type | Default | Meaning |
| --------------- | ---- | ------- | ------- |
| `disabled` | `boolean` | `false` | renders the action with the native `disabled` attribute |

`NavigationBar` template: add `[disabled]="item.disabled || undefined"` to the `.navigation-bar__action` buttons (both leading and trailing groups).

`navigation-bar.scss`: add

```scss
&:disabled {
  color: #c7c7cc;
  cursor: default;
}
```

(native `disabled` removes the button from tab order and stops click emissions - the feature-003 disabled pattern).

## `CallsPage` state machine (`src/app/features/calls/`)

```text
state      : editMode = signal(false)
             items    = signal<CallEntry[]>([])  // effect: items.set([...calls()])
header     : leading  = computed(editMode ? [{id:'done', label:'Done'}]
                                            : [{id:'edit', label:'Edit'}])
             centre   = [data-nav-center] All|Missed segment (unchanged from 004, static)
             trailing = computed(editMode
                            ? [{id:'clear', label:'Clear', disabled: items().length === 0}]
                            : [{id:'new-call', label:'New call', icon:'new-call'}])
onNavAction: 'edit'  -> editMode.set(true)
             'done'  -> editMode.set(false)
             'clear' -> items.set([])
             else    -> no-op (new-call)
onCallRemove(call)   : if editMode -> items.update(list => list.filter(c => c.id !== call.id))
onCallSelected       : editMode -> return (no-op); normal -> no-op (004 calling-flow scope)
onTabSelect(key)     : editMode -> return (guard, Clarification 4)
                       else existing 004 logic (chats -> /chats, calls -> no-op, other -> stub)
list                 : @if (items().length)  render <ul data-testid="call-list"> rows
                       @else (activeTab === 'calls') render <div data-testid="empty-state" role="status"> "No calls"
                       (activeTab !== 'calls')      render existing stub
```

`app-call-list-item` wires `(selected)="onCallSelected($event)"` and `(remove)="onCallRemove($event)"`.

Header in BOTH modes keeps `title=""` and the identical segmented control (`data-testid="calls-filter"`, `filter-all` active / `filter-missed`, both disabled - feature-004 contract unchanged).

## Empty state markup (page-owned)

```html
<div class="calls-page__empty" role="status" data-testid="empty-state">
  <p class="calls-page__empty-text">No calls</p>
</div>
```

Styled like the `No chats` placeholder (`chats-page.scss` empty-state block) - centred, secondary text, fills the list area.

## Unit-test fixtures to add

- `CallListItem`: `editMode=true` renders `.call-list-item__remove` (`data-testid="call-remove"`, `aria-label "Remove call for <name>"`), emits `remove` once, no info button, `--edit` class present; click on the minus does not bubble to the row handler.
- `NavigationBar`: an action with `disabled: true` renders the native `disabled` attribute and emits nothing on click.
- `CallsPage`: `Edit` enters edit mode, `Done` exits; `remove` deletes exactly that row; `clear` empties and `Clear` turns disabled; `No calls` empty state; row-body no-op in edit mode; tab select inert in edit mode.

## E2E swap list (feature-004 tests that MUST change)

- `tests/e2e/calls.spec.ts`: the "all header and row controls are no-ops" test now excludes `Edit` (it enters edit mode) and keeps `+ new call`, row activation, info button as no-ops - rename to reflect the 005 scope.
- `src/app/features/calls/calls-page.spec.ts`: the no-ops test likewise drops `Edit`; new edit-mode tests (above) cover it.
- `tests/e2e/focus.spec.ts`: unaffected (004 focus cases stay); edit-mode focus coverage lives in `calls-edit.spec.ts`.
- `tests/e2e/responsive.spec.ts`: add a `/calls` edit-mode no-overflow case alongside the existing ones.

## Shared notes

- No new dependencies, no raster assets (red minus is inline SVG), tokens reused (`--wa-call-row-height`, `--wa-fs-control`).
- `calls.spec.ts` "renders chrome" and the golden screenshot tests must keep passing (normal mode unchanged).