# Plan: Chats Settings — complete every setting (feature 059)

## Approach

One feature, three sub-features (F-057 precedent), one commit series, committed in the
`docs(spec)` → `feat` → `test` → `docs(spec)` order. Every new visual is PROVISIONAL (G1 blocked:
Figma OAuth token expired 2026-10-03); values live in `research.md` and are replaced at the
post-re-auth reconcile, never silently. Playwright stays paused (2026-09-26): e2e authored only.

1. **Prefs store (FR-001, FR-002, FR-008)** — add `mediaVisibility` back to `PrefsKey`/
   `DEFAULT_PREFS` (consumer lands in the same series), add the `wallpaper` signal +
   `WALLPAPERS`/`DEFAULT_WALLPAPER`/`setWallpaper`, bump `PREFS_VERSION` 4→5, widen the hydrate
   guard to 1–5. This is the version-and-migration core everything else reads.
2. **Wallpaper (FR-003, FR-004, FR-005)** — new PROVISIONAL `--wa-wallpaper-*` tokens +
   `[data-wallpaper]` scopes in `_tokens.scss`; `chat-window-page.scss` paints with
   `var(--wa-wallpaper-bg)`; `ChatWindowPage` binds `[attr.data-wallpaper]`; lazy
   `/settings/chats/wallpaper` route + `WallpaperPage` radiogroup (FontSizePage pattern).
3. **Keyboard (FR-006)** — lazy `/settings/chats/keyboard` route + `KeyboardPage` hosting the
   Enter-key-sends `Toggle` + PROVISIONAL note.
4. **Rows (FR-007, FR-011)** — `CHATS_SETTINGS_ROWS` drops `chats-enter-sends`, clears
   `chats-media-visibility.unavailable`; `chats-settings-page.ts` maps
   `'chats-media-visibility' → 'mediaVisibility'` and navigates Wallpaper/Keyboard;
   description rewrite for Media visibility.
5. **Masking (FR-009, FR-010)** — `MessageBubble` reads `mediaVisibility`; placeholder branch +
   PROVISIONAL `aria-label`.
6. **Tests** — prefs (v5, keep-v4-semantics, wallpaper lifecycle), new page specs, updated
   chats-settings/message-bubble specs, chat-window binding; full suite + build.
7. **Closure** — drift notes (016, 046 disposition, 054, design-map row 16, gap-audit changelog),
   checklist/converge, FR→test traceability, reconcile records.

## Drift policy

- Every earlier spec this features supersedes gets a drift note written into it: `016-chats-settings`
  (row restructure + two rows become live), `046` disposition (deferral rows → RESOLVED; the
  `mediaVisibility` key returns **with a consumer in the same commit** — the disposition's own
  allowed path), `054` (Media visibility description rewritten), `figma/design-map.md` row 16,
  `specs/design-gap-audit.md` changelog.
- If implementation reveals a requirement is wrong/missing/contradictory → stop, clarify, write the
  answer into `spec.md`, continue. Never silently change the contract.

## Review gates

- **G1 — BLOCKED (Figma capture)**: expired OAuth token; 059 chrome stays PROVISIONAL; capture
  task `[ ]` in `tasks.md`; re-capture after re-auth.
- **G2**: `npm run build` green AND full unit suite green (exact count reported) before every
  commit.
- **G3**: checklist + converge clean; drift notes landed; no task unrecorded.

## Risks

- **Version-guard regression**: `prefs.store.spec` F-046 block currently asserts `mediaVisibility`
  normalizes away from a v4 snapshot; that expectation is *deliberately inverted* now (it becomes
  a live key). The F-046 test is updated, not deleted, and the inversion is called out in the task +
  commit body.
- **One-pref-one-switch**: removing the standalone `Enter key sends` row changes the F-016 seed
  hypothesis; the 6-vs-5 reconcile record in 059 tasks closure + 016 drift note.
- **Masking hiding content**: mask is render-only; the store is never touched, so no data is lost.
- **Wallpaper readability**: bubbles keep their own backgrounds; only the scroll canvas recolours.