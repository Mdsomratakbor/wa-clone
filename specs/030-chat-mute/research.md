# Design Research + Plan + Tasks + Quickstart: Chat — mute / unmute (feature 030)

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

## Plan

1. `ChatStore`: `muted?` on the model + `isMuted`/`toggleMuted` + `contact()` includes `muted`.
2. `ChatHeader` muted bell; `ChatActionsModal` derives Mute/Unmute label from a `muted` input.
3. `ChatWindowPage`: `[muted]` binding + `onChatAction('chat-mute')` toggles (sheet stays open).
4. Unit coverage (store/header/modal/window); e2e authored (paused).
5. Drift note (`specs/010`); build + unit validation; commits (spec → feat → test).

**Gates**: G1 bell chrome provisional (no new capture); G2 build/unit green + e2e authored; G3
close + drift note.

## Tasks

- [x] T001 — Spec set `specs/030-chat-mute/` (this set)
- [x] T002 — Store mute state + contact muted
- [x] T003 — Header bell + actions label
- [x] T004 — Window page wiring
- [x] T005 — Unit tests + authored e2e
- [x] T006 — 010 drift note; build + unit green
- [x] T007 — Commits

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per owner directive
```