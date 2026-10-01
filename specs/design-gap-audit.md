# Design Gap Audit — Figma `PcGX72lSWkYIk3pL5V8PS3` vs. implementation

**Date**: 2026-09-27
**Method**: design rows 1–21 (the 21 screens in the design map) cross-referenced with the app's
17 routes, every row/button handler, and the 21 spec sets. Rows 1–7 carry exact captured geometry;
rows 8–21 are recorded from their spec sets (captures pending).
**Live re-verification**: blocked - Figma REST returned `429` with `Retry after 375849s` on
2026-09-28 10:07 UTC, so this audit must be re-checked against `scripts/capture-figma.mjs` output at
the quota reset (**2026-10-02 18:38 UTC**). One request slipped through before the limit and is
recorded in `specs/041-font-size/research.md`: the row-16 payload shows 4 row groups = 6 rows,
against the 5-row `CHATS_SETTINGS_ROWS` seed (open finding, not yet reconciled).

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
| A6 | 2 Chat window | `Video call`, `Call` | start a call | **DONE (F-045)** — both start a real call and open the in-call screen. The buttons are row 2, design-verified; the in-call chrome is PROVISIONAL |

## Tier B — real design flow, needs one new (hypothesis) screen

| # | Design row | Entry point | Missing screen |
| - | ---------- | ------------ | -------------- |
| B1 | 13 Settings | `Contacts` row | Contacts list — **done (F-039)** |
| B2 | 1/3 Chats + 9 Add modal | `New Group` | group creation (name + participants) — **done (F-040)** |
| B3 | 1 Chats | `Broadcast Lists` | broadcast list screen — **done (F-042)**, list + entry only; create form still missing, chrome PROVISIONAL |
| B4 | 2 Chat window + 16 Chats settings | `Wallpaper` | wallpaper picker — **still open, and now a named deferral.** F-046 honestly disabled both copies; the picker remains capture-blocked until 2026-10-02 18:38 UTC |
| B5 | 16 Chats settings | `Font size` | size control (persisted, applied app-wide) — **done (F-041)** |
| B6 | 4/5 Calls | `New call`, row tap, call info | call screen / call-info sheet — **DONE (F-045)**: row tap (F-038), the call-info sheet (F-043), and now the calling flow — picker at `/calls/new`, in-call screen at `/calls/active`, and all three previously inert controls wired. The new chrome is PROVISIONAL by construction (no Figma node exists). F-046 additionally wired the `All`/`Missed` filter and fixed `isMissedCall`, which had been reporting unanswered calls as answered since F-045 |
| B7 | 15 Contact info | `Media, photos and links` | media grid — **done (F-044)**, derived from the chat's own `Message.file` entries; only chat-006 is populated, so the empty state is the default, and the grid chrome is PROVISIONAL |
| B8 | 15 Contact info | `Groups` | shared-groups list — **closed by F-048 (2026-10-01)**, 635 unit green. F-044's premise was half right: the seed holds no group, but `ChatPreview.participantIds` *is* the membership record and is populated by the live F-040 New Group flow, so the list is a filter rather than an invented social graph. `/contact/:id/groups` lists groups where `kind === 'group'` and the contact id is a participant. **Owner decision: derive only, seed nothing** — so all nine seeded contacts show the empty state on first run, which is the honest state of a fresh install. Sub-screen chrome is **provisional** (no Figma node exists for it) |
| B9 | 14 Account | `Security`, `Two-step verification`, `Change number`, `Delete my account` | 4 sub-screens — **still open, now a named deferral.** F-046 left all 4 rows untouched and recorded them |
| B10 | 17 Notifications | `Sound`, `Vibrate`, `Popup notification` | **not a gap — the "3 sub-screens" wording was wrong.** All five notification rows ship as flat toggles in F-017, which the owner confirmed on 2026-09-29 is the intended shape. **F-046 completed this**: `onRowActivate` and its dead `<button>` branch are removed, and `sound`/`vibrate`/`popup`/`light`/`mediaVisibility` — five live switches that persisted values nothing read — are now honestly disabled with their storage keys deleted |
| B11 | 18 Data and storage | `Storage usage`, `Media auto-download`, `Images`, `Audio`, `Videos`, `Documents`, `Network usage` | storage management — **still open, now a named deferral.** F-046 left all 7 rows untouched and recorded them |
| B12 | 16 Chats settings | `Keyboard` | keyboard settings — **still open, now a named deferral.** F-046 left the row untouched and recorded it |

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
  (no match ⇒ stays put). The `ⓘ` info button is live too (**F-043**): it opens a call-info sheet
  over the list with Message / Voice call / Video call / Delete, where `Message` opens the chat and
  `Delete` removes the entry and persists. **`New call` and the sheet's `Voice call` / `Video call`
  are live as of F-045** — they open the contact picker and the in-call screen respectively. B6 is
  done; no inert Calls control remains.
- 13 Settings: the last dead row is `Contacts` — **fixed (F-039)**.
- Chats `New Group` / add-modal `New group` are live (F-040): a group conversation model plus
  `/new-group` creation. `Broadcast Lists` is live too (F-042): a `broadcast` conversation kind,
  `createBroadcast()`, and the `/broadcasts` list screen. Broadcasts are excluded from the Chats
  list, and `createBroadcast()` ships **without a UI caller** — the create form is still missing, so
  B3 is *partially* done. `New community` stays inert.

- 15 Contact info: the `Media, photos and links` row is **fixed (F-044)** — it opens a per-contact
  media grid derived from that chat's own file messages, so the screen cannot contradict the chat
  window. Only `chat-006` (Martha Craig) has a thread, and it holds all four file messages, so eight
  of nine contacts get the empty state; that is the honest result of not inventing per-contact
  media. The `Groups` row (B8) was inert here for the same reason and was **closed by F-048**: the
  social graph is not invented, it is read from `participantIds`. See the B8 row above.

## Suggested order

1. **A1–A2** (Status wiring) — done (F-035).
2. **A3** (profile persistence) — done (F-036).
3. **A4** (auth keypad + Continue) — done (F-037).
4. **Calls store-backing + row activation** — done (F-038).
5. **B1** (Contacts) — done (F-039).
6. **B2** (New Group) — done (F-040).
7. **B4/B5** (Wallpaper, Font size) — B5 **done (F-041)**; B4 (Wallpaper) blocked: it needs real
   imagery no capture can supply while the quota is exhausted.
8. **B3** (Broadcast Lists) — done for list + entry (F-042); the create form remains and is itself
   capture-gated.
9. **B6** (Calls) — **done (F-045)**: row tap (F-038), the call-info sheet (F-043), and the calling
   flow — picker at `/calls/new`, in-call screen at `/calls/active`, and all five previously inert
   controls wired. Audit **A6** closed in the same feature. The two new screens are PROVISIONAL by
   construction: the design file has no node for either, so the quota reset cannot verify them.
10. Remaining tier B, then tier C at the quota reset (**2026-10-02 18:38 UTC**).

## Progress log

- **2026-09-27** — Audit written; A1–A4 + the calls fixes landed as F-035…F-038 (331 → 357 unit
  tests, build green). Tier A is now empty; the next work is tier B or the quota reset.
- **2026-09-27** — F-039 Contacts (370 unit) and F-040 New Group (385 unit) landed; build green.
  B1 and B2 are done, so the next tier-B targets are B4/B5 then B3/B6…B12.
- **2026-09-28** — F-041 Font size (417 unit) landed; build green. B5 done: the `Font size` row now
  opens a picker and the choice is persisted and applied to chat text only. The quota reset moved
  out to 2026-10-02 18:38 UTC, so F-041's screen chrome ships PROVISIONAL with capture tasks
  T011–T013 open. Next tier-B target is **B4** once imagery can be captured, else B3/B6.
- **2026-09-28** — F-042 Broadcast lists (440 unit) landed; build green. B3 done for list + entry:
  a `broadcast` kind, `createBroadcast()`, the `/broadcasts` screen, and `Broadcast Lists` wired off
  its multi-year no-op. The dead action is gone, but the screen is unreachable in practice — no
  create form and no seed — so the empty state is what ships. Chrome stays PROVISIONAL (same
  2026-10-02 quota). The v1-snapshot test also caught a real hydrate defect: pre-F-040 snapshots
  loaded with `kind === undefined`; hydration now fills `kind`/`participantIds` without touching
  persisted `read`/`muted`/`archived`. Next tier-B target: **B6** (Calls), since B4 needs imagery.
- **2026-09-28** — F-043 Call info sheet (456 unit) landed; build green. B6 partially done: the
  `ⓘ` button on the Calls list opens an action sheet, and with row tap (F-038) two of B6's three
  dead controls are live. `Message` and `Delete` work; `Voice call` / `Video call` render and are
  focusable but inert, because their destination is the in-call screen that this feature
  deliberately did not build — the same split F-042 made on Broadcast Lists. The sheet reused
  `app-action-sheet`, so no new shared component and no route were needed. Still open: `+ new call`
  and the calling flow.
- **2026-09-29** — F-044 Media screen (469 unit) landed; build green. B7 done for the populated
  case: a per-contact grid derived from that chat's own `Message.file` entries, so the screen cannot
  contradict the chat window. Empty state is the honest default — only `chat-006` has a thread.
  B8 (`Groups`) was left inert on the same reasoning and was **wrong**: membership is readable from
  `participantIds`, not absent. Closed by F-048 on 2026-10-01.
- **2026-09-29** — F-045 Calling flow (**549 unit**, +55) landed; build green, `tsc` clean. **B6
  done, audit A6 closed**: all five inert controls are now live. The calling flow is a real state
  machine (`dialing → ringing → connected → ended`) over local state on an injected clock, with
  store-backed `Mute`/`Speaker`/`Video`, a `role="timer"` duration, and a log entry written at call
  end whose `outcome` is derived from the state actually reached. `G1` is blocked **by
  construction** — no Figma node exists for the picker or the in-call screen, so the 2026-10-02
  quota reset cannot clear it; that chrome ships PROVISIONAL and is labelled as such in code.
  Two clarify answers were needed: the legacy `outcome` default is derived from `direction` (a
  blanket `completed` would have reported the seed's two missed calls as completed), and the inert
  set is **five** controls, not four. Three defects surfaced and were fixed: an F-043 `Delete`
  regression caught by its own existing test, and two latent dead-control holes in the chat-window
  and Calls-page call paths that would have left controls inert for exactly the contacts F-043
  left them inert for. Next: the **forward-only audit** of remaining inert features, then F-046's
  backend seam.
- **2026-09-29** — A full forward-only inert-control sweep (F-046) was run and verified, and B10's
  "3 sub-screens" entry was **found to be wrong**: Notifications ships as flat toggles, which the
  owner confirmed is intended, so B10 is not a gap. The sweep found ~30 inert controls in three
  shapes — silent no-ops that swallow a tap with the sheet left open (3, on design-verified rows 2
  and 14), `<button>`s with no handler at all (the 4 composer icons), and empty handlers awaiting a
  later feature (16 rows across Account, Data-and-storage, Chats settings, Contact info, Status,
  Camera). It also found the inverse: 3 `ChatStore` methods with no production caller, and 6 of 7
  `PrefsStore` booleans written by live toggles and read by nothing (`composer.ts:32` reading
  `enterKeySends` is the only read in the app). F-046's scope was narrowed by the owner to the
  **honesty fixes**; the large destinations each become their own spec. This sweep also caused the
  backend seam to be **renumbered F-046 → F-047** (owner-confirmed 2026-09-29).

- **2026-10-01** - F-048 Shared Groups landed (**635 unit**, +15) and **B8 is closed**. The row now
  opens /contact/:id/groups. This also **corrects an F-044 conclusion**: shared-group membership
  was never missing data, it is `ChatPreview.participantIds`, which F-040's live New Group screen
  already populates. The list is a filter, so no social graph is invented. Owner decision on
  2026-10-01 was to derive only and seed nothing, which leaves all nine seeded contacts showing the
  empty state on first run - honest, and one New Group away from populated. `ChatStore` gained one
  pure accessor; no model field, no seed, no snapshot change and no shared component edit. One
  finding worth carrying forward: `contactConversations()` sorts alphabetically by contact name, so
  it does not begin at `chat-001` - seeding participants from it silently produced a route param
  and a participant id that disagreed. G1 remains BLOCKED, so the sub-screen chrome is provisional.
