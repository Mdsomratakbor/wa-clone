# Feature Specification: WhatsApp Settings — persisted toggles

**Feature Branch**: `027-settings-toggles`

**Created**: 2026-09-26

**Status**: **In progress — implementing (spec-driven).**

**Input**: `specs/016-chats-settings`, `specs/017-notifications` + `ChatStore` persistence
pattern (F-024) + `specs/027-settings-toggles/research.md`

---

## Summary

F-027 lands a persisted **preferences store** and converts the toggle-type rows of the Chats
Settings and Notifications screens from static chevron rows into live iOS-style switches. The
flagship behavior is **Enter key sends**: toggling it off gates the composer's Enter handler so
Enter no longer sends. The remaining toggles persist their state now (state model is durable
across reloads via localStorage) with their consumer behaviors declared as later targets
(media visibility → list thumbnails, notifications → OS-level effects).

## Functional Requirements

- **FR-001** `PrefsStore` (root, persisted under `wa.prefs.v1`, versioned snapshot + hydrate +
  reset mirroring `ChatStore`): boolean prefs `enterKeySends`, `mediaVisibility`, `sound`,
  `vibrate`, `popup`, `light`, `showPreviews` with `DEFAULT_PREFS`.
- **FR-002** `PrefsStore.toggle(key)` flips and persists; `set(key, value)` persists explicitly;
  `reset()` clears storage and restores defaults.
- **FR-003** Shared `app-toggle` switch component (`role="switch"`, `aria-checked`, no text).
- **FR-004** Chats Settings: **Enter key sends** and **Media visibility** rows render as toggles
  bound to the store; Wallpaper/Font size/Keyboard keep chevron rows. Notifications: all five
  rows render as toggles.
- **FR-005** Composer Enter: `enterKeySends` ON → Enter sends (current behavior); OFF → Enter is
  inert (single-line input cannot hold a newline — documented deviation). Send button/`(send)`
  unchanged.
- **FR-006** Toggle state and Enter behavior survive reload (persisted).

## Non-Goals

- Wallpaper/font/keyboard navigation; media-visibility and notification consumer effects beyond
  persistence; "Show previews" changing chat-list preview text (golden-sensitive, `0-8855`);
  popup sub-options; per-pref "default reset" UI.

## User Stories

- **US1 (flag)**: I switch **Enter key sends** off; pressing Enter in a chat no longer sends.
- **US2 (durable)**: My toggles survive reloading the app.
- **US3 (surface)**: Toggle-type rows render as visible switches, not chevrons.

## Acceptance Criteria (validation targets)

1. Unit `prefs.store.spec.ts`: defaults; toggle persists; set persists; hydrate on reload;
   reset clears storage + restores defaults.
2. Unit `chats-settings-page.spec.ts`: enter-sends + media-visibility render switches with
   default state; toggling updates the store; remaining rows are chevron rows + no-op.
3. Unit `notifications-page.spec.ts`: all rows render switches bound to the store.
4. Unit `composer.spec.ts` (extend): with `enterKeySends` false, Enter does not send; toggle
   back true → Enter sends (existing Enter test stays green under defaults).
5. Unit `toggle.spec.ts`: role switch, aria-checked sync, emits checkedChange.
6. E2E `tests/e2e/settings-toggles.spec.ts` (authored, runs paused): toggle off → Enter inert in
   chat; toggle persisted across reload on both settings screens.
7. Build green + unit green.

## Explicit deviations (documented drift)

1. Single-line composer: with `enterKeySends` ON Enter sends (unchanged); OFF Enter is inert —
  no newline insertion (input is `type="text"`; newline composition is out of map scope).
2. `enterKeySends` default is ON to preserve shipped behavior (F-022) and existing tests.
3. Only the two Chats Settings toggles have consumer behavior this feature; Notification toggles
  persist state only (OS/notification targets are map-external).

## Caveat (deliberately incomplete until G1)

Golden geometry of the switch (track/knob sizing, iOS green `#34C759`) provisionally styled;
exact switch treatment from capture rows `0:10483` (Chats Settings) / `0:10334` deferred.