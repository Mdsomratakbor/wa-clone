# Feature Specification: WhatsApp Chats Settings

**Feature Branch**: `016-chats-settings`

**Created**: 2026-09-24

**Status**: **In progress — structural scope landed pre-capture (owner directive `2026-09-24`).**
The Settings "Chats Settings" row now opens `/settings/chats`, which renders the Chats Settings
pushed screen (Back → `/settings`, title "Chats Settings", seeded hypothesis rows, no tab bar).
All inner rows are no-ops this feature. Exact rows, glyphs, previews and golden remain PENDING
the Figma capture (~2026-09-28) and are gated at G1; provisional/hypothesis values in place.

**Input**: `figma/design-map.md` row 16 (`0:9973`) + `specs/016-chats-settings/research.md`

---

## Summary

Chats Settings is a pushed Settings sub-page reached from the Settings "Chats Settings" row.
This feature wires that row and renders the screen with a seeded row list (hypothesis: Wallpaper,
Font size, Keyboard, Enter key sends, Media visibility). Controls, previews and wallpaper
selection are later features / map-external; rows are no-ops here.

## PENDING design inventory (capture on ~2026-09-28)

- [ ] Row set/order/labels + glyphs + section headers
- [ ] Wallpaper preview tile treatment
- [ ] Nav title/breadcrumb confirmation

## Owner Clarifications (proposed — confirm at G1)

1. **Entry**: Settings → Chats Settings row → `/settings/chats`.
2. **Rows**: hypothesis list replaced from the payload at G1.
3. **Title**: "Chats Settings" in the pushed header (PENDING).

## Functional Requirements

- **FR-001**: Settings "Chats Settings" row navigates to `/settings/chats`.
- **FR-002**: `/settings/chats` renders the Chats Settings screen (title + rows from
  `CHATS_SETTINGS_ROWS` seed), no tab bar.
- **FR-003**: Back returns to `/settings`.
- **FR-004**: All rows are no-ops (later features / map-external).

> **Drift note (F-027, 2026-09-26)**: Rows are no longer all no-ops. **Enter key sends** and
> **Media visibility** render as persisted switches (`PrefsStore`, `wa.prefs.v1`); **Enter key
> sends** now gates the composer's Enter handler (OFF ⇒ Enter inert). Wallpaper/Font size/
> Keyboard remain chevron no-op rows. See `specs/027-settings-toggles`.
- **FR-005**: No horizontal overflow at any breakpoint.

## Non-Goals

- Wallpaper pickers, font size, keyboard, media-visibility toggles.
- Re-hosting 011-style sheets from this screen.

## User Stories

- **US1 (entry)**: On Settings I tap Chats Settings and land on `/settings/chats`.
- **US2 (screen)**: I see the pushed header (Back + "Chats Settings"), labelled rows (first is
  Wallpaper hypothesis), no tab bar.
- **US3 (chroming)**: Back returns to `/settings`; rows are no-ops; no horizontal overflow;
  screen matches the Figma render within the measured golden threshold.

## Acceptance Criteria (validation targets)

1. Unit — `chats-settings-page.spec.ts` (new): chrome, rows from seed, Back → `/settings`,
   no tab bar, no-ops. `settings-page.spec.ts`: Chats Settings row → navigate, no-op row updated
   to a still-inert row. Full suite green.
2. E2E `tests/e2e/chats-settings.spec.ts`: US1/US2/US3 (+ golden `0-9973-chats-settings.png`
   gated). `settings.spec.ts` US2 updated (Chats Settings row navigates; a different row is
   the no-op).
3. Responsive: no-overflow cases for `/settings/chats`.
4. `figma/design-map.md` row 16 spec → `016` + implemented at closure.

## Closing note (deliberately incomplete)

Until T001 lands, `chats-settings-page` renders structural rows (stable testids/aria-labels) —
replaced at G1 with the captured design.