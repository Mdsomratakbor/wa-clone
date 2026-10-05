# F-046 — Disposition table (FR-009, G3)

Every control the audit found, and what happened to it. One of **wired**,
**honestly disabled**, **removed**, or **deferred**. Every deferral names a
destination feature, so the remainder is tracked work rather than a forgotten gap.

`wired` means a user action reaches real state. `honestly disabled` means a
native `disabled` control (or an `Action.disabled` row) that cannot be
activated, is out of the tab order, and does not look live. `removed` means the
code is gone. `deferred` means out of scope for this feature and untouched.

**The four dispositions that are not "honestly disabled" are the point of this
feature.** A disabled control is a promise to come back. An enabled control that
swallows activation is a lie.

## Wired

| Control | Reaches | Notes |
| ------- | ------- | ----- |
| Composer `Camera` | Router → `/camera` | Destination already existed (F-012); the button just never called it. |
| `showPreviews` | `chat-list-item` preview visibility | Judgment call: there is no notification pipeline to gate, so the pref was wired to the one place message content is shown. Name, timestamp, and read ticks are unaffected. |
| Calls `All` / `Missed` | `filter` signal → derived `items` | Required fixing `isMissedCall` first — see Clarification 5. |
| `mediaVisibility` | `MessageBubble` media masking | **RESOLVED by F-059 (2026-10-04)**: returned from the "deleted keys" set only because a consumer landed in the same commit (bubble-level privacy placeholder), which is exactly the rule in "What a later feature must not do" below. Preview on the chat list is untouched. |
| Prefs `sound`, `vibrate` | `ChatWindowPage` outbound send feedback | **RESOLVED by F-060 (2026-10-04)**: keys returned **with a consumer in the same feature** — a successful chat send plays a short Web-Audio tone (sound) and/or `navigator.vibrate` (vibrate) via the `SendFeedback`/`BrowserFeedbackEffects` port, gated on the store's boolean `sendMessage`/`sendAttachment` return. Blank drafts and refused files are silent. Same rule as `mediaVisibility`: key returns only with its consumer |

## Honestly disabled

| Control | Destination feature |
| ------- | ------------------- |
| Chat actions `Wallpaper` | Wallpaper picker — **capture-blocked**, no capturable imagery until 2026-10-02 18:38 UTC |
| Add modal `New community` | Broadcast/communities create flow (gap-audit B3) |
| Settings overflow `More` | Overflow destination list (B-tier settings) |
| ~~Composer `Add attachment`~~ | ~~Attachment pipeline (media picking + send)~~ — **RESOLVED by F-058 (2026-10-04)**: the composer now opens an attachment ActionSheet (Photos & Videos / Document), decodes photos to a downscaled JPEG data URL (`FileInfo.dataUrl`), shows a removable pending preview, and Send persists a file message with the draft as caption. See drift note at the end of this file |
| Composer `Emoji stickers` | Sticker picker |
| Composer `Record audio` | Voice notes (record + upload) |
| Prefs `popup`, `light` | Notification delivery pipeline — a phone-web app has no lock screen or LED, so no honest browser consumer exists; **F-060 (2026-10-04) kept both honestly disabled with their keys deleted** and re-enabled only `sound`/`vibrate` (see wired table + drift note) |
| ~~Pref `mediaVisibility`~~ | ~~Media-privacy filtering of message bubbles~~ — **RESOLVED by F-059 (2026-10-04)**: the pref returned **with its consumer in the same commit** (`MessageBubble` masking; see the wired table and the drift note at the end of this file) and the row is a live toggle again |
| ~~Prefs `sound`, `vibrate`~~ | ~~Notification delivery pipeline~~ — **RESOLVED by F-060 (2026-10-04)**: keys returned **with a consumer in the same feature** (send-feedback tone/vibration); see the wired table and the F-060 drift note |

The four prefs also had their **storage keys deleted**, not just their switches
disabled. A disabled switch over a persisted key would leave a setting the app
remembers and never honours. (`mediaVisibility` was a fifth; F-059 restored its
key together with a consumer. `sound` and `vibrate` were restored the same way by
F-060 — see the drift note. Only `popup` and `light` remain deleted.)

## Removed

| Code | Reason |
| ---- | ------ |
| `ChatStore.broadcastRecipients` | Byte-identical duplicate of `groupParticipants`, no caller. |
| `ChatStore.setConversations` | Test seam that had become public API: overwrote the whole list and persisted. |
| `NotificationsPage.onRowActivate` | Unreachable, and navigated nowhere for every row that could reach it. |
| Notifications dead `<button>` block | Replaced by a defensive disabled-switch `@else`, so a future seed row cannot recreate the no-op. |

`ChatStore.createBroadcast` was **flagged for removal and retained** — see
Clarification 4. It is F-042's mandated capability, the only way to put a
broadcast into the store, and its absence of a UI caller is the deferred B3
create form, not a dead method.

## Deferred — out of scope, unchanged, tracked

Per Clarification 2 these were left alone. They are **still inert** — each row
below currently looks live and swallows activation. That is a known, recorded
gap, not a claim of coverage. G4 does not extend to them.

| Control | Screen | Destination feature |
| ------- | ------ | ------------------- |
| `settings-security`, `settings-two-step-verification`, `settings-change-number`, `settings-delete-account` | Account (4) | ~~Account & privacy screens~~ — **RESOLVED by F-057 (2026-10-04)**: every row now navigates to a real pushed sub-screen (`/settings/account/security` etc.) with honest local flows (persisted two-step PIN, persisted device number, type-to-confirm delete wipe). See `specs/057-account-settings/` |
| `ds-storage-usage`, `ds-auto-download`, `ds-images`, `ds-audio`, `ds-videos`, `ds-documents`, `ds-network-usage` | Data & storage (7) | Storage usage + media auto-download |
| ~~`chats-wallpaper`~~ | ~~Chats settings~~ — **RESOLVED by F-059 (2026-10-04)**: opens `/settings/chats/wallpaper`, a PROVISIONAL token-colour picker that recolours the chat scroll canvas through a `[data-wallpaper]` scope |
| ~~`chats-keyboard`~~ | ~~Chats settings~~ — **RESOLVED by F-059 (2026-10-04)**: opens `/settings/chats/keyboard`, which hosts the Enter-key-sends toggle + PROVISIONAL note; the standalone `Enter key sends` row was removed (one pref, one switch) |
| ~~`contact-groups`~~ | Contact info | **RESOLVED by F-048 (2026-10-01)** — now live, opens `/contact/:id/groups` |
| Status `Send` | Status | Status publishing |
| Camera `Shutter`, `Flip` | Camera | Capture pipeline — **blocked**, `getUserMedia` unavailable |

## Disposition of the two judgment calls

1. **`showPreviews` wired to the chat list, not disabled.** Disabling it would
   have been defensible and cheaper, but the pref is real, named correctly, and
   maps onto exactly one visible surface. Silently disabling a correctly-named
   setting is how you get `mediaVisibility` in the first place.
2. **`isMissedCall` corrected rather than trusted.** The plan cited it as
   "already-live" evidence. It was live and wrong since F-045 — building the
   filter on it would have produced an enabled, correctly-styled control that
   showed nothing, which is strictly worse than the disabled one it replaced.

## What a later feature must not do

Do not re-enable a control without wiring it. The **two** remaining deleted pref keys (`popup`,
`light`) must not come back as switches: a pref with no consumer is a setting that lies. If a
future feature adds a consumer, the key returns with the consumer, in the same commit — **F-059
(2026-10-04) did exactly this for `mediaVisibility`** and **F-060 (2026-10-04) for `sound` and
`vibrate`** (see the wired table and the drift notes below).

## Drift note (2026-10-04, F-058)

`composer-add-attachment` is **superseded**: this feature re-enabled the control
with a full pipeline (`specs/058-composer-attachment/`). The `composer.html`
F-046 pointer comment was removed by that feature's rewrite (the control is back
in the wired set). Remaining composer deferrals — `Emoji stickers` and
`Record audio` — are unchanged and stay honestly disabled. The 058 attachment
sheet, pending strip, photo bubble, and chat-list preview string are PROVISIONAL
chrome pending the Figma re-capture (G1 blocked 2026-10-03, expired token).

## Drift note (2026-10-04, F-059)

`mediaVisibility` — deleted by F-046, returned by `059-chats-settings-complete`
**with its consumer in the same commit** (bubble-level masking in `MessageBubble`,
`specs/059-chats-settings-complete/` FR-008/FR-009), the exact path this
disposition's closing rule allows. The `chats-wallpaper` and `chats-keyboard`
deferrals are RESOLVED (picker + keyboard screens). Remaining honestly-disabled
Chats-adjacent controls: `Chat actions → Wallpaper` (per-chat wallpaper is a
recorded follow-up) and the two Notifications prefs with no consumer. Wallpaper
palette/labels, picker chrome, keyboard note, and the "Media hidden"
placeholder are PROVISIONAL pending the G1 Figma re-capture.

## Drift note (2026-10-04, F-060)

`notifications-send-feedback` re-enables exactly two of the deleted Notifications
keys — `sound` and `vibrate` — **with a consumer in the same feature**
(`specs/060-notifications-send-feedback/` FR-005): a successful chat send plays a
short Web-Audio tone and/or a `navigator.vibrate` pulse via `SendFeedback`, gated
on the store's boolean `sendMessage`/`sendAttachment` return. This is the same
"key returns with its consumer" path F-059 used for `mediaVisibility`; the page
and service specs fake the `BrowserFeedbackEffects` port so no real audio/vibration
runs in the harness. `popup` and `light` stay removed: a phone-web app has no lock
screen or LED. The 060 Sound/Vibrate descriptions and the tone shape / vibration
pattern are PROVISIONAL pending the G1 Figma re-capture.
