# Tasks: Status Publishing (feature 049)

**Spec**: [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md)

**Total**: 10 implementation tasks · 3 capture-gated tasks (T011–T013)

## Implementation

- [ ] **T001** - `status.model.ts`: `StatusEntry { id, text, createdAtMs }`.
- [ ] **T002** - `StatusStore` on `PersistencePort`, key `wa.status-store.v1`, `version: 1`,
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

- [ ] **T003** - `status.store.spec.ts` covers the storage-unavailable path: a port whose `read`
      returns `null` and whose `write` throws must not break publishing or hydration.

- [ ] **T004** - Compose page template: replace `.compose__placeholder` + `.compose__caret` with a
      real `<input type="text" placeholder="Type a status">`, and **remove `aria-hidden="true"`** from
      `.compose__type`, which was correct for a decorative paragraph and is wrong for a control.
      Reuse the existing placeholder token styling so no new value enters the token map.

- [ ] **T005** - Compose page: `value` signal, `canSend()` = trimmed non-empty, `[disabled]` on
      `Send`; `onSend` publishes the trimmed text with `Clock.now()` then navigates to `/status`;
      `Send-alt` gets `disabled` + a visually hidden `aria-describedby` explanation; the empty
      `onSendAlt` handler is **deleted**. **Tests first** in `compose-page.spec.ts`.

- [ ] **T006** - Compose page tests. Three existing assertions change as a *consequence of the spec*
      and are re-pointed, not relaxed:
  - `'send glyphs, placeholder and keyboard are no-ops'` asserted `navigate` was never called;
    `Send` now navigates, so the no-op assertion moves to `Send-alt` alone.
  - the placeholder was asserted as a `.compose__placeholder` element's text; it is now an input's
    `placeholder` attribute.
  - the fake caret is gone, so its assertion is replaced by an assertion that a real input and a
    real caret are present.
  Plus: `Send` disabled while blank and enabled once typed; trimmed text is what is published;
  `Send-alt` disabled and inert by mouse **and** keyboard.

- [ ] **T007** - Status page: inject `StatusStore`; expose `myStatus()` and a `subtitle` computed;
      make the tip conditional on `myStatus() === null`; add the status text in a `role="status"`
      region via interpolation only. **Tests first** in `status-page.spec.ts`:
  - tip shows and status region is absent when nothing is published
  - the status text replaces the tip in a `role="status"` region once published
  - the `My Status` subtitle is `Add to my status` when empty, the published text when not
  - a status containing markup renders as that literal text (FR-011)
  - the existing row, badge, circles and tab-bar assertions are unchanged

- [ ] **T008** - `tests/e2e/status-compose.spec.ts` — open the composer, `Send` disabled with an
      empty box, type, `Send`, land on the feed with the text visible, `Send-alt` disabled, and a
      reload keeps the status. **Authored, not run** (Playwright paused, owner directive 2026-09-26).

- [ ] **T009** - G2: `npm run build` green, then the **full** unit suite green with the exact count
      reported.
- [ ] **T010** - `/speckit.analyze` pass; then `/speckit.checklist` per FR with named test evidence
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

Filled in at closure with the exact suite count and named tests.

| FR | Task |
|----|------|
| FR-001 | T004, T006 |
| FR-002 | T006 |
| FR-003 | T002, T006 |
| FR-004 | T002 |
| FR-005 | T002 |
| FR-006 | T002 |
| FR-007 | T002 |
| FR-008 | T006 |
| FR-009 | T007 |
| FR-010 | T007 |
| FR-011 | T007 |
| FR-012 | T005 |
| FR-013 | T002 |

## Analysis pass (the `/speckit.analyze` gate)

Run at closure; results appended here.

## Closure (G3)

Appended at closure.