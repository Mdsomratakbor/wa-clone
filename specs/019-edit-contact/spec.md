# Feature Specification: WhatsApp Edit Contact

**Feature Branch**: `019-edit-contact`

**Created**: 2026-09-26

**Status**: **In progress — structural scope landed pre-capture (owner directive `2026-09-24`).**
Contact Info now exposes an "Edit" action in its pushed header that opens `/contact/:id/edit`,
rendering the Edit Contact pushed screen (Back → `/contact/:id`, title "Edit Contact", a
structural name/phone form + Save, no tab bar). Save is a no-op this feature. Exact form fields,
labels, glyphs and golden remain PENDING the Figma capture (~2026-09-28) and are gated at G1;
provisional/hypothesis values in place.

**Input**: `figma/design-map.md` row 19 (`0:10334`) + `specs/019-edit-contact/research.md`

---

## Summary

Edit Contact is a pushed form screen in the contact-info feature area. The design file has no
interaction wiring (confirmed in `design-analysis.md`), so the entry is a declared hypothesis:
an "Edit" action in the Contact Info pushed header. This feature wires that entry and renders a
structural form (Name prefilled from `CHAT_SEED`, Phone empty, Save). Persistence and field
behaviour are later features / map-external; Save is a no-op.

## PENDING design inventory (capture on ~2026-09-28)

- [ ] Form field set/labels (Name/Phone hypothesis) + layout
- [ ] Save/Cancel treatment, avatar/glyph edit affordance
- [ ] Entry affordance confirmation (Edit action vs Edit row)
- [ ] Nav title ("Edit Contact" PENDING)

## Owner Clarifications (proposed — confirm at G1)

1. **Entry**: Contact Info pushed header "Edit" action → `/contact/:id/edit`.
2. **Form**: Name (prefilled) + Phone fields; Save no-op.
3. **Title**: "Edit Contact" in the pushed header.

## Functional Requirements

- **FR-001**: Contact Info "Edit" action navigates to `/contact/:id/edit`.
- **FR-002**: `/contact/:id/edit` renders the form screen (title + Name prefilled from
  `CHAT_SEED.contactName` + Phone + Save), no tab bar.
- **FR-003**: Back returns to `/contact/:id`.
- **FR-004**: Save is a no-op.
- **FR-005**: No horizontal overflow at any breakpoint.

## Non-Goals

- Persistence; phone data; save-to-seed; validation.

## User Stories

- **US1 (entry)**: On Contact Info I tap Edit and land on `/contact/:id/edit`.
- **US2 (screen)**: I see the pushed header (Back + "Edit Contact"), the Name field prefilled
  with the contact name, a Phone field and a Save action, no tab bar.
- **US3 (chroming)**: Back returns to Contact Info; Save is a no-op; no horizontal overflow;
  matches the Figma render within the measured golden threshold.

## Acceptance Criteria (validation targets)

1. Unit — `edit-contact-page.spec.ts` (new); `contact-page.spec.ts` Edit action navigation.
2. E2E `tests/e2e/edit-contact.spec.ts`: US1/US2/US3 (+ golden `0-10334-edit-contact.png`
   gated). `contact-info.spec.ts` US2 extended.
3. Responsive: no-overflow cases for `/contact/chat-001/edit`.
4. `figma/design-map.md` row 19 spec → `019` + implemented at closure.

## Closing note (deliberately incomplete)

Until T001 lands, `edit-contact-page` renders a structural form (stable testids/aria-labels) —
replaced at G1 with the captured design.