# Plan: WhatsApp Settings — persisted toggles (feature 027)

**Input**: `specs/027-settings-toggles/spec.md` + `specs/027-settings-toggles/research.md` (original: **Input**: `specs/016-chats-settings`, `specs/017-notifications` + `ChatStore` persistence)

**Gate**: G1 needs no capture - the toggle rows already exist in rows 16 and 17; this feature only makes them live.

## Approach

1. `PrefsStore` + `1prefs.store.spec.ts`.
2. `app-toggle` shared component + spec.
3. Chats Settings + Notifications: toggle rows bound to the store; chevron rows unchanged.
4. Composer: Enter gated on `prefs.enterKeySends`.
5. Spec drift notes (016, 017); e2e authored (paused); build + unit validation.
6. Commits (spec → feat → test).

close + drift notes.

## Phases

The approach above is executed in order; each numbered step is one commit-sized unit (docs -> feat -> test).

## Review gates

- **G1**: no-op (no new capture);
- **G2**: build/unit green + e2e authored (runs paused);
- **G3**: close + drift notes.

## Drift policy

Adds a `PrefsStore` plus a shared `app-toggle`, so 016 / 017 rows stop being no-ops (drift notes in both). Toggle chrome is provisional until capture.

## Structure

Single project (repo root):

```text
specs/027-settings-toggles/
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