# Design Research: WhatsApp Edit Profile — real Save (persisted Name/About)

**Source**: gap audit tier A (`specs/design-gap-audit.md`, A3) — a designed form whose Save does
nothing.

## Research summary

- `EditContactPage` (019) is the in-repo precedent for a real form: `#input` template refs feeding
  signal drafts via `(input)`, then a store write in `onSave()` followed by navigation back. Reusing
  that pattern keeps the codebase idiomatic and the a11y attributes unchanged.
- `PrefsStore` already owns user-level, persisted, non-chat state (`prefs`, `chatSort`) under
  `wa.prefs.v1` with tolerant hydration. The profile belongs there rather than in a new store: it is
  a small, user-scoped preference with no chat/thread coupling, and a second store would add a second
  storage key for the same screen pair.
- Envelope: bump to version `3` and keep accepting `1` and `2`, hydrating a missing `profile` from
  the default. `reset()` must clear it too, otherwise tests that reset prefs would leak a profile.
- `SettingsPage` reads `SETTINGS_PROFILE` (a seed constant). It becomes a computed: name from the
  store, subtitle still the design's `Tap to edit profile`. Because the default name is `Ani` — the
  value the design itself shows — seeded/golden renders do not move. The avatar tile stays as-is
  (its glyph is pending capture, so no initials are invented).
- Blank-name rejection: the avatar tile has no initials yet, but a blank name would erase the header
  identity entirely, so `Save` guards on a trimmed name and keeps the previous value.

## Canonical artifacts

The plan and the task list that used to live in this file now live in the canonical
Speckit artifacts for this feature:

- `plan.md` - approach, phases, review gates, drift policy
- `tasks.md` - the delivery checklist (this file keeps the research record only)