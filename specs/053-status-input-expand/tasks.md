# Tasks: Expanding Status Input (053)

**Feature**: `053-status-input-expand` · **Spec**: [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md)

Playwright remains paused by owner directive (2026-09-26): e2e cases below are **authored, never
executed**.

| Task | Work | FR | Status |
|---|---|---|---|
| T001 | `docs(spec)` — spec/plan/tasks; drift notes on the F-049/F-051 single-line-field footprint; design-map row 7; gap-audit changelog | — | [x] `767645d` |
| T002 | `compose-page.html` — `<input>` → `rows="1"` `textarea` (`#statusInput`); keep `[value]`, `(input)`, testid, aria-label, placeholder, focus | FR-001, FR-002 | [x] `a13b979` |
| T003 | `compose-page.ts` — `viewChild('statusInput')` + value-driven growth effect (`min(scrollHeight, 228)`, overflow toggle); `onValue` reads `HTMLTextAreaElement` | FR-001, FR-003 | [x] `a13b979` |
| T004 | `compose-page.scss` — `.compose__type` `min-height: 52px`; field `min-height: 45.6px`, `max-height: 228px`, `resize: none`, `overflow-wrap: anywhere`; typography/placement/focus unchanged | FR-001, FR-005 | [x] `a13b979` |
| T006 | `compose-page.spec.ts` — textarea exists; wrapping text grows height; cap 228px with internal scroll; clear → one line; `\n` preserved in signal + publish; F-051 keys type in and backspace removes a `\n`; photo mode has no field | FR-001, FR-002, FR-003, FR-005 | [x] `7c4d787` |
| T007 | `status-page.spec.ts` — a status containing `\n` renders with `white-space: pre-wrap` | FR-004 | [x] `7c4d787` |
| T008 | E2E authored in `tests/e2e/status-compose.spec.ts` (two-line status grows the field and the feed shows both lines) — **not run** | FR-001, FR-004 | [x] `7c4d787` — authored, not executed (Playwright pause 2026-09-26) |
| T009 | G2 + closure: build green, full unit suite green (report exact count), checklist + converge, design-map row 7, gap-audit changelog, drift notes | DoD | [x] closure commit — build green, **709/709** |

## Checkpoint

`/status/compose` (text mode): typing a long status makes the centred field grow to at most five
lines and scroll inside; Enter inserts a line break; publishing keeps the breaks, and the feed shows
the status as composed. Photo mode and the on-screen keyboard are unchanged.

## FR → test traceability

- **FR-001** — `compose-page.spec.ts` "renders a real expanding textarea, not a decorative
  placeholder, plus the on-screen keyboard" (tagName `TEXTAREA`, `rows=1`, `data-testid`/`aria-label`
  kept); "starts at one line and grows with the typed content"; "caps the field at five lines, then
  scrolls inside it" (height stays 228px, `overflowY` `hidden` at 5 lines → `auto` past it,
  `scrollHeight > clientHeight`); "clearing the field returns it to one line"; existing "keeps the
  same surface and Close/Send glyphs as text mode" + photo-mode tests (FR rest-state chrome).
- **FR-002** — "newlines typed in the field are preserved through publish" (value keeps `\n`, store
  `myStatus().text` matches, `navigate(['/status'])`); "the on-screen backspace removes a trailing
  line break" covering the `\n`-through-on-screen-keys path.
- **FR-003** — "the on-screen keys grow the field too, since they share the value" (30 × key-a grows
  height); growth itself asserted via the FR-001 tests against the measured one-line value, because
  Chrome rounds `scrollHeight` (46px vs the 45.6px token).
- **FR-004** — `status-page.spec.ts` "renders a status with line breaks as composed (F-053 FR-004)"
  (`textContent` matches with `\n`; computed `white-space` `pre-wrap`).
- **FR-005** — photo-mode tests under "photo mode" assert no field (`omits the keyboard graphic in
  photo mode`); no store/model/token/route change in this feature.
- **E2E (authored, not run)** — `status-compose.spec.ts` "a multi-line status grows the field and the
  feed shows the composed lines".