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

- [ ] `prefs.store.ts`: re-add `mediaVisibility` to `PrefsKey`/`DEFAULT_PREFS`; add
      `WallpaperId`, `WALLPAPERS`, `DEFAULT_WALLPAPER`, the `wallpaper` signal and
      `setWallpaper()`; `PREFS_VERSION` 4→5; hydrate guard accepts 1–5; `persist()`/`reset()`
      include wallpaper. (FR-001, FR-002, FR-008)
- [ ] `prefs.store.spec.ts`: F-046 "removed keys" block updated — the four Notifications keys
      still normalize away **and `mediaVisibility` is no longer one of them** (title + assertion
      inversion, see plan Risks); add v5 hydrate/persist tests (wallpaper + mediaVisibility),
      v4 → `mediaVisibility` default-true hydrate, invalid wallpaper → default, `reset()` restores
      defaults. (FR-001, FR-002, FR-008)
- Files: `src/app/core/prefs.store.ts`, `src/app/core/prefs.store.spec.ts`.

## T3 — feat: wallpaper (tokens, scope, picker screen)

- [ ] `_tokens.scss`: PROVISIONAL `--wa-wallpaper-bg: var(--wa-surface)` at `:root` + per-id
      `[data-wallpaper='<id>']` scopes (`sky/sand/mint/blush/slate` colours from research.md). (FR-003)
- [ ] `chat-window-page.scss`/`chat-window-page.html`/`.ts`: paint the scroll area with
      `var(--wa-wallpaper-bg)`; bind `[attr.data-wallpaper]="wallpaper()"` on `.chat-window` root
      reading the store. (FR-005)
- [ ] `wallpaper-page.{ts,html,scss}` + lazy route `/settings/chats/wallpaper`: title `Wallpaper`,
      Back → `/settings/chats`, radiogroup of six swatch rows, stored one checked, select calls
      `setWallpaper`. (FR-004)
- Files: `src/app/core/tokens/_tokens.scss`, `src/app/features/chat-window/chat-window-page.{ts,html,scss}`,
      `src/app/features/settings/wallpaper-page.{ts,html,scss}`, `src/app/app.routes.ts`.

## T4 — feat: keyboard screen + rows restructure

- [ ] `keyboard-page.{ts,html,scss}` + lazy route `/settings/chats/keyboard`: title `Keyboard`,
      Back → `/settings/chats`, a stored `Toggle` for `enterKeySends` + PROVISIONAL note line. (FR-006)
- [ ] `settings.seed.ts`: drop `chats-enter-sends`; clear `chats-media-visibility.unavailable`;
      rewrite its description to the PROVISIONAL copy. (FR-007, FR-011)
- [ ] `chats-settings-page.ts`: `TOGGLE_PREFS` gains `'chats-media-visibility' →
      'mediaVisibility'`; `onRowActivate` navigates `chats-wallpaper` and `chats-keyboard`.
      (FR-007)
- Files: `src/app/features/settings/{keyboard-page.ts,keyboard-page.html,keyboard-page.scss}`,
      `src/app/features/settings/settings.seed.ts`, `src/app/features/settings/chats-settings-page.ts`,
      `src/app/app.routes.ts`.

## T5 — feat: media privacy masking in message bubbles

- [ ] `message-bubble.{ts,html,scss}`: inject `PrefsStore`; when `mediaVisibility` is false and the
      message has a `file`, render a placeholder (`data-testid="bubble-media-private"`, PROVISIONAL
      copy) instead of the photo `<img>`/file card; caption still renders; `aria-label` reads
      `Media hidden` (+ caption). Store untouched. (FR-009, FR-010)
- Files: `src/app/shared/components/message-bubble/message-bubble.{ts,html,scss}`.

## T6 — test: unit coverage (build + full suite green)

- [ ] `wallpaper-page.spec.ts`: header/Back; six swatches; stored one checked; selecting persists +
      re-checks; no tab bar. (FR-003, FR-004)
- [ ] `keyboard-page.spec.ts`: hosts the Enter-key-sends switch bound to `enterKeySends`; toggling
      persists; Back. (FR-006)
- [ ] `chats-settings-page.spec.ts`: four rows (no `Enter key sends` row); Wallpaper/Keyboard rows
      navigate; Media visibility is a live store-bound toggle (disabled-assertion **inverted**);
      F-054 description assertions match the new copy. (FR-007, FR-011)
- [ ] `message-bubble.spec.ts`: `mediaVisibility` off → placeholder + caption, no img/card, masked
      aria-label; on → media as today. (FR-009, FR-010)
- [ ] `chat-window-page.spec.ts` and/or `prefs.store.spec.ts`: `data-wallpaper` binding follows the
      stored value; default renders byte-identical. (FR-005, FR-012)
- [ ] Full unit suite green, exact count reported (baseline 794). No sleeps; local storage cleared
      per suite.
- Files: as listed + touched spec files.

## T7 — test: e2e authored (not executed)

- [ ] `tests/e2e/chats-settings.spec.ts`: four rows; Wallpaper → picker → choose → thread
      background changes; Keyboard → toggle persists; Media visibility off → masked bubble, on →
      restored; no `Enter key sends` row; no overflow at 375px.
- [ ] Playwright pause directive recorded (2026-09-26) — authored only, never run.
- Files: `tests/e2e/chats-settings.spec.ts`.

## T8 — docs(spec): drift notes + closure

- [ ] `specs/016-chats-settings/spec.md` drift note: two rows now live, `Enter key sends` row
      removed (one-pref-one-switch), 6-vs-5 reconcile pointer.
- [ ] `specs/046-inert-control-sweep/disposition.md`: `chats-wallpaper`/`chats-keyboard` deferral
      rows → RESOLVED by 059; `chats-media-visibility` key returned **with a consumer in the same
      commit** (the disposition's own allowed path) + drift note.
- [ ] `specs/054-settings-row-descriptions/spec.md` drift note: Media visibility description
      rewritten (PROVISIONAL).
- [ ] `figma/design-map.md` row 16 note; `specs/design-gap-audit.md` changelog entry (2026-10-04).
- [ ] `specs/059-chats-settings-complete/spec.md` Status → ✅ Implemented (counts); `tasks.md`
      checkboxes + closure section (checkpoint, FR → test-name traceability, blocked-gate record,
      6-vs-5 + media-screen reconcile records).
- Files: as listed; exact unit/test counts reported.

## Closure

FR → test traceability (final), checkpoint, blocked gates — filled in at close of T8.

- FR-001..FR-012 → … (T8 fill-in)

**Blocked (recorded, not skipped)**: G1 Figma capture — expired OAuth token (2026-10-03), so all
059 chrome stays PROVISIONAL until the post-re-auth reconcile. Playwright paused (2026-09-26): e2e
authored only.