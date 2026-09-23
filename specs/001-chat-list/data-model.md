# Data Model — Feature 001: WhatsApp Chats

Extracted from `spec.md` entities. No persistence — in-memory static seed only.

## Entity: ChatPreview

Represents one conversation row in the Chats list.

| Field | Type | Required | Constraints |
| ----- | ---- | -------- | ----------- |
| `id` | `string` | Yes | Stable, unique (`chat-001` … `chat-009`) |
| `contactName` | `string` | Yes | Non-empty; ellipsized if overflowed |
| `preview` | `string` | Yes | Latest message text; multi-line allowed, ellipsized |
| `timestamp` | `string` | Yes | **Static display string** from Figma (e.g. `"10/30/19"`) — never computed (decision 3) |
| `avatarRef` | `string \| null` | Optional | Image source; `null` → initials fallback |

Validation rules:
- All fields present for seed rows; `contactName` and `preview` non-empty.
- `avatarRef` failure → `UserAvatar` falls back to initials (`AvatarFallback`, contract `avatar`).

### State transitions

None — static data (no loading/error mutation in 001). Empty state is an input condition (`conversations.length === 0`), not a transition.

## Entity: TabItem

| Field | Type | Required | Constraints |
| ----- | ---- | -------- | ----------- |
| `key` | `'settings' \| 'chats' \| 'camera' \| 'calls' \| 'status'` | Yes | Union type; order fixed per Figma |
| `label` | `string` | Yes | Figma label text |
| `active` | `boolean` | Yes | Exactly one active; `chats` default (FR-008/FR-010) |

## Seed data (static, exact Figma content — node `0:8855`)

| # | contactName | preview | timestamp |
| - | ----------- | ------- | --------- |
| 1 | Maximillian Jacobson | Bro, I have a good idea! | 10/30/19 |
| 2 | Andrew Parker | What kind of strategy is better? | 11/16/19 |
| 3 | Kieron Dotson | Ok, have a good trip! | 7/29/19 |
| 4 | Tabitha Potter | Actually I wanted to check with you about your online business plan on our… | 8/25/19 |
| 5 | Maisy Humphrey | faster, look at Pixsellz | 8/20/19 |
| 6 | Martha Craig | Welcome, to make design process | 8/20/19 |
| 7 | Martin Randolph | Yes, 2pm is awesome | 11/19/19 |
| 8 | Karen Castillo | 0:14 | 11/15/19 |
| 9 | Joshua Lawrence | Do you like WhatsApp UI? | 10/20/19 |

Exact strings and page order read from the Figma node text elements during analysis (2026-09-23).