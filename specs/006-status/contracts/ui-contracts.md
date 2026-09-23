# Data Model & UI Contracts: WhatsApp Status — Feed

## Seeded data

None. The feed is static (Clarification 4): the My Status row and the tip are hard-coded UI chrome — no
`status.seed.ts` / model is needed. If a later feature (row 7 compose, recent statuses) requires a list,
a `StatusEntry` model should be introduced then.

## Route

```ts
{ path: 'status', loadComponent: () => import('./features/status/status-page').then((m) => m.StatusPage) },
```

## Component contracts

### `StatusPage` (`features/status/status-page.ts` + html + scss + spec.ts)

- `ChangeDetectionStrategy.OnPush`.
- Inject `Router`.
- `activeTab = signal<TabKey>('status')`.
- `tabs = computed<TabItem[]>(...)` — same `TAB_KEYS`/`TAB_LABELS` order as features 003-005
  (`settings, chats, camera, calls, status`).
- `leadingActions = [{ id: 'privacy', label: 'Privacy' }]`; `trailingActions = []`.
- `onNavAction(id)`: `privacy` -> no-op (later Settings feature).
- `onTabSelect(key)`: `editing`-style guard not applicable (no edit mode); `chats` -> navigate
  `/chats`; `calls` -> navigate `/calls`; `status` -> no-op; `camera`/`settings` -> `activeTab.set(key)`
  (renders the "coming soon" stub).
- `onRowActivate()`, `onCamera()`, `onNote()`: no-ops (compose is a later feature).

### Template structure

```html
<app-navigation-bar title="Status" [leading]="leadingActions" (action)="onNavAction($event)" />
<div class="status-page__body" data-testid="status-page">
  @if (activeTab() === 'status') {
    <div class="status-page__feed" data-testid="status-feed">
      <div class="status-page__row" role="button" tabindex="0" aria-label="My Status, Add to my status"
           data-testid="status-my" (click)="onRowActivate()" (keydown.enter)="onRowActivate()" (keydown.space)="onRowActivate()">
        <div class="status-page__avatar" data-testid="status-avatar">
          <app-user-avatar [name]="'My Status'" [size]="58" />
          <span class="status-page__badge" data-testid="status-badge" aria-hidden="true">…20x20 blue + svg…</span>
        </div>
        <div class="status-page__copy">
          <p class="status-page__name">My Status</p>
          <p class="status-page__subtitle">Add to my status</p>
        </div>
        <div class="status-page__actions">
          <button class="status-page__circle" data-testid="status-camera" type="button"
                  aria-label="Add a photo to my status" (click)="onCamera()">…camera svg…</button>
          <button class="status-page__circle" data-testid="status-note" type="button"
                  aria-label="Add a text to my status" (click)="onNote()">…pencil svg…</button>
        </div>
      </div>
      <div class="status-page__tip" data-testid="status-tip" role="status">
        <p class="status-page__tip-text">No recent updates to show right now.</p>
      </div>
    </div>
  } @else {
    <div class="status-page__stub" role="status" data-testid="tab-stub">
      <p class="status-page__stub-text">{{ activeLabel() }} - coming soon</p>
    </div>
  }
</div>
<app-tab-bar [items]="tabs()" (select)="onTabSelect($event)" />
```

### Styling (375 design; note `data-testid` ports)

- `.status-page__body { background: #EFEFF4; }` (scrolls between nav and tab bar like other pages).
- `.status-page__row`: `min-height: 76px; display: flex; align-items: center; padding: 9px 16px 9px 13px;
  gap: 9px; background: #FFF;` hairline top/bottom `0.33px solid rgba(60,60,67,0.29)`.
- `.status-page__avatar { position: relative; flex: none; }` — badge `position: absolute; right: 0;
  bottom: 0.5px; width/height: 20px;` blue disc + white plus; `aria-hidden`.
- `.status-page__copy { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }`
  - name: 16/600/21 `var(--wa-on-surface)`; subtitle: 14/400/16 `#8E8E93` (ellipsis overflow).
- `.status-page__actions { display: flex; gap: 16px; flex: none; }`
  - `.status-page__circle`: 36px, `border-radius: 50%`, `background: #EDEDFF`, `display: grid;
    place-items: center; cursor: pointer;` focus-visible: inset ring `var(--wa-accent)`.
- `.status-page__tip`: `min-height: 43px; margin-top: 35px; background: #FFF; hairlines;
  padding-left: 67px; display: flex; align-items: center;` text 14/400/16 `#8E8E93`.
- Stub block mirrors `calls-page`/`chats-page` stub styling.

## Test / E2E contracts

### Unit — `status-page.spec.ts`
- renders chrome: `navigation-bar` with title `Status` and `Privacy` action; no trailing action.
- renders My Status row: avatar (initials), `status-badge`, name `My Status`, subtitle
  `Add to my status`, `status-camera` + `status-note` buttons.
- tip renders `No recent updates to show right now.`; no FAB element (like calls-page asserts absence).
- tab computation: Status active (`aria-selected`/active class), order `[settings, chats, camera, calls, status]`.
- `onTabSelect`: Chats -> `router.navigate(['/chats'])`; Calls -> `/calls`; Camera/Settings -> stub with
  `status` text; Status -> stays (no navigation).
- no-ops: Privacy click, row activation, camera click, note click — no navigation, state unchanged.

### Unit swaps (feature-006 remap)
- `chats-page.spec.ts` "Status tab …" stub assertion -> expects `router.navigate` `['/status']`.
- `calls-page.spec.ts` Status-stub test -> expects `['/status']`.

### E2E — `tests/e2e/status.spec.ts`
- US1: `/status` -> nav (`Privacy`, title `Status`), `status-my` row (avatar, `status-badge`,
  `My Status`, `Add to my status`, camera/note buttons), `status-tip` text, tab bar Status active,
  no FAB, no `call-info`/`select-circle`/`chat-actions`.
- US2: `/status` -> Chats tab lands `/chats` (chat-list visible); back to `/status` -> `Calls` tab
  lands `/calls`; at `/chats` `Status` tab lands `/status`; at `/calls` same; Camera/Settings tabs
  show `tab-stub`; Privacy/camera/note/row taps keep URL `/status`.
- US3: visible focus ring on Privacy + camera + note (Tab loop); golden `0-8498-status.png` at
  375x812 with measured `maxDiffPixelRatio`.

### Responsive
- `tests/e2e/responsive.spec.ts`: append `/status` no-overflow case (following the `/calls` pattern).

## Swap list (tests asserting the Status "coming soon" stub)

- `src/app/features/chat-list/chats-page.spec.ts` — `tabs[4]` (Status) click asserts stub; remap to
  navigation `['/status']`.
- `src/app/features/calls/calls-page.spec.ts` — Status-tab stub test; remap to `['/status']`.
- E2E: no existing e2e asserts the Status stub (verified 2026-09-23); `calls-edit.spec.ts` tab-inert
  clicks Status while editing (guard short-circuits) — remains valid. `focus.spec.ts` — verify during
  implementation that no Status-stub assertion exists.