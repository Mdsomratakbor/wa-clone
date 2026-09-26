# Design Research + Plan + Tasks + Quickstart: Settings — persisted toggles (feature 027)

**Source**: behaviour slice (future work 2). Reuses: F-024 snapshot/persist pattern
(`prefs.store.ts`), shared component conventions (`input()`/`output()` signal API), seed-driven
settings screens (`chats-settings-page`, `notifications-page`).

## Research summary

- Chats Settings (row 16) lists Wallpaper / Font size / Keyboard / **Enter key sends** / **Media
  visibility**; Notifications (row 17) lists Sound / Vibrate / Popup notification / Light / Show
  previews. Today every row is a static chevron `<button>` with a no-op handler (`F-016`/`F-017`
  Non-Goals defer navigation targets).
- WhatsApp real behaviour: in "Enter key sends" the toggle decides whether the composer's Enter
  key sends; the rest affect chat-list/storage/OS surfaces. Our chat list preview text is
  golden-pinned (`0-8855`), so **Show previews** stays a persisted-but-unwired toggle.
- The composer (`shared/components/composer`) handles `(keydown.enter)="onSend()"` and a Send
  button; it's the natural single hook point for `enterKeySends`. Composer's existing Enter unit
  test assumes send-by-default → default ON preserves it.
- A new root `PrefsStore` (key `wa.prefs.v1`) mirrors `ChatStore`'s persist/hydrate/reset
  contract; a presentational `app-toggle` (`role="switch"`) keeps row chrome testable.

## Plan

1. `PrefsStore` + `1prefs.store.spec.ts`.
2. `app-toggle` shared component + spec.
3. Chats Settings + Notifications: toggle rows bound to the store; chevron rows unchanged.
4. Composer: Enter gated on `prefs.enterKeySends`.
5. Spec drift notes (016, 017); e2e authored (paused); build + unit validation.
6. Commits (spec → feat → test).

**Gates**: G1 no-op (no new capture); G2 build/unit green + e2e authored (runs paused); G3
close + drift notes.

## Tasks

- [x] T001 — Spec set `specs/027-settings-toggles/` (this set)
- [x] T002 — `PrefsStore` + units
- [x] T003 — `app-toggle` component + spec
- [x] T004 — Chats Settings / Notifications toggle rows
- [x] T005 — Composer Enter gating
- [x] T006 — Spec updates + authored e2e
- [x] T007 — Drift notes (016/017), build green + unit green
- [x] T008 — Commits

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per owner directive
```