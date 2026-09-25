# Plan: WhatsApp Chats Settings (feature 016)

**Input**: `specs/016-chats-settings/{spec,research}.md`

**Gate**: Figma 429 clears (~2026-09-28) → node payload capture (`0:9973`) → owner approval →
write-first tests → implementation. Structural implementation approved pre-capture (owner
directive `2026-09-24`).

## Approach

- `features/settings/chats-settings-page.{ts,html,scss,spec.ts}` at `/settings/chats`: pushed
  surface (no tab bar); `NavigationBar` (Back → `/settings`, title "Chats Settings"); rows
  (`chats-settings-list`/`chats-settings-row`) from `CHATS_SETTINGS_ROWS` seed; rows no-op.
- `settings.seed.ts`: add `CHATS_SETTINGS_ROWS` hypothesis list.
- `settings-page` `onRowActivate`: `chats-settings` → `['/settings/chats']`.
- Route `/settings/chats` lazy.

## Phases

1. **Capture** (deferred ~09-28): node inventory `0:9973`; golden `0-9973-chats-settings.png`;
   glyphs. Fill research.md.
2. **Screen**: seed + `chats-settings-page` component + units.
3. **Entry**: Settings row activation + settings e2e update (no-op row change).
4. **US3**: Back routing + responsive no-overflow + golden (measure baseline,
   `maxDiffPixelRatio = measured + 0.05`).
5. **Closure**: design-map row 16 -> `016` + implemented; spec/tasks statuses; commits (spec set /
   feat / docs).

## Review gates

- **G1**: node inventory + owner approval (row set, title).
- **G2**: build + unit + e2e (incl. settings regression) green; baseline recorded.
- **G3**: closure commit + traceability (design-map/spec/tasks).

## Drift policy

"Chats Settings" row stops being a no-op and navigates — spec'd, not silent. Rows provisional,
replaced at G1.