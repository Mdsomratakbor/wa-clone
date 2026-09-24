# Data Model & UI Contracts: WhatsApp Starred Messages (feature 008)

## Seeded data

None. The screen is the static empty state (Research "Decisions"): no `starred.seed.ts`, no model.
The only "data" is the avatar raster reference `starred-messages-avatar.png`.

## Routes

```ts
{ path: 'starred-messages', loadComponent: () => import('./features/starred-messages/starred-page').then((m) => m.StarredPage) },
{ path: 'settings',         loadComponent: () => import('./features/starred-messages/settings-stub-page').then((m) => m.SettingsStubPage) },
```

`/starred-messages` renders in the shared shell; `/settings` is a minimal stub owned by row 13 later.

## Runtime asset

- Copy the captured avatar raster to `public/starred-messages-avatar.png`; runtime reference is
  `/starred-messages-avatar.png` (base href `/`), served by Angular's `public/**` copy.
- No other public assets.

## Shared component amendment: `app-navigation-bar`

- Extend `NavAction.icon` (`features/chat-list/chat.model.ts`) union with `'back'`:
  ```ts
  export interface NavAction { id: string; label: string; icon?: 'new-call' | 'back'; disabled?: boolean; }
  ```
- `navigation-bar.html`: `@if (item.icon === 'back')` render the chevron SVG (white -> `currentColor`
  with `color: var(--wa-accent)` on the action button) before the label:
  ```html
  <svg class="navigation-bar__icon" width="12" height="22" viewBox="0 0 12 22" aria-hidden="true">
    <path d="…exact path from starred-messages-back-chevron.svg…" fill="currentColor"/>
  </svg>
  ```
  Geometry: chevron 11.84x21 in the design ("Back" frame x9 y54, chevron at rel(0,1)); inside the
  existing leading action button it renders left of the "Settings" label, `#007AFF`.
- Existing tests for `new-call` icon are unaffected; add unit coverage for `back`.

## Component contracts

### `StarredPage` (`features/starred-messages/starred-page.ts` + html + scss + spec.ts)

- `ChangeDetectionStrategy.OnPush`, injects `Router`.
- `protected onBack(): void { void this.router.navigate(['/settings']); }` (from nav `(action)`).
- Template:
  ```html
  <app-navigation-bar
    [title]="'Starred Messages'"
    [leading]="leadingActions"   <!-- [{ id: 'back', label: 'Settings', icon: 'back' }] -->
    (action)="onBack()"
  />
  <main class="starred" data-testid="starred-page">
    <section class="starred__tip" data-testid="starred-tip">
      <app-user-avatar class="starred__tip-avatar" [src]="avatarSrc" [name]="'WhatsApp'"
                       [size]="132" />
      <h2 class="starred__tip-title" data-testid="starred-tip-title">No Starred Messages</h2>
      <p class="starred__tip-body" data-testid="starred-tip-body">
        Tap and hold on any message to star it, so you can easily find it later.
      </p>
    </section>
  </main>
  ```
  (`app-user-avatar` renders the avatar with `alt=""`/decorative when `src` is set; the WhatsApp
  logo is not a real person, so `name` only feeds fallback initials + aria.)
- No tab bar, no FAB anywhere.

### `SettingsStubPage` (`features/starred-messages/settings-stub-page.ts` + html + scss + spec.ts)

- Nav bar `[title]="'Settings'"` with leading Back "Settings" disabled? No — leading Back returns
  to `/starred-messages`; body is a placeholder ("Feature coming soon" style, plain).
- Minimal: fields so the Back flow from Starred is real and testable.

### Styling (375 design; `data-testid` ports)

- `.starred`: full-bleed, `background: var(--wa-surface);` (= `#EFEFF4`) fills the shell content
  area (below the nav bar), like `chat-list`/`calls`.
- `.starred__tip`: centred block — outer frame abs x24 y336 327x230 (relative to the content area
  top = shell nav offset; anchor with `position: relative`, `margin: 292px auto 0` i.e. y336 minus
  44px status bar → re-check at implementation against rendered chrome). Content:
  - avatar circle 132px centred (frame abs centre ~(188,402)), hairline `#636366` 0.5px + soft
    shadow `0 2px 4px rgba(0,0,0,0.2)` (D3: thin stroke/AA absorbed by threshold).
  - title: 16px/21px semibold, `rgba(60,60,67,0.6)`, centred, letter-spacing -0.0188em.
  - body: 14px/21px regular, `rgba(60,60,67,0.6)`, centred, letter-spacing -0.0112em, wraps to 2
    lines within 327px.
- Component uses the shared `--wa-font-family`, `--wa-fw-semibold`/`--wa-fw-regular`, and nav
  variables already used by `app-navigation-bar`.

### Status bar / shell

Shared `app-shell` reused unchanged; frame status bar is **Light** → no drift expected (D1-none).

## Test / E2E contracts

### Unit — `starred-page.spec.ts`
- renders `app-navigation-bar` with title "Starred Messages"; leading action button labelled
  "Settings"; no `[role="tab"]`, no `.fab`, no stub copy.
- tip: `starred-tip-title` = "No Starred Messages", `starred-tip-body` = the helper sentence;
  avatar `alt=""` (decorative) with `src` `/starred-messages-avatar.png`.
- Back click -> `router.navigate` `['/settings']`.

### Unit — `settings-stub-page.spec.ts`
- title "Settings", placeholder body; Back click -> navigate `['/starred-messages']`.

### Unit — `navigation-bar.spec.ts` (extension)
- `icon: 'back'` renders the chevron svg + label; emits same action id.

### E2E — `tests/e2e/starred.spec.ts`
- US1: `/starred-messages` -> nav bar + title + leading Back; no tab bar, no FAB.
- US2: tip visible: avatar (decorative), header + helper copy verbatim.
- US3: focus ring on Back (Tab loop); Back -> URL `/settings`; stub Back -> `/starred-messages`;
  golden `0-8820-starred-messages.png` 375x812 with measured `maxDiffPixelRatio` (= measured+0.05).

### Responsive
- `tests/e2e/responsive.spec.ts`: append `/starred-messages` and `/settings` no-overflow cases
  (flat surface; nav bar + tip must not overflow at any breakpoint).

## Swap list

- None expected. Smoke spec asserts unknown `/foo` falls back to Chats — confirm `starred-messages`
  and `settings` are the only new paths and do not collide with the fallback.
- `navigation-bar.spec.ts` gains a `back` case; existing `new-call` cases stay.