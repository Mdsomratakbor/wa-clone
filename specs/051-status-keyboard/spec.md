# Feature Specification: WhatsApp On-Screen Status Keyboard (feature 051)

**Feature Branch**: `051-status-keyboard`

**Created**: 2026-10-02

**Status**: In progress — provisional implementation approved by the owner (2026-10-02); G1 capture
still **BLOCKED** until 2026-10-02 18:38 UTC, so the keyboard's styling is PROVISIONAL and carries a
post-capture reconcile task.

**Input**: design row 7 (`0:9634`, Status compose chrome). The compose frame's keyboard band is the
only captured artifact for a keyboard: `status-compose-keyboard.png` (375x291), a crop of the frame
band y521-812.

## Clarifications

### Session 2026-10-02

The owner reported the on-screen keyboard "is not working" and approved building it now.

- Q: The segmented keyboard on the text status composer is a static PNG that does not type. The
  key layout and glyph positions exist in **no captured artifact** (F-050 recorded this and the
  2026-10-01 owner decision was to *wait for the capture* and decline a provisional QWERTY).
  A (**owner**): **build it now, provisoally.** Ship the keyboard as a real, tappable control and
  record what is provisional so the post-capture pass resolves it. This **reverses** the 2026-10-01
  deferral; a drift note is added to the F-050 spec and the F-050 T013 task is superseded.
- Q: How should the keyboard be rendered? Laying invisible tap-targets over the PNG is an
  accessibility hazard (invisible tab stops, focus states over an image that could not be
  pixel-verified this session), and the graphic's precise key geometry is uncaptured.
  A (**owner**): **a real segmented keyboard rendered from the design system tokens**, replacing the
  PNG entirely. Standard QWERTY layout, dark WhatsApp-style keycaps, every rendered key live (no
  decorative placeholders like `123` / globe, which would be inert controls).
- Q: Should the real input stay usable with the OS keyboard too?
  A (**owner**): **keep both** (confirms the F-050 "keep both" decision). The input stays focusable
  and the on-screen keys insert into it.

## Summary

The text composer's keyboard band is a picture of a keyboard. Tapping it changes nothing, so the
screen *looks* finished at the exact control the user interacts with to type — the same defect class
F-046 and F-050 were created to remove, visible on a design-verified screen. Rather than continue to
render a decorative image, F-051 replaces it with a real segmented keyboard: letter keys insert into
the status value, shift toggles case, backspace deletes, space inserts, and a Send key publishes —
mirroring the top Send glyph. The value stays a single source shared with the real input, so typing
via either the OS keyboard or the on-screen keys is reflected in both the field and Send's disabled
state (the F-050 "keep both" decision, now implemented).

The keyboard styling does not exist in any captured artifact (only the band crop does), so the
palette and geometry are PROVISIONAL, rendered from new design-system tokens, and reconciled as a
named task after the Figma gate clears.

## Functional Requirements

- **FR-001** Text compose mode renders a real, segmented keyboard below the input instead of the
  `status-compose-keyboard.png` image. The keyboard is **not** rendered in photo mode (unchanged
  from F-050 FR-003). Every rendered key is a live control; no `123` / globe / emoji keys are
  rendered because they would be inert.
- **FR-002** Tapping a letter key inserts that letter into the status value at the end. When `shift`
  is off the letter is lowercase; when on, uppercase. Tapping a letter after engaging shift applies
  the uppercase for that one letter and then resets shift (one-shot, matching OS keyboard behaviour).
- **FR-003** The Shift key toggles case. Its pressed state is exposed with `aria-pressed`, and its
  label is `Shift`. It becomes a struck-through/toggled visual and does not read as a separate state
  to assistive technology.
- **FR-004** Backspace removes the last character of the status value. When the value is empty it is
  genuinely `disabled` (never a silent no-op).
- **FR-005** Space inserts a single space.
- **FR-006** The keyboard's Send key publishes the current status value through the same store path
  and navigation as the top Send glyph. It is genuinely `disabled` while the trimmed value is blank,
  and it never publishes when disabled.
- **FR-007** The value is a single source: the `Type a status` input and the on-screen keys both
  edit the same `value` signal, so text entered through either is shown in the field and governs
  Send's enabled state identically. No key press clears or reorders the value.
- **FR-008** Keys are real buttons: `type="button"`, stable kebab-case `data-testid`
  (`compose-key-<letter>`, `compose-key-shift`, `compose-key-backspace`, `compose-key-space`,
  `compose-key-send`), `aria-label` on every key, visible focus, keyboard reachability, and contrast
  between key text and keycap.
- **FR-009** The keyboard does not read the wall clock and never touches persistent state or the
  store directly; it only emits typed characters, backspace and send intentions to the page.

## Non-Goals

- **Numbers and symbols layout** (`123`), **globe / language-wheel**, **emoji**, **dictation,
  autocorrect / word suggestions, key press popovers, multi-touch and slides** are not built and are
  not rendered as inert controls.
- **No change to publication semantics**: the store, the models, the clock usage and the navigation
  behaviour of `Send` are untouched. The keyboard emits to the page; the page keeps its existing
  publish path.
- **No change to photo mode** beyond the existing rule that the keyboard is absent there.
- **No new dependency**, no network call, no `getUserMedia`.
- This feature deletes the now-unused runtime PNG `public/status-compose-keyboard.png` (dead asset).
  The golden copy `tests/e2e/golden/status-compose-keyboard.png` is kept as the capture reference.

## Review Gates

- **G1 (BLOCKED - Figma)**: the REST API returned `429` (quota reset **2026-10-02 18:38 UTC**). The
  compose chrome (`0:9634`) reused by this feature is design-verified; **PROVISIONAL**: the keyboard
  palette, key sizes, gaps, radius and send-graph are not in any captured artifact and are rendered
  from new tokens recorded below for the reconcile task.
- **G2**: `npm run build` green and the full unit suite green with the exact count reported.
- **G3**: closure commit, drift note in the F-050 spec (whose non-goal this feature supersedes),
  checklist + converge clean.

## Figma Reference

- Design row 7, Status compose (`0:9634`) — the surface the keyboard sits on, the send glyph reused
  as the keyboard's Send keycap, and the keyboard band crop provenance
  (`status-compose-keyboard.png`, 375x291, band y521-812).
- **No Figma node defines an interactive keyboard.** The band crop is a picture; its key geometry is
  not captured. The keyboard's appearance is therefore PROVISIONAL and the capture task references
  the band crop, not invented node IDs.

## UNKNOWN / NEEDS CLARIFICATION

- Key palette. **Hypothesis (approved provisional)** — the iOS dark keyboard palette modelled on the
  existing `call-field` dark token: band `#17181C`, keycap `#3A3A3C`, special keycap `#2C2C2E`, key
  text `#FFFFFF`. Recorded as tokens so the reconcile has exact values to correct.
- Key geometry. **Hypothesis (approved provisional)** — 44px key height, 6px key gap/no radius,
  letter rows cap at 38px keycap text. The band crop implies a fuller keyboard, but the cropped
  image has no measurable key coordinates.
- Whether Send should live on the keyboard. **Hypothesis (approved)** — yes: the band picture shows a
  send glyph there, and an inert picture would duplicate the F-046 defect class.

## Assumptions

- A segmented alpha keyboard (letters, shift, backspace, space, send) is a sufficient honest minimum:
  it types statuses, and the omitted symbol/globe/emoji surfaces are removed rather than faked.
- The `value` signal is the composition source of truth; both inputs (physical/OS and on-screen)
  write it, and both the field and Send read it.
- Keeping both input sources (F-050 "keep both") is preserved: the on-screen keyboard augments the
  real input, which stays focusable and operable with screen readers and physical keyboards.

## Out of Scope Changes

- `status.store.ts`, `status.model.ts`, `clock` usage, routes, `navigation-bar`, `tab-bar` and all
  other features are untouched.
- Photo mode is untouched (the keyboard is simply not rendered there, as F-050 FR-003 already says).
- `_tokens.scss` gains the keyboard palette tokens in the same change (per the token rule), referenced
  by `status-keyboard.scss`; the compose surface's existing raw pink/white are untouched precedent.

## Implemented (2026-10-02) — recorded, not design-verified

The PROVISIONAL choices that shipped as literal values, so the post-capture reconcile has exact
targets:

- Palette tokens added to `_tokens.scss`: `keyboard-bg: #17181C`, `keycap: #3A3A3C`,
  `keycap-special: #2C2C2E`, `key-text: #FFFFFF`. Styling is a full-width dark band anchored to the
  screen bottom, keys 44px tall with 6px gaps and a 6px radius, key text 18px. Send is a keycap with
  the design's send glyph.
- Sub-copy: Shift `aria-label`/visible "Shift" glyph, Backspace `aria-label` "Delete", Space
  `aria-label` "Space", Send `aria-label` "Send status".
- The runtime PNG is removed from `public/`; the golden copy for the reconcile stays.
- The obsolete inert-graphic unit test is withdrawn; the F-050 FR-001/FR-003 tests that asserted the
  PNG are updated to assert the keyboard component.

## Validation Targets

### Unit

- `StatusKeyboard`: renders the 26 letters + Shift + Backspace + Space + Send as labelled buttons;
  tapping a letter emits it in the correct case for shift state; shift is one-shot; backspace emits
  and is disabled when the value is empty; space emits; send emits and is disabled when the trimmed
  value is blank; no key is a silent no-op.
- `ComposePage` text mode: the on-screen keyboard and the field share one value — typing a key
  updates the field, typing in the field updates what the keys' disabled states see; the keyboard's
  Send publishes and navigates exactly as the top glyph; the keyboard is present in text mode and
  absent in photo mode.

### E2E (authored, not run)

- `tests/e2e/status-compose.spec.ts` — tap a letter key, the field shows it, Send publishes.

## Definition of Done

- [ ] Every FR is covered by at least one named unit test
- [ ] Text mode renders a working segmented keyboard; every rendered key is live (FR-001, FR-008)
- [ ] Letters, shift (one-shot), backspace, space and send behave per FR-002…FR-006
- [ ] Field and on-screen keys edit one value: entry via either is reflected in the other's output
      (FR-007)
- [ ] The runtime keyboard PNG is removed; no dead CSS or dead asset remains
- [ ] No wall-clock read, no persistent-state write, no new dependency (FR-009)
- [ ] The blocked G1 gate and every provisional value are recorded for the post-capture reconcile
- [ ] Drift note added to the F-050 spec (non-goal superseded by owner reversal), design-map row 7,
      gap audit
- [ ] `npm run build` green; full unit suite green with the exact count reported
- [ ] Playwright specs authored; execution deferred per the owner directive (2026-09-26)