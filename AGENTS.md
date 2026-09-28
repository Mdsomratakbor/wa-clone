# AGENTS.md

Working agreement for agents on `whatsapp-ui` (Angular 20 WhatsApp clone rebuilt from the Figma
`WhatsApp UI Screens (Community)` file). This file is binding: if anything here conflicts with an
agent's default habits, this file wins.

---

## 0. The one rule that overrides everything

**No code without a spec. No spec change without a clarify pass.**

- Nothing is implemented — not a store method, not a field, not a route, not a style tweak — until
  a numbered feature directory `specs/NNN-slug/` exists and its `spec.md` has approved
  requirements.
- If implementation reveals a requirement is wrong, missing, or contradictory: **stop**, run
  `/speckit.clarify`, write the answers into `spec.md`, then continue. Silently changing the
  contract is a defect, not a fix.
- Unspecified behavior is not implemented. Unknown design values stay `UNKNOWN / NEEDS
  CLARIFICATION` in the spec; they are never guessed in code.
- Figma node IDs are never invented. Only IDs returned by the Figma API may be cited.

---

## 1. Speckit chain — mandatory, in order, per feature

| # | Command | Produces | Must satisfy before moving on |
|---|---------|----------|-------------------------------|
| 1 | `/speckit.specify` | `specs/NNN-slug/spec.md` | Numbered FRs, acceptance criteria, Figma reference, quality checklist |
| 2 | `/speckit.clarify` | Clarification block inside `spec.md` | ≤3 questions per pass (constitution Art. I); every answer written back into the spec |
| 3 | `/speckit.plan` | `specs/NNN-slug/plan.md`, `research.md` | Approach traceable to the spec; review gates G1/G2/G3; drift policy |
| 4 | `/speckit.tasks` | `specs/NNN-slug/tasks.md` | Every FR maps to ≥1 task; ordering is dependency-correct |
| 5 | `/speckit.analyze` | consistency report | Zero unresolved contradictions across spec/plan/tasks/contracts |
| 6 | `/speckit.implement` | `src/` changes | Tasks executed in order, each task = one commit-sized unit |
| 7 | `/speckit.checklist` | per-requirement checklist | Every requirement marked satisfied with evidence (test name, build result) |
| 8 | `/speckit.converge` | final verification | Artifacts match shipped code; no task left unrecorded |

Supporting commands: `/speckit.constitution` (amend rules deliberately, with rationale),
`/speckit.taskstoissues` (only when the owner asks for issue export).

**Skipping a gate is a process failure even if the code works.** If a gate is blocked, record it
as blocked (see §5) and continue only on the work the owner has explicitly approved.

**Active-feature resolution is unreliable.** `/speckit.check-prerequisites` currently resolves
`001-chat-list` when the branch is `main`. Always state the feature directory explicitly
(`specs/NNN-slug/`) instead of trusting auto-detection, and verify the resolved feature before
writing any artifact.

---

## 2. Per-feature workflow

1. **Allocate** the next `NNN` and a kebab-case slug. Never reuse or renumber a shipped feature.
2. **Specify** from the design source (`figma/design-map.md` row / `figma/design-analysis.md`
   tokens) or the gap audit (`specs/design-gap-audit.md`). No node ID without the API.
3. **Clarify** anything ambiguous before writing a plan. The spec is the contract.
4. **Plan** with explicit review gates and a **drift policy**: every earlier spec this feature
   supersedes gets a drift note, and the drift note is written in the superseded spec.
5. **Tasks** so that each task is one commit-sized unit and each FR is covered.
6. **Implement** task by task. After each task: build + unit green, then commit.
7. **Checklist + converge**, then report counts (tests added, total tests, build result).

### Commit cadence (established convention)

Small, traceable commits in this order — never one giant commit:

```
docs(spec)  ->  spec.md, plan.md, tasks.md, contracts, drift notes
feat        ->  src/ changes for one task
test        ->  unit tests for that task, e2e specs (authored, not run)
```

Commit messages: lowercase conventional prefix, imperative summary, body explaining *why* when the
change is not self-evident. Never amend/force-push a shared branch, never commit secrets, never
commit test logs or generated artifacts.

---

## 3. Golden rules — coding

**Stack:** Angular 20 standalone components, signals, TypeScript 5.8 strict, SCSS with the token
maps in `src/app/core/tokens/_tokens.scss`. No new dependencies without owner approval.

- **Spec linkage:** every store method, model field, route, or component starts from an FR. If you
  cannot name the FR, you are not allowed to write the code.
- **Structure:** one folder per screen under `src/app/features/<feature>/`, with
  `*.page.ts|html|scss` and a colocated `*.spec.ts`. State lives in `src/app/core/*.store.ts`;
  shared UI in `src/app/shared/components/`.
- **Reuse first:** 11 shared components already exist (`navigation-bar`, `chat-list-item`,
  `action-sheet`, `toggle`, `avatar`, …). Reuse before adding; add a component only for real
  repetition or clear behavioural ownership.
- **Model changes are additive with defaults.** Extend via optional fields and normalize at load
  (see `normalizeChats()` in `chat.store.ts`), so old persisted snapshots keep working.
- **Stores:** immutable updates, pure helper functions, versioned persistence keys
  (`wa.chat-store.v1`), best-effort `localStorage` in `try/catch`, monotonic counters for generated
  IDs (`group-<n>`), no wall-clock reads in render paths.
- **Styling:** tokens only — no raw hex/rgba, no ad-hoc spacing. If a genuinely new value is
  needed, add it to the token map in the same change and note it in the spec.
- **Accessibility is part of done:** semantic elements, `aria-label` on icon-only controls,
  `role="status"` for live regions, keyboard reachability, visible focus, contrast. A disabled
  button must be actually disabled — never a click-through no-op.
- **Test hooks:** stable kebab-case `data-testid` on interactive elements and containers
  (`new-group-create`, `new-group-list`), mirrored by the e2e specs.
- **Comments:** only for non-obvious rationale or a cited constraint. Never narrate code, never
  restate the spec inline.
- **No drive-by refactors, no dead code, no `any`, no casts to silence the compiler, no scope
  creep.** One feature per commit series.
- **Don't touch specs during implementation.** If the code is right and the spec is wrong, that is
  a clarify + drift-note situation, not a silent doc edit.

---

## 4. Golden rules — tests

**Commands**

```bash
npm run build                                            # must be green before every commit
npx ng test --watch=false --reporters=progress          # full unit suite
npm run e2e:fast                                         # Playwright chromium-mobile
```

- **Playwright is paused by owner directive (2026-09-26).** E2E specs are *authored and updated*,
  never executed. Record the pause in the task file (`[ ]` + directive date). Do not "just run it
  once" to check.
- **Full suite green before each commit.** Report the exact number (`unit 390/390`). A partial,
  filtered, or interrupted run is never reported as green.
- **Test behavior, not implementation.** Assert what the user sees/hears, not private method calls
  or component internals.
- **Every FR needs coverage.** At least one assertion per FR; store changes also cover persistence,
  version defaults, and re-load normalization. Record FR → test-name traceability in the
  `tasks.md` closure section.
- **Determinism:** no `setTimeout` sleeps — use `fakeAsync`/`whenStable()`/explicit awaits; no
  dependence on test order or the real clock; unique IDs/times injected or controlled.
- **No shared state between tests.** Clear `localStorage` in `beforeEach` and reset any store
  singletons. A suite that only passes in file order is broken.
- **Cover the unhappy paths** the spec mentions: blank/invalid input, empty collections, disabled
  states, and storage-unavailable fallbacks.
- **No skipped tests** (`xit`, `fdescribe`, commented `it`) without a spec-linked reason in the
  commit body.
- **Goldens:** never re-baseline a screenshot to hide a regression. Re-capture is allowed only after
  the Figma capture gate clears, and the re-capture must be called out in the commit and task file.
- **A failing test is a defect report, not something to delete.** Fix code or spec — never the
  expectation — unless the spec itself changed through clarify.

---

## 5. Blocked gates (Figma capture)

- When the Figma API returns 429, the capture gate is **blocked**, not skipped. Mark G1 blocked in
  `plan.md`, keep capture tasks `[ ]` in `tasks.md`, and ship only the structural work the owner
  has approved.
- Any UI whose chrome is not covered by a capture is explicitly labelled **provisional** in the
  spec/plan until the gate clears. Never present provisional chrome as design-verified.
- `specs/design-gap-audit.md` carries the authoritative reset timestamp — read it before retrying
  a capture.

---

## 6. Definition of Done

A feature is done only when **all** of these hold:

- [ ] `spec.md` (+ `plan.md`, `tasks.md`, `contracts/`) exist and match the shipped behavior
- [ ] Clarify answers written back into the spec; no open contradiction (`/speckit.analyze` clean)
- [ ] Drift notes added to every superseded spec
- [ ] `npm run build` green
- [ ] Full unit suite green, exact count reported
- [ ] E2E specs updated (execution still deferred per directive)
- [ ] Checklist satisfied per requirement with evidence (`/speckit.checklist`, `/speckit.converge`)
- [ ] Commits split as `docs(spec)` / `feat` / `test`, messages explain why
- [ ] Nothing shipped that no spec authorizes

Report to the owner: files touched, FRs covered, build + test counts, and anything left blocked.
Do not report a feature as complete with a skipped gate.
