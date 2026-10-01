# Implementation Plan: Status Publishing (feature 049)

**Spec**: [`spec.md`](./spec.md) · **Research**: [`research.md`](./research.md)

## Approach

Create `StatusStore` on the existing F-047 persistence port, give the compose screen a real input,
make `Send` publish, and let the feed render what was published. One new store, one new model type,
one new route-free change set. Nothing is sent to anyone.

The ordering matters: the store is pure and fully testable before any UI depends on it, so a failure
in the text-entry work cannot be mistaken for a data problem.

### Files

| File | Change |
|---|---|
| `src/app/core/status.model.ts` | new — `StatusEntry` |
| `src/app/core/status.store.ts` | new — `StatusStore`, `STATUS_PERSISTENCE_KEY` |
| `src/app/core/status.store.spec.ts` | new — store tests |
| `src/app/features/status/compose-page.ts` | input value signal, `canSend`, `onSend` publishes, `onSendAlt` removed as a handler |
| `src/app/features/status/compose-page.html` | `<p>` + fake caret → real input; `Send` disabled binding; `Send-alt` disabled + `aria-describedby` |
| `src/app/features/status/compose-page.scss` | input inherits the placeholder token styling |
| `src/app/features/status/compose-page.spec.ts` | replace the two inert assertions, add publishing tests |
| `src/app/features/status/status-page.ts` | inject `StatusStore`, expose `myStatus` and the subtitle |
| `src/app/features/status/status-page.html` | tip becomes conditional; status text region; subtitle binding |
| `src/app/features/status/status-page.spec.ts` | tip becomes conditional; add post-publish tests |
| `tests/e2e/status-compose.spec.ts` | **rewritten, not created** — the file already existed from F-007, and its no-op and focus-ring assertions became false by design (authored, **not run**) |
| `figma/design-map.md` | rows 6 and 7: `Send` live as of F-049 |
| `specs/design-gap-audit.md` | row-7 publishing closed |

Not touched: every store except the new one, every shared component, `_tokens.scss`, and all of
`chat-window`. **Corrected at closure (2026-10-01):** this paragraph originally excluded both `.scss`
files "beyond the input's own rules", which understated the work. `compose-page.scss` also gained a
`&:disabled` treatment and a `&__sr-only` utility (no prior sr-only utility existed), and
`status-page.scss` added `&__mine` / `&__mine-text` as selector-list additions to the existing `&__tip`
rules. The same correction is recorded in `spec.md`; no token value was added.

### Model

```ts
export interface StatusEntry {
  id: string;
  text: string;
  createdAtMs: number;
}
```

Three fields, no optional ones, no `status` or `kind` discriminator. There is exactly one kind of
status this build produces, so a discriminator would be a field nothing branches on.

### Store

Mirrors `call.store.ts` exactly: `signal<StatusEntry | null>`, mandatory `PersistencePort` in the
constructor, `hydrate()` called from it, `persist()` writing
`{ version: 1, myStatus, nextStatusSeq }` under `wa.status-store.v1`.

```ts
publish(text: string, nowMs: number): StatusEntry | null {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return null;
  }
  const entry: StatusEntry = { id: this.nextId(), text: trimmed, createdAtMs: nowMs };
  this.myStatus.set(entry);
  this.persist();
  return entry;
}
```

`nextId()` increments `nextStatusSeq` **before** the entry is built, so the id in the snapshot and
the id in the signal are the same value — the defect that would appear if the counter were persisted
after the increment and the write failed.

`hydrate()` refuses, in order: a `null` read, unparseable JSON, a `version !== 1`, and a `myStatus`
that is present but not an object with string `id`/`text` and numeric `createdAtMs`. `nextStatusSeq`
defaults to `0` when absent, so a snapshot written by a build that had no counter still loads and
simply starts issuing from `status-1`.

### Text entry

A single-line `<input type="text">` with `placeholder="Type a status"`, bound to a signal on the
page. The `aria-hidden="true"` on `.compose__type` is **removed** — it was correct when the wrapper
held a decorative paragraph and is wrong once it holds a real control.

`Send` gets `[disabled]="!canSend()"` where `canSend()` is the trimmed value being non-empty. That
satisfies `AGENTS.md`: a disabled button is actually disabled, and the store refuses blanks anyway, so
the two guards are independent rather than redundant.

### Send-alt

`disabled` plus a visually hidden `<p>` referenced by `aria-describedby`, so the reason is available
to a screen reader rather than living only in a source comment. The `onSendAlt` handler is **deleted**
rather than left as an empty method — there is no behaviour left to describe, and an empty handler is
the exact shape F-046 catalogued as a defect.

### Feed

`myStatus()` drives three things: the `My Status` subtitle, the conditional tip, and the status text
region. All three read the same signal, so the feed cannot show a subtitle for a status the list is
not showing.

## Ordering

1. `StatusEntry` + `StatusStore` + its tests (pure, no UI).
2. Compose page: input, `canSend`, `Send` publishes, `Send-alt` disabled — with tests.
3. Status page: subtitle, conditional tip, status region — with tests.
4. E2E spec.
5. Drift notes, design map, gap audit.
6. G2 build + full suite, then checklist/converge and the closure commit.

Tests are written before the code they cover within each step.

## Risks

- **Two keyboards on screen.** The retained PNG may overlap the OS keyboard. Removing a
  design-verified element on a cosmetic guess is worse, so it stays and the overlap is recorded for
  the capture gate.
- **Three existing assertions encode the inert behaviour** and must change. Each is a consequence of
  the spec, named in `tasks.md`, not a test relaxed to fit the code.
- **A real input diverges from the design's segmented keyboard.** This is the owner's 2026-10-01
  decision, and it is the only way the screen can accept text at all.
- **Publishing is not delivery.** A user could reasonably expect a published status to be visible to
  contacts. It is not, and cannot be. The spec says so in the Assumptions, and the feed shows no
  recipient affordance that would imply otherwise.
- **`Clock` must be injected, not stubbed by patching `Date`.** The store takes `nowMs` as a
  parameter precisely so this cannot be got wrong; the page is the only place time is read.

## Drift policy

| Superseded artifact | What it currently claims | Correction |
|---|---|---|
| `specs/007-status-compose/spec.md` | Send / Send-alt are non-functional placeholders | `Send` publishes as of F-049; `Send-alt` disabled with a recorded reason |
| `specs/006-status/spec.md` | Feed shows a static "no recent updates" tip | Tip is now conditional; the published status renders |
| `specs/035-status-wiring/spec.md` | My Status row opens the composer only | Subtitle changes once a status exists |
| `specs/design-gap-audit.md` | Row-7 publishing open | Closed by F-049 |
| `figma/design-map.md` rows 6, 7 | Implemented, publishing inert | `Send` live as of F-049; post-publish chrome provisional |

F-047 is untouched: this feature adds a consumer of the port, not a change to it.