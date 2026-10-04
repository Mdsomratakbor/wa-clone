# Feature Specification: Chats Settings — complete every setting

**Feature Branch**: `059-chats-settings-complete`

**Created**: 2026-10-04

**Status**: ✅ **Specified** (2026-10-04) — clarify answers binding, plan/tasks/implementation
pending. G1 capture still blocked (expired Figma token), so all 059 chrome is PROVISIONAL.

**Input**: `figma/design-map.md` row 16 (`Chats Settings`, frame `0:9973`) + `specs/016-chats-settings/`
+ `specs/041-font-size/` (screen + scoped-token precedent) + `specs/046-inert-control-sweep/disposition.md`
(deferral table) + `specs/054-settings-row-descriptions/` (row copy) + `src/app/core/prefs.store.ts`.

---

## State today (`/settings/chats`, seeded `CHATS_SETTINGS_ROWS`)

| Row | Current state | Origin |
| --- | ------------- | ------ |
| `chats-wallpaper` Wallpaper | **inert chevron** — navigates nowhere | F-041/F-046 deferred: "needs real imagery no capture can supply" |
| `chats-font-size` Font size | **wired** → `/settings/chats/font-size` | F-041 (complete) |
| `chats-keyboard` Keyboard | **inert chevron** — navigates nowhere | F-046 deferred: destination "keyboard shortcut sheet" |
| `chats-enter-sends` Enter key sends | **wired toggle** (`enterKeySends`), consumer = composer Enter | F-027/F-046 (complete) |
| `chats-media-visibility` Media visibility | **honestly disabled**, key deleted | F-046 (deferred: "media-privacy filtering of message bubbles") |

"Complete every setting" therefore means the three remaining settings. Font size and Enter key
sends are shipped and unchanged.

## Clarifications (2026-10-04, owner; all three recommended options accepted, verbatim)

1. **Q1 — Wallpaper**: *"Token-color picker, PROVISIONAL"* — build the real picker flow with a
   defined set of token-based background options (solid colors, no external image files), applied
   to the chat window surface via a `data-wallpaper` scope. Mark all chrome + options PROVISIONAL;
   keep a G1 re-capture task open for the designed imagery.
2. **Q2 — Keyboard**: *"Host the Enter-key-sends toggle"* — push `/settings/chats/keyboard` hosting
   the one keyboard preference this app can honour (Enter key sends), plus a PROVISIONAL reference
   note. Remove the standalone `Enter key sends` row so one pref has one switch.
3. **Q3 — Media visibility**: *"Mask media in-bubble"* — when OFF, photo/file bubbles render a
   privacy placeholder instead of the image/card; content stays stored (toggling back restores it).
   The F-054 `chats-media-visibility` description gets a PROVISIONAL rewrite (the current
   "apps and devices" copy cannot be honoured in this isolated clone).

## Summary

Three sub-features land in one commit series (F-057 precedent: one feature can contain several
pushed sub-screens). A **wallpaper** preference + picker screen drive the chat-window background
through a scoped token; a **Keyboard** screen hosts the Enter-key-sends toggle (the standalone row
is removed — one switch per pref); the **mediaVisibility** pref returns from the F-046 deletion,
with its consumer (in-bubble media privacy masking) landing in the same commit — exactly the
condition F-046's disposition required ("the key returns with the consumer, in the same commit").

## Functional Requirements

- **FR-001** `PrefsStore` gains a persisted `wallpaper: WallpaperId` signal, a sibling of
  `chatSort`/`fontScale`/`profile` in the `wa.prefs.v1` envelope, defaulting to `'default'`
  (`DEFAULT_WALLPAPER`). `setWallpaper(id)` sets and persists it; `reset()` restores `'default'`.
- **FR-002** The envelope version increments `4 -> 5`; `hydrate()` accepts `1`, `2`, `3`, `4` and
  `5`; a missing or invalid `wallpaper` hydrates as `'default'`; older snapshots keep working.
- **FR-003** `WALLPAPERS` is an ordered, exported list of PROVISIONAL token-colour options —
  ids `default | sky | sand | mint | blush | slate`, each with a PROVISIONAL label — declared in
  `prefs.store.ts` next to `FONT_SCALES`. Raw colours are recorded in `research.md` and added to
  `_tokens.scss` in the same change.
- **FR-004** `/settings/chats/wallpaper` is a lazy route rendering `WallpaperPage`: title
  `Wallpaper`, leading `Back` to `/settings/chats`, no trailing action, no tab bar. It renders one
  swatch row per `WALLPAPERS` entry as a `radiogroup` (single-radio semantics); the row matching
  the stored `wallpaper` is checked on render; activating a row calls `setWallpaper(id)`, which
  re-checks it and persists.
- **FR-005** `ChatWindowPage` binds `[attr.data-wallpaper]="wallpaper()"` on its `.chat-window`
  root (the F-041 `[data-font-scale]` precedent). `_tokens.scss` declares `--wa-wallpaper-bg` at
  `:root` as `var(--wa-surface)` (so default rendering is byte-identical) and re-declares it per
  id inside a `[data-wallpaper='<id>']` scope with the PROVISIONAL colours; `chat-window-page.scss`
  paints the scroll area with `var(--wa-wallpaper-bg)`. Bubble/chrome surfaces are untouched, so
  message bubbles stay readable on every option.
- **FR-006** `/settings/chats/keyboard` is a lazy route rendering `KeyboardPage`: title `Keyboard`,
  leading `Back` to `/settings/chats`, no tab bar. It hosts the **Enter key sends** `Toggle`
  bound to the persisted `enterKeySends` pref (live consumer: composer Enter handler) plus a
  PROVISIONAL note line; toggling persists immediately.
- **FR-007** `CHATS_SETTINGS_ROWS` is restructured: the standalone `chats-enter-sends` row is
  **removed** (its pref now lives under Keyboard — one switch per pref); `chats-media-visibility`
  clears its `unavailable` flag and becomes a live store-bound toggle (`mediaVisibility`); Chats
  Settings `Wallpaper` and `Keyboard` rows navigate to their new routes (`onRowActivate`).
- **FR-008** `mediaVisibility: boolean` (default `true`) is re-added to `PrefsKey` and
  `DEFAULT_PREFS`. F-046 deleted it; per the disposition's own rule the key returns only because
  a consumer lands in the same commit (FR-009). `normalizePrefs` picks it up from the `DEFAULT_PREFS`
  key loop automatically; a snapshot that still carries the four removed Notifications keys
  (`sound`, `vibrate`, `popup`, `light`) still drops those.
- **FR-009** `MessageBubble` injects `PrefsStore` and reads `mediaVisibility`. When it is `false`,
  a message whose `file` is present renders a privacy placeholder
  (`data-testid="bubble-media-private"`, PROVISIONAL copy) instead of the photo `<img>` or file
  card; a non-empty caption still renders below it. The stored message is untouched, so setting
  `mediaVisibility` back to `true` restores the media. Masking applies wherever `MessageBubble`
  renders (chat window, starred messages).
- **FR-010** A masked media bubble's `aria-label` reads `Media hidden` (PROVISIONAL copy), plus
  the caption when present, plus time/direction. Radio rows keep radio semantics and the toggle
  keeps `role="switch"` with `aria-checked`.
- **FR-011** The F-054 `chats-media-visibility` description is rewritten (PROVISIONAL, recorded
  literally in `research.md` for the G1 reconcile); all other `CHATS_SETTINGS_ROWS` descriptions
  are unchanged.
- **FR-012** Default `wallpaper` and default `mediaVisibility` render byte-identical to today's
  screens. Build green; full unit suite green with the exact count reported.

## Non-Goals

- Per-chat wallpaper, and the chat-window `Chat actions → Wallpaper` sheet row — it stays honestly
  disabled (F-046). A per-chat picker is a separate feature; recorded as a follow-up reconcile.
- Real wallpaper imagery or a photo-from-gallery wallpaper option (blocked: no capturable imagery,
  and gallery access is out of scope for this clone).
- Applying the wallpaper to the chats list, tab bar, nav bar or settings chrome.
- Implementing keyboard shortcuts beyond Enter-to-send; the Keyboard reference note is read-only
  PROVISIONAL copy, not a list of claims.
- Masking the F-044 media page or contact media page. The clarified contract is bubble-level; the
  media screens being unmasked while bubbles are masked is a recorded reconcile item, not a bug.
- Changing the shipped Font size or Enter key sends behaviour, or any non-Chats-settings row.

## Review Gates

- **G1 (BLOCKED - Figma)**: wallpaper option set/copy, picker chrome, keyboard note copy, masked
  placeholder copy. The Figma OAuth token expired (403/429, see `specs/design-gap-audit.md`), so
  every 059 visual is **PROVISIONAL**; the capture task stays open in `tasks.md` and the real
  values replace the hypotheses at the post-re-auth reconcile.
- **G2**: `npm run build` green; full unit suite green with the exact count reported.
- **G3**: closure commit; drift notes in every superseded spec; checklist + converge clean.

## Figma Reference

- Design row 16, frame `0:9973` "WhatsApp Chats Settings" — the seeded row set (hypothesis,
  see F-041's 6-vs-5 open finding). No Figma node exists for a wallpaper picker, a keyboard
  screen, a masked bubble, or the media-visibility description; all are declared hypotheses.

## UNKNOWN / NEEDS CLARIFICATION

- Wallpaper ids, labels and raw colours (`sky/sand/mint/blush/slate`) are **PROVISIONAL
  hypotheses**; the design carries a photo wallpaper no capture has produced (owner-approved
  `#EFEFF4` approximation today).
- Picker chrome (swatch geometry), the keyboard note copy, and the masked-placeholder copy are
  **PROVISIONAL**.
- The 016 open finding (design shows 6 rows in 4 groups vs the 5-row seed) stays open; 059 removes
  `Enter key sends` to resolve a one-pref-one-switch duplication, which *changes* the hypothesis —
  recorded as a reconcile item at G1, not silently asserted.

## User Stories

- As a user, I can open Chats Settings and have every row do something real: Wallpaper shows a
  picker whose choice recolours the conversation background immediately and survives a reload;
  Keyboard shows one honest keyboard preference; Media visibility visibly hides photos/files inside
  chats for privacy without deleting anything, and shows them again when I switch it back.

## Acceptance Criteria

- AC-01 `/settings/chats` renders four rows: Wallpaper, Font size, Keyboard, Media visibility.
  No standalone `Enter key sends` row.
- AC-02 Wallpaper row navigates to `/settings/chats/wallpaper`; the picker shows six swatches with
  the stored one checked; choosing one recolours the chat window background and persists across a
  reload; `reset()` returns to `default`.
- AC-03 Keyboard row navigates to `/settings/chats/keyboard`; its Enter-key-sends toggle is bound
  to `enterKeySends` (the composer consumer) and persists on toggle.
- AC-04 Media visibility renders as a live switch; turning it off masks photo/file bubbles
  (placeholder, caption kept) and turning it on restores them; a starred message shows the same
  masking; content is never lost.
- AC-05 A v5 envelope reloads wallpaper + mediaVisibility; v1–v4 snapshots hydrate with defaults.
- AC-06 Default wallpaper and default media visibility are byte-identical to today's rendering.
- AC-07 No horizontal overflow at any breakpoint at any wallpaper.
- AC-08 Build green; full unit suite green, exact count reported.
- AC-09 Playwright spec updated (authored, **not executed** — paused by owner directive 2026-09-26).

## Quality Checklist

- [x] FRs are numbered, unambiguous, each maps to ≥1 task in `tasks.md`
- [x] Every FR implementable/testable without inventing a *silently-claimed* design value; new
      values are PROVISIONAL and recorded in `research.md`
- [x] Figma reference cites only known node IDs; hypotheses are labelled
- [x] Persistence, versioning and reload behaviour specified (FR-001, FR-002, FR-008)
- [x] Accessibility: radiogroup semantics, switch semantics, aria-labels, keyboard reachability,
      visible focus
- [x] Blast radius bounded: wallpaper scopes only the chat window (FR-005); masking is bubble-level
- [x] The F-046 key-return contract (key returns with its consumer in the same commit) is honoured
      (FR-008 + FR-009)
- [x] The blocked G1 gate is recorded, not skipped