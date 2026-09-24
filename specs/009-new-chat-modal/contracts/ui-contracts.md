# Data Model & UI Contracts: WhatsApp New Chat (Add) Modal (feature 009)

> **Status: PENDING node capture.** Fills/geometry/content below are placeholders to be replaced
> from the `0:9072` / `0:9075` inventory (research.md) at gate G1. No values here are design facts.

## Seeded data

None beyond the row model. Row content (labels, order, icons) is supplied by the feature wrapper
(`features/new-chat-modal`), not hard-coded in the shared component.

## Shared contract: `ActionSheetComponent` (`shared/components/action-sheet`)

- Selector/usage:
  ```html
  <app-action-sheet [title]="modalTitle" [actions]="sheetActions" (action)="onAction($event)" (dismiss)="onDismiss()" />
  ```
  `title` and `actions` inputs; `action` emits the row id; `dismiss` emits on backdrop tap /
  close affordance.
- Model:
  ```ts
  // shared/components/action-sheet/action-sheet.model.ts
  export interface Action {
    id: string;
    label: string;
    icon?: string; // asset url or svg key, per captured inventory
  }
  ```
- Row rendering: real `<button>`s (`data-testid="action-sheet-row"`), label is the accessible
  name; decorative icons `aria-hidden`.
- Sheet surface: background + corner radius + handle/backdrop from T004 (bottom sheet style);
  `data-testid="action-sheet"` / `action-sheet-backdrop`.
- Geometry/typography: PENDING (T004).

## Add Modal wrapper (`features/new-chat-modal/add-modal.ts` + html + scss + spec.ts)

- Owns the 009 `Action[]` (content PENDING until T001) and passes them to `app-action-sheet`;
  `dismiss` -> close (component removed).
- `ChangeDetectionStrategy.OnPush`; mounted by `ChatsPage` only while open.

## Chats FAB wiring (`features/chat-list`)

- `chats-page.ts:105-107`: `onFabPressed()` -> open modal (swap TODO comment).
- `chats-page.html`: modal host inside the routed content area (over the page, under the shell
  content block so status bar / home indicator stay fixed).

## Routes

- **None.** The modal is an in-frame overlay (no new route). Snapshot/smoke specs keep routing
  unchanged; `/chats` remains the FAB host.

## Test / E2E contracts

### Unit
- `action-sheet.spec.ts`: renders N rows from input; row n activates -> `action(id)`; backdrop
  click -> `dismiss`; WITHOUT input, no backdrop/sheet rendered; no hard-coded labels.
- `add-modal.spec.ts`: rows flow through to the sheet; `dismiss` closes; activation emits id.
- `chats-page.spec.ts` (extension): FAB press mounts the modal; second press (sheet open) does
  not double-open; row action + dismiss propagate.

### E2E — `tests/e2e/add-modal.spec.ts`
- US1: `/chats` -> press FAB -> backdrop + sheet visible (testid), Chats content visible behind.
- US2: rows visible with the captured labels; each is a `<button>` with the label as accessible
  name; activation emits / no route change.
- US3: backdrop tap closes + focus returns to the FAB; Escape close (if in design); golden
  `0-9072-add-modal.png` with measured `maxDiffPixelRatio` (= measured + 0.05).

### Responsive
- `tests/e2e/responsive.spec.ts`: append FAB-open (and closed) add-modal no-overflow cases at all
  3 breakpoints.

## Swap list

- `chats-page.ts:105-107` no-op TODO -> modal open (T009).
- Confirm no smoke/unit/e2e asserts the FAB is inert; update if present.
- No shared shell / nav-bar / tab-bar changes.