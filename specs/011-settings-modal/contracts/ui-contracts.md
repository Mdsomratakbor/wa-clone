# Data Model & UI Contracts: WhatsApp Settings Modal (feature 011)

> **Status: PENDING node capture.** Fills/geometry/content below are placeholders to be replaced
> from the `0:9778` inventory (research.md) at gate G1. No values here are design facts.

## Seeded data

Row content (labels, order, icons) is supplied by the feature wrapper (`features/settings`), not
hard-coded in the shared component. Provisional hypothesis rows until T001 (stable ids, PENDING
labels/glyphs):

```ts
// features/settings/settings.seed.ts (provisional hypothesis — REPLACE at G1)
import { Action } from '../../shared/components/action-sheet/action-sheet.model';

export const SETTINGS_ACTIONS: readonly Action[] = [
  { id: 'settings-notifications', label: 'Notifications' }, // hypothesis
  { id: 'settings-storage', label: 'Storage' },            // hypothesis
  { id: 'settings-more', label: 'More' },                  // hypothesis
];
```

## Shared contract: `ActionSheetComponent` (`shared/components/action-sheet`) — reused from 009, unchanged

- Selector/usage (same as 009/010):
  ```html
  <app-action-sheet [title]="sheetTitle" [actions]="sheetActions" (action)="onAction($event)" (dismiss)="onDismiss()" />
  ```
- Model: `Action { id: string; label: string; icon?: string }` (`action-sheet.model.ts`).
- Row rendering: real `<button>`s (`data-testid="action-sheet-row"`), label is the accessible
  name; decorative icons `aria-hidden`; backdrop `data-testid="action-sheet-backdrop"`, sheet
  `data-testid="action-sheet"`.
- **No shared-component changes.** Any delta required by `0:9778` = drift → owner approval.

## Settings entry + wrapper (`features/settings` + stub host)

- `features/settings/settings-modal.{ts,html,scss}`: owns `SETTINGS_ACTIONS` seed, feeds
  `app-action-sheet`, forwards `dismiss`; Escape closes (HostListener, same as 009/010 wrappers).
- `settings-stub-page.{ts,html}` (owner-approved host): + a trailing entry trigger (icon button,
  a11y label + `data-testid`) emitting a sheet-open event; `settingsModalOpen` signal;
  dismiss closes + focus returns to the trigger. Row 13 (`0:9198`) replaces the stub later without
  changing the modal contract.

## Routes

- **None.** The modal is an in-frame overlay (no new route). `/settings` remains the host.

## Test / E2E contracts

### Unit
- `settings-modal.spec.ts`: rows flow through to the sheet; `dismiss` closes; activation emits id.
- `settings-stub-page.spec.ts` (extension): trigger renders with aria-label; activation opens the
  sheet; backdrop/Escape closes and focus returns to the trigger.
- Full suite green.

### E2E — `tests/e2e/settings-modal.spec.ts`
- US1: `/settings` -> activate trigger -> backdrop + sheet visible (testid), Settings content
  behind.
- US2: rows visible with the captured labels; each is a `<button>` with the label as accessible
  name; activation emits / no route change.
- US3: backdrop tap closes + focus returns to the trigger; Escape close (if in design); golden
  `0-9778-settings-modal.png` with measured `maxDiffPixelRatio` (= measured + 0.05).

### Responsive
- `tests/e2e/responsive.spec.ts`: append settings-modal no-overflow cases (open + close) at all 3
  breakpoints.

## Swap list

- `features/starred-messages/settings-stub-page.{html,ts}`: add the trailing entry trigger + sheet
  wiring (host for 011 until row 13).
- Confirm no smoke/unit/e2e asserts the settings stub is inert beyond its stub copy; update if
  present.
- No shared shell / nav-bar / tab-bar changes.