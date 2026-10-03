# Tasks: Settings Row Descriptions (054)

**Feature**: `054-settings-row-descriptions` · **Spec**: [`spec.md`](./spec.md) · **Plan**:
[`plan.md`](./plan.md)

Playwright remains paused by owner directive (2026-09-26): e2e cases below are **authored, never
executed**.

| Task | Work | FR | Status |
|---|---|---|---|
| T001 | `docs(spec)` — spec/plan/tasks for 054 | — | [ ] |
| T002 | `settings.seed.ts` — `SettingsRowSeed.description?`; copy for all 5 row lists | FR-001, FR-002 | [ ] |
| T003 | `settings-page.html/scss` — chevron rows wrap label + description | FR-001, FR-002, FR-003 | [ ] |
| T004 | `account-page.html/scss` — chevron rows wrap label + description | FR-001, FR-002, FR-003 | [ ] |
| T005 | `chats-settings-page.html/scss` — chevron, live-toggle and unavailable branches all show the description | FR-001, FR-002, FR-003 | [ ] |
| T006 | `notifications-page.html/scss` — toggle and unavailable branches show the description | FR-001, FR-002, FR-003 | [ ] |
| T007 | `data-storage-page.html/scss` — chevron rows wrap label + description | FR-001, FR-002, FR-003 | [ ] |
| T008 | Unit tests per page (description under each label, all branches, `aria-label` unchanged, token styling) | FR-001, FR-003, FR-004 | [ ] |
| T009 | E2E authored in `tests/e2e/settings.spec.ts` (a row shows its description) — **not run** | FR-002 | [ ] |
| T010 | G2 + closure: build green, full unit suite green (exact count), drift notes 013/014/016/017/018, design-map rows 13/14/16/17/18, gap-audit changelog, checklist + converge | DoD | [ ] |

## Checkpoint

`/settings`: each of the five rows shows an owner-approved one-line description under its label,
and every sub-screen (Account, Chats Settings, Notifications, Data & Storage) does the same for all
its row kinds, with the toggles, chevrons and `aria-label`s exactly as before. The header stays
pinned.

## FR → test traceability

_Completed at closure (T010)._