# Design Gap Audit — Figma `PcGX72lSWkYIk3pL5V8PS3` vs. implementation

**Date**: 2026-09-27
**Method**: design rows 1–21 (the 21 screens in the design map) cross-referenced with the app's
17 routes, every row/button handler, and the 21 spec sets. Rows 1–7 carry exact captured geometry;
rows 8–21 are recorded from their spec sets (captures pending).
**Live re-verification**: blocked — Figma REST returned `429` with `Retry after 72844s` on
2026-09-27, so this audit must be re-checked against `scripts/capture-figma.mjs` output at the
quota reset (~2026-09-28 02:00 UTC).

## Headline

**No designed screen is missing.** All 21 rows render, and 14 of them are behaviourally live
(messaging, new chat, persistence, starring, contact info, search/sort, settings toggles, mute,
chat More menu, edit-mode actions, archived screen). What is missing is the **behaviour behind
~25 designed controls** — rows and buttons that render exactly as designed and do nothing.

## Tier A — target already exists, needs only wiring (no capture required)

| # | Design row | Dead control | Should do | Notes |
| - | ---------- | ------------ | ---------- | ----- |
| A1 | 6 Status | `My Status` row ("Add to my status") | open `/status/compose` | target exists |
| A2 | 6 Status | nav `Privacy` | open `/settings` | target exists |
| A3 | 20 Edit profile | `Save` | persist Name/About, reflect on Settings | fields are prefilled "Ani" |
| A4 | 21 Auth | keypad digits / backspace / `Continue` | fill phone field, verify, enter the app | screen is fully designed and inert |
| A5 | 12 Camera | `Flip` | swap front/back camera state | shutter stays gated (needs getUserMedia) |
| A6 | 2 Chat window | `Video call`, `Call` | start a call | needs a call screen → tier B |

## Tier B — real design flow, needs one new (hypothesis) screen

| # | Design row | Entry point | Missing screen |
| - | ---------- | ------------ | -------------- |
| B1 | 13 Settings | `Contacts` row | Contacts list |
| B2 | 1/3 Chats + 9 Add modal | `New Group` | group creation (name + participants) |
| B3 | 1 Chats | `Broadcast Lists` | broadcast list screen |
| B4 | 2 Chat window + 16 Chats settings | `Wallpaper` | wallpaper picker |
| B5 | 16 Chats settings | `Font size` | size control (persisted, applied app-wide) |
| B6 | 4/5 Calls | `New call`, row tap, call info | call screen / call-info sheet |
| B7 | 15 Contact info | `Media, photos and links` | media grid |
| B8 | 15 Contact info | `Groups` | shared-groups list |
| B9 | 14 Account | `Security`, `Two-step verification`, `Change number`, `Delete my account` | 4 sub-screens |
| B10 | 17 Notifications | `Sound`, `Vibrate`, `Popup notification` | 3 sub-screens |
| B11 | 18 Data and storage | `Storage usage`, `Media auto-download`, `Images`, `Audio`, `Videos`, `Documents`, `Network usage` | storage management |
| B12 | 16 Chats settings | `Keyboard` | keyboard settings |

## Tier C — capture-gated (cannot be built faithfully yet)

- **Publish a status** (row 7): Send / Send-alt need the captured keyboard chrome and the design's
  publish affordance; the compose screen is otherwise complete.
- **Camera capture pipeline** (row 12): shutter needs `getUserMedia` + the captured preview
  treatment; A5 (flip) is the capture-free part.
- **Exact content of every tier-B screen**: labels, row counts, ordering, section copy.
- **14 goldens** for rows 8–21, and the F-028 search/sort chrome in `0-8855`.

## Also worth fixing (already-shipped specs that drifted from their spec)

- Calls `Clear` (row 5) mutates a local list only — the F-032 bug class; it should be store-backed
  so a reload does not resurrect the call log.
- Calls rows are inert: no activation, no call info.
- 13 Settings: the last dead row is `Contacts` (B1).

## Suggested order

1. **A1–A2** (Status wiring) — smallest visible win, no new surface.
2. **A3** (profile persistence) — makes a designed form real, and Settings reflects it.
3. **A4** (auth keypad + Continue) — revives a fully designed, currently inert screen.
4. **Calls `Clear` store-backing** (the F-032 bug class) and calls row activation.
5. **B1/B2** (Contacts, New Group) — the two most valuable new screens, both re-use the chat model.
6. **B4/B5** (Wallpaper, Font size) — visible, persisted, app-wide.
7. Remaining tier B, then tier C at the quota reset.
