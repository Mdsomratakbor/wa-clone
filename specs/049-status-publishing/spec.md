# Feature Specification: WhatsApp Status Publishing (feature 049)

**Feature Branch**: `049-status-publishing`

**Created**: 2026-10-01

**Status**: **Specified** (clarifications resolved; G1 capture still BLOCKED — see Review Gates)

**Input**: design row 6 (`0:8498`, Status feed) + design row 7 (`0:9634`, Status compose)

## Clarifications

### Session 2026-10-01

The owner answered three scope questions directly.

- Q: The design's compose screen shows a **segmented custom on-screen keyboard**, shipped here as
  a static PNG, and the text area is a decorative `<p>` with a fake caret. There is no input at
  all, so nothing can be typed. How does text get entered?
  A (**owner**): **a real input with the OS keyboard.** The segmented keyboard's key layout, glyph
  positions and special keys exist in no captured artifact, so making the PNG type would mean
  inventing the design. The real input publishes real text; the keyboard graphic stays the
  provisional image it already is.
- Q: What should Send-alt do? Its real behaviour is a contact picker that sends to chosen people.
  A (**owner**): **disable it and record why.** That is messaging, so it belongs in the backend
  list. F-046's honesty rule applies: a real `disabled` button with an accessible explanation, not
  a silent no-op and not a fabricated per-recipient status.
- Q: What should the feed render? A (**owner**): **only the status this app's user publishes.** The
  "No recent updates" tip stays for everyone else, exactly as today. Seeding other people's
  statuses would invent the social graph — the same line F-044 drew and F-048 respected.

## Summary

The Status feed's `Send` and `Send-alt` glyphs have been inert since F-007, and the gap audit has
listed publishing a status as open ever since. F-049 makes `Send` real: the compose screen gains a
single-line input, publishing writes a status through a new `StatusStore`, and the feed renders it.

Unlike F-048, **both screens this feature touches are design-verified**: the feed is `0:8498` and
the compose surface is `0:9634`. What is *not* design-verified is the post-publish state — the
design only shows the empty feed — so the published-status presentation is PROVISIONAL under a
blocked capture gate.

`StatusStore` is the first store created since F-047, so it follows the port pattern established
there: a mandatory `PersistencePort` constructor dependency, a versioned key, a monotonic id
counter persisted in the snapshot, and a `hydrate()` that refuses a corrupt or foreign snapshot.

## Functional Requirements

- **FR-001** The compose screen exposes a real single-line text input, labelled by the placeholder
  `Type a status`, replacing the decorative `<p>` and its fake caret. A real caret is rendered by
  the input itself, so the fake one is removed.
- **FR-002** `Send` is enabled only when the trimmed text is non-empty. Otherwise the button carries
  the `disabled` attribute — a genuinely disabled control, not a click-through no-op.
- **FR-003** `Send` publishes the **trimmed** text and then navigates to `/status`. Trailing and
  leading whitespace never reaches the store.
- **FR-004** `StatusStore.publish(text, nowMs)` refuses blank or whitespace-only text: it returns
  `null`, creates no entry, and writes nothing.
- **FR-005** The store holds **at most one** `myStatus` entry of shape
  `{ id, text, createdAtMs }`. Publishing again replaces the previous entry rather than stacking.
- **FR-006** `myStatus` is persisted under the versioned key `wa.status-store.v1` and restored on
  reload. `hydrate()` ignores a snapshot whose `version` is not 1, whose `myStatus` is malformed, or
  whose JSON does not parse — and leaves the store at its empty default rather than throwing.
- **FR-007** Status ids are monotonic `status-<n>` from a counter carried in the snapshot, so a
  reload cannot reissue an id that already exists.
- **FR-008** `Send-alt` is honestly disabled, with a visually hidden explanation referenced by
  `aria-describedby` saying it is unavailable because sending to chosen contacts is not part of
  this app. Activating it must do nothing and must not navigate.
- **FR-009** The feed renders the published status text in a `role="status"` region. The
  "No recent updates to show right now." tip renders **only** when there is no published status.
- **FR-010** The `My Status` row subtitle reads `Add to my status` when nothing is published, and the
  published text when something is.
- **FR-011** Status text is rendered through Angular interpolation only. `bypassSecurityTrustHtml`
  is never used, and a text containing markup renders as that literal text.
- **FR-012** No wall-clock read in the store or in any render path. The page obtains the time from
  the injected `Clock` and passes it to `publish()`.
- **FR-013** Nothing new is persisted for the feed's empty case: with no status, the store writes no
  snapshot on load and the tip is driven purely by the empty signal.

## Non-Goals

- **`Send-alt`'s contact picker.** Sending a status to chosen contacts is messaging, so it belongs
  in the backend list. Disabled, with the reason recorded, per the 2026-10-01 clarification.
- **Making the segmented keyboard type.** The design's key layout, glyph geometry and special keys
  are in no captured artifact; reproducing them would be invented design. The PNG stays a
  provisional image and the OS keyboard does the typing.
- **Multiple simultaneous statuses.** The design has exactly one `My Status` row, so the store holds
  one entry and a second publish replaces the first. Stacking is a social concept with no source
  here, and a retained list nobody renders is dead data.
- **Other people's statuses.** No social graph is invented, per the 2026-10-01 clarification.
- **Timestamps or relative-time labels** on a published status. The format is unsourced; showing a
  text with no time is honest, where an invented "2 min ago" would not be.
- **Photo and video statuses.** The camera pipeline is separately BLOCKED in F-046's disposition
  (`getUserMedia` unavailable), and the design's photo variant has no data source.
- **Editing or deleting a published status**, and any status privacy setting.

## Review Gates

- **G1 (BLOCKED - Figma)**: the Figma REST API returned `429` (`Retry after 375849s`, quota reset
  **2026-10-02 18:38 UTC**) on 2026-09-28. The **feed** (`0:8498`) and the **compose surface**
  (`0:9634`) are design-verified. **PROVISIONAL**: the post-publish feed presentation, the `My
  Status` subtitle once a status exists, the keyboard graphic, and the absence of a timestamp are
  not in the design. Capture tasks stay open in `tasks.md`.
- **G2**: `npm run build` green and the full unit suite green with the exact count reported.
- **G3**: closure commit, drift notes in every superseded spec, checklist + converge clean.

## Figma Reference

- Design row 6, Status feed (`0:8498`) — the `My Status` row, the camera/note circles, and the
  "No recent updates" empty tip, all already implemented by F-006/F-035.
- Design row 7, Status compose (`0:9634`) — the full-bleed surface, the Close / Type / Send glyphs,
  the `Type a status` copy, and the keyboard graphic, all already implemented by F-007.
- **No Figma node shows a published status.** The design only contains the empty state, so the
  post-publish presentation cites no node and none is invented.

## UNKNOWN / NEEDS CLARIFICATION

- Whether a real input may replace the design's segmented keyboard. **Hypothesis** - yes, per the
  2026-10-01 clarification. The alternative is a screen where nothing can be typed.
- Post-publish presentation of the status text. **Hypothesis** - the text in a `role="status"`
  region where the tip sits, using existing tokens. No captured variant exists.
- Whether the published text should be truncated in the `My Status` subtitle, as real WhatsApp
  truncates long statuses. **Hypothesis** - no truncation, because a truncation rule is unsourced
  and a truncated status is a status the user cannot read in full.
- Whether the keyboard graphic should stay visible once the OS keyboard is up. **Hypothesis** - it
  stays, so the screen keeps the design's look; the two overlapping is a capture-gated cosmetic
  issue, recorded rather than designed around.

## Assumptions

- A status is text the app's user published, with no recipient. It is not a message, and it is not
  delivered to anyone in this build.
- `Clock` (F-045) is the single source of "now", so tests inject or stub time rather than reading
  the wall clock.
- The empty tip's copy is unchanged, so the status-page suite keeps asserting the exact string it
  asserts today.

## Out of Scope Changes

- No edits to `status-page.scss`, `compose-page.scss`, `navigation-bar`, `tab-bar` or
  `user-avatar`. The existing `.compose__placeholder` token styling is reused on the input.
- `status-page.html` changes only inside the feed body: the tip becomes conditional and the status
  text is added beside it. The `My Status` row, its badge, its circles and the tab bar are untouched.
- `compose-page.html` changes only inside `.compose__type` (the decorative `<p>` and fake caret
  become an input) and the `Send-alt` button's `disabled` state.
- `PersistencePort`, `LocalStorageAdapter` and `InMemoryPersistencePort` are unchanged — the port
  seam from F-047 already covers this store.
- No change to `chat.store.ts`, `call.store.ts` or `prefs.store.ts`.

## Validation Targets

### Unit

- `StatusStore`: publishes a trimmed entry with the injected time; refuses blank and whitespace-only
  text without creating or persisting; a second publish replaces rather than stacks; ids are
  monotonic and survive a reload without collision; a persisted status is restored on reload; a
  snapshot with a wrong version, a missing key, malformed `myStatus` or unparseable JSON is ignored
  and leaves the store empty without throwing.
- `ComposePage`: renders a real input with the `Type a status` placeholder and no fake caret; `Send`
  is disabled while the text is blank and enabled once it is not; `Send` publishes the trimmed text
  and navigates to `/status`; `Send-alt` is disabled and neither clicking nor keyboard activation
  navigates or publishes.
- `StatusPage`: the tip shows when nothing is published; the published text replaces the tip in a
  `role="status"` region; the `My Status` subtitle is `Add to my status` when empty and the
  published text when not; a status containing markup renders as literal text.

### E2E (authored, not run)

- `tests/e2e/status-compose.spec.ts` — open the composer, type, `Send`, land on the feed with the
  text visible; `Send` disabled with an empty box; `Send-alt` disabled; reload keeps the status.

## Definition of Done

- [ ] Every FR is covered by at least one named unit test
- [ ] `Send` publishes trimmed, real text and nothing else is persisted (FR-003, FR-004, FR-013)
- [ ] Blank input yields a genuinely disabled button, not a click-through (FR-002)
- [ ] `Send-alt` is disabled with an accessible reason and tested (FR-008)
- [ ] Hydration refuses a corrupt, foreign-version or malformed snapshot without throwing (FR-006)
- [ ] Ids are monotonic and reload-safe (FR-007)
- [ ] The feed renders the status as text via interpolation only (FR-011)
- [ ] No wall-clock read outside `Clock` (FR-012)
- [ ] The blocked G1 gate is recorded, not skipped, and the two verified screens are distinguished
      from the provisional post-publish presentation
- [ ] Drift notes are added to specs 006, 007, 035, the gap audit, and `figma/design-map.md` rows 6
      and 7
- [ ] `npm run build` green; full unit suite green with the exact count reported
- [ ] Playwright spec authored; execution deferred per the owner directive (2026-09-26)