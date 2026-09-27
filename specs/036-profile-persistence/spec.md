# Feature Specification: WhatsApp Edit Profile — real Save (persisted Name/About)

**Feature Branch**: `036-profile-persistence`

**Created**: 2026-09-27

**Status**: **In progress — implementing (spec-driven).**

**Input**: `ProfilePage` (spec 020) + `SettingsPage` profile header (013) +
`EditContactPage` form precedent (019) + `specs/036-profile-persistence/research.md`

---

## Summary

`/settings/profile` renders the design's Edit Profile form (Name prefilled `Ani`, empty About, Save)
but `Save` is a no-op and nothing reads the inputs. F-036 makes the form real: drafts are editable,
`Save` persists Name/About through `PrefsStore`, and the Settings profile header reflects the saved
name (including the avatar initials) across reloads. No new surface, no design change.

## Functional Requirements

- **FR-001** `PrefsStore` exposes a `profile` signal `{ name, about }` defaulting to
  `{ name: 'Ani', about: '' }` and `updateProfile(name, about)`, persisted in the existing
  `wa.prefs.v1` envelope (version bumped to `3`; versions `1` and `2` still hydrate).
- **FR-002** `PrefsStore.reset()` restores the default profile alongside the default prefs/sort.
- **FR-003** `/settings/profile` seeds `nameDraft`/`aboutDraft` from the stored profile and keeps
  both inputs editable (`(input)` → draft, matching `EditContactPage`).
- **FR-004** `Save` calls `updateProfile(nameDraft, aboutDraft)` and navigates back to `/settings`.
- **FR-005** The Settings profile header and avatar initials render the stored name; seeded renders
  are unchanged because the default name is still `Ani`.
- **FR-006** An empty/whitespace-only name is rejected: `Save` keeps the previous name (no blank
  profile) and stays on the form.
- **FR-007** `Back` and `Save` both discard uncommitted drafts (no autosave).
- **FR-008** A failed/absent storage write is best-effort: in-memory state still updates (existing
  `PrefsStore` semantics).

## Non-Goals

- Avatar/photo editing (design row shows an avatar; the design's picker is not in the map).
- The About line on the Settings header (design shows the fixed `Tap to edit profile` subtitle).
- Profile propagation into chat threads or contact cards.

## User Stories

- **US1**: I edit my name, Save, and Settings (plus the avatar initials) shows the new name after a
  reload.
- **US2**: I clear the name and Save — my previous name is kept.

## Acceptance Criteria (validation targets)

1. Unit `prefs.store.spec.ts`: default profile, `updateProfile` persistence, v1/v2 hydration without
   a profile, v3 round-trip, `reset()`.
2. Unit `profile-page.spec.ts`: drafts seeded from the store, typing + Save persists and navigates to
   `/settings`, blank-name rejection, Back discards drafts.
3. Unit `settings-page.spec.ts`: header/avatar show a stored name; default still `Ani`.
4. E2E `tests/e2e/profile.spec.ts` extended (authored, runs paused).
5. Build green + full unit suite green (playwright paused).

## Explicit deviations (documented drift)

1. Spec 020's "Save is a no-op" and "Persistence is a later feature" are superseded (drift note in
   `specs/020`).
