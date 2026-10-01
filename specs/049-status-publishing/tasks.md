# Tasks: Status Publishing (feature 049)

**Spec**: [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md)

**Total**: 10 implementation tasks · 3 capture-gated tasks (T011–T013)

## Implementation

- [x] **T001** - `status.model.ts`: `StatusEntry { id, text, createdAtMs }`.
- [x] **T002** - `StatusStore` on `PersistencePort`, key `wa.status-store.v1`, `version: 1`,
      `myStatus` signal, `nextStatusSeq` counter. **Tests first** in `status.store.spec.ts`:
  - `publish` creates an entry with the injected time and returns it (FR-005)
  - `publish` trims leading and trailing whitespace (FR-003)
  - `publish` refuses blank and whitespace-only text, creates nothing, writes nothing (FR-004)
  - a second publish replaces rather than stacks (FR-005)
  - ids are monotonic `status-<n>` and do not collide after a reload (FR-007)
  - a published status survives a reload (FR-006)
  - `hydrate` ignores a wrong version, a missing key, malformed `myStatus`, and unparseable JSON,
    leaving the store empty without throwing (FR-006)
  - a snapshot with no `nextStatusSeq` still loads and starts issuing (FR-007)
  - an empty store writes nothing on load (FR-013)

- [x] **T003** - `status.store.spec.ts` covers the storage-unavailable path. **Corrected at closure
      (2026-10-01)**: this task originally read "a port whose `read` returns `null` and whose `write`
      **throws** must not break publishing or hydration". That is not the port's contract and no test
      asserts it. `LocalStorageAdapter` owns storage-error handling (F-047), and a store that caught
      around `write()` would be storing a policy the adapter already owns. The task now asserts what
      the architecture actually guarantees: a non-persistent port (`read` → `null`, `write` → no-op)
      still publishes and hydrates correctly, which is the condition a real unavailable-storage
      environment produces.

- [x] **T004** - Compose page template: replace `.compose__placeholder` + `.compose__caret` with a
      real `<input type="text" placeholder="Type a status">`, and **remove `aria-hidden="true"`** from
      `.compose__type`, which was correct for a decorative paragraph and is wrong for a control.
      Reuse the existing placeholder token styling so no new value enters the token map.

- [x] **T005** - Compose page: `value` signal, `canSend()` = trimmed non-empty, `[disabled]` on
      `Send`; `onSend` publishes the trimmed text with `Clock.now()` then navigates to `/status`;
      `Send-alt` gets `disabled` + a visually hidden `aria-describedby` explanation; the empty
      `onSendAlt` handler is **deleted**. **Tests first** in `compose-page.spec.ts`.

- [x] **T006** - Compose page tests. Three existing assertions change as a *consequence of the spec*
      and are re-pointed, not relaxed:
  - `'send glyphs, placeholder and keyboard are no-ops'` asserted `navigate` was never called;
    `Send` now navigates, so the no-op assertion moves to `Send-alt` alone.
  - the placeholder was asserted as a `.compose__placeholder` element's text; it is now an input's
    `placeholder` attribute.
  - the fake caret is gone, so its assertion is replaced by an assertion that a real input and a
    real caret are present.
  Plus: `Send` disabled while blank and enabled once typed; trimmed text is what is published;
  `Send-alt` disabled and inert by mouse **and** keyboard.

- [x] **T007** - Status page: inject `StatusStore`; expose `myStatus()` and a `subtitle` computed;
      make the tip conditional on `myStatus() === null`; add the status text in a `role="status"`
      region via interpolation only. **Tests first** in `status-page.spec.ts`:
  - tip shows and status region is absent when nothing is published
  - the status text replaces the tip in a `role="status"` region once published
  - the `My Status` subtitle is `Add to my status` when empty, the published text when not
  - a status containing markup renders as that literal text (FR-011)
  - the existing row, badge, circles and tab-bar assertions are unchanged

- [x] **T008** - `tests/e2e/status-compose.spec.ts` — open the composer, `Send` disabled with an
      empty box, type, `Send`, land on the feed with the text visible, `Send-alt` disabled, and a
      reload keeps the status. **Authored, not run** (Playwright paused, owner directive 2026-09-26).

- [x] **T009** - G2: `npm run build` green, then the **full** unit suite green with the exact count
      reported.
- [x] **T010** - `/speckit.analyze` pass; then `/speckit.checklist` per FR with named test evidence
      and `/speckit.converge`.

## Capture - BLOCKED (Figma 429, reset 2026-10-02 18:38 UTC)

- [ ] T011 - Confirm from a capture whether the feed shows a **published** status anywhere in the
      file, and record its node id (or record that there is none) in `research.md`
- [ ] T012 - Reconcile the post-publish presentation, the `My Status` subtitle variant, the retained
      keyboard graphic against the OS keyboard, and the absence of a timestamp; replace the
      hypotheses in `spec.md` if the design differs
- [ ] T013 - Golden for the empty and published feed, and the composed status (blocked twice over:
      capture + Playwright pause)

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per owner directive
```

## Notes

- `[ ]` T011–T013 are capture-gated and stay open until the quota resets.
- The store is **not** a ChatStore extension and does not touch the chat snapshot. It is the first
  store created since F-047 and follows the `call.store.ts` shape: mandatory `PersistencePort`,
  versioned key, counter in the snapshot, `hydrate()` that refuses a bad snapshot.
- `publish` guards blanks and `Send` is disabled when blank. Those are independent guards on purpose:
  one protects the UI, the other protects the data.
- Publishing is **not delivery**. No status reaches any contact in this build, and the feed shows no
  recipient affordance that would imply otherwise.
- The feed and compose screens are both design-verified (`0:8498`, `0:9634`); only the *post-publish*
  presentation is provisional.

## FR → test traceability

Suite: **658 / 658 SUCCESS** (`npx ng test --watch=false --reporters=progress`), `npm run build`
green, both on 2026-10-01. Baseline before F-049 was 635; F-049 added **23** tests (14 store,
6 net-new compose + 1 re-pointed, 3 net-new feed). Test names are quoted exactly as they appear in
the files.

| FR | Task | Named test evidence |
|----|------|---------------------|
| FR-001 | T004, T006 | `status.store.spec` n/a → `ComposePage` › "renders a real input, not a decorative placeholder, plus the keyboard graphic (FR-001)"; "the keyboard graphic stays inert (FR-001)" |
| FR-002 | T006 | `ComposePage` › "Send is genuinely disabled while the text is blank (FR-002)"; "Send becomes enabled once text is typed (FR-002)" |
| FR-003 | T002, T006 | `StatusStore` › "trims leading and trailing whitespace (F-049 FR-003)"; `ComposePage` › "Send publishes the trimmed text and navigates to the feed (FR-003)" |
| FR-004 | T002, T006 | `StatusStore` › "refuses blank and whitespace-only text without creating or writing (F-049 FR-004)"; `ComposePage` › "Send publishes nothing and navigates nowhere when the text is blank (FR-004)" |
| FR-005 | T002 | `StatusStore` › "publishes a status with the injected time and returns it (F-049 FR-005)"; "a second publish replaces rather than stacks (F-049 FR-005)" |
| FR-006 | T002 | `StatusStore` › "a published status survives a reload (F-049 FR-006)"; "ignores a snapshot with a foreign version"; "ignores an unparseable snapshot rather than throwing"; "ignores a malformed myStatus rather than rendering undefined"; "a snapshot without a myStatus key loads as empty" |
| FR-007 | T002 | `StatusStore` › "ids are monotonic and do not collide after a reload (F-049 FR-007)"; "loads a snapshot with no counter and starts issuing" |
| FR-008 | T006 | `ComposePage` › "Send-alt is disabled with an accessible reason, and inert by mouse and keyboard (FR-008)" |
| FR-009 | T007 | `StatusPage` › "the published status replaces the tip in a live region (FR-009)"; "renders the tip with the no-recent-updates message when nothing is published" |
| FR-010 | T007 | `StatusPage` › "the My Status subtitle follows the published status (FR-010)" |
| FR-011 | T007 | `StatusPage` › "renders a status containing markup as that literal text (FR-011)" |
| FR-012 | T005 | `ComposePage` › "Send uses the injected Clock, not the wall clock (FR-012)" |
| FR-013 | T002 | `StatusStore` › "an empty store writes nothing on load (F-049 FR-013)" |

## Analysis pass (the `/speckit.analyze` gate)

Run 2026-10-01 at closure, after T004–T010. Result: **no unresolved contradiction** between
`spec.md`, `plan.md`, `tasks.md` and the shipped code. Three items were found and resolved rather
than left open:

1. **T003 contradicted the F-047 port contract.** It required a store to tolerate a `write()` that
   *throws*, while `LocalStorageAdapter` already owns storage-error handling. Resolved by rewriting
   T003 to assert a non-persistent port (the real unavailable-storage shape) and by recording the
   reason in the task itself. No code or requirement changed.
2. **`spec.md` "Out of Scope Changes" was factually wrong.** It claimed no edits to
   `compose-page.scss` / `status-page.scss`, which implementation disproved: the placeholder class
   styles a `<p>` and would have left default input chrome. The section now states the correction and
   names the three rules added. Recorded in the spec rather than absorbed silently.
3. **The disabled-glyph treatment deviated from the F-046 convention** (`--wa-text-tertiary` →
   `opacity`), because the convention reads as a colour change on a saturated pink fill. Kept
   deliberately, with the reason in the stylesheet, the spec's `UNKNOWN` list, and the commit body.

Consistency checks that passed: `StatusStore` is reachable only through `PersistencePort`; no
wall-clock read exists outside `Clock` (`Date.now`/`new Date` absent from the store and both pages);
no shared component was modified; `_tokens.scss` is untouched; the `sendText` focus-ring E2E
assertion was re-pointed rather than deleted, because a disabled control genuinely leaves the tab
order and the old assertion was false for a good reason.

## Closure (G3)

**F-049 is closed with G1 still BLOCKED.** The structural and behavioural work is shipped; the
capture-gated presentation questions (T011–T013) remain open and are not claimed as done.

- **Files changed**: `status.model.ts`, `status.store.ts`, `status.store.spec.ts` (new);
  `compose-page.{ts,html,scss,spec.ts}`, `status-page.{ts,html,scss,spec.ts}`,
  `tests/e2e/status-compose.spec.ts`.
- **Commits**: `c173733` docs(spec) · `58a4487` store · `21ebbcd` compose · `03bc172` feed + E2E ·
  `f6827c0` style-convention corrections · this closure commit.
- **G2 evidence**: `npm run build` green; unit **658 / 658 SUCCESS**.
- **G3 evidence**: drift notes added to specs 006, 007 and 035, the gap audit, and
  `figma/design-map.md` rows 6–7. This table is the per-FR checklist.
- **Deferred, not silently dropped**: the `Send-alt` contact picker (backend), segmented-keyboard
  typing (no captured key geometry), other people's statuses, timestamps, photo/video statuses, and
  edit/delete. Each is a Non-Goal in `spec.md`, not a missing item.
- **Known limitations recorded rather than fixed**: the 38px input does not follow `--wa-font-scale`
  (pre-existing on this screen, and scaling it could overflow the design-verified 232px field); the
  keyboard graphic overlaps the OS keyboard; the disabled treatment and post-publish presentation are
  PROVISIONAL pending G1.