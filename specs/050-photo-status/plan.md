# Implementation Plan: Photo Status (feature 050)

**Spec**: [`spec.md`](./spec.md) · **Research**: [`research.md`](./research.md)

**Prerequisite**: F-049 shipped (`StatusStore`, the feed region, the disabled-glyph convention). This
feature extends that store additively and branches the existing composer; it does not replace them.

## Approach

1. **Model** — one optional `photo` field on `StatusEntry`. Additive, defaulted, normalized at load.
2. **Store** — `publishPhoto(dataUrl, nowMs)` beside `publish`, sharing the id counter and the
   single-entry rule, with a hard character budget it enforces itself.
3. **Helper** — a pure async downscale-to-JPEG-data-URL function, page-level, so the store stays
   synchronous.
4. **Compose** — photo mode as a `?kind=photo` branch on the existing screen: file input, label,
   preview, `Send` disabled until an image is chosen, keyboard graphic omitted.
5. **Feed** — render the photo, provisional subtitle, text region suppressed for a photo.
6. **Entry point** — the camera circle navigates to photo mode; note circle and row body unchanged.

## Files

| File | Change |
|------|--------|
| `src/app/core/status.model.ts` | `StatusPhoto` + optional `photo` on `StatusEntry` |
| `src/app/core/status.store.ts` | `publishPhoto`, photo-aware `isStatusEntry`, budget constant |
| `src/app/core/status.store.spec.ts` | photo publish, budget refusal, malformed-photo load, F-049 snapshot |
| `src/app/core/status-photo.ts` **(new)** | `downscaleToJpegDataUrl`, `PHOTO_MAX_CHARS`, `MAX_EDGE` |
| `src/app/core/status-photo.spec.ts` **(new)** | real canvas → blob → `File` round trip, rejection path |
| `src/app/features/status/compose-page.ts` | photo mode from `queryParamMap`, file handling, photo `Send` |
| `src/app/features/status/compose-page.html` | labelled file input + preview, keyboard omitted in photo mode |
| `src/app/features/status/compose-page.scss` | preview + file-input rules (tokens, existing values) |
| `src/app/features/status/compose-page.spec.ts` | photo-mode tests; text-mode tests unchanged |
| `src/app/features/status/status-page.ts` | `hasPhoto` / photo subtitle branch |
| `src/app/features/status/status-page.html` | `<img>` branch, text region suppressed for a photo |
| `src/app/features/status/status-page.scss` | photo sizing (PROVISIONAL) |
| `src/app/features/status/status-page.spec.ts` | photo rendering + subtitle tests |
| `tests/e2e/status-compose.spec.ts` | photo case via `setInputFiles` — authored, **not run** |
| `tests/e2e/status.spec.ts` | camera circle reaches photo mode — authored, **not run** |
| `src/app/features/status/status-page.html` | camera circle navigates to `?kind=photo` |
| `figma/design-map.md` | row 7 updated for photo mode and the provisional presentation |
| `specs/design-gap-audit.md` | photo entry closed; keyboard recorded as a named deferral |

Not touched: routes (the query param rides the existing route), `navigation-bar`, `tab-bar`,
`user-avatar`, `PersistencePort`, `LocalStorageAdapter`, `_tokens.scss`, `chat-window`.

## Decisions

- **Mode over a new screen.** Spending zero invented chrome is worth more than a separate route;
  research §3.
- **Refuse over-budget in the store, not the UI.** The adapter swallows quota errors by design, so
  the store is the only place that can keep the visible and persisted status identical; research §4.
- **Async helper, sync store.** The three stores hydrate in their constructors and that shape is not
  worth breaking for an image decode; research §6.
- **Budget in characters, capped conservatively.** The platform's quota is browser-dependent and
  shared with three other stores, so the constant is deliberately pessimistic; research §5.
- **Drop a malformed photo, keep the entry.** Discarding a valid text status over a junk photo field
  would be a worse failure than showing it as text; research §8.
- **Omit the keyboard graphic in photo mode.** Hiding a graphic the interaction cannot use invents
  less than rendering it, and it removes the duplicated-keyboard artefact the owner flagged for the
  photo path without pretending the text-path keyboard is solved.

## Risks

| Risk | Mitigation |
|------|------------|
| Quota still exceeded despite the cap (other stores already large) | The cap is conservative and the previous status is left intact on refusal, so a refusal degrades to "no photo published" rather than a lost one |
| Canvas/`toDataURL` unavailable or tainted | Only same-origin data URLs are decoded; a failure leaves the preview empty and `Send` disabled (FR-004) |
| A photo is chosen, then the user navigates away mid-decode | The decode is awaited before `Send` enables; an in-flight decode never publishes on its own |
| Provisional photo sizing looks wrong on a real device | Recorded as PROVISIONAL and gated on T012; not presented as design-verified |
| E2E never runs, so a `setInputFiles` mistake ships unseen | The unit suite covers the whole flow through the store and the page; the pause is recorded, not hidden |

## Drift policy

| Superseded spec | Superseded claim | New reality |
|-----------------|------------------|-------------|
| `specs/007-status-compose/spec.md` | Clarification 1: both circles open the text composer | The camera circle opens photo mode; only the note circle and row body open text |
| `specs/006-status/spec.md` | `My Status` row opens the text composer | Row body unchanged; the camera circle is the one new entry |
| `specs/035-status-wiring/spec.md` | row navigates to `/status/compose` | Unchanged for the row body; the camera circle is a sibling entry and gains its own target |
| `specs/design-gap-audit.md` | camera capture in Tier C | Unchanged — this feature picks a file, it does not capture. Keyboard stays a named deferral |

## Review gates

- **G1 BLOCKED** — quota resets 2026-10-02 18:38 UTC. Reused chrome is verified; photo presentation
  is provisional. Capture tasks stay open in `tasks.md`.
- **G2** — `npm run build` green, full unit suite green, exact count reported. **CLEARED 2026-10-01**:
  build green, **691 / 691** (baseline 658, +33).
- **G3** — closure commit, drift notes, checklist, converge clean. See `tasks.md#closure-g3`.
