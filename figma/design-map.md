# Figma → Angular Design Map

**Figma File**: [`WhatsApp UI Screens (Community)`](https://www.figma.com/design/PcGX72lSWkYIk3pL5V8PS3/WhatsApp-UI-Screens--Community-) (file key `PcGX72lSWkYIk3pL5V8PS3`)

**Canvas**: `WhatsApp` (node `0:8102`) — 24 screens, all iPhone-resolution frames.

Node IDs below are taken directly from Figma via the Figma API. URLs use the hyphen form (`0-8855`); API form uses colons (`0:8855`).

## Screen-to-Feature Map

| # | Feature | Figma Frame | Node ID | Angular Feature | Spec |
| - | ------- | ----------- | ------- | --------------- | ---- |
| 1 | Chat List (Chats) | WhatsApp Chats | `0:8855` | `features/chat-list` — ✅ **implemented** (US1–US3, 2026-09-23) | 001 |
| 2 | Chat Window | WhatsApp Chat | `0:8257` | `feature/chat-window` — ✅ **implemented** (US1–US3, 2026-09-23) | 002 |
| 3 | Chats (Edit mode) | WhatsApp Chats Edit | `0:8114` | `feature/chat-list` (edit) — ✅ **implemented** (US1–US3, 2026-09-23) | 003 |
| 4 | Calls | WhatsApp Calls | `0:10395` | `feature/calls` | — |
| 5 | Calls (Edit mode) | WhatsApp Calls Edit | `0:8597` | `feature/calls` (edit) | — |
| 6 | Status (feed) | WhatsApp Status | `0:8498` | `feature/status` | — |
| 7 | Status (compose) | WhatsApp Status | `0:9634` | `feature/status` (compose) | — |
| 8 | Starred Messages | WhatsApp Starred Messages | `0:8820` | `feature/starred-messages` | — |
| 9 | New Chat (Add) Modal | WhatsApp Add Modal | `0:9072` | `shared/components/action-sheet` | — |
| 10 | Chat Actions Modal | WhatsApp Chat Actions | `0:10087` | `shared/components/action-sheet` | — |
| 11 | Settings Modal | WhatsApp Settings Modal | `0:9778` | `shared/components/action-sheet` | — |
| 12 | Camera | WhatsApp Camera | `0:9155` | `feature/camera` | — |
| 13 | Settings | WhatsApp Settings | `0:9198` | `feature/settings` | — |
| 14 | Account | WhatsApp Account | `0:9371` | `feature/settings/account` | — |
| 15 | Contact Info | WhatsApp Contact Info | `0:9486` | `feature/contact-info` | — |
| 16 | Chats Settings | WhatsApp Chats Settings | `0:9973` | `feature/settings` | — |
| 17 | Notifications | WhatsApp Notifications | `0:10758` | `feature/settings` | — |
| 18 | Data & Storage | WhatsApp Data and Storage Usage | `0:10894` | `feature/settings` | — |
| 19 | Edit Contact | WhatsApp Edit Contact | `0:10334` | `feature/contact-info` | — |
| 20 | Edit Profile | WhatsApp Edit Profile | `0:10659` | `feature/settings/profile` | — |
| 21 | Authorization | WhatsApp Authorization | `0:11030` | `feature/auth` | — |
| 22 | Cover | Cover | `7:257` | n/a (artboard cover) | — |

## Reusable Component → Figma Source

| Angular Component | Figma Reference | Node | Notes |
| ----------------- | --------------- | ---- | ----- |
| `chat-list-item` | Chat row (frame `Chat`) | `0:8115`, `0:8873` | Repeated per contact; avatar + name + preview + time |
| `call-list-item` | Call row (frame `Call`) | `0:8598`, `0:10396` | 12 instances on each Calls screen |
| `message-bubble` | Group `Message` | `0:8260` … `0:8414` | 13 instances on Chat screen |
| `composer` | Group `Send Message` | `0:8452` | Bottom input + send/actions |
| `navigation-bar` | Frame `Navigation Bar` | `0:8225`, `0:8995`, `0:10619` | Title + leading/trailing actions |
| `tab-bar` | Group `Tab Bar` | `0:8549`, `0:9004` | 5 items: Settings, Chats, Camera, Calls, Status |
| `status-bar` | Frame `Bars / Status Bar / iPhone X` | `0:8233` etc. | iOS status bar, time `9:41` |
| `home-indicator` | Frame `Bars / Home Indicator` | `0:8254` etc. | iOS home indicator |
| `action-sheet` | Group `Action Sheet` | `0:9075`, `0:9928`, `0:10283` | Bottom sheet used by 3 modals |
| `settings-row` | Group `Rows` | `0:9207`, `0:9200` | List rows used across Settings/Notifications/etc. |
| `fab` (Chat Actions) | Frame `Actions` | `0:8229`, `0:8991` | Floating action button on Chats screens |

## Design-System Source

| Source | Status |
| ------ | ------ |
| Design tokens / Styles API | Empty — the file defines **no** Figma styles or variables (`sources: 0`). Raw values must be read from nodes. |
| Local variables | **Not accessible** — API requires `file_variables:read` scope (current token lacks it). |
| Raw node values | Available — colors, typography, spacing extracted from node payloads (see `design-analysis.md`). |

## Drift Tracking

This map is the canonical Figma ↔ implementation traceability index. Update it when:

- A screen, frame, or component is added/removed/renamed in Figma
- A feature is implemented, so its `Spec` column can be linked
- A node ID changes (Figma node IDs can shift when frames are reparented)
- **Owner-approved drift** is introduced (e.g., responsive breakpoints at 2026-09-23, feature 001)

If a Figma node referenced by an implemented feature changes, evaluate design drift per the constitution before modifying code.