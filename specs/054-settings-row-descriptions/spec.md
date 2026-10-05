# Feature Specification: WhatsApp Settings Row Descriptions

**Feature Branch**: `054-settings-row-descriptions`

**Created**: 2026-10-03

**Status**: ✅ Shipped and closed (2026-10-03) — owner-approved behaviour extension, PROVISIONAL
copy. G2 gate passed: build green + full unit suite **715/715**. The description copy is
**owner-approved but design-unverified**: the Figma capture gate is blocked by an expired OAuth
token (`{"status":403,"err":"Token expired"}`, 2026-10-03), so row 13 (`0:9198`) and rows
14/16/17/18 cannot be fetched until the owner re-authenticates. Every string is recorded literally
in this spec for the post-capture reconcile, and the header stays pinned (owner decision, below).

**Input**: design rows 13 (`0:9198` Settings), 14 (`0:9371` Account), 16 (`0:9973` Chats Settings),
17 (`0:10758` Notifications), 18 (`0:10894` Data & Storage) — the `settings-row` group (`0:9207`,
`0:9200`). No capture is currently available; the description treatment is a hypothesis until G1
clears.

## Clarifications

### Session 2026-10-03

The owner asked to check the Settings design and the app header, and to make the settings "more
informative".

- Q: The app's top bar (the shared `app-navigation-bar`) stays pinned on Settings while the list
  scrolls beneath it. Is that really necessary?
  A (**owner**): **keep it fixed** — it matches WhatsApp and the Figma-designed chrome; the
  Settings screen keeps its title and Back affordance. No code change.
- Q: What does "more informative" mean for the Settings screens?
  A (**owner**): **Descriptions on all settings rows** — a one-line description under each row
  label, WhatsApp-style, on the top-level Settings list **and** the four sub-screen lists (Account,
  Chats Settings, Notifications, Data & Storage).
- Q: The design source cannot be fetched until the expired Figma token is refreshed. Proceed?
  A (**owner**): **proceed now, PROVISIONAL** — the copy is owner-approved, labelled PROVISIONAL
  in this spec, and reconciled after token re-auth.

## Summary

The five Settings screens render rows as bare labels (some with a toggle or chevron) and give the
user zero context about what each setting is or does. F-054 adds a WhatsApp-style one-line
description under every row label across the five screens. The header, routes, toggles,
`unavailable` semantics, tab bar and accessibility contract are unchanged.

## Functional Requirements

- **FR-001** The row model (`SettingsRowSeed`) gains an optional `description: string`. When
  present, a row renders the description as a second line beneath the label, in every row kind a
  settings screen uses: the chevron button row (Settings, Account, Data & Storage, and the Chats
  Settings chevron branch), the live toggle row (Chats Settings, Notifications), and the disabled
  `unavailable` row (Chats Settings, Notifications).
- **FR-002** Every row on all five screens carries owner-approved description copy, listed
  literally in the [Appendix](#appendix-provisional-copy).
- **FR-003** The description uses existing tokens only — `--wa-fs-control` for the size,
  `--wa-text-secondary` for the colour, regular weight, stacked under the label with a 2px gap.
  No token is added. The label keeps its existing type and colour; the right-side control (chevron
  or toggle) stays vertically centred.
- **FR-004** Behaviour is unchanged: `[attr.aria-label]` stays `row.label` (tests pin it), routes
  and `onRowActivate` mapping are untouched, live toggles and `unavailable` rows keep their exact
  semantics, and the pinned app header stays. The description is presentational text inside the
  row; screen-reader users keep the label as the accessible name and hear the description as row
  content.
- **FR-005** The copy is PROVISIONAL: a drift note is added to the five superseded specs
  (013, 014, 016, 017, 018), design-map rows 13/14/16/17/18 record the descriptions, and the
  gap-audit changelog carries an entry. No Figma node ID is invented.

## Non-Goals

- No change to the pinned header (owner decision), no row reordering, no section headers, no icon
  or glyph changes, no new tokens, no store/model/route change.
- No change to the profile header row ("Tap to edit profile" subtitle) or the Font size screen.

## Review Gates

- **G1 (avoid claiming design verification)**: the description treatment and every string are
  owner-approved hypotheses; the capture gate is blocked by the expired token, so nothing here is
  design-verified. Reconcile against row `0:9207`/`0:9200` groups after token re-auth.
- **G2**: `npm run build` green and the full unit suite green with the exact count reported.
  **CLEARED 2026-10-03**: build green, full suite **715/715** (710 baseline + 5 new tests).
- **G3**: closure commit with drift notes in specs 013/014/016/017/018, design-map rows
  13/14/16/17/18, gap-audit changelog, checklist + converge clean. **CLEARED 2026-10-03** — see
  `tasks.md` closure and FR → test traceability.

## UNKNOWN / NEEDS CLARIFICATION

- Whether the real row-13 design shows descriptions or a different informative treatment. Recorded
  hypothesis (owner-approved): a second description line, WhatsApp-style, because the current
  capture cannot be fetched. Reconcile post-token-re-auth.
- Exact copy provenance: most strings mirror real WhatsApp subtitles; `Contacts`, `Keyboard`, and
  the Data & Storage ones are drafted. All are owner-approved and recorded literally.

## Assumptions

- A description line is more useful than section headers for a five- to seven-row phone list and
  matches the real product.
- `aria-label` must keep equalling the label because the existing suites (and the e2e) assert it;
  the description stays visually adjacent text.

## Out of Scope Changes

- `settings.seed.ts` — `SettingsRowSeed.description?`; every row in `SETTINGS_ROWS`,
  `ACCOUNT_ROWS`, `CHATS_SETTINGS_ROWS`, `NOTIFICATIONS_ROWS`, `DATA_STORAGE_ROWS` gains a
  description. No store/route change.
- `settings-page.html/scss`, `account-page.html/scss`, `chats-settings-page.html/scss`,
  `notifications-page.html/scss`, `data-storage-page.html/scss` — the label is wrapped with an
  optional description line in each row branch.
- No change to `_tokens.scss`, `status.*`, routes, or the shared `navigation-bar`.

## Validation Targets

### Unit

- Each of the five pages: every rendered row shows its description beneath the label; switch-row,
  unavailable-row and chevron-row branches all carry it; `aria-label` still equals the label.
- The description is styled with `--wa-fs-control`/`--wa-text-secondary`.

### E2E (authored, not run)

- `tests/e2e/settings.spec.ts`: a Settings row shows its description under the label.

## Definition of Done

- [ ] Every FR is covered by at least one named unit test
- [ ] All five screens render an owner-approved description under every row label (FR-001, FR-002)
- [ ] Description styling uses existing tokens only (FR-003)
- [ ] Routes, toggles, `unavailable` semantics, `aria-label` and the pinned header unchanged (FR-004)
- [ ] Drift notes in 013/014/016/017/018, design-map rows 13/14/16/17/18, gap-audit changelog (FR-005)
- [ ] `npm run build` green; full unit suite green with the exact count reported
- [ ] Playwright specs authored; execution deferred per the owner directive (2026-09-26)

## Drift note (F-059, 2026-10-04) — Chats Settings copy and row set changed

`specs/059-chats-settings-complete/` (owner clarify Q2/Q3, 2026-10-04) altered two rows of this
feature's Chats Settings appendix, all PROVISIONAL pending the G1 reconcile:

- The standalone **`chats-enter-sends` row is removed** (its pref now lives under Keyboard —
  one preference, one switch), so its "Assigns the Enter key…" description moved to the
  **`chats-keyboard`** row.
- **`chats-media-visibility`** is no longer `unavailable` (the pref returned with its consumer)
  and its description is rewritten to **"Show photos and files inside chats"** — the old
  "apps and devices" copy cannot be honoured by this clone and is deliberately superseded.
- All other five screens' copy is unchanged.

FR-001/FR-003 behaviour (description line in every row kind) is untouched and still applies to the
new four-row Chats Settings list. Reconcile both new strings against the real design after token
re-auth.

## Drift note (F-060, 2026-10-04) — Sound and Vibrate descriptions rewritten

`specs/060-notifications-send-feedback/` re-enabled the Notifications **Sound** and **Vibrate**
rows with a real consumer (an outbound send-feedback tone/vibration), so their descriptions are
rewritten — **"Play a tone when you send a message"** / **"Vibrate when you send a message"** — to
describe the behaviour that actually ships. The previous owner-approved strings ("For incoming
messages" / "For incoming messages and calls") described incoming delivery that does not exist and
would have been a lie on a live toggle. `Popup notification` and `Light` keep their copy and stay
`unavailable`. All four strings require reconcile against the captured design (G1 blocked).

## Appendix — PROVISIONAL copy

Literal strings, owner-approved 2026-10-03. Reconcile against the real design after token re-auth.

### Settings (top-level)

| id | label | description |
|---|---|---|
| `account` | Account | Security, two-step verification, change number |
| `chats-settings` | Chats Settings | Theme, wallpapers, font size and chat history |
| `notifications` | Notifications | Message, group and call tones |
| `data-storage` | Data and Storage | Network usage and media auto-download |
| `contacts` | Contacts | View, invite or block contacts |

### Account

| id | label | description |
|---|---|---|
| `security` | Security | Account security options |
| `two-step-verification` | Two-step verification | Additional PIN you can create to further protect your account |
| `change-number` | Change number | Transfer your account information to a new phone number |
| `delete-account` | Delete my account | Delete your account and all of your message history |

### Chats Settings

| id | label | description |
|---|---|---|
| `chats-wallpaper` | Wallpaper | Set a default wallpaper for your chats |
| `chats-font-size` | Font size | Change the text size in chats |
| `chats-keyboard` | Keyboard | **Assigns the Enter key to send messages** *(rewritten by F-059; see drift note)* |
| ~~`chats-enter-sends`~~ | ~~Enter key sends~~ | **removed by F-059** — one pref, one switch (Enter key sends lives under Keyboard) |
| `chats-media-visibility` | Media visibility | **Show photos and files inside chats** *(rewritten by F-059; no longer unavailable)* |

### Notifications

| id | label | description |
|---|---|---|
| `notifications-sound` | Sound | **Play a tone when you send a message** *(rewritten by F-060; no longer unavailable — the send-feedback consumer ships in the same feature)* |
| `notifications-vibrate` | Vibrate | **Vibrate when you send a message** *(rewritten by F-060; no longer unavailable)* |
| `notifications-popup` | Popup notification *(unavailable)* | When your phone is locked |
| `notifications-light` | Light *(unavailable)* | Flash for incoming messages |
| `notifications-previews` | Show previews | Show message text in notifications |

### Data & Storage

| id | label | description |
|---|---|---|
| `ds-storage-usage` | Storage usage | Manage the storage used by chats |
| `ds-auto-download` | Media auto-download | Automatically download media you receive |
| `ds-images` | Images | Save incoming photos to your gallery |
| `ds-audio` | Audio | Save incoming audio to your device |
| `ds-videos` | Videos | Save incoming videos to your device |
| `ds-documents` | Documents | Save incoming documents to your device |
| `ds-network-usage` | Network usage | See network usage by chats |