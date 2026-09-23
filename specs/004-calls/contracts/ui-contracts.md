# UI Contracts - Feature 004: Calls

Shared-component contracts and the page state machine. Implemented exactly as specified; verify against Figma `0:10395`.

## `CallListItem` (new, `src/app/shared/components/call-list-item/`)

| Input | Type | Default | Meaning |
| ----- | ---- | ------- | ------- |
| `call` | `CallEntry` | required | name, direction, date, avatarRef |

| Output | Type | When |
| ------ | ---- | ---- |
| `selected` | `CallEntry` | row activated (click / Enter / Space) |
| `info` | `CallEntry` | info button activated |

Rendering (per row, 375x56):
- `role="button"`, `tabindex 0`, `aria-label = "<name>, <direction>, <date>"`; row click/Enter/Space emits `selected` once.
- 40px `UserAvatar` (`avatarRef`/`name`).
- Line 1: name (16px/400, `--wa-on-surface`; `--wa-text-danger`-equivalent `#FF3B30` when `direction === 'missed'`, class `call-list-item__name--missed`) + right-aligned date (14px/400 `--wa-text-secondary`).
- Line 2: 15x15 arrow glyph + direction label (14px/400 `--wa-text-secondary`), glyph path = exported Figma `0:10402` (`fill #8E8E93`).
- Trailing info button (22x22, `#007AFF` circled "i", path from Figma `0:10404`), `type="button"`, `aria-label = "Call info for <name>"`, `data-testid="call-info"`; activation emits `info` and MUST NOT bubble to row activation (`stopPropagation`).
- Separator: 0.33px `rgba(60,60,67,0.29)` inset from `x68` (`::after`, `left: 68px`).
- Row background `#FFFFFF` (`--wa-surface-variant`); `:focus-visible` ring on rows and the info button.

Geometry tokens: row height `--wa-call-row-height` (56px), body gap 12px (`padding: 10px 16px`; avatar 16px gutter).

## `NavigationBar` (extended, `src/app/shared/components/navigation-bar/`)

| Input | Type | Default | Meaning |
| ----- | ---- | ------- | ------- |
| `title` | `string` | `''` | now optional; empty -> no `<h1>` |
| `leading` | `NavAction[]` | `[]` | unchanged |
| `trailing` | `NavAction[]` | `[]` | unchanged; items may carry `icon: 'new-call'` |

Centre column: renders `<h1 class="navigation-bar__title">` only when `title` is non-empty, plus `<ng-content select="[data-nav-center]" />` (page projects the segmented control).

Actions: when `item.icon === 'new-call'` render the phone-plus `#007AFF` SVG (24x24, path from Figma `0:10630`) inside the same button, `aria-label = item.label`; otherwise the text label as today.

`NavAction` (`src/app/features/chat-list/chat.model.ts`) gains optional `icon?: 'new-call'`.

## `CallsPage` (new, `src/app/features/calls/`)

```text
route      : { path: 'calls', loadComponent: CallsPage }
tabs       : TAB_KEYS order (001), active = 'calls'
tab select : 'chats' -> router.navigate(['/chats'])
             key === 'calls' -> no-op
             else            -> activeTab.set(key)   (existing "coming soon" stub)
no-ops      : Edit, new-call, row activation, info button
header      : leading = [{ id: 'edit', label: 'Edit' }]
              centre  = [data-nav-center] All|Missed segment (static, disabled)
              trailing = [{ id: 'new-call', label: 'New call', icon: 'new-call' }]
```

CallsPage renders `NavigationBar` + list `ul[data-testid="call-list"]` of `CallListItem` + `TabBar`; never a FAB; stub content identical to ChatsPage for non-chats/non-calls tabs.

## Segmented control markup (page-owned)

```html
<div class="calls-page__filter" data-nav-center data-testid="calls-filter">
  <button type="button" disabled class="calls-page__filter-item calls-page__filter-item--active"
          aria-selected="true"  data-testid="filter-all">All</button>
  <button type="button" disabled class="calls-page__filter-item"
          aria-selected="false" data-testid="filter-missed">Missed</button>
</div>
```

Styles: 151x28, border `1px rgba(0,122,255,0.756)`, radius 8, `overflow: hidden`; halves flex 1:1; active = bg `#007AFF` text `#FFFFFF`; inactive = bg `#FFFFFF` text `#007AFF`; font 13px/500 (`--wa-fs-control`, new).

## Shared tokens added

| Token | Value |
| ----- | ----- |
| `--wa-call-row-height` | 56px |
| `--wa-fs-control` | 13px |

## Swap/consistency notes

- `chats.spec.ts` "renders chrome" + golden `0-8855` must keep passing unchanged.
- `chats-page.spec.ts` "switches to a placeholder when a non-chats tab is selected" (Status) still passes; a new case asserts the `Calls` tab navigates to `/calls`.
- `navigation-bar.spec.ts` existing cases (title required semantics) must be adjusted only for optional-title behaviour (they may assert with a non-empty title).
- `responsive.spec.ts` gains a `/calls` overflow case alongside existing ones.