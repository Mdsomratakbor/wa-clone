# Plan: WhatsApp Edit Contact (feature 019)

**Input**: `specs/019-edit-contact/spec.md` + `specs/019-edit-contact/research.md` (original: **Input**: `figma/design-map.md` row 19 (`0:10334`) + `specs/019-edit-contact/research.md`)

**Gate**: Figma 429 clears (~2026-09-28) -> node payload capture (`0:10334`) -> owner approval -> test-first -> implementation. Structural implementation approved pre-capture (owner directive `2026-09-24`).

## Approach

1. **Screen**: `features/contact-info/edit-contact-page` (form: Name prefilled from `CHAT_SEED`,
   Phone, Save no-op) + units.
2. **Entry**: Contact Info NavigationBar trailing "Edit" action → `['/contact', id, 'edit']`.
3. **US3**: Back routing + responsive + gated golden (measure baseline, ship measured + 0.05).
4. **Closure**: design-map row 19 -> `019` + implemented; commits (spec/feat/docs).

provisional until G1.

## Phases

The approach above is executed in order; each numbered step is one commit-sized unit (docs -> feat -> test).

## Review gates

- **G1**: capture + owner approval;
- **G2**: build/unit green (+ e2e when owner permits runs);
- **G3**: closure commit.

## Drift policy

The Contact Info `Edit` trailing action is a declared hypothesis (the design file carries no interaction wiring). The Edit Contact form fields are provisional until G1; `/contact/:id/edit` is a second route added by this feature.

## Structure

Single project (repo root):

```text
specs/019-edit-contact/
- spec.md          # requirements (canonical)
- research.md      # Phase 0 research + assumptions
- plan.md          # this file (Phase 1)
- tasks.md         # Phase 2 task list
- contracts/ui-contracts.md
src/app/core/        # stores (ChatStore, PrefsStore, CallStore)
src/app/features/    # one folder per screen
src/app/shared/components/  # nav bar, list item, action sheet, toggles
tests/e2e/           # playwright specs (authored; runs paused)
```