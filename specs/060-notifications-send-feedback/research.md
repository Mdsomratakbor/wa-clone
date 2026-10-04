# Research: Notifications send-feedback (feature 060)

## 1. Where the consumer hooks

The chat send path in `ChatWindowPage`:

- `onSend(text)` → `ChatStore.sendMessage(...)` (currently `void`; FR-007 makes it `boolean`).
- `onSendAttachment(draft)` → `ChatStore.sendAttachment(...)` (already `boolean`, F-058).

The store refuses blank drafts (`sendMessage` early-returns) and unsafe/oversized files
(`sendAttachment` returns `false`; F-058 FR-005/FR-006). The page must only fire feedback when the
store actually appended a message. `sendMessage` returning `boolean` mirrors `sendAttachment` and
keeps the decision in the store (the adapter swallows quota errors, so only the store knows the
truth).

Status/camera publish into the Status store (F-049/F-050), not a chat thread — the clarify answer
(Q2) scoped the tone/vibrate to "sending a message **in a chat**", so those paths are non-goals.

## 2. The port (F-047 mental model)

`SendFeedback` routes "a successful send happened" to two effects through a `FeedbackEffects` port
(abstract class). Default implementation `BrowserFeedbackEffects`:

- `tone()` — Web Audio: lazily create an `AudioContext`, play a very short, quiet oscillator note;
  entire body in `try/catch`. If the context is missing or autoplay/`SecurityError` blocks it, no-op.
- `vibrate()` — `typeof navigator.vibrate === 'function'` then `navigator.vibrate(pattern)`; whole
  call guarded so an absent API is a no-op, not a throw.

Both are "best-effort device feedback" — same honesty bar as the F-050/F-058 adapters that swallow
quota/SecurityError. Tests provide a recording fake port and assert the routing (FR-005), never real
audio.

## 3. PROVISIONAL values (hypotheses, no Figma node)

Recorded for the post-re-auth reconcile; never presented as design-verified.

| Value | Hypothesis | Reconcile note |
|-------|-----------|----------------|
| Tone duration | ~150 ms | No node; WhatsApp's real asset is map-external |
| Tone pitch/curve | short sine ~880 Hz glide to ~620 Hz, quiet gain | Above |
| Vibration pattern | `[60]` single short pulse | Android sends a short pulse; pattern is a guess |
| Sound default | `true` | Pre-F-046 shipped baseline (`sound: true` was in `DEFAULT_PREFS` before F-046 `9b…` removed all four keys) |
| Vibrate default | `true` | Same evidence |

## 4. Versioning precedent

F-041 bumped 3 → 4 (fontScale), F-059 bumped 4 → 5 (wallpaper + returned mediaVisibility). Each
additive schema change bumps and widens the hydrate guard, and old snapshots normalize at load
(`normalizePrefs` fills missing keys with defaults, drops unknown keys). Feature 060 bumps 5 → 6 and
accepts 1..6. A v5 snapshot (no sound/vibrate) hydrates to `sound: true, vibrate: true`.

## 5. F-046 disposition interaction

`disposition.md` states: "If a future feature adds a consumer, the key returns with the consumer,
in the same commit." That is exactly this feature for `sound`/`vibrate`. `popup`/`light` keep lock:
no browser consumer exists. The disposition's closing rule currently names "the four remaining
deleted pref keys" — after 060 only two remain, so the disposition gets a drift note.

## 6. Copy

Sound/Vibrate descriptions are rewritten (FR-004) to say what actually happens. They replace
F-054-approved PROVISIONAL copy, so `054` gets a drift note listing the old → new strings. The
Screen title, Back behavior, and `data-testid`s are untouched (FR-008).

## 7. Open findings inherited

None new. G1 Figma capture remains blocked (expired OAuth token, authoritative reset marker in
`specs/design-gap-audit.md`); this feature ships no chrome, only the PROVISIONAL copy above.
Playwright paused by owner directive (2026-09-26) — e2e authored, never executed.