# Data Model & UI Contracts: WhatsApp Chat Actions Modal (feature 010)

> **Status: PENDING node capture.** Fills/geometry/content below are placeholders to be replaced
> from the `0:10087` inventory (research.md) at gate G1. No values here are design facts.

## Seeded data

Row content (labels, order, icons) is supplied by the feature wrapper (`features/chat-window`),
not hard-coded in the shared component. Provisional hypothesis rows until T001 (stable ids, PENDING
labels/glyphs):

```ts
// features/chat-window/chat-actions.seed.ts (provisional hypothesis — REPLACE at G1)
import { Action } from '../../shared/components/action-sheet/action-sheet.model';

export const CHAT_ACTIONS: readonly Action[] = [
  { id: 'chat-mute', label: 'Mute' },        // hypothesis
  { id: 'chat-wallpaper', label: 'Wallpaper' }, // hypothesis
  { id: 'chat-more', label: 'More' },        // hypothesis
];
```

## Shared contract: `ActionSheetComponent` (`shared/components/action-sheet`) — reused from 009, unchanged

- Selector/usage (same as 009):
  ```html
  <app-action-sheet [title]="sheetTitle" [actions]="sheetActions" (action)="onAction($event)" (dismiss)="onDismiss()" />
  ```
- Model: `Action { id: string; label: string; icon?: string }` (`action-sheet.model.ts`).
- Row rendering: real `<button>`s (`data-testid="action-sheet-row"`), label is the accessible
  name; decorative icons `aria-hidden`; backdrop `data-testid="action-sheet-backdrop"`, sheet
  `data-testid="action-sheet"`.
- **No shared-component changes.** Any delta required by `0:10087` = drift → owner approval.

## Chat Window entry + wrapper (`features/chat-window`)

- `chat-header.html`/`.ts` (shared): add trailing More-options icon button emitting an `actions`
  output; aria-label + `data-testid` (exact glyph/label PENDING T001).
- `chat-window-page.ts`: `chatActionsOpen` signal; `onChatActions()` opens, `onDismissChatActions()`
  closes + focus returns to the trigger; `onChatAction(_id)` emits (targets later features);
  modal host in `chat-window-page.html` (over the routed page, under the shell content block).
- `chat-actions-modal.{ts,html,scss}` (or equivalent wrapper): owns the `CHAT_ACTIONS` seed,
  feeds `app-action-sheet`, forwards `dismiss`.

## Routes

- **None.** The modal is an in-frame overlay (no new route). `/chat/:id` remains the host.

## Test / E2E contracts

### Unit
- `chat-header.spec.ts` (extension): More-options affordance renders with aria-label; activation
  emits `actions`.
- `chat-window-page.spec.ts` (extension): trigger opens sheet; row activation emits id; dismiss
  closes and focus returns to the trigger.
- Full suite green.

### E2E — `tests/e2e/chat-actions.spec.ts`
- US1: `/chat/chat-001` -> activate More-options -> backdrop + sheet visible (testid), chat
  content behind.
- US2: rows visible with the captured labels; each is a `<button>` with the label as accessible
  name; activation emits / no route change.
- US3: backdrop tap closes + focus returns to the trigger; Escape close (if in design); golden
  `0-10087-chat-actions.png` with measured `maxDiffPixelRatio` (= measured + 0.05).

### Responsive
- `tests/e2e/responsive.spec.ts`: append chat-actions no-overflow cases (open + close) at all 3
  breakpoints.

## Swap list

- `src/app/shared/components/chat-header/chat-header.html` (+ `.ts`): add the trailing
  More-options affordance + `actions` output.
- `src/app/features/chat-window/chat-window-page.{ts,html}`: modal host + open/dismiss/focus.
- Confirm no smoke/unit/e2e asserts the header has exactly two trailing icon buttons; update if
  present.
- No shared shell / nav-bar / tab-bar changes.