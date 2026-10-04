# Tasks: Chats Settings — complete every setting (feature 059)

Each task is one commit-sized unit. Commit order: `docs(spec)` → `feat` → `test` → `docs(spec)`
closure. Playwright stays paused (2026-09-26): **e2e authored, never executed** — recorded `[ ]`
with the directive date.

## T1 — docs(spec): spec, plan, research, tasks

- [x] `specs/059-chats-settings-complete/{spec,plan,research,tasks}.md` exist; clarify answers
  (2026-10-04) written into §Clarification verbatim; FR-001..FR-012 final; PROVISIONAL inventory
  recorded in research.md; open findings carried forward.
- Evidence: every FR names real files/consumers; every new value is PROVISIONAL.

## T2 — feat: prefs store (mediaVisibility + wallpaper + v5 envelope)

- [x] `prefs.store.ts`: re-add `mediaVisibility` to `PrefsKey`/`DEFAULT_PREFS`; add
      `WallpaperId`, `WALLPAPERS`, `DEFAULT_WALLPAPER`, the `wallpaper` signal and
      `setWallpaper()`; `PREFS_VERSION` 4→5; hydrate guard accepts 1–5; `persist()`/`reset()`
      include wallpaper. (FR-001, FR-002, FR-008)
- [x] `prefs.store.spec.ts`: F-046 "removed keys" block updated — the four Notifications keys
      still normalize away **and `mediaVisibility` is no longer one of them** (title + assertion
      inversion, see plan Risks); add v5 hydrate/persist tests (wallpaper + mediaVisibility),
      v4 → `mediaVisibility` default-true hydrate, invalid wallpaper → default, `reset()` restores
      defaults. (FR-001, FR-002, FR-008)
- Files: `src/app/core/prefs.store.ts`, `src/app/core/prefs.store.spec.ts`. Commit `9b3735a`.

## T3 — feat: wallpaper (tokens, scope, picker screen)

- [x] `_tokens.scss`: PROVISIONAL `--wa-wallpaper-bg: var(--wa-surface)` at `:root` + per-id
      `[data-wallpaper='<id>']` scopes (`sky/sand/mint/blush/slate` colours from research.md). (FR-003)
- [x] `chat-window-page.scss`/`chat-window-page.html`/`.ts`: paint the scroll area with
      `var(--wa-wallpaper-bg)`; bind `[attr.data-wallpaper]="wallpaper()"` on `.chat-window` root
      reading the store. (FR-005)
- [x] `wallpaper-page.{ts,html,scss}` + lazy route `/settings/chats/wallpaper`: title `Wallpaper`,
      Back → `/settings/chats`, radiogroup of six swatch rows, stored one checked, select calls
      `setWallpaper`. (FR-004)
- Files: `src/app/core/tokens/_tokens.scss`, `src/app/features/chat-window/chat-window-page.{ts,html,scss}`,
      `src/app/features/settings/wallpaper-page.{ts,html,scss}`, `src/app/app.routes.ts`. Commit `fd85590`.

## T4 — feat: keyboard screen + rows restructure

- [x] `keyboard-page.{ts,html,scss}` + lazy route `/settings/chats/keyboard`: title `Keyboard`,
      Back → `/settings/chats`, a stored `Toggle` for `enterKeySends` + PROVISIONAL note line. (FR-006)
- [x] `settings.seed.ts`: drop `chats-enter-sends`; clear `chats-media-visibility.unavailable`;
      rewrite its description to the PROVISIONAL copy. (FR-007, FR-011)
- [x] `chats-settings-page.ts`: `TOGGLE_PREFS` gains `'chats-media-visibility' →
      'mediaVisibility'`; `onRowActivate` navigates `chats-wallpaper` and `chats-keyboard`.
      (FR-007)
- Files: `src/app/features/settings/{keyboard-page.ts,keyboard-page.html,keyboard-page.scss}`,
      `src/app/features/settings/settings.seed.ts`, `src/app/features/settings/chats-settings-page.ts`,
      `src/app/app.routes.ts`. Commit `6626376`.

## T5 — feat: media privacy masking in message bubbles

- [x] `message-bubble.{ts,html,scss}`: inject `PrefsStore`; when `mediaVisibility` is false and the
      message has a `file`, render a placeholder (`data-testid="bubble-media-private"`, PROVISIONAL
      copy) instead of the photo `<img>`/file card; caption still renders; `aria-label` reads
      `Media hidden` (+ caption). Store untouched. (FR-009, FR-010)
- Files: `src/app/shared/components/message-bubble/message-bubble.{ts,html,scss}`. Commit `651d587`.

## T6 — test: unit coverage (build + full suite green)

- [x] `wallpaper-page.spec.ts`: header/Back; six swatches; stored one checked; selecting persists +
      re-checks; no tab bar. (FR-003, FR-004)
- [x] `keyboard-page.spec.ts`: hosts the Enter-key-sends switch bound to `enterKeySends`; toggling
      persists; Back. (FR-006)
- [x] `chats-settings-page.spec.ts`: four rows (no `Enter key sends` row); Wallpaper/Keyboard rows
      navigate; Media visibility is a live store-bound toggle (disabled-assertion **inverted**);
      F-054 description assertions match the new copy. (FR-007, FR-011)
- [x] `message-bubble.spec.ts`: `mediaVisibility` off → placeholder + caption, no img/card, masked
      aria-label; on → media as today. (FR-009, FR-010)
- [x] `chat-window-page.spec.ts` and/or `prefs.store.spec.ts`: `data-wallpaper` binding follows the
      stored value; default renders byte-identical. (FR-005, FR-012)
- [x] Full unit suite green, exact count reported (baseline 800 at this feature's start). **824/824**
      committed; no sleeps; local storage cleared per suite.
- Files: as listed + touched spec files. Commit `b05c934`.

## T7 — test: e2e authored (not executed)

- [x] `tests/e2e/chats-settings.spec.ts`: four rows; Wallpaper → picker → choose → thread
      background changes; Keyboard → toggle persists; Media visibility off → masked bubble, on →
      restored; no `Enter key sends` row; no overflow at 375px.
- [x] Playwright pause directive recorded (2026-09-26) — authored only, never run.
- Files: `tests/e2e/chats-settings.spec.ts`. Commit `3b9f862`.

## T8 — docs(spec): drift notes + closure

- [x] `specs/016-chats-settings/spec.md` drift note: two rows now live, `Enter key sends` row
      removed (one-pref-one-switch), 6-vs-5 reconcile pointer.
- [x] `specs/046-inert-control-sweep/disposition.md`: `chats-wallpaper`/`chats-keyboard` deferral
      rows → RESOLVED by 059; `chats-media-visibility` key returned **with a consumer in the same
      commit** (the disposition's own allowed path) + drift note.
- [x] `specs/054-settings-row-descriptions/spec.md` drift note: Media visibility description
      rewritten (PROVISIONAL).
- [x] `figma/design-map.md` row 16 note; `specs/design-gap-audit.md` changelog entry (2026-10-04).
- [x] `specs/059-chats-settings-complete/spec.md` Status → ✅ Implemented (counts); `tasks.md`
      checkboxes + closure section (checkpoint, FR → test-name traceability, blocked-gate record,
      6-vs-5 + media-screen reconcile records).
- Files: as listed; exact unit/test counts reported.

## Closure

### Checkpoint

Build green; full unit suite **824/824** (800 at this feature's start, +24); e2e authored, not
run (Playwright paused 2026-09-26). UI chrome — wallpaper palette + labels, picker swatch
geometry, keyboard note copy, masked-placeholder copy — is **PROVISIONAL** pending the G1 Figma
re-capture.

### FR → test-name traceability (final)

| FR | Unit test(s) |
|----|--------------|
| FR-001 | `PrefsStore` » "starts on the default wallpaper"; "reset returns the wallpaper to default" |
| FR-002 | `PrefsStore` » "persists a version 5 envelope with wallpaper…"; "a v4 envelope with no wallpaper key hydrates as default"; "an unknown wallpaper id hydrates as default" |
| FR-003 | `WallpaperPage` » "renders the PROVISIONAL wallpaper ids and labels…"; "every swatch paints through its own data-wallpaper scope" |
| FR-004 | `WallpaperPage` » "renders the header…"; "checks the stored id…"; "activating an option stores it…"; "navigates to /settings/chats when Back is activated"; "does not render the tab bar" |
| FR-005 | `ChatWindowPage` » "carries the stored wallpaper id…"; "defaults the wallpaper scope to default" |
| FR-006 | `KeyboardPage` » header/Back/no-tab-bar/navigate tests; `ChatsSettingsPage` » "the Keyboard row opens the keyboard screen" |
| FR-007 | `ChatsSettingsPage` » "renders Media visibility as the one live, store-bound switch"; "the Wallpaper row opens the wallpaper picker"; "the Keyboard row opens the keyboard screen"; "keeps Wallpaper/Font size/Keyboard as chevron rows" |
| FR-008 | `PrefsStore` » "F-046 FR-006 + F-059 FR-008: removed/returned keys on load" (inverted block); "keeps the surviving prefs…"; `ChatsSettingsPage` » "Media visibility is live because its consumer ships with it" |
| FR-009 | `MessageBubble` » F-059 masking describe (placeholder replaces photo and file card; media restored on) |
| FR-010 | `MessageBubble` » "announces Media hidden followed by any caption…"; "announces just Media hidden…"; "keeps the caption and hides only the media surface" |
| FR-011 | `ChatsSettingsPage` » "toggling Media visibility persists the change"; F-054 description assertion ("Show photos and files inside chats"); `KeyboardPage` » "shows the F-054 description under the label" |
| FR-012 | default-path tests above (byte-identical) + full suite green |

### Blocked gates (recorded, not skipped)

- **G1 Figma capture** — expired OAuth token (`403`, 2026-10-03; authoritative reset marker:
  `specs/design-gap-audit.md`). Wallpaper palette/labels, picker chrome, keyboard note copy and
  the masked-placeholder copy all stay PROVISIONAL; the capture task re-opens at the post-re-auth
  reconcile. The **6-vs-5 row finding** for frame `0:9973` (F-041) stays open: 059 removed
  `Enter key sends` to fix a one-pref-one-switch duplication, *changing* the hypothesis — the
  seed now ships 4 rows and the reconcile must verify against the captured design.
- **Playwright** paused by owner directive (2026-09-26) — `tests/e2e/chats-settings.spec.ts`
  authored and updated, never executed.

### Reconcile records

- The F-044 media page and contact media page are **not** masked while bubbles are; bubble-level
  masking is the clarified contract (FR-009), the media screens staying unmasked is recorded, not
  a bug.
- Conversation-level `Chat actions → Wallpaper` sheet row stays honestly disabled (F-046);
  per-chat wallpaper is out of scope (spec Non-Goals) and is a follow-up reconcile.
- `var(--wa-text-primary)` is referenced by legacy settings stylesheets and is not in the token
  map (falls back by inheritance); new 059 stylesheets use `--wa-on-surface`. Out of scope.