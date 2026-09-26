# Feature Specification: WhatsApp Contact Info

**Feature Branch**: `015-contact-info`

**Created**: 2026-09-24

**Status**: **In progress — structural scope landed pre-capture (owner directive `2026-09-24`).**
The chat-window header identity tap (avatar + name) now opens `/contact/:id`, which renders the
Contact Info pushed screen (Back → `/chat/:id`, title = contact name, hero block + Messages
action + seeded info rows, no tab bar). All inner actions are no-ops this feature. Exact
geometry, hero/action wording, info rows, glyphs and golden remain PENDING the Figma capture
(~2026-09-28) and are gated at G1; provisional/hypothesis values in place until then.

**Input**: `figma/design-map.md` row 15 (`0:9486`) + `specs/015-contact-info/research.md`

---

## Summary

Contact Info is a pushed screen reached by tapping the chat header (avatar + name) in the chat
window. This feature wires that tap and renders the screen: hero (avatar + name; phone PENDING
capture), a primary Messages action, and a seeded info-row list (Media / Groups / Starred
messages hypothesis). Contact identity resolves from the chat route id via `CHAT_SEED`. Row and
action targets are later features (messaging, calling, media/groups screens not in the map yet).

## PENDING design inventory (capture on ~2026-09-28)

- [ ] Hero topology: avatar size/position, name, phone row
- [ ] Action row: Messages + call/video affordances — labels/glyphs
- [ ] Info rows: exact set/order/glyphs/dividers
- [ ] Nav treatment (Back + title text) and status bar

## Owner Clarifications (proposed — confirm at G1)

1. **Entry**: chat header identity tap → `/contact/:id`. Confirm the design's entry.
2. **Info rows**: seed `CONTACT_ROWS` (hypothesis Media / Groups / Starred messages) replaced
   from the payload at G1.
3. **Title**: contact name in the pushed header vs literal "Contact info" (PENDING).
4. **Phone row**: omitted pre-capture (no real phone data) unless payload provides it.
5. **Tab bar**: absent (pushed surface). Confirm.

## Functional Requirements

- **FR-001**: Tapping the chat header identity (avatar + name/subtitle) opens `/contact/:id`.
- **FR-002**: `/contact/:id` renders the Contact Info screen (hero + Messages action + info rows
  from seed) for the chat's contact.
- **FR-003**: Back returns to `/chat/:id`.
- **FR-004**: All Contact Info actions are no-ops (later features / map-external).

> **Drift note (F-026, 2026-09-26)**: Actions are no longer all no-ops. **Messages** opens the
> thread (`openConversation` + route), the **Starred messages** row routes to
> `/starred-messages`, and the identity comes from `ChatStore` (renames reflect instantly and
> persist). Media/Groups rows remain no-ops (spec Non-Goals).
- **FR-005**: No horizontal overflow at any breakpoint.

## Non-Goals

- Messaging / call / video actions; wallpapers; disappearing messages.
- Real contact phone / photo assets (PENDING capture).
- Edit Contact (row 19), other chat actions.

## User Stories

- **US1 (entry)**: In the chat window I tap the header identity and land on `/contact/:id`.
- **US2 (screen)**: I see the hero (avatar + name), Messages action, and the info rows —
  focusable/labelled; no tab bar.
- **US3 (chroming)**: Back returns to the chat; no horizontal overflow; screen matches the Figma
  render within the measured golden threshold.

## Acceptance Criteria (validation targets)

1. Unit — `contact-page.spec.ts` (new): chrome (Back + title), hero, Messages action, rows from
   seed, Back → `/chat/:id`, no tab bar, no-ops. `chat-header.spec.ts`: identity button renders
   with aria-label + emits `identity`. `chat-window-page.spec.ts`: identity → navigate
   `['/contact', id]`. Full suite green.
2. E2E `tests/e2e/contact-info.spec.ts`: US1 (header tap), US2, US3 (Back + golden
   `0-9486-contact-info.png` gated). `chat-window.spec.ts` focus-tab budget 12 → 13.
3. Responsive: no-overflow cases for `/contact/chat-001`.
4. `figma/design-map.md` row 15 spec → `015` + implemented at closure.

## Swap list

- `ChatHeader`: wrap avatar + titles in a focusable identity button (`chat-header__identity`,
  aria-label e.g. "Open contact info", `identity` output); scss for button reset/focus ring.
- `chat-window-page.html/.ts`: `(identity)="onIdentity()"` → `['/contact', id]`.
- `chat-window.spec.ts` (e2e): focus tab budget 12 → 13.
- `app.routes.ts`: lazy `/contact/:id`.
- No contact-page → chat static swaps; resolve name from `CHAT_SEED` by id at route time.

## Closing note (deliberately incomplete)

Until T001 lands, `contact-page` renders the structural hero + hypothesis rows (stable testids/
aria-labels) — replaced at G1 with the captured design.