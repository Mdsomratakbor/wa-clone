# Contracts — Feature 001: WhatsApp Chats

UI contracts for the Angular application (no external API in this feature). These are the input/output contracts each shared component exposes, derived from `data-model.md` and the Figma node values.

## `UserAvatar`

| Input | Type | Required | Constraints |
| ----- | ---- | -------- | ----------- |
| `src` | `string \| null` | No | Image URL; `null`/failure → initials fallback |
| `name` | `string` | Yes | Source of initials (`A`/`B` for two words) |
| `size` | `px` | No (default 48) | Diameter; circular mask |

Output: none (visual). Events: none.
Accessibility: `role="img"` + `aria-label="<name> avatar"`.

## `ChatListItem`

| Input | Type | Required | Constraints |
| ----- | ---- | -------- | ----------- |
| `chat` | `ChatPreview` | Yes | See data-model.md |
| `index` | `number` | Yes | For list semantics/id stability |

Output: `@Output() selected` — emitted on row activation (Enter/click).
Accessibility: rendered as list-member with row role; separator via hairline `#A6A6AA`.

Figma: row text — name `16/600 lh21 #000000`, preview+time `14/400 lh16.7 #8E8E93` (node `0:8855`).

## `NavigationBar`

| Input | Type | Required | Constraints |
| ----- | ---- | -------- | ----------- |
| `title` | `string` | Yes | `Chats` for 001 |
| `leading` | `NavAction[]` | No | 001: `Broadcast Lists`, `New Group` |
| `trailing` | `NavAction[]` | No | 001: `Edit` |

| `NavAction` | type | constraints |
| ----- | ----- | ----------- |
| `label` | string | text of action |
| `id` | string | stable key |

Accessibility: `<nav>` + `aria-label="Navigation bar"`; actions are buttons with visible focus.
Figma: actions `17/400 #007AFF`, title `17/600 #000000`; bottom hairline `#A6A6AA` + shadow `#3C3C43 29%`.

## `TabBar`

| Input | Type | Required | Constraints |
| ----- | ---- | -------- | ----------- |
| `items` | `TabItem[]` | Yes | 5 items, exact Figma order |
| `activeKey` | `TabKey` | Yes | default `chats` |

`@Output() select(key)` — active-state toggling only in 001 (no routing).

Accessibility: `role="tablist"`; items `role="tab"` + `aria-selected`; focusable via roving tabindex. Tab order: Settings · Chats · Camera · Calls · Status.
Figma: label `10/500 lh11.9`, active `#007AFF` / inactive `#545458`.

## `Fab` (Actions)

| Input | Type | Required | Constraints |
| ----- | ---- | -------- | ----------- |
| `label` | `string` | No | `aria-label`; visually icon-only |

`@Output() pressed`.
Figma: floating round button at list bottom-right (node `Actions` `0:8229`).

## Root route contract

| Route | Renders | Notes |
| ----- | ------- | ----- |
| `/` (default) | `ChatsPage` | FR-008; empty route redirect |

## Seed contract

`chat-list.seed.ts` exports `CHAT_SEED: ChatPreview[]` (9 rows, exact Figma strings — data-model.md). Used by `ChatsPage`; also used by tests.