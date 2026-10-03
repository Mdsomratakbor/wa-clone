# Tasks: Settings Row Descriptions (054)

**Feature**: `054-settings-row-descriptions` · **Spec**: [`spec.md`](./spec.md) · **Plan**:
[`plan.md`](./plan.md)

Playwright remains paused by owner directive (2026-09-26): e2e cases below are **authored, never
executed**.

| Task | Work | FR | Status |
|---|---|---|---|
| T001 | `docs(spec)` — spec/plan/tasks for 054; drift notes 013/014/016/017/018; design-map rows 13/14/16/17/18 | — | [x] `527fcc2` |
| T002 | `settings.seed.ts` — `SettingsRowSeed.description?`; owner-approved copy for all 5 row lists | FR-001, FR-002 | [x] `1631c76` |
| T003 | `settings-page.html/scss` — chevron rows wrap label + description | FR-001, FR-002, FR-003 | [x] `1631c76` |
| T004 | `account-page.html/scss` — chevron rows wrap label + description | FR-001, FR-002, FR-003 | [x] `1631c76` |
| T005 | `chats-settings-page.html/scss` — chevron, live-toggle and unavailable branches all show the description | FR-001, FR-002, FR-003 | [x] `1631c76` |
| T006 | `notifications-page.html/scss` — toggle and unavailable branches show the description | FR-001, FR-002, FR-003 | [x] `1631c76` |
| T007 | `data-storage-page.html/scss` — chevron rows wrap label + description | FR-001, FR-002, FR-003 | [x] `1631c76` |
| T008 | Unit tests per page (description under each label, all branches, `aria-label` unchanged, token styling) | FR-001, FR-003, FR-004 | [x] `a12c3bb` |
| T009 | E2E authored in `tests/e2e/settings.spec.ts` (a row shows its description) — **not run** | FR-002 | [x] `a12c3bb` — authored, not executed (Playwright pause 2026-09-26) |
| T010 | G2 + closure: build green, full unit suite green (**715/715**), drift notes 013/014/016/017/018, design-map rows 13/14/16/17/18, gap-audit changelog, checklist + converge | DoD | [x] closure commit — build green, **715/715** |

## Checkpoint

`/settings`: each of the five rows shows an owner-approved one-line description under its label,
and every sub-screen (Account, Chats Settings, Notifications, Data & Storage) does the same for all
its row kinds, with the toggles, chevrons and `aria-label`s exactly as before. The header stays
pinned.

## FR → test traceability

- **FR-001** — `settings-page.spec.ts`, `account-page.spec.ts`, `chats-settings-page.spec.ts`,
  `notifications-page.spec.ts`, `data-storage-page.spec.ts` "F-054: every … row shows its
  description under the label" (each seeded row renders label + description in the row-text block,
  and the row's `aria-label` still equals the label).
- **FR-002** — copy lives in `settings.seed.ts` one string per row, matching the appendix in
  `spec.md`; e2e authored-only in `tests/e2e/settings.spec.ts` "every row shows its description
  under the label (F-054)" (not run, Playwright pause 2026-09-26).
- **FR-003** — the same tests assert the description resolves the secondary control tokens
  (`getComputedStyle` `13px` / `rgb(142, 142, 147)`), proving the treatment uses
  `--wa-fs-control`/`--wa-text-secondary`, not new tokens; chevron, live-toggle and `unavailable`
  row kinds all covered via the per-row iteration (chats/notifications mix all three).
- **FR-004** — `aria-label` equality is asserted row-by-row in every screen test (no contract
  change); the F-046 `unavailable` switch semantics are untouched (existing disabled-switch suites
  still green).
- **FR-005** — the pinned header requires no code change; screens share the existing
  `app-navigation-bar` and the settings headers/footer tests remain green unchanged.
- **E2E (authored, not run)** — `settings.spec.ts` "every row shows its description under the label
  (F-054)".

## Blocked (recorded, not skipped)

- **G1 capture** — the Figma OAuth token expired (`403 Token expired`, 2026-10-03), so rows
  13/14/16/17/18 remain unfetchable. F-054 copy is PROVISIONAL and stays labelled provisional in
  the spec; reconcile after the owner re-authenticates, together with the 051/052/053 provisional
  values.