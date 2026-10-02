# Tasks: On-Screen Status Keyboard (051)

**Feature**: `051-status-keyboard` · **Spec**: [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md)

Playwright remains paused by owner directive (2026-09-26): e2e cases below are **authored, never
executed**.

| Task | Work | FR | Status |
|---|---|---|---|
| T001 | `docs(spec)` — spec/plan/tasks; drift note in `specs/050-photo-status/spec.md` (non-goal superseded), design-map row 7, gap audit changelog | — | [x] `fb7b7c6` (spec/plan/tasks + 050 drift note; row 7 + gap audit at closure) |
| T002 | Add keyboard palette tokens to `_tokens.scss` (`keyboard-bg #17181C`, `keycap #3A3A3C`, `keycap-special #2C2C2E`, `key-text #FFFFFF`) | — | [x] `8c66934` |
| T003 | New `status-keyboard` component (ts/html/scss): rows, shift (one-shot, `aria-pressed`), backspace, space, send; every key a real button; `data-testid`s; no wall-clock/store access | FR-001…FR-009 | [x] `8c66934` |
| T004 | Compose page integration: `[value]` + type/backspace/send wiring into the existing `value` source and `onSend`; keyboard rendered in text mode only; runtime PNG removed from `public/` | FR-001, FR-004, FR-006, FR-007 | [x] `8c66934` |
| T005 | `status-keyboard.spec.ts` — letters emit correct case, one-shot shift, backspace disabled at empty, space, send disabled at blank, labels + testids | FR-002…FR-008 | [x] `21364d8` |
| T006 | `compose-page.spec.ts` — replace the two PNG-keyboard tests: single-source typing (key → field, field → key state), keyboard Send = publish+navigate; keep photo-mode absence test | FR-001, FR-006, FR-007 | [x] `21364d8` |
| T007 | E2E authored in `tests/e2e/status-compose.spec.ts` (tap a key, field shows it, Send publishes) — **not run** | FR-002, FR-006 | [x] `4f32f4d` — authored, not executed (Playwright pause 2026-09-26) |
| T008 | G2 + closure: build green, full unit suite green (report exact count), checklist + converge, reconcile task recorded for the post-capture pass | DoD | [x] closure commit — build green, **701/701** at T002–T007 + **702/702** with F-052 |

## Checkpoint

`/status/compose` (text mode): a dark segmented keyboard sits at the screen bottom; tapping `h`
types an uppercase-`H`-less `h` into the field unless shift is on; `Send` on the keyboard and the top
bar both publish; photo mode shows no keyboard.

## FR → test traceability

- **FR-001** — `status-keyboard.spec.ts` "every rendered key is live: 123/globe/emoji keys do not
  exist"; `compose-page.spec.ts` "omits the keyboard graphic in photo mode, and keeps it in text
  mode".
- **FR-002** — "a letter key emits the lowercase letter when shift is off"; "shift engages once: the
  next letter is uppercase, then shift resets".
- **FR-003** — "shift engages once…"; "shift toggles back off when pressed again".
- **FR-004** — "backspace emits once and is genuinely disabled when the value is empty";
  `compose-page.spec.ts` "the on-screen backspace removes the last typed character".
- **FR-005** — "space emits a space".
- **FR-006** — "send emits and is genuinely disabled while the trimmed value is blank";
  `compose-page.spec.ts` "a blank value leaves the on-screen Send disabled and nothing is published".
- **FR-007** — `compose-page.spec.ts` "the on-screen keys and the field share one value".
- **FR-008** — "renders the 26 letters, shift, backspace, space and send as labelled buttons".
- **FR-009** — no wall-clock/store access by construction; covered by the component emitting only
  (passive `value`, outputs only) exercised in every `StatusKeyboard` spec.
- **E2E (authored, not run)** — `status-compose.spec.ts` "a tapped key types into the field and
  backspace removes it" (FR-002/FR-004), "keyboard Send publishes the status and navigates to the
  feed" (FR-006), "the keyboard holds 26 live letter keys and no decorative sub-keys" (FR-001/FR-008).