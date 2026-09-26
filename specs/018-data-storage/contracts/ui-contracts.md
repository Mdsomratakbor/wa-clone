# UI Contracts + Quickstart: Data & Storage (feature 018)

## UI contracts

Provisional until `0:10894` captured (Figma 429 → ~09-28). Testids are hard contract; labels are
PENDING.

| Item | Contract |
| ---- | -------- |
| route | `/settings/data-storage`, lazy `DataStoragePage` |
| entry | Settings "Data and Storage" row activation |
| surface | pushed (no tab bar) |
| root testid | `data-storage-page` |
| chrome | Back (`icon: back`, label "Back") → `/settings`; title "Data & Storage" (PENDING) |
| `data-storage-list` | rows container (`ul`), rows from `DATA_STORAGE_ROWS` |
| `data-storage-row` | row button; aria-label = label; chevron trailing; no-op |

**Seed (provisional, G1 data-swap)**: `DATA_STORAGE_ROWS` hypothesis = Storage usage /
Media auto-download / Images / Audio / Videos / Documents / Network usage.

**Keyboard/a11y**: Back + rows focusable with visible focus rings.
**Golden**: `tests/e2e/golden/0-10894-data-storage.png` (native 1x);
threshold = measured baseline + 0.05.

## Explicit deviation candidates (drift gate G1)

1. Section/row set, labels, glyphs, auto-download row treatment.
2. Nav title wording.
3. Settings US2 e2e no-op probe change (Data and Storage now navigates; Contacts becomes no-op).

## Quickstart — E2E (reuses the running `ng serve` on 4200)

```bash
npm run start          # once per session; playwright reuses it (webServer.reuseExistingServer)
npm run test:e2e:fast  # dev loop — mobile project only
npx playwright test tests/e2e/data-storage.spec.ts tests/e2e/settings.spec.ts tests/e2e/responsive.spec.ts --project=chromium-mobile
npm run test:e2e:responsive
npm run e2e            # closure only — full 3-project matrix
```

## Capture (deferred ~2026-09-28)

```powershell
npx -y figma-developer-mcp fetch --file-key PcGX72lSWkYIk3pL5V8PS3 --node-id 0:10894 --depth 6 --format json
```