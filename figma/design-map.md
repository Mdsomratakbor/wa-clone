# Figma → Angular Design Map

**Figma File**: [`WhatsApp UI Screens (Community)`](https://www.figma.com/design/PcGX72lSWkYIk3pL5V8PS3/WhatsApp-UI-Screens--Community-) (file key `PcGX72lSWkYIk3pL5V8PS3`)

**Canvas**: `WhatsApp` (node `0:8102`) — 24 screens, all iPhone-resolution frames.

Node IDs below are taken directly from Figma via the Figma API. URLs use the hyphen form (`0-8855`); API form uses colons (`0:8855`).

## Screen-to-Feature Map

| # | Feature | Figma Frame | Node ID | Angular Feature | Spec |
| - | ------- | ----------- | ------- | --------------- | ---- |
| 1 | Chat List (Chats) | WhatsApp Chats | `0:8855` | `features/chat-list` — ✅ **implemented** (US1–US3, 2026-09-23); `New Group` live since F-040, `Broadcast Lists` live since F-042 (opens `/broadcasts`; broadcast screen chrome provisional - no broadcast screen node known) | 001, 040, 042 |
| 2 | Chat Window | WhatsApp Chat | `0:8257` | `feature/chat-window` — ✅ **implemented** (US1–US3, 2026-09-23); header `Call` / `Video call` start a real call since F-045 (in-call chrome PROVISIONAL). Since F-046 the `Wallpaper` action is **honestly disabled** - the picker it belongs to has no capturable imagery until 2026-10-02 18:38 UTC. The chrome above is unchanged | 002, 045, 046 |
| 3 | Chats (Edit mode) | WhatsApp Chats Edit | `0:8114` | `feature/chat-list` (edit) — ✅ **implemented** (US1–US3, 2026-09-23); list excludes group/broadcast kinds since F-042 | 003, 042 |
| 4 | Calls | WhatsApp Calls | `0:10395` | `feature/calls` — ✅ **implemented** (US1–US3, 2026-09-23); call-info button opens a sheet since F-043, row tap since F-038; the calling flow (picker + in-call screen) and `+ new call` since F-045 — new chrome PROVISIONAL, no Figma node exists | 004, 038, 043, 045 |
| 5 | Calls (Edit mode) | WhatsApp Calls Edit | `0:8597` | `feature/calls` (edit) — ✅ **implemented** (US1-US3, 2026-09-23) | 005 |
| 6 | Status (feed) | WhatsApp Status | `0:8498` | `feature/status` — ✅ **implemented** (US1–US3, 2026-09-23); Privacy + My Status row navigate since F-035; the tip is now conditional and the `My Status` subtitle data-driven since F-049, and since F-050 the camera circle opens photo mode while the feed can render a published **photo** in a `role="status"` region. Since F-052 the post-publish photo is a rounded preview block (radius 8px, gutters 16px, max-height 280px, cover) rather than a 43px smear — block geometry is PROVISIONAL, no Figma node shows a published status | 006, 035, [`049`](../specs/049-status-publishing), [`050`](../specs/050-photo-status), [`052`](../specs/052-status-photo-preview) |
| 7 | Status (compose) | WhatsApp Status | `0:9634` | `feature/status` (compose) — ✅ **implemented** (US1–US3, 2026-09-23; a real single-line input replaced the decorative `<p>` + fake caret and `Send` publishes since F-049; the text-bar glyph is now genuinely `disabled` because its contact picker is backend work — the disabled treatment is PROVISIONAL). Since F-050 the camera circle enters a **photo mode** (`?kind=photo`) of this same verified frame: a labelled file input + preview replace the field and keyboard, the photo is downscaled and stored (photo variant PROVISIONAL — no node exists for it). Since F-051 the on-screen keyboard is a real provisional CSS QWERTY (dark `keyboard-*` tokens, 44px keys, 6px gaps/radius, one-shot shift): keys type into the same value as the input and its Send publishes — values PROVISIONAL pending the G1 capture, superseding the F-050 T013 deferral. Since F-053 the field is a growing single-row `textarea` (5-line cap, internal scroll) and published statuses keep their computed line breaks (no Figma node shows a grown field). Since F-054 every row shows an owner-approved one-line description beneath the label (PROVISIONAL copy — capture blocked by an expired token). Since F-055 the profile header also shows the user's About text beneath "Tap to edit profile" when set (PROVISIONAL) | 007, [`049`](../specs/049-status-publishing), [`050`](../specs/050-photo-status), [`051`](../specs/051-status-keyboard), [`053`](../specs/053-status-input-expand), [`054`](../specs/054-settings-row-descriptions), [`055`](../specs/055-profile-informative) |
| 8 | Starred Messages | WhatsApp Starred Messages | `0:8820` | `feature/starred-messages` — ✅ **implemented** (US1–US3, 2026-09-23; golden/chevron assets deferred to Figma capture ~09-28) | 008 |
| 9 | New Chat (Add) Modal | WhatsApp Add Modal | `0:9072` | `shared/components/action-sheet` — ✅ **implemented** (US1–US3 structure, 2026-09-24; exact geometry/glyphs/golden deferred to Figma capture ~09-28) | [`009`](../specs/009-new-chat-modal) |
| 10 | Chat Actions Modal | WhatsApp Chat Actions | `0:10087` | `shared/components/action-sheet` — ✅ **implemented** (US1–US3 structure via chat-header More options, 2026-09-24; exact geometry/glyphs/golden deferred to Figma capture ~09-28) | [`010`](../specs/010-chat-actions-modal) |
| 11 | Settings Modal | WhatsApp Settings Modal | `0:9778` | `shared/components/action-sheet` — ✅ **implemented** (US1–US3 structure via Settings stub trigger, 2026-09-24; exact geometry/glyphs/golden deferred to Figma capture ~09-28; row 13 hosts later) | [`011`](../specs/011-settings-modal) |
| 12 | Camera | WhatsApp Camera | `0:9155` | `feature/camera` — ✅ **implemented** (US1–US3 structure: Camera tab navigates from chats/calls/status; viewport + Close/Shutter/Flip hypothesis controls, 2026-09-24; exact geometry/glyphs/golden deferred to Figma capture ~09-28). Since F-056 the screen shows the real-control chrome (Flash + Close top bar, gallery + shutter + flip bottom bar, HD chip) and a real **file-picker capture** (F-050 pipeline): shutter opens the picker, capture state shows a preview with Send-to-status / Retake, Close unchanged — all PROVISIONAL (node still uncaptured, expired Figma token) | [`012`](../specs/012-camera), [`056`](../specs/056-camera-capture-preview) |
| 13 | Settings | WhatsApp Settings | `0:9198` | `feature/settings` — ✅ **implemented** (US1–US3 structure: real screen replaces the stub, 011 modal re-hosted, Settings tab navigates everywhere, 2026-09-24; exact profile/rows/glyphs/golden deferred to Figma capture ~09-28) | [`013`](../specs/013-settings) |
| 14 | Account | WhatsApp Account | `0:9371` | `feature/settings/account` — ✅ **implemented** (US1–US3 structure: Settings Account row navigates, pushed screen w/ hero + hypothesis rows, 2026-09-24; exact rows/hero/glyphs/golden deferred to Figma capture ~09-28). Since F-054 every row shows an owner-approved one-line description beneath the label (PROVISIONAL copy). **F-046 deferral resolved by F-057 (2026-10-04)**: Security / Two-step verification / Change number / Delete my account each navigate to a real pushed sub-screen with honest local flows (persisted 6-digit two-step PIN + required recovery email; persisted device number via change-number; type-to-confirm delete that wipes chats/prefs/statuses/account). Sub-screen chrome is **provisional** — no design node exists; capture still blocked by the expired token | [`014`](../specs/014-account), [`046`](../specs/046-inert-control-sweep), [`054`](../specs/054-settings-row-descriptions), [`057`](../specs/057-account-settings) |
| 15 | Contact Info | WhatsApp Contact Info | `0:9486` | `feature/contact-info` — ✅ **implemented** (US1–US3 structure: chat header identity tap opens `/contact/:id`, pushed screen w/ hero + Messages + hypothesis rows, 2026-09-24; exact rows/hero/phone/glyphs/golden deferred to Figma capture ~09-28); `Media, photos and links` opens a per-contact media grid since F-044; `Groups` opens a shared-groups list since F-048 (derived from group membership; sub-screen chrome **provisional** — no node exists for it) | [`015`](../specs/015-contact-info), [`044`](../specs/044-media-screen), [`048`](../specs/048-contact-groups) |
| 16 | Chats Settings | WhatsApp Chats Settings | `0:9973` | `feature/settings` (chats-settings-page) — ✅ **implemented** (US1–US3 structure: Settings Chats Settings row navigates, pushed screen w/ hypothesis rows, 2026-09-24; exact rows/glyphs/golden deferred to Figma capture) - `Font size` row live since F-041; capture 2026-09-28 shows 4 row groups = 6 rows vs the 5-row seed (open finding). Since F-054 every row shows an owner-approved one-line description beneath the label, chevron and toggle branches alike (PROVISIONAL copy) | [`041`](../specs/041-font-size), [`054`](../specs/054-settings-row-descriptions) | [`016`](../specs/016-chats-settings) |
| 17 | Notifications | WhatsApp Notifications | `0:10758` | `feature/settings` (notifications-page) — ✅ **implemented** (US1–US3 structure: Settings Notifications row navigates, pushed screen w/ hypothesis rows, 2026-09-24; exact rows/toggles/glyphs/golden deferred to Figma capture ~09-28). Since F-054 every row shows an owner-approved one-line description beneath the label (PROVISIONAL copy) | [`017`](../specs/017-notifications), [`054`](../specs/054-settings-row-descriptions) |
| 18 | Data & Storage | WhatsApp Data and Storage Usage | `0:10894` | `feature/settings` (data-storage-page) — ✅ **implemented** (US1–US3 structure: Settings Data and Storage row navigates, pushed screen w/ hypothesis rows, 2026-09-26; exact rows/glyphs/golden deferred to Figma capture ~09-28). Since F-054 every row shows an owner-approved one-line description beneath the label (PROVISIONAL copy) | [`018`](../specs/018-data-storage), [`054`](../specs/054-settings-row-descriptions) |
| 19 | Edit Contact | WhatsApp Edit Contact | `0:10334` | `feature/contact-info` (edit-contact-page) — ✅ **implemented** (US1–US3 structure: Contact Info Edit action opens `/contact/:id/edit`, pushed form w/ prefilled Name + Phone + Save, 2026-09-26; entry is a declared hypothesis — design file has no interaction wiring — exact form/glyphs/golden deferred to Figma capture ~09-28) | [`019`](../specs/019-edit-contact) |
| 20 | Edit Profile | WhatsApp Edit Profile | `0:10659` | `feature/settings/profile` (profile-page) — ✅ **implemented** (US1–US3 structure: Settings profile header "Tap to edit profile" opens `/settings/profile`, pushed form w/ prefilled Name + About + Save, 2026-09-26; entry is a declared hypothesis — design file has no interaction wiring — exact form/glyphs/golden deferred to Figma capture ~09-28) — form hint captions added by F-055, PROVISIONAL) | [`020`](../specs/020-edit-profile), [`055`](../specs/055-profile-informative) |
| 21 | Authorization | WhatsApp Authorization | `0:11030` | `feature/auth` (auth-page) — ✅ **implemented** (structural: `/auth` cold-start screen w/ brand title, number region, 1–9/0 + backspace keypad, Continue no-op, no bars; 2026-09-26; **no entry wiring** — default `**` → `/chats` unchanged, cold-start flow + keypad state deferred; exact layout/glyphs/golden deferred to Figma capture ~09-28) | [`021`](../specs/021-auth) |
| 22 | Cover | Cover | `7:257` | n/a (artboard cover) | — |

## Reusable Component → Figma Source

| Angular Component | Figma Reference | Node | Notes |
| ----------------- | --------------- | ---- | ----- |
| `chat-list-item` | Chat row (frame `Chat`) | `0:8115`, `0:8873` | Repeated per contact; avatar + name + preview + time |
| `call-list-item` | Call row (frame `Call`) | `0:8598`, `0:10396` | 12 instances on each Calls screen |
| `message-bubble` | Group `Message` | `0:8260` … `0:8414` | 13 instances on Chat screen |
| `composer` | Group `Send Message` | `0:8452` | Bottom input + send/actions. F-058 (2026-10-04) wired `Add attachment`; the accessory sheet, pending photo strip, and photo bubble are PROVISIONAL chrome pending re-capture (node `0:8452` verified-uncaptured, G1 expired token 2026-10-03) |
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