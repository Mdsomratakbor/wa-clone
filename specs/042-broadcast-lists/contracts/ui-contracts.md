# UI Contracts: Broadcast Lists (feature 042)

**Provisional**: there is **no** Figma node for a broadcast screen. Every visual below is a
declared hypothesis and must be reconciled at G1 (capture blocked until 2026-10-02 18:38 UTC).

## `BroadcastsPage` - `/broadcasts`

| Element | Contract |
| ------- | -------- |
| Nav bar | `title="Broadcast lists"`, leading `Back` -> `/chats`, no trailing action, no tab bar |
| Root | `<main class="broadcasts" data-testid="broadcasts-page">` |
| Empty state | `role="status"`, `data-testid="broadcasts-empty"`, text `No broadcasts` |
| List | `<ul class="broadcasts__list" data-testid="broadcasts-list">` of `app-chat-list-item` |
| Row | the shared `ChatListItem`, unchanged: name, timestamp, preview, ticks |
| Row activation | marks the conversation read and navigates to `/chat/:id` |

## Chats nav action

| Element | Contract |
| ------- | -------- |
| `Broadcast Lists` | label and position unchanged (leading, before `New Group`); now navigates to `/broadcasts` |
| `New Group` | unchanged (`/new-group`) |

## Not shown

| Element | Contract |
| ------- | -------- |
| Tab bar | absent - pushed surface |
| Broadcasts in the Chats list | excluded by `kind` |
| Broadcasts in contact pickers | excluded by `kind` |

## Test hooks

`broadcasts-page`, `broadcasts-empty`, `broadcasts-list`, plus the existing
`chats-page` / `navigation-bar` hooks for the entry-point assertion.
