# Plan: WhatsApp Font size (chat text scale) (feature 041)

**Input**: `specs/041-font-size/spec.md` + `specs/041-font-size/research.md`

**Gate**: G1 **BLOCKED** - the Figma REST API returned `429` (reset 2026-10-02 18:38 UTC) on
2026-09-28. The `/settings/chats/font-size` chrome and the step labels/multipliers are
**PROVISIONAL** hypotheses; the capture task stays open in `tasks.md`.

## Approach

1. `core/prefs.store.ts`: `FontScale` type, `DEFAULT_FONT_SCALE`, `fontScale` signal,
   `setFontScale()`, envelope field, `PREFS_VERSION` 3 -> 4, hydrate accepts 1-4 and defaults
   missing/invalid values, `reset()` clears it.
2. `core/tokens/_tokens.scss`: `$wa-font-scale` map; emit `--wa-font-scale` in `:root`; emit a
   per-step `[data-font-scale='<step>']` block that re-declares `--wa-fs-message`,
   `--wa-fs-bubble-time`, `--wa-fs-date`, `--wa-fs-preview`, `--wa-fs-chat-title` via
   `calc(<base> * var(--wa-font-scale))`.
3. `features/settings/font-size-page.{ts,html,scss,spec.ts}`: nav bar + `radiogroup` of the four
   steps, checked state from the store, activation calls `setFontScale()`.
4. `app.routes.ts`: lazy `/settings/chats/font-size`; `chats-settings-page.ts` routes the
   `chats-font-size` row; `chats-page`, `archived-page`, `chat-window-page` bind
   `[attr.data-font-scale]` on their root elements.
5. Unit tests for the store (persist/hydrate/versions/reset), the token emission is covered by the
   page + a computed-style assertion, the page (render, check, activate, back) and the two wiring
   rows; e2e spec updated (authored, not run); drift notes in 016/027; build + unit green.

## Phases

The approach above is executed in order; each numbered step is one commit-sized unit
(docs -> feat -> test).

## Review gates

- **G1**: capture (BLOCKED, 2026-09-28 `429`) - exact row labels, picker chrome, real step values;
- **G2**: build + unit green, e2e authored, no overflow at `extra-large`;
- **G3**: close + drift notes (016 row inventory, 027 prefs), checklist + converge.

## Drift policy

- **016 Chats Settings**: FR-004 ("all rows are no-ops") is superseded for `chats-font-size` only -
  it now navigates. Drift note added in `specs/016-chats-settings/spec.md`.
- **027 Settings toggles**: the `PrefsStore` surface documented there (version 3, boolean-only
  snapshot) is superseded by version 4 plus the non-boolean `fontScale`/`chatSort` fields. Drift
  note added in `specs/027-settings-toggles/spec.md`.
- The 6-row group layout observed in `0:9973` vs the 5-row `CHATS_SETTINGS_ROWS` seed is recorded as
  an open finding for the F-016 inventory, **not** fixed here (one feature per series).

## Structure

Single project (repo root):

```text
specs/041-font-size/
- spec.md          # requirements (canonical)
- research.md      # capture evidence + decisions
- plan.md          # this file
- tasks.md         # task list
- contracts/ui-contracts.md
src/app/core/prefs.store.ts          # fontScale state + version 4 envelope
src/app/core/tokens/_tokens.scss     # $wa-font-scale + scoped token emission
src/app/features/settings/font-size-page.{ts,html,scss,spec.ts}
src/app/features/chat-list/{chats,archived}-page.{ts,html}
src/app/features/chat-window/chat-window-page.{ts,html}
src/app/app.routes.ts
tests/e2e/chats-font-size.spec.ts
```
