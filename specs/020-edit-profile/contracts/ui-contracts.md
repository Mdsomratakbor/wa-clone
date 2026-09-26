# UI Contracts + Quickstart: Edit Profile (feature 020)

## UI contracts

Provisional until `0:10659` captured (Figma 429 → ~09-28). Testids are hard contract; labels
PENDING.

| Item | Contract |
| ---- | -------- |
| route | `/settings/profile`, lazy `ProfilePage` |
| entry | Settings profile header (`settings-profile`) tap — subtitle "Tap to edit profile" |
| surface | pushed (no tab bar) |
| root testid | `profile-page` |
| chrome | Back (`icon: back`, label "Back") → `/settings`; title "Edit Profile" (PENDING) |
| `profile-name` | Name input, prefilled from `SETTINGS_PROFILE.name` ("Ani") |
| `profile-about` | About input (empty), aria-label "About" |
| `profile-save` | Save button; no-op (later feature) |

**Keyboard/a11y**: Back/Save/inputs focusable with visible focus rings.
**Golden**: `tests/e2e/golden/0-10659-profile.png` (native 1x); threshold = measured + 0.05.

## Explicit deviation candidates (drift gate G1)

1. Form fields/labels/avatar layout.
2. Nav title wording.
3. Settings profile entry: declared from the "Tap to edit profile" subtitle (design file has no
   interaction wiring).

## Quickstart — E2E (reuses the running `ng serve` on 4200)

```bash
npm run start          # once per session
npx playwright test tests/e2e/profile.spec.ts tests/e2e/settings.spec.ts tests/e2e/responsive.spec.ts --project=chromium-mobile
npm run test:e2e:fast
npm run e2e            # when playwright runs are re-enabled
```

## Capture (deferred ~2026-09-28)

```powershell
npx -y figma-developer-mcp fetch --file-key PcGX72lSWkYIk3pL5V8PS3 --node-id 0:10659 --depth 6 --format json
```