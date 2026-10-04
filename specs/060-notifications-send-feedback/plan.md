# Plan: Notification delivery prefs with a send-feedback consumer (feature 060)

## Approach

One commit series in the established `docs(spec)` → `feat` → `test` → `docs(spec)` order, G2
(build + full unit suite green, exact count) before every commit. Playwright stays paused
(2026-09-26): e2e authored only.

1. **Prefs store (FR-001, FR-002)** — re-add `sound`/`vibrate` to `PrefsKey`/`DEFAULT_PREFS`
   (default `true`), bump `PREFS_VERSION` 5 → 6, widen `KNOWN_PREFS_VERSIONS` to 1..6. Additive
   with defaults; old snapshots normalize.
2. **Send feedback (FR-005, FR-006, FR-007)** — new `SendFeedback` service + `FeedbackEffects`
   port, default `BrowserFeedbackEffects` (Web-Audio tone + featured `navigator.vibrate`, both
   best-effort); `ChatStore.sendMessage` returns `boolean`; `ChatWindowPage` fires feedback only
   when the store accepted text or attachment sends.
3. **Screen (FR-003, FR-004)** — seed: clear `unavailable` on `notifications-sound` and
   `notifications-vibrate`, rewrite their two descriptions (PROVISIONAL); `notifications-page.ts`
   maps the two rows to `sound`/`vibrate`; markup unchanged.
4. **Tests** — `prefs.store.spec` F-046 block inverted (sound/vibrate are live keys again;
   popup/light still normalize away), v6 envelope + v5-hydrates-to-defaults; new
   `send-feedback.spec`; `chat-window-page.spec` send-feedback cases; `chat.store.spec`
   `sendMessage` return; `notifications-page.spec` three-live assertions. Full suite + build.
5. **E2E (authored, not executed)** — `notifications.spec.ts` "rows are no-ops" no longer holds:
   Sound/Vibrate/Show previews are live toggles, Popup/Light disabled; `settings-toggles.spec.ts`
   sound/vibrate persistence across reload.
6. **Closure** — drift notes (017, 046 disposition, 054, design-map row 17, gap-audit changelog),
   checklist/checklist-converge, FR → test-name traceability, reconcile records.

## Drift policy

- Superseded specs each get a drift note: `017-notifications` (F-046's "all four delivery rows are
  honestly disabled" narrows to two), `046-inert-control-sweep/disposition.md` (sound/vibrate
  return WITH a consumer in the same commit — the disposition's own allowed path; the closing rule
  now has two, not four, deleted keys), `054-settings-row-descriptions` (two descriptions rewritten).
- If implementation reveals a wrong/missing/contradictory requirement → stop, clarify, write the
  answer into `spec.md`, continue. Never silently change the contract.

## Review gates

- **G1 — BLOCKED (Figma capture)**: expired OAuth token; 060 ships no chrome, only PROVISIONAL
  copy + tone/vibration hypotheses (research.md). Reconcile after re-auth.
- **G2**: `npm run build` green AND full unit suite green (exact count) before every commit.
- **G3**: checklist + converge clean; drift notes landed; no task unrecorded.

## Risks

- **F-046 assertion inversion**: `prefs.store.spec` currently asserts all four delivery keys
  normalize away; that block is *updated*, not deleted, to the two still-removed keys — the
  inversion is called out in the task + commit body.
- **Effect ports in staged specs**: page-level send tests provide a fake `FeedbackEffects` so
  no real audio/vibration runs in the harness; the port is behavior-asserted (tone/vibrate called),
  not implementation-probed.
- **`navigator.vibrate` absent in CI**: `BrowserFeedbackEffects` guards via `typeof`; specs use the
  port, never the real motor.
- **sendMessage signature**: `void` → `boolean` is additive; existing callers ignore the return.