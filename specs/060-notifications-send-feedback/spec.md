# Feature Specification: Notification delivery preferences with a send-feedback consumer

**Feature**: `060-notifications-send-feedback`

**Created**: 2026-10-04

**Status**: ✅ **Implemented** — build green, full unit suite **837/837** (825 at feature start, +12); e2e authored, not executed (Playwright paused 2026-09-26). Closure records, drift notes, and FR → test traceability in `tasks.md`; PROVISIONAL copy/hypotheses in `research.md`.

**Input**: `specs/017-notifications/spec.md` (row 17, frame `0:10758`), the F-046
"key returns only with a consumer" disposition (`specs/046-inert-control-sweep/disposition.md`),
and the F-059 v5-envelope precedent (`specs/059-chats-settings-complete/`). The gift for the
consumer is the chat send path (`ChatWindowPage.onSend` / `onSendAttachment`).

---

## Clarification block (2026-10-04, owner, verbatim answers)

The clarify pass asked: "What should 'update the Notifications settings' actually change" and
"which consumer should the enabled toggles drive?" Owner answers:

- **Q1 — "Re-enable the four delivery toggles with real consumers."** Delivered as: `sound` and
  `vibrate` come back **with a consumer in the same commit** (the F-046 disposition's own allowed
  path). The follow-up Q3 narrows the wording "four": `popup` and `light` cannot be honest on a
  phone-web app (no lock screen, no notification light), so they **stay honestly disabled**, keys
  remain deleted. All five rows remain visible.
- **Q2 — "Outbound send feedback": "Sending a message in a chat plays a short Web-Audio tone
  (Sound) and navigator.vibrate (Vibrate) when those toggles are on."** The consumer fires only on
  a **successful** send; refused/blank sends never trigger it. Snapshot: the feedback is local,
  best-effort feedback for the moment the user sends, not a notification pipeline.
- **Q3 (follow-up) — "Sound+Vibrate live; Popup/Light stay disabled":** confirmed. The four
  delivery keys are therefore split — two re-enabled with the send-feedback consumer, two
  remaining honestly disabled with their keys deleted.

## Summary

Sending a message in a chat now plays a short tone (Web Audio) and/or a brief vibration when the
corresponding Notifications toggle is on. This re-enables the `sound` and `vibrate` prefs (default
`true`, matching the pre-F-046 shipped baseline) with a **same-commit consumer** in
`ChatWindowPage`, so the F-046 rule is satisfied. `popup` and `light` remain honestly disabled.

## Functional Requirements

- **FR-001**: `sound` and `vibrate` re-enter `PrefsKey` and `DEFAULT_PREFS`, default `true`
  (the pre-F-046 baseline, evidenced in git history). Additive: a snapshot written before this
  feature (no sound/vibrate keys) hydrates with the defaults. Unknown keys are still stripped.
- **FR-002**: persistence envelope version bumps 5 → 6; `hydrate()` accepts versions 1–6. A v5
  envelope round-trips and a v4 envelope with no sound/vibrate keys hydrates to defaults.
- **FR-003**: Notifications screen — `Sound` and `Vibrate` rows become **live, store-bound
  toggles**; `Popup notification` and `Light` stay `unavailable` (disabled switches); all five rows
  remain, `Show previews` unchanged.
- **FR-004**: The `Sound` / `Vibrate` row descriptions are rewritten (PROVISIONAL copy, recorded
  below) to the consumer that actually ships: a tone/vibration on your **outgoing** messages.
  Popup/Light/Show-previews copy unchanged. F-054 drift note required.
- **FR-005**: `SendFeedback` service consumed by `ChatWindowPage`: after a successful text send or
  a successful attachment send, iff `sound` then `tone()` effect; iff `vibrate` then `vibrate()`
  effect. Neither fires when the pref is off, when the draft was blank, or when the store refused
  the send. Effects go through a `FeedbackEffects` port so tests assert the routing without a real
  speaker or vibration motor.
- **FR-006**: `BrowserFeedbackEffects` (the default port): Web-Audio short tone and
  `navigator.vibrate`, both **feature-detected and best-effort** — a missing/blocked API or a
  missing pref is a silent no-op, never a throw. Tone shape/pattern are PROVISIONAL hypotheses
  (research.md), recorded for the reconcile.
- **FR-007**: `ChatStore.sendMessage` gains a **boolean return** (additive; `false` only for a
  blank draft) so the page can distinguish "sent" from "refused". `sendAttachment` already
  returns `boolean`. Existing callers that ignore the return keep compiling.
- **FR-008**: No layout, overflow, or chrome change on `/settings/notifications` — only toggle
  wiring and copy. No horizontal overflow at any breakpoint (F-054 shape unchanged).

## Non-Goals

- `popup` and `light` stay honestly disabled — no lock screen / notification light exists in a
  browser; re-enabling them without a consumer would recreate the F-046 defect.
- No real notification-delivery pipeline, no badge/ringtone picker, no per-conversation tones.
- Status publishing and camera photo publish are **not** chat sends and do not play the tone
  (Q2 says "sending a message in a chat").
- The tone it plays is a local PROVISIONAL synth, not the real WhatsApp tone asset (map-external).

## User Stories

- **US1 (toggle)**: In Notifications I switch Sound/Vibrate off; sending from a chat goes quiet.
- **US2 (feedback)**: With Sound and Vibrate on, sending a message in a chat plays a short tone and
  a brief vibration; a blank draft or a refused file plays neither.
- **US3 (screen)** : The Notifications screen keeps five rows; Popup/Light remain disabled with an
  honest "not supported" rendering while Sound/Vibrate/Show previews work.

## Acceptance Criteria (validation targets)

1. Unit — `prefs.store.spec.ts` (F-046 block **inverted**: sound/vibrate are live keys again,
   popup/light still normalize away; envelope v6; v5→defaults hydrate), new
   `send-feedback.spec.ts`, `chat-window-page.spec.ts` send-feedback cases, `chat.store.spec.ts`
   `sendMessage` return, `notifications-page.spec.ts` (three live toggles).
2. E2E authored (not executed, Playwright paused): `tests/e2e/notifications.spec.ts` "rows are
   no-ops" no longer holds, `tests/e2e/settings-toggles.spec.ts` sound/vibrate persistence.
3. `npm run build` green; full unit suite green with exact count reported.
4. Drift notes: `017`, `046` disposition, `054`, `figma/design-map.md` row 17,
   `specs/design-gap-audit.md` changelog.

## PROVISIONAL inventory (reconcile after the G1 Figma re-capture)

- Sound description: **"Play a tone when you send a message"**
- Vibrate description: **"Vibrate when you send a message"**
- Tone shape: short sine glide, ~150 ms, quiet gain (research.md records the literal params as
  hypotheses — no Figma node exists for a local synth tone).

## Quality checklist

- Deterministic tests: no real clock, no sleeps; effects asserted through the `FeedbackEffects`
  port; `navigator.vibrate`/AudioContext never invoked at unit-test time in a way that can throw.
- A disabled thing is disabled: Popup/Light remain `unavailable` with `data-testid-unavailable`.
- No scope creep: no new dependencies, no persistence-key renames, additive schema only.