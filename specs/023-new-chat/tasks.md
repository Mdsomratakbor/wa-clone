# Tasks: WhatsApp New Chat Creation (feature 023)

**Input**: `specs/023-new-chat/plan.md`, `specs/023-new-chat/spec.md`, `specs/023-new-chat/research.md`, `specs/023-new-chat/contracts/ui-contracts.md`

- **Gates**: G1 = no-op (no new Figma data needed); G2 = build/unit green + e2e authored (runs paused); G3 = close + drift notes.
- **Tests**: `npx ng test --watch=false --reporters=progress` green before each commit;
  Playwright specs are authored but **not executed** (paused by owner directive 2026-09-26).

## Implementation



## Closure

- [x] Spec set committed before any code (`docs(spec)`), then `feat`, then `test`.
- [x] `npm run build` green and the full unit suite green.
- [x] Drift notes added to every superseded spec listed in `plan.md` -> Drift policy.
- [ ] Playwright execution - deferred by owner directive 2026-09-26.

## Commands



## Notes

- `[ ]` items are capture-gated (Figma 429) and stay open until the quota resets.
- Checkboxes marked `[x]` shipped in this feature; the list is the delivery record.
- `plan.md` is the authority for the approach; `spec.md` for the requirements.