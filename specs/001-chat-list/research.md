# Research — Feature 001: WhatsApp Chats

Phase 0 output. Resolves every technical unknown from the Technical Context.

## Decision 1 — Styling & design tokens

**Decision**: SCSS custom properties (`:root` variables) defined once in `src/core/tokens/_tokens.scss`; components consume via `var(--wa-*)`.

**Rationale**: Existing project uses SCSS (inline, per-component) with an Angular Material M3 theme in `src/styles.scss`. Custom properties let components reference design tokens without duplication while keeping Material compatibility.

**Alternatives considered**: (a) Material theme only — insufficient, Figma palette (`#EFEFF4`, `#007AFF`, `#8E8E93`…) is not an M3 palette; (b) Tailwind — rejected, would introduce a new framework against the constitution.

**Design-fidelity note**: Token values are node-extracted (see `figma/design-analysis.md §6.4`); approved decision 6.

## Decision 2 — Responsive breakpoints

**Decision**: `--wa-bp-mobile` <600px (edge-to-edge, exact fidelity) · `--wa-bp-tablet` 600–1023px (center column, max-width 480px) · `--wa-bp-desktop` ≥1024px (centred shell; two-pane layout deferred).

**Rationale**: Owner-approved drift (decision 4). Keeps 375px Figma fidelity untouched on mobile while guaranteeing no horizontal overflow on wider viewports — the validation target we committed to.

**Alternatives considered**: (a) mobile-only + letterbox — rejected by owner; (b) full two-pane desktop — too large for feature 001 scope.

## Decision 3 — Test stack

**Decision**: Keep Jasmine + Karma for unit tests (existing). Add Playwright (`@playwright/test`) as a standalone dev-dependency for E2E + visual comparison, with the Figma reference PNG for node `0:8855` stored under `tests/e2e/golden/`.

**Rationale**: Karma covers component behaviour; Playwright covers routing, layout, and pixel-level Figma comparison at 375/800/1440 widths. Angular `ng e2e` has no default runner — standalone Playwright is the standard choice.

**Alternatives considered**: (a) Angular CDK testbed only — insufficient for visual validation; (b) Cypress — heavier, weaker screenshot diffing story.

## Decision 4 — Seed data

**Decision**: A typed, hand-curated array in `src/app/features/chat-list/chat-list.seed.ts` replicating the 9 Figma conversations exactly (names/previews/timestamps from node `0:8855`).

**Rationale**: Spec FR-007 (static seed data, owner-approved decision 3). Deterministic for unit tests and Playwright assertions.

## Decision 5 — Avatar assets

**Decision**: Use inline SVG/initial-based avatars rendered from `avatarRef`; no raster assets in repo.

**Rationale**: Figma avatars are image fills referenced by opaque `imageRef` hashes — bundling them is impractical without Figma export. Initials fallback is already specified in the contract. Visual fidelity for avatars is approximate in 001 and flagged as a fidelity caveat in the checklist.

**Alternatives considered**: Export PNGs from Figma — deferred; requires render API access and asset licensing review.

## Dependency audit note

- All deps verified against budget constraints; no new UI library introduced.
- Potential no. `@playwright/test` is the only new dev-dependency — pinned latest stable at install time.