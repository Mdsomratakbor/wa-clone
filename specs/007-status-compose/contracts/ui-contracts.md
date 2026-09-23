# Data Model & UI Contracts: WhatsApp Status — Compose

## Seeded data

None. The compose screen is static chrome (Clarifications 3-4): the placeholder text, caret and
keyboard graphic carry no model. No `status.seed.ts` / model is introduced in feature 007; a
`StatusDraft` model belongs to the later publish feature that follows. The only "data" is the
keyboard asset reference `status-compose-keyboard.png`.

## Route

```ts
{
  path: 'status/compose',
  loadComponent: () =>
    import('./features/status/compose-page').then((m) => m.ComposePage),
},
```

## Runtime asset

- Copy `tests/e2e/golden/status-compose-keyboard.png` (375x291) to `public/status-compose-keyboard.png`.
  Angular copies `public/**` to the output root, so the runtime reference is `/status-compose-keyboard.png`
  (base href `/`).

## Component contracts

### `StatusPage` amendments (`features/status/status-page.ts` + html + spec.ts)

- `onCamera()` and `onNote()` change from no-op to:
  ```ts
  protected onCamera(): void { void this.router.navigate(['/status/compose']); }
  protected onNote(): void { void this.router.navigate(['/status/compose']); }
  ```
- `onNavAction` (Privacy) and `onRowActivate` remain no-ops (feature 006 unchanged).

### `ComposePage` (`features/status/compose-page.ts` + html + scss + spec.ts)

- `ChangeDetectionStrategy.OnPush`. Injects `Router`.
- `onClose(): void { void this.router.navigate(['/status']); }` — called by the Close `X`.
- `onSend()` / `onSendAlt()`: no-ops (publish flow is a later feature).
- No tab bar, no `app-navigation-bar`, no FAB anywhere in the template.

### Template structure

```html
<div class="compose" data-testid="compose-page">
  <div class="compose__top" data-testid="compose-top">
    <button class="compose__glyph" data-testid="compose-close" type="button"
            aria-label="Close" (click)="onClose()">…X svg (white)…</button>
    <div class="compose__send">
      <button class="compose__glyph" data-testid="compose-send-text" type="button"
              aria-label="Type status" (click)="onSendAlt()">…text-bar svg (white)…</button>
      <button class="compose__glyph" data-testid="compose-send" type="button"
              aria-label="Send status" (click)="onSend()">…paper-plane svg (white)…</button>
    </div>
  </div>
  <div class="compose__type" data-testid="compose-type" aria-hidden="true">
    <p class="compose__placeholder">Type a status</p>
    <span class="compose__caret"></span>
  </div>
  <img class="compose__keyboard" data-testid="compose-keyboard"
       src="/status-compose-keyboard.png" alt="" />
</div>
```

### Styling (375 design; note `data-testid` ports)

- `.compose`: full-bleed, `background: #FF8A8C; overflow: hidden; position: relative;`
  fills the shell content area (between status bar and home indicator), like `chat-window` full
  height.
- `.compose__top`: `position: absolute; top: 16.5px; left: 19px; right: 18px; height: 24px;
  display: flex; align-items: center; justify-content: space-between;`
  - Left glyph = Close X (abs x19-37). Right cluster = text-bar glyph (abs x284-303) +
    paper-plane (abs x333-357) with `gap: 30px` between them (exact from the 338x24 vector).
  - `.compose__send`: `display: flex; gap: 30px;` — the two right glyphs (text-bar + paper-plane).
  - `.compose__glyph`: 24x24 hit area, `display: grid; place-items: center;` white SVG (paths from
    `status-compose-top-actions.svg`); `cursor: pointer;` focus-visible light ring
    (`outline`/halo `rgba(255,255,255,.85)` so it is visible on the pink surface).
  - Glyph alignment follows the design coordinates: Close `X` is left-aligned in its 24px button
    (`compose__glyph--start`, `justify-items: start` -> glyph abs x19-37); text-bar is right-aligned
    (`compose__glyph--end`, `justify-items: end` -> glyph abs x284-303); paper-plane fills its button
    (glyph abs x333-357).
  - Glyph `<svg>` viewBoxes bound each path's own source coordinates (paths carry 338x24 vector
    numbers): Close `viewBox="0 0 19 23"`, text-bar `viewBox="265.4 0.5 18.6 23"`, paper-plane
    `viewBox="313.98 0 24.04 23.63"`. A tight per-glyph `viewBox` is required — a `0 0 <w> <h>`
    box clips paths whose absolute x exceeds it (was the invisible-glyph root cause).
- `.compose__type`: `position: absolute; top: 211px;` (frame y255 minus 44px status bar) centred:
  `left: 50%; transform: translateX(-50%);` `height: 52px; display: flex; align-items: center;
  justify-content: center;` — frame zone 232x49 (x72-304, y255-304).
  - `.compose__placeholder`: `font: 500 38px/1.2 Helvetica Neue, Arial, sans-serif;
    letter-spacing: -0.0026em; text-align: center; color: rgba(255,255,255,.74);` (D2).
  - `.compose__caret`: `position: absolute; top: 2px; left: 115px; width: 2px; height: 48px;
    background: #fff;` — the design places the caret at ~x186 (after the partially typed "Type a"),
    not at the flex-row end; absolute placement (left:115px within the 232px zone) reproduces that.
- `.compose__keyboard`: `position: absolute; top: 477px; left: 0; width: 100%; height: auto;`
  `display: block;` `-webkit-user-drag: none; user-select: none;` decorative (`alt=""`,
  `aria-hidden` not needed on alt="" img). `top: 477px` = frame y521 minus 44px status bar: the
  keyboard band must start at abs y521 to match the golden; `bottom: 0` anchored it 34px higher.

### Status bar / shell

Shared `app-shell` (status bar + `<ng-content>` + home indicator) reused unchanged (drift D1).

## Test / E2E contracts

### Unit — `compose-page.spec.ts`
- renders `.compose` background `#FF8A8C`; top row with `compose-close` (X), `compose-send-text`,
  `compose-send`; no `app-navigation-bar`, no `[role="tab"]`, no `.fab`, no `.navigation-bar__title`.
- placeholder `Type a status` + `compose-caret` render; `compose-keyboard` img source is
  `/status-compose-keyboard.png`.
- Close click -> `router.navigate` `['/status']`; send-text / send clicks -> no navigation.
- keyboard/placeholder clicks -> no navigation (click falls through / inert).

### Unit swaps (feature-007 remap)
- `status-page.spec.ts`: replace the camera/note no-op assertions with navigation `['/status/compose']`;
  `Privacy` + row no-op assertions stay. Also the "keeps feed / all no-ops" case splits accordingly.

### E2E — `tests/e2e/status-compose.spec.ts`
- US1: `/status/compose` -> `compose-top` glyphs (Close X, two send glyphs), `compose-type`
  placeholder `Type a status`, `compose-keyboard` visible; no tab bar (`[role="tab"]` count 0), no
  FAB, no navigation title.
- US2: from `/status`, `status-camera` -> URL `/status/compose`; reload feed, `status-note` -> same;
  `compose-close` -> URL `/status`; on compose, send-text + send + placeholder + keyboard taps keep
  URL `/status/compose`.
- US3: visible focus ring on Close + both send glyphs (Tab loop); golden `0-9634-status-compose.png`
  375x812 with measured `maxDiffPixelRatio`.

### E2E swaps
- `tests/e2e/status.spec.ts` US2 "Privacy, camera, note and row activation are no-ops" ->
  split: camera/note navigate `/status/compose`; Privacy + row keep URL `/status`.

### Responsive
- `tests/e2e/responsive.spec.ts`: append `/status/compose` no-overflow case (pink full-bleed page;
  keyboard `width:100%` must not cause overflow at any breakpoint).

## Swap list (tests asserting the camera/note no-op)

- `src/app/features/status/status-page.spec.ts` — camera/note no-op cases -> `['/status/compose']`.
- `tests/e2e/status.spec.ts` — "camera/note/row" no-op case -> camera/note navigate.
- Unchanged: calls-edit tab-inert (edit guard), focus.spec.ts (buttons still exist), feature-006
  navigation tests for `Status` tab.