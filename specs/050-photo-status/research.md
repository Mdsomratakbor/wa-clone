# Research: Photo Status (feature 050)

Inputs: F-049's shipped `StatusStore`, the F-047 persistence seam, the F-012 camera disposition, and
the owner's three answers from 2026-10-01.

## 1. The gap is an entry-point lie, not a missing feature

F-007 Clarification 1 sent **both** circles to `/status/compose`, and the reasoning was sound at the
time: *"There is exactly one compose frame in the design — the text composer; the camera/photo flow
is not part of row 7."* With an inert composer, "Add a photo to my status" opening a screen where
nothing can be typed was one of many honest no-ops.

F-049 changed that. The text composer now has a real input and a working `Send`, so the same entry
point now **looks** like it is about photos and **behaves** as text. That is worse than the original
no-op: F-046's rule exists precisely to stop a control that appears finished from disagreeing with
what it does. The fix is scoped to the entry point plus a photo flow, not a redesign.

## 2. Photo mode as a query param has precedent, and needs no route change

`in-call-page.ts:100` already reads `this.route.snapshot.queryParamMap.get('from')` and validates it
with a fallback. So `?kind=photo` on the existing `status/compose` route follows a pattern this
codebase already uses, and:

- **no route change at all** — the query param rides the existing route;
- **no existing test changes** — an absent `kind` param resolves to text mode, so F-049's compose
  and e2e specs keep asserting the text contract unchanged;
- a missing or unrecognised `kind` falls back to text mode rather than rendering an empty screen.

## 3. Reusing `0:9634` is what keeps this feature from inventing chrome

The alternative — a new `/status/photo` screen — would mean inventing a background, a control bar
and button geometry that exist in no captured artifact, in exchange for nothing. Photo mode instead
keeps the design-verified full-bleed surface, the `Close` glyph and the `Send` glyph exactly as they
are, and replaces only the **entry region**, which the design does not specify for a photo.

That gives a clean split the closure report can state honestly:

| Element | Status |
|---------|--------|
| Surface, `Close`, `Send` glyph | design-verified (`0:9634`), reused unchanged |
| Photo preview, feed photo size, subtitle copy, alt text | **PROVISIONAL**, no node exists |
| On-screen keyboard | deferred, capture-gated, tracked as an open task |

## 4. The quota is the real constraint, and the adapter makes it silent

`LocalStorageAdapter.write` swallows `QuotaExceededError` by design (F-047 FR-002, "best-effort: an
unavailable store is a no-op, not an error"). For text statuses that is harmless. For a photo it is
not, and this is the single most important finding in this research:

> An oversized photo would be **published, shown to the user, and then silently gone on reload** —
> with no error anywhere, because the adapter did exactly what it was built to do.

So the budget cannot be a UI-only concern. FR-007 puts the cap in the **store**: `publishPhoto`
refuses an over-budget payload and leaves the previous status untouched. The visible status and the
persisted status stay the same thing, which is the only honest outcome available on a synchronous
string-valued port.

`PersistencePort`'s payload is an opaque string (F-047), so a data URL fits with **no change to the
seam and no new adapter**.

## 5. Quota numbers are browser-dependent, so budget in characters

Origins are commonly capped around 5 MB of UTF-16 data, so ~2.5 M characters, but the exact figure
varies by browser and by how much of the origin the other stores already use (`chat`, `call`, `prefs`
and `status` all share it). The budget is therefore expressed as a **character count on the data
URL** with a conservative cap, not as a byte figure pretending to a precision the platform does not
offer. The cap is a named constant with the reasoning attached, so it can be revisited rather than
rediscovered.

## 6. The downscale pipeline stays out of the store

`File` → decode → `canvas` → `toDataURL('image/jpeg', quality)`. All browser APIs, no dependency, and
all available in the Karma/Chrome the unit suite already runs.

It is **asynchronous**, which is the deciding factor: the three existing stores are synchronous and
hydrate in their constructors. Putting an async decode inside `StatusStore` would force the store
asynchronous and break that shape for one feature. So the pipeline is a **pure page-level helper**
that returns a data URL, and the store only validates and stores the resulting string. The store
stays sync, and the image logic stays testable on its own.

## 7. The helper is testable for real, so it should not be over-mocked

Karma runs a real Chrome, so a test can generate a source image with a canvas, convert it to a blob,
wrap it in a `File` and feed it to the helper — exercising decode, downscale and encoding end to end
with no stub of `Image` or `document.createElement`. Only the *rejection* path (a non-image) needs a
deliberately invalid input, which is easy to construct. Mocking the DOM here would test the mock.

## 8. The model change is additive, and `isStatusEntry` has to grow with it

`StatusEntry` gains `photo?: { dataUrl, width, height }`. F-049's `isStatusEntry` validator checks
three primitive fields; a validator that ignores `photo` would let a malformed photo through and
render `undefined` in an `<img src>` — precisely the defect class F-049 documented when it fixed
`normalizeCalls()`. So the validator gains a photo check, and a malformed photo is **dropped while
the entry survives as a text status** (FR-006), which is strictly better than discarding a valid text
status because its photo field is junk.

An F-049 snapshot has no `photo` key and loads unchanged, so no migration is needed.

## 9. Reuse from F-049 rather than rebuild

Already shipped and directly reusable: the `role="status"` feed region, the conditional tip, the
`subtitle` computed, the `canSend` disabled-button pattern, the F-046 disabled-glyph convention
(deviating with a written reason on the pink fill), the injected `Clock`, and the trimmed-text rule.
Photo mode is a branch on an existing screen, not a parallel screen.

## 10. E2E remains authored-only

`tests/e2e/status-compose.spec.ts` and `status.spec.ts` gain a photo case using Playwright's
`setInputFiles`. Per the owner directive of 2026-09-26 these are **authored and not run**; the
existing spec files are extended, not replaced, and their current assertions are unaffected because
an absent `kind` param is text mode.
