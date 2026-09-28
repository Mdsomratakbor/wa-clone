# Tasks: WhatsApp Authorization (feature 021)

**Input**: `specs/021-auth/plan.md`, `specs/021-auth/spec.md`, `specs/021-auth/research.md`, `specs/021-auth/contracts/ui-contracts.md`

- **Gates**: G1 = capture + owner approval (incl. entry/default-flow decision); G2 = build/unit green (e2e runs paused per owner directive); G3 = closure commit.
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