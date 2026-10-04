# Tasks: Notification delivery prefs with a send-feedback consumer (feature 060)

Each task is one commit-sized unit. Commit order: `docs(spec)` → `feat` → `test` → `docs(spec)`
closure. Playwright stays paused (2026-09-26): **e2e authored, never executed** — recorded `[ ]`
with the directive date.

## T1 — docs(spec): spec, plan, research, tasks

- [x] `specs/060-notifications-send-feedback/{spec,plan,research,tasks}.md` exist; clarify answers
  (2026-10-04) written into §Clarification verbatim; FR-001..FR-008 final; PROVISIONAL copy + tone
  hypotheses recorded in research.md.
- Evidence: every FR names real files/consumers; scope excludes status/camera sends.

## T2 — feat: prefs store (sound/vibrate back, envelope v6)

- [x] `prefs.store.ts`: `sound`/`vibrate` re-enter `PrefsKey` and `DEFAULT_PREFS` (default `true`);
      `PREFS_VERSION` 5→6; `KNOWN_PREFS_VERSIONS` = 1..6. Comment updated (three keys returned by
      F-059/F-060, two still removed). (FR-001, FR-002)
- [x] `prefs.store.spec.ts`: update the F-046 block — sound/vibrate are live keys again (inversion
      called out in commit), only popup/light normalize away; envelope test 5→6; add v5→defaults
      hydrate and v6 round-trip (sound/vibrate persisted). (FR-001, FR-002)
- Files: `src/app/core/prefs.store.ts`, `src/app/core/prefs.store.spec.ts`.

## T3 — feat: SendFeedback service + wiring

- [x] `src/app/core/send-feedback.ts`: `FeedbackEffects` (abstract) + `BrowserFeedbackEffects`
      (Web-Audio tone, `navigator.vibrate`, both featured/guarded, never throw) + `SendFeedback`
      (reads prefs, routes through the port).
- [x] `chat.store.ts`: `sendMessage` returns `boolean` (`false` only for blank). (FR-007)
- [x] `chat-window-page.ts`: fire `SendFeedback` on successful text send and attachment send only.
      (FR-005)
- Files: `src/app/core/send-feedback.ts`, `src/app/core/chat.store.ts`,
      `src/app/features/chat-window/chat-window-page.ts`.

## T4 — feat: notifications screen rows live

- [x] `settings.seed.ts`: `notifications-sound`/`notifications-vibrate` clear `unavailable`;
      descriptions rewritten (PROVISIONAL per research.md); Popup/Light unchanged. (FR-003, FR-004)
- [x] `notifications-page.ts`: `TOGGLE_PREFS` gains `'notifications-sound' → 'sound'`,
      `'notifications-vibrate' → 'vibrate'`. Markup unchanged. (FR-003, FR-008)
- Files: `src/app/features/settings/settings.seed.ts`, `src/app/features/settings/notifications-page.ts`.

## T5 — test: unit coverage (build + full suite green)

- [x] `send-feedback.spec.ts` (new): default on → tone+vibrate; sound off → no tone; vibrate off →
      no vibrate; BrowserFeedbackEffects no-throw when APIs absent.
- [x] `notifications-page.spec.ts`: three live toggles (Sound, Vibrate, Show previews), two
      disabled (Popup, Light); toggling Sound/Vibrate persists; copy assertions updated.
- [x] `chat-window-page.spec.ts`: send feedback fires on accepted text + attachment sends; not on
      blank draft or refused file (fake port).
- [x] `chat.store.spec.ts`: `sendMessage` returns true on non-blank, false on blank.
- [x] Full unit suite green, exact count reported; no sleeps; localStorage cleared per suite.
- Files: as listed + touched spec files.

## T6 — test: e2e authored (not executed)

- [x] `tests/e2e/notifications.spec.ts`: "rows are no-ops" no longer holds — Sound/Vibrate/Show
      previews live toggles, Popup/Light disabled.
- [x] `tests/e2e/settings-toggles.spec.ts`: sound/vibrate persist across reload.
- [x] Playwright pause directive recorded (2026-09-26) — authored only, never run.
- Files: `tests/e2e/notifications.spec.ts`, `tests/e2e/settings-toggles.spec.ts`.

## T7 — docs(spec): drift notes + closure

- [x] `specs/017-notifications/spec.md` drift note: F-046 "four delivery rows honestly disabled"
      narrows to two (sound/vibrate now live with a send-feedback consumer).
- [x] `specs/046-inert-control-sweep/disposition.md`: sound/vibrate returned WITH consumers in the
      same commit (the disposition's own allowed path); closing rule "four remaining" → two.
- [x] `specs/054-settings-row-descriptions/spec.md`: drift note + appendix copy update for the two
      rewritten descriptions.
- [x] `figma/design-map.md` row 17 note; `specs/design-gap-audit.md` changelog entry (2026-10-04).
- [x] `specs/060-notifications-send-feedback/spec.md` Status → ✅ Implemented; `tasks.md`
      checkboxes + closure section (checkpoint, FR → test-name traceability, blocked gates,
      reconcile records).
- Files: as listed; exact unit/test counts reported.

## Closure

### Checkpoint

Build green; full unit suite green with exact count (baseline 825 at feature start); e2e authored,
not run (Playwright paused 2026-09-26). PROVISIONAL at closure: Sound/Vibrate descriptions, tone
shape, vibration pattern (research.md), all pending the G1 Figma re-capture.

### FR → test-name traceability (final)

| FR | Unit test(s) |
|----|--------------|
| FR-001 | `PrefsStore` » "starts on the default prefs (sound/vibrate on)"; F-046 block inversion (sound/vibrate live, popup/light normalize away) |
| FR-002 | `PrefsStore` » "persists a version 6 envelope…"; "a v5 envelope with no sound/vibrate keys hydrates to defaults" |
| FR-003 | `NotificationsPage` » "three live, two disabled"; "toggling Sound/Vibrate persists the change" |
| FR-004 | `NotificationsPage` » F-054 description cases for the new Sound/Vibrate copy |
| FR-005 | `SendFeedback` » routing cases; `ChatWindowPage` » send-feedback cases (fires on accepted, silent on blank/refused) |
| FR-006 | `SendFeedback` » "BrowserFeedbackEffects never throws when … absent" |
| FR-007 | `ChatStore` » "sendMessage returns true for non-blank, false for blank" |
| FR-008 | `NotificationsPage` » chrome tests unchanged; full suite + no-overflow suite |

### Blocked gates (recorded, not skipped)

- **G1 Figma capture** — expired OAuth token (`403`, 2026-10-03; reset marker:
  `specs/design-gap-audit.md`). Sound/Vibrate descriptions and the tone/vibration hypotheses stay
  PROVISIONAL; reconcile after re-auth.
- **Playwright** paused by owner directive (2026-09-26) — authored, never executed.

### Reconcile records

- Status/camera publish (Status store) do not play the tone — Q2 scoped the feedback to a chat
  send; recorded, not a bug.
- `popup`/`light` stay disabled with keys deleted; re-enabling them would need a real browser
  consumer (lock-screen popup, LED) that does not exist.