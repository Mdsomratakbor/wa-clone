# Design Research: WhatsApp Chat — mute / unmute

**Source**: remaining no-op with a natural store-backed behaviour. The chat "..." sheet
(`CHAT_ACTIONS` = Mute/Wallpaper/More) has one row with a concrete product meaning: **Mute**.
Reuses the F-024 snapshot/persist contract on `ChatStore`.

## Research summary

- `ChatActionsModal` renders a static `CHAT_ACTIONS` list and `ChatWindowPage.onChatAction` is a
  no-op. Mute is the only row a toggle maps to cleanly; Wallpaper/More need new screens (gated).
- `ChatPreview` already carries optional row fields (`read?`, `phone?`); a `muted?: boolean`
  snapshots inside conversations with no shape change (additive, normalised to `false`).
- The chat header is the visible mute affordance in real WhatsApp; the sheet label flips
  Mute/Unmute. Both are cheap, testable, and default-hidden (no seed has muted) so no golden
  surface changes unless the user actually mutes.

## Canonical artifacts

The plan and the task list that used to live in this file now live in the canonical
Speckit artifacts for this feature:

- `plan.md` - approach, phases, review gates, drift policy
- `tasks.md` - the delivery checklist (this file keeps the research record only)