# Plan: WhatsApp Contact Info (feature 015)

**Input**: `specs/015-contact-info/{spec,research}.md`

**Gate**: Figma 429 clears (~2026-09-28) → node payload capture (`0:9486`) → owner approval of
spec Clarifications (rows/hero/title) → write-first tests → implementation. Structural
implementation approved pre-capture (owner directive `2026-09-24`).

## Approach

- `features/contact-info/contact-page.{ts,html,scss,spec.ts}` at `/contact/:id`: pushed surface
  (no tab bar); `NavigationBar` (Back → `/chat/:id`, title = contact name); hero block
  (avatar + name); Messages action; info rows (`contact-list`/`contact-row`) from `CONTACT_ROWS`
  seed; inner actions no-op.
- Contact identity: route id → `CHAT_SEED` lookup (`contactName`), `UserAvatar` with initials
  fallback.
- `ChatHeader`: identity button wraps avatar + titles, `identity` output (aria-label "Open
  contact info"); chat-window-page wires it → `['/contact', id]`.

## Phases

1. **Capture** (deferred ~09-28): node inventory `0:9486`; golden `0-9486-contact-info.png`;
   hero/row glyphs. Fill research.md.
2. **Screen**: `CONTACT_ROWS` seed + `contact-page` component + units.
3. **Entry**: ChatHeader identity button + chat-window wiring + chat-window e2e tab budget.
4. **US3**: Back routing + responsive no-overflow + golden (measure baseline,
   `maxDiffPixelRatio = measured + 0.05`).
5. **Closure**: design-map row 15 -> `015` + implemented; spec/tasks statuses; commits (spec set /
   feat / docs).

## Review gates

- **G1**: node inventory + owner approval (entry, rows, hero, title).
- **G2**: build + unit + e2e (incl. chat-window regression + golden) green; baseline recorded.
- **G3**: closure commit + traceability (design-map/spec/tasks).

## Drift policy

Header behavior change (identity tap opens Contact Info) is the design's canonical entry — spec'd,
not silent. Contact identity is seed-derived (real chat names). Rows/hero/title are provisional,
replaced at G1. Phone row omitted until capture provides real data.