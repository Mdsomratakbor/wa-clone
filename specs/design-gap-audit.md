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

| # | Design row | Dead control | Should do | Status |
| - | ---------- | ------------ | ---------- | ------ |
| A1 | 6 Status | `My Status` row ("Add to my status") | open `/status/compose` | **done (F-035)** |
| A2 | 6 Status | nav `Privacy` | open `/settings` | **done (F-035)** |
| A3 | 20 Edit profile | `Save` | persist Name/About, reflect on Settings | **done (F-036)** |
| A4 | 21 Auth | keypad digits / backspace / `Continue` | fill phone region, verify, enter the app | **done (F-037)** |
| A5 | 12 Camera | `Flip` | swap front/back camera state | moved to tier C (see below) |
| A6 | 2 Chat window | `Video call`, `Call` | start a call | needs a call screen → tier B |

## Tier B — real design flow, needs one new (hypothesis) screen

| # | Design row | Entry point | Missing screen |
| - | ---------- | ------------ | -------------- |
| B1 | 13 Settings | `Contacts` row | Contacts list — **done (F-039)** |
| B2 | 1/3 Chats + 9 Add modal | `New Group` | group creation (name + participants) — **done (F-040)** |
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
- **Camera capture pipeline** (row 12): the shutter needs `getUserMedia` plus the captured preview
  treatment. **`Flip` moved here from tier A** (2026-09-27): without a live preview a front/back
  state has no observable effect, so shipping a state-only flip would be dead behaviour — it belongs
  with the preview work.
- **Exact content of every tier-B screen**: labels, row counts, ordering, section copy.
- **14 goldens** for rows 8–21, and the F-028 search/sort chrome in `0-8855`.

## Also worth fixing (already-shipped specs that drifted from their spec)

- Calls `Clear` (row 5) mutated a local list only — the F-032 bug class. **Fixed (F-038)**: the log
  lives in `CallStore` (`wa.call-store.v1`) and removals/clears persist.
- Calls rows are inert: **fixed (F-038)** — a row opens the chat with the same `contactName`
  (no match ⇒ stays put). `New call` and call info remain inert (B6).
- 13 Settings: the last dead row is `Contacts` — **fixed (F-039)**.
- Chats `New Group` / add-modal `New group` are live (F-040): a group conversation model plus
  `/new-group` creation. `Broadcast Lists` (B3) and `New community` stay inert.

## Suggested order

1. **A1–A2** (Status wiring) — done (F-035).
2. **A3** (profile persistence) — done (F-036).
3. **A4** (auth keypad + Continue) — done (F-037).
4. **Calls store-backing + row activation** — done (F-038).
5. **B1** (Contacts) — done (F-039).
6. **B2** (New Group) — done (F-040).
7. **B4/B5** (Wallpaper, Font size) — next: visible, persisted, app-wide.
8. Remaining tier B, then tier C at the quota reset.

## Progress log

- **2026-09-27** — Audit written; A1–A4 + the calls fixes landed as F-035…F-038 (331 → 357 unit
  tests, build green). Tier A is now empty; the next work is tier B or the quota reset.
- **2026-09-27** — F-039 Contacts (370 unit) and F-040 New Group (385 unit) landed; build green.
  B1 and B2 are done, so the next tier-B targets are B4/B5 then B3/B6…B12.
