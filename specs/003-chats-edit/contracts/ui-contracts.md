# UI Contracts — Feature 003: Chats Edit

Shared-component contracts and the page state machine. Implemented exactly as specified; verify against Figma `0:8114`.

## `ChatListItem` (extended, `src/app/shared/components/chat-list-item/`)

| Input | Type | Default | Meaning |
| ----- | ---- | ------- | ------- |
| `chat` | `ChatPreview` | required | unchanged (001) |
| `selectMode` | `boolean` | `false` | edit mode: render circle + checkbox semantics; row activation emits but does not navigate (page decides) |
| `checked` | `boolean` | `false` | circle selected state |

| Output | Type | When |
| ------ | ---- | ---- |
| `selected` | `ChatPreview` | row activated (click / Enter / Space), both modes |

Rendering in `selectMode`:
- `role="checkbox"`, `aria-checked` bound to `checked`, `aria-label = "<name>"`.
- Leading 21px circle (inline SVG) at the 16px gutter; content shifted `padding-left: 55px`.
  - unselected: ring `stroke #3C3C43 1.5px`, `opacity 0.42`;
  - selected: `fill #007AFF`, white check path.
- `data-testid="select-circle"` (+ `select-circle--checked` when selected).

Normal mode equals feature-001 output exactly (`role="button"`, no circle).

## `ChatActionsBar` (new, `src/app/shared/components/chat-actions-bar/`)

| Input | Type | Default | Meaning |
| ----- | ---- | ------- | ------- |
| `selectedCount` | `number` | `0` | drives disabled + color state |

| Output | Type | When |
| ------ | ---- | ---- |
| `archive` | `void` | `Archive` activated & enabled |
| `readAll` | `void` | `Read All` activated & enabled |
| `delete` | `void` | `Delete` activated & enabled |

Rendering:
- `role="toolbar"`, `aria-label="Chat actions"`, `data-testid="chat-actions"`.
- Height `49px` (`--wa-tab-bar-height`), background `--wa-bar-surface`, top hairline `0 -0.33px 0 #A6A6AA` (`--wa-nav-hairline`).
- Buttons `Archive`, `Read All`, `Delete` in that visual order (left · centre · right).
- `selectedCount === 0` → all `disabled`, color `--wa-text-tertiary`≈`#C7C7CC` (spec: `#C7C7CC`; use `#C7C7CC`).
- `selectedCount > 0` → `Archive`/`Read All` `color --wa-accent` (`#007AFF`), `Delete` `color #FF3B30`; all actionable.
- `:focus-visible` ring like `NavigationBar` actions.

## `ChatsPage` state machine (`src/app/features/chat-list/`)

```text
normal ──Edit action──▶ edit            edit ──Done action──▶ normal
edit:   items = [...CHAT_SEED] (page-owned working copy)
        selected = Set<id>  (cleared on both transitions)
actions
  row activate  : edit? toggle(id)  : navigate /chat/{id}
  Archive/Delete: items.remove(selected); selected.clear()
  Read All      : no-op
empty items in either mode → existing `No chats` placeholder
```

- Trailing nav actions: `[Edit]` normal ↔ `[Done]` edit (same slot, `#007AFF`).
- In edit: FAB and `TabBar` hidden; `ChatActionsBar` rendered in the tab-bar slot.
- `items` seeds from the `conversations` input once and on input change (so tests may inject `[]`), but action mutations never rewrite from the input.
  - Simplest compliant pattern: mirror the input into a `signal` via `effect` that only runs when the input reference changes; guard so it never clobbers an intentional empty-after-delete.

## Layout / geometry tokens (all reused)

| Legend | Value |
| ------ | ----- |
| row-height | `68px` (001 drift vs Figma 74) |
| gutter / circle | 16px, 21px circle |
| edited row content pad | `55px` |
| bar visible height | `--wa-tab-bar-height` (49px) |
| bar bg / hairline | `--wa-bar-surface` / `--wa-nav-hairline` |
| action fs | `--wa-fs-nav-action` (17px) |

## Swap/consistency notes

- `chats.spec.ts` "renders chrome" and "golden `0-8855`" must keep passing unchanged (FR-009).
- `focus.spec.ts` FAB/nav test clicks `Edit`, then the FAB and a row — its order must be updated (exit edit via `Done` before FAB/row activation) to keep green.
- `responsive.spec.ts` gains an edit-mode overflow case alongside the existing ones.