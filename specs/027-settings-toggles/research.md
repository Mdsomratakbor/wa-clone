# Design Research: WhatsApp Settings — persisted toggles

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

## Canonical artifacts

The plan and the task list that used to live in this file now live in the canonical
Speckit artifacts for this feature:

- `plan.md` - approach, phases, review gates, drift policy
- `tasks.md` - the delivery checklist (this file keeps the research record only)