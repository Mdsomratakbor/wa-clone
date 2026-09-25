# Plan: WhatsApp Account (feature 014)

**Input**: `specs/014-account/{spec,research}.md`

**Gate**: Figma 429 clears (~2026-09-28) → node payload capture (`0:9371`) → owner approval of
spec Clarifications (rows/hero) → write-first tests → implementation. Structural implementation
approved pre-capture (owner directive `2026-09-24`).

## Approach

- New `features/settings/account-page.{ts,html,scss,spec.ts}` at `/settings/account`: pushed
  surface (no tab bar), `NavigationBar` (Back → `/settings`, title "Account"), hero/illustration
  block (`account-hero`), Account rows (`account-list`/`account-row`) from seed; internal row
  activation no-op.
- `app.routes.ts`: lazy `/settings/account`.
- `settings-page.ts`: activate the Account row → navigate; other rows no-op.

## Phases

1. **Capture** (deferred ~09-28): node inventory `0:9371`; golden `0-9371-account.png`; hero/row
   glyphs. Fill research.md.
2. **Screen**: `ACCOUNT_ROWS` seed + `account-page` component + units.
3. **Entry wiring**: Settings Account row activation + route; settings.spec no-op case update.
4. **US3**: Back routing + responsive no-overflow + golden (measure baseline,
   `maxDiffPixelRatio = measured + 0.05`).
5. **Closure**: design-map row 14 -> `014` + implemented; spec/tasks statuses; commits (spec set /
   feat / docs).

## Review gates

- **G1**: node inventory + owner approval (row list/order, hero geometry).
- **G2**: build + unit + e2e (incl. settings regression + golden) green; baseline recorded.
- **G3**: closure commit + traceability (design-map/spec/tasks).

## Drift policy

Pushed-surface design (no tab bar, Back → `/settings`) follows the starred-screen pattern.
Row list + hero are seed-driven provisional values replaced at G1. Settings-screen Account row
activation is a deliberate, spec'd behavior change (not silent drift).