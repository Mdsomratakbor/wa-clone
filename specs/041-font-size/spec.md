# Feature Specification: WhatsApp Font size (chat text scale)

**Feature Branch**: `041-font-size`

**Created**: 2026-09-28

**Status**: **Complete - implemented, build green, unit 417/417. G1 capture still BLOCKED**
(Figma 429, reset 2026-10-02 18:38 UTC), so the picker chrome, the step labels and the
multipliers remain PROVISIONAL hypotheses - see UNKNOWN below. Playwright runs paused per owner
directive; the e2e spec is authored, not executed.

**Input**: design row 16 (`Chats Settings`, frame `0:9973`, `Font size` row) + gap audit tier B5 +
`specs/041-font-size/research.md`

## Clarifications

### Session 2026-09-28 (owner answers; ≤3 questions per constitution Art. I)

- Q: Which dead design control should F-041 target?  A: **B5 Font size** (Chats Settings >
  `Font size`). Wallpaper needs real imagery that no capture can supply, and broadcast lists /
  call screens are deferred to later features.
- Q: What should the font-size preference actually change?  A: **Chat text only** - message
  bubbles, bubble timestamps, the chat date divider, and the chat list title/preview. Nav titles,
  tab bar, settings rows, status, calls and other chrome keep their captured sizes.
- Q: How should uncapturable chrome be treated while the Figma API is rate-limited?  A: **Ship
  provisional and label it** - build the behaviour and the token work now, mark every unverifiable
  visual as `PROVISIONAL` in spec/plan, and keep a G1 capture task open until the quota resets.

## Summary

Row 16 (`Chats Settings`) has a designed `Font size` row and the row is a dead control: the seed
lists it, the page renders it as a chevron button, and `onRowActivate()` is an empty no-op (F-016
FR-004 parked it as "later features"). B5 in the gap audit calls for a size control that is
**persisted and applied app-wide**.

Real WhatsApp's setting scales conversation text only, so the preference is stored in
`PrefsStore` next to `chatSort` and applied as a **scoped** CSS custom-property multiplier. The
`--wa-fs-*` tokens are shared by ~20 screens (`--wa-fs-preview` alone is used by settings,
contacts, calls, status, starred, contact-info and new-group), so a global redefinition would
rescale every screen and violate the clarified scope. Instead the scale is bound as a
`data-font-scale` attribute on the two chat surfaces only, and `_tokens.scss` re-declares the four
chat-text token values per scale step inside that scope.

## Functional Requirements

- **FR-001** `PrefsStore` gains a persisted `fontScale: FontScale` signal
  (`'small' | 'default' | 'large' | 'extra-large'`), defaulting to `'default'`. It is a sibling of
  `chatSort` in the `wa.prefs.v1` envelope, not a member of the boolean `PrefsSnapshot` record.
- **FR-002** The snapshot version increments `3` -> `4`; `hydrate()` accepts `1`, `2`, `3` and `4`,
  defaults a missing/invalid `fontScale` to `'default'`, and older snapshots therefore keep working.
- **FR-003** `PrefsStore.setFontScale(value)` sets and persists the scale, and `reset()` restores
  `'default'` alongside the other defaults.
- **FR-004** `/settings/chats/font-size` is a lazy route rendering `FontSizePage`: title
  `Font size`, leading `Back` to `/settings/chats`, no trailing action, no tab bar.
- **FR-005** The screen lists exactly four radio options - `Small`, `Default`, `Large`,
  `Extra large` - in that order, rendered as a `radiogroup` with one radio per option.
- **FR-006** The option matching the stored `fontScale` is checked on render; activating any option
  calls `setFontScale()` with that option's value, which re-checks it and persists.
- **FR-007** The Chats Settings `Font size` row navigates to `/settings/chats/font-size`; the other
  rows keep their current behaviour.
- **FR-008** `ChatsPage` and `ArchivedPage` bind `[attr.data-font-scale]="fontScale()"` on their root
  element, reading the store directly.
- **FR-009** `ChatWindowPage` binds the same attribute on its root element, so the bubbles, bubble
  timestamps and the date divider are covered.
- **FR-010** `_tokens.scss` declares, for each scale step, the four chat-text token values inside the
  `[data-font-scale]` scope: `--wa-fs-message`, `--wa-fs-bubble-time`, `--wa-fs-date`,
  `--wa-fs-preview`, `--wa-fs-chat-title`. `default` re-declares the captured values unchanged, so
  the default state is byte-identical to today's rendering.
- **FR-011** The multiplier table is a single `$wa-font-scale` map in `_tokens.scss` keyed by step
  (`small: 0.85`, `default: 1`, `large: 1.15`, `extra-large: 1.3`) and is emitted as
  `--wa-font-scale`; token values are derived with `calc()` from the base value and the multiplier,
  so a step never hard-codes a pixel value twice.
- **FR-012** Settings, contacts, calls, status, starred, contact-info, auth, new-group and the shared
  nav bar / tab bar / toggle chrome are **not** rescaled: their `--wa-fs-*` values still resolve
  from the unscoped `:root` block.
- **FR-013** No horizontal overflow appears at any breakpoint at `extra-large` in the chat window or
  the chat list: bubbles stay within `--wa-message-max-width` and rows keep their two-line clamp.
- **FR-014** Every non-default scale survives a reload through the versioned `wa.prefs.v1` envelope.

## Non-Goals

- Wallpaper / chat background (B4) - needs real imagery no capture can supply right now.
- Broadcast lists (B3) and the call screen (B6).
- Scaling nav titles, tab bar, status bar, settings rows, calls or any other chrome (clarified).
- A system-level `rem`/root-font-size approach, or changing the global `:root` token values.
- Per-contact font size; the setting is app-wide for chat text.
- Pixel-perfect capture of the `/settings/chats/font-size` screen (see G1 below).

## Review Gates

- **G1 (BLOCKED - Figma)**: exact row inventory/labels of row 16, and the font-size screen's
  chrome (options, copy, selection affordance, preview block). The Figma REST API returned `429`
  (`Retry after 375849s`, quota reset **2026-10-02 18:38 UTC**) on 2026-09-28, so the screen's
  visual treatment is **PROVISIONAL** and the capture task stays open in `tasks.md`.
- **G2**: `npm run build` green and the full unit suite green with the exact count reported.
- **G3**: closure commit, drift notes in the superseded specs, checklist + converge clean.

## Figma Reference

- Design row 16, frame `0:9973` "WhatsApp Chats Settings" (captured 2026-09-28, `0:9974` rows
  group at y=123 - the row labels were not readable in the depth-limited payload, so the exact
  `Font size` label and its neighbours stay UNKNOWN / NEEDS CLARIFICATION until G1).
- No Figma node exists for a font-size screen; the screen chrome is a declared hypothesis.

## UNKNOWN / NEEDS CLARIFICATION

- The four step labels (`Small`, `Default`, `Large`, `Extra large`) are the real WhatsApp set and are
  **hypothesis** - the design has no font-size screen to verify them against.
- The multipliers (`0.85` / `1` / `1.15` / `1.3`) are **hypothesis**; they must be replaced with
  captured values at G1 if the design specifies discrete sizes instead of a ratio.
- Whether the design shows a live text preview on the screen, and whether the row displays the
  current value as a trailing label on Chats Settings.

## User Stories

- As a user who finds the default text too small, I can pick a larger size in Chats Settings and see
  every conversation's text - list titles, previews, bubbles, timestamps and the date divider - grow
  immediately, and keep that choice after a reload (FR-001..FR-014).

## Acceptance Criteria

- AC-01 `Font size` in `/settings/chats` navigates to `/settings/chats/font-size`; other rows are
  unchanged.
- AC-02 The screen shows four options in order with the stored one checked.
- AC-03 Choosing `Large` re-checks `Large`, persists, and immediately changes the rendered font size
  of chat list title/preview and chat window bubbles/timestamp/date divider.
- AC-04 Choosing `Small` / `Extra large` does the same for those steps.
- AC-05 Nav title, tab bar and settings-row text are unchanged at every step.
- AC-06 A reload restores the last chosen step; a snapshot at version 1/2/3 hydrates with
  `'default'`.
- AC-07 `reset()` returns the scale to `'default'`.
- AC-08 No horizontal overflow at any breakpoint with `extra-large` in the chat list or chat window.
- AC-09 Build green; full unit suite green with the exact count reported.
- AC-10 Playwright spec updated (authored, **not executed** - paused by owner directive 2026-09-26).

## Quality Checklist

- [x] FRs are numbered, unambiguous and each maps to ≥1 task in `tasks.md`
- [x] Every FR is implementable and testable without inventing a design value
- [x] The Figma reference cites only API-returned node IDs
- [x] Unknowns are marked UNKNOWN / PROVISIONAL rather than guessed
- [x] Persistence, versioning and re-load behaviour are specified (FR-001..FR-003, FR-014)
- [x] Accessibility: radiogroup semantics, `aria-label`, keyboard reachability, visible focus
- [x] Blast radius is bounded: only the two chat surfaces carry the scale attribute (FR-012)
- [x] The blocked G1 gate is recorded, not skipped
