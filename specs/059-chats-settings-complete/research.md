# Research: Chats Settings — complete every setting (feature 059)

Grounded facts gathered 2026-10-04 from the working tree. Every design value below is PROVISIONAL
unless it reuses an existing token.

## Current screen and deferral trail

- `src/app/features/settings/chats-settings-page.ts` — `TOGGLE_PREFS` maps only
  `'chats-enter-sends' → 'enterKeySends'`; `onRowActivate` handles only `chats-font-size`
  (`router.navigate(['/settings/chats/font-size'])`). Wallpaper and Keyboard fall through with no
  handler → silent no-op chevrons (F-046 "Deferred, still inert" table).
- `chats-settings-page.html` — three row shapes: `unavailable` (`data-testid-unavailable="true"`,
  disabled `Toggle`), live `Toggle` bound through `toggleKey(rowId)`, and a chevron
  `button[data-testid="chats-settings-row"]` calling `onRowActivate`. Every branch renders the
  F-054 description line below the label.
- `settings.seed.ts` `CHATS_SETTINGS_ROWS` (5): `chats-wallpaper`, `chats-font-size`,
  `chats-keyboard`, `chats-enter-sends`, `chats-media-visibility` (the last with
  `unavailable: true`). `SettingsRowSeed` = `{ id, label?, description?, unavailable? }`.
- F-046 `disposition.md` — `chats-wallpaper` destination "Wallpaper picker (capture-blocked)",
  `chats-keyboard` destination "Chat-wallpaper/keyboard shortcut sheet", both deferred-only.
  `mediaVisibility` destination "Media-privacy filtering of message bubbles". The disposition's
  closing rule: a deleted key must not return as a switch without a consumer; it returns **with the
  consumer, in the same commit** — FR-008/FR-009 fulfil exactly that.

## Prefs store (versioning contract)

- `prefs.store.ts`: `PrefsKey = 'enterKeySends' | 'showPreviews'`; `DEFAULT_PREFS` both `true`.
  `PREFS_VERSION = 4` (F-041 bumped 3→4 for `fontScale`). Envelope key `wa.prefs.v1`.
  `hydrate()` guard: `version !== 1 && !== 2 && !== 3 && !== PREFS_VERSION` → bail. Non-boolean
  fields: `chatSort`, `fontScale?`, `profile?`.
- `normalizePrefs(raw)` iterates `Object.keys(DEFAULT_PREFS)`, keeps only boolean values → adding
  `mediaVisibility` to `DEFAULT_PREFS` gives hydrate/normalize support for free, and the four still
 -removed Notifications keys keep normalizing away.
- v5 change surface: add `mediaVisibility` to `PrefsKey`/`DEFAULT_PREFS`; add `wallpaper` field +
  `WallpaperId`/`WALLPAPERS`/`DEFAULT_WALLPAPER` + `setWallpaper()`; bump `PREFS_VERSION` to 5;
  hydrate guard accepts 1–5; `persist()` writes `wallpaper`; `reset()` restores default.

## Precedent to mirror

- **Scoped chat token** — F-041 `_tokens.scss` lines ~112–174: `$wa-font-scale` map + per-step
  `[data-font-scale='<step>']` scope redeclaring the four chat-text tokens; `:root` emits
  `--wa-font-scale: map.get(..., default)`. This is the pattern for `--wa-wallpaper-bg`: `:root`
  declares `--wa-wallpaper-bg: var(--wa-surface)` (byte-identical default; the current scroll
  background is `var(--wa-surface)`, `chat-window-page.scss:5`), and each
  `[data-wallpaper='<id>']` scope redeclares it.
- **Radiogroup picker screen** — `font-size-page.ts/html`: `FONT_SCALES` + `FONT_SCALE_LABELS`,
  `radiogroup` of rows, stored value checked, `setFontScale` on select, `Back` → `/settings/chats`.
  The wallpaper picker mirrors this; the swatch square is additionally filled with the option's
  colour via a token-driven style.
- **Toggle in a settings row** — `notifications-page.ts` maps `'notifications-previews' →
  'showPreviews'` and renders a live switch; `KeyboardPage` reuses the same `Toggle` component
  (`[checked]`, `(checkedChange)`, `[label]`, `[disabled]`).
- **Message rendering** — `message-bubble.html`: `@if (message().file; as file)` branches to
  photo `<img data-testid="bubble-photo">` (when `file.dataUrl`) or the file card
  (`.message-bubble__file`), then a caption `<p data-testid="bubble-caption">`. Masking inserts a
  placeholder branch ahead of both, gated by `mediaVisibility`.

## PROVISIONAL values recorded (owner-accepted hypotheses, replaced at G1)

- Wallpaper ids + labels: `default` (untitled), `sky` "Sky", `sand` "Sand", `mint` "Mint",
  `blush` "Blush", `slate` "Slate".
- Wallpaper raw colours (token conversion target `--wa-wallpaper-<id>` in `_tokens.scss`,
  PROVISIONAL):
  - `sky`: `#C7E0F4`
  - `sand`: `#EDE0C8`
  - `mint`: `#CBE7D8`
  - `blush`: `#F0D8DC`
  - `slate`: `#D6DCE4`
  - `default`: `var(--wa-surface)` (existing token; NOT a new hex)
- Masked-placeholder copy (PROVISIONAL): "Media hidden".
- `chats-media-visibility` F-054 description rewrite (PROVISIONAL): `Show photos and files inside chats`.
- Keyboard note copy (PROVISIONAL): `Enter is the only keyboard preference this app can honour today.`
- Comment/reference note: the Keyboard page must not list shortcuts that do not exist in this app.

## Open findings carried forward

- F-041/F-016 6-vs-5 row count for frame `0:9973` (4 row groups). 059 removes `Enter key sends`
  from the seed (one-pref-one-switch, owner decision Q2). The reconcile record is in tasks.md
  closure + spec §UNKNOWN.
- F-044 media page / contact media page remain unmasked while bubbles are masked — recorded
  reconcile item (spec Non-Goals).