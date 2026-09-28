# Plan: WhatsApp Edit Profile — real Save (persisted Name/About) (feature 036)

**Input**: `specs/036-profile-persistence/spec.md` + `specs/036-profile-persistence/research.md` (original: **Input**: `ProfilePage` (spec 020) + `SettingsPage` profile header (013) +)

**Gate**: G1 needs no capture - 020 profile form and the 013 header already exist; this feature makes Save real.

## Approach

1. `prefs.store.ts`: `ProfileSnapshot`, `DEFAULT_PROFILE`, `profile` signal, `updateProfile()`,
   `reset()`, envelope v3 + tolerant hydrate.
2. `profile-page.ts` / `.html`: drafts + `#input (input)` + `onSave()` persist + navigate.
3. `settings-page.ts`: `profile` computed from the store.
4. Unit: prefs store, profile page, settings page. E2E extended (paused).
5. Drift note (`specs/020`); build + unit green; commits (spec → feat → test).

## Phases

The approach above is executed in order; each numbered step is one commit-sized unit (docs -> feat -> test).

## Review gates

- **G1**: store + form;
- **G2**: build/unit green + e2e authored;
- **G3**: close + drift note.

## Drift policy

The 020 `Save` stops being a no-op and `PrefsStore` gains a v3 profile envelope (drift note in 020). The avatar tile is left unchanged on purpose - the design shows no editable avatar.

## Structure

Single project (repo root):

```text
specs/036-profile-persistence/
- spec.md          # requirements (canonical)
- research.md      # Phase 0 research + assumptions
- plan.md          # this file (Phase 1)
- tasks.md         # Phase 2 task list
- contracts/ui-contracts.md
src/app/core/        # stores (ChatStore, PrefsStore, CallStore)
src/app/features/    # one folder per screen
src/app/shared/components/  # nav bar, list item, action sheet, toggles
tests/e2e/           # playwright specs (authored; runs paused)
```