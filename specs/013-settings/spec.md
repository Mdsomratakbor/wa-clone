# Feature Specification: WhatsApp Settings

**Feature Branch**: `013-settings`

**Created**: 2026-09-24

**Status**: **Implemented — structural scope landed pre-capture (owner directive `2026-09-24`,
validated `2026-09-24`).** The real `/settings` screen (profile header, settings row list from
seed, tab bar with Settings active, Back → `/starred-messages`) replacing the "Settings coming
soon" stub, the re-hosting of the 011 Settings Modal on the real screen, and the Settings tab
navigation across chats/calls/status/camera (no local stubs remain: all five tabs now route their
top-level screens) shipped — build green, unit 149/149, full e2e 291 passed / 18 skipped
(0 failures; 18 = gated goldens). Exact geometry, row list/order, glyphs, profile identity and
golden remain PENDING the Figma capture (~2026-09-28) and are gated at G1; provisional/hypothesis
values in place until then.

**Input**: `figma/design-map.md` row 13 (`0:9198`) + `specs/013-settings/research.md`

---

## Summary

The Settings screen is the first tab of the shared tab bar. It currently mounts a "Settings
coming soon" stub (`features/starred-messages/settings-stub-page`) that owns the feature 011
Settings Modal trigger. This feature replaces the stub with the real Settings screen (profile
header + row list + real tab bar) at the same `/settings` route, and moves the 011 modal host onto
it, preserving the `settings-page` / `settings-options` testid contract so 011 and existing e2e
stay green. Row targets (Account, Notifications, Data & Storage, …) are later features
(rows 14-20) and stay no-ops.

## PENDING design inventory (capture on ~2026-09-28)

To be filled from the `0:9198` payload:

- [ ] Profile header topology: avatar, name (provisional "Ani"), subtitle, chevron; colors/dims
- [ ] Row list: exact rows, order, glyphs, dividers
- [ ] Nav treatment (Back chevron) + Settings Modal entry placement
- [ ] Tab bar presence / status-bar treatment

## Owner Clarifications (proposed — confirm at G1)

1. **Profile header + rows**: exact identity/rows/order come from the payload; the seed-driven
   structure (`SETTINGS_PROFILE`, `SETTINGS_ROWS` hypothesis) is data and replaced at G1.
2. **011 modal entry**: hypothesis — keep the "Settings options" (⋮) trigger in the settings
   surface top-right (current contract). Confirm the design's actual entry (G1).
3. **Back destination**: keep `/starred-messages` (the existing contract the starred flow tests
   rely on). Confirm intended Back behavior for direct Settings entries at G1.
4. **Row activation**: Non-Goal (rows 14-20 later). Confirm.
5. **Responsive**: no horizontal overflow at any breakpoint (contract pattern 006-012).

## Functional Requirements

- **FR-001**: `/settings` renders the Settings screen (profile header + Settings rows) in place of
  the stub; `data-testid="settings-page"` preserved.
- **FR-002**: Tab bar present with Settings active; Chats/Camera/Calls/Status tabs route to their
  top-level screens.
- **FR-003**: Back returns to `/starred-messages` (existing contract).
- **FR-004**: Row activation is a no-op (sub-pages are later features).

> **Drift note (F-029, 2026-09-26)**: The Settings overflow sheet rows are no longer all
> no-ops — Notifications/Storage route to their existing screens (F-017/F-018). The main list
> rows (Account/Chats Settings/Notifications/Data and Storage) and profile have routed since
> F-014/016/017/018/020; only "Contacts" (row 21-adjacent) and the sheet's "More" stay no-ops.
> See `specs/029-settings-overflow`.
- **FR-005**: The 011 Settings Modal still opens from `settings-options` with backdrop/Escape
  dismiss + focus return (contract unchanged); modal state preserved 1:1.
- **FR-006**: No horizontal overflow at any breakpoint.

## Non-Goals (later features / explicitly deferred)

- Row sub-screens (Account, Chats Settings, Notifications, Data & Storage, Contacts, Edit
  Profile) — rows 14-20.
- Profile editing depth, avatars media, real images — glyphs/avatar PENDING capture.
- The Settings Modal content itself (feature 011, already shipped, untouched).

## User Stories

- **US1 (screen)**: As a user on `/settings` I see the Settings chrome (Back + title + tab bar)
  and a profile header + row list instead of "coming soon".
- **US2 (navigation)**: Tabs route to their screens; Back returns to `/starred-messages`; row
  taps do nothing yet.
- **US3 (011 integration + chroming)**: Settings options still opens/dismisses the Settings Modal
  with focus return; no horizontal overflow at any breakpoint; screen matches the Figma render
  within the measured golden threshold.

## Acceptance Criteria (validation targets)

1. Unit — `settings-page.spec.ts` (new, replaces `settings-stub-page.spec.ts`): chrome (Back
   leading + title), tab bar active Settings, profile header, rows from seed, options trigger
   (closed default; opens; rows; keep open on row; backdrop + focus; Escape + focus), Back →
   `/starred-messages`, tab routing. Full suite green.
2. E2E `tests/e2e/settings.spec.ts`: US1 chrome/profile/rows; US2 routing + Back; US3 golden
   `0-9198-settings.png` (gated) + responsive appended.
3. Regression: `settings-modal.spec.ts` (011) and `starred.spec.ts` updated ('coming soon'
   assertion → real screen); full e2e green.
4. `figma/design-map.md` row 13 spec → `013` + implemented at closure.

## Swap list

- `app.routes.ts`: `/settings` → `features/settings/settings-page` (lazy).
- Delete `starred-messages/settings-stub-page.{ts,html,scss,spec.ts}`; move modal wiring + tests
  into `features/settings/settings-page.*`.
- `starred-page` Back → `/settings` unchanged; `starred.spec.ts` 'coming soon' assertion updated.
- `responsive.spec.ts`: settings case re-labelled (keep `settings-page` testid).
- Settings modal seed (`SETTINGS_ACTIONS`), `settings-modal.*`, `settings.seed.ts` host: extend
  seed with profile/rows; modal component untouched.
- Confirm no other files import the stub (search complete: only routes + stub spec).

## Closing note (deliberately incomplete)

Until T001 lands, `settings-page` renders the structural profile header + hypothesis row list
(stable testids/aria-labels) — replaced at G1 with the captured design. No exact design values are
claimed anywhere.