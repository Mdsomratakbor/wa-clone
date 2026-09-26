# Plan: WhatsApp Notifications (feature 017)

**Input**: `specs/017-notifications/{spec,research}.md`

**Gate**: Figma 429 clears (~2026-09-28) → node payload capture (`0:10758`) → owner approval →
test-first → implementation. Structural implementation approved pre-capture (owner directive
`2026-09-24`).

## Approach

- `features/settings/notifications-page.{ts,html,scss,spec.ts}` at `/settings/notifications`:
  pushed surface (no tab bar); `NavigationBar` (Back → `/settings`, title "Notifications"); rows
  (`notifications-list`/`notifications-row`) from `NOTIFICATIONS_ROWS` seed; rows no-op.
- `settings.seed.ts`: add `NOTIFICATIONS_ROWS` hypothesis list.
- `settings-page` `onRowActivate`: `notifications` → `['/settings/notifications']`.
- Route `/settings/notifications` lazy.

## Phases

1. **Capture** (deferred ~09-28): node inventory `0:10758`; golden `0-10758-notifications.png`;
   glyphs. Fill research.md.
2. **Screen**: seed + `notifications-page` component + units.
3. **Entry**: Settings row activation + settings e2e update (no-op row change).
4. **US3**: Back routing + responsive no-overflow + golden (measure baseline,
   `maxDiffPixelRatio = measured + 0.05`).
5. **Closure**: design-map row 17 -> `017` + implemented; spec/tasks statuses; commits (spec set /
   feat / docs).

## Review gates

- **G1**: node inventory + owner approval (rows/toggles, title).
- **G2**: build + unit + e2e (incl. settings regression) green; baseline recorded.
- **G3**: closure commit + traceability (design-map/spec/tasks).

## Drift policy

"Notifications" row stops being a no-op and navigates — spec'd, not silent. Rows provisional,
replaced at G1. Fast e2e loop (`test:e2e:fast`) used during dev; full matrix at closure.