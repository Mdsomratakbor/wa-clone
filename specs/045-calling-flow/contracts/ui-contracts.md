# UI Contracts: Calling Flow and In-Call Screen (feature 045)

**Status**: G1 **BLOCKED and not clearable** — neither screen in this feature has a Figma node.
**Directive**: functional over display (2026-09-29). No control in this contract may be
display-only; every one changes real `CallSession` state.

## 1. Design-verified: the entry points

Already rendered by shipped code and cited to real nodes. These are contracts, not hypotheses.

| Control | Source | Node | Contract |
| ------- | ------ | ---- | -------- |
| Calls `+ new call` | design row 4, Calls | `0:10395` | Nav-trailing icon button on the Calls list. Currently inert. |
| Chat header `Call` | design row 2, Chat window | `chat-header.html:75` | Phone glyph, nav-trailing on the chat header. Currently inert, `aria-label="Call, coming soon"`. |
| Chat header `Video call` | design row 2, Chat window | `chat-header.html:63` | Video glyph, nav-trailing. Currently inert, `aria-label="Video call, coming soon"`. |

**Removal of "coming soon" is a required part of this contract.** Those labels tell a screen-reader
user the feature does not exist. Once the control is live, the label names the action and its target
(`Call Martha Craig`, `Video call Martha Craig`).

## 2. PROVISIONAL: the in-call screen

**No node exists.** Not "pending capture" — absent from the file. The quota reset on
**2026-10-02 18:38 UTC** does not change this.

Hypotheses, all modelled on real WhatsApp:

- **Field**: full-bleed dark field (a new token; see §5).
- **Top**: contact avatar (large), contact name, call kind (`Voice call` / `Video call`).
- **Duration**: `mm:ss`, real elapsed time from the injected clock, **zero until the session reaches
  `connected`**, then counting once per second.
- **Controls**: a two-row grid, four controls: `Mute`, `Speaker`, `Video` (all real toggles) and
  `Hang up`, the red circle, visually dominant on its own row.
- **States**: the screen renders the real session state — `dialing` / `ringing` before connection
  (duration reads `00:00`), `connected` with a running duration.
- **No "Simulated call" banner.** An earlier draft specified one; revoked under the functional
  directive because there is no faked result to disclose.

## 3. PROVISIONAL: the contact picker

**No node exists.** Follows the `contacts-page.ts` pattern rather than inventing one: nav with
`Back`, a search field, a list of contacts, empty state when nothing matches. Selecting a contact
starts a voice call.

## 4. Tokens

The in-call screen needs a dark field and a red hangup button. If no existing token covers them they
are added to `src/app/core/tokens/_tokens.scss` in the same change and noted in `plan.md` — this is
the feature's one anticipated token addition. **No raw hex and no ad-hoc spacing in the new SCSS**,
per `AGENTS.md`.

## 5. Accessibility contract

- `Mute` / `Speaker` / `Video` are `aria-pressed` toggles **backed by `CallSession` state**. Under
  G4, a toggle that only changes its own label fails the gate.
- `Hang up` is `aria-label`led and is the only way out; there is no implicit timeout.
- The duration uses **`role="timer"`**, not a live region. `role="status"` implies `aria-live`,
  which would announce a new value every second — the worst available outcome on this screen.
  A test asserts the region carries no `aria-live`.
- Toggles remain `focusable` and never `disabled`: they are live, and a disabled control would be a
  lie in the other direction.

## 6. Data contract

- `CallSession`: the live call state — `contactId`, `contactName`, `avatarRef`, `kind`, `state`,
  `startedAtMs`, `connectedAtMs`, `elapsedMs`, `muted`, `speakerOn`, `videoOn`, `outcome`.
- `CallEntry.outcome?: CallOutcome` — **optional**, normalized at load, so a pre-F-045 `v1` snapshot
  loads intact.
- Snapshot `version` stays `1`; `nextCallSeq` defaults. A `version: 2` bump would discard every
  user's call log to ship an optional field.
- **The session is never persisted** (FR-009).
- Generated ids are `call-<n>`, monotonic, following the `group-<n>` convention in `ChatStore`.
- `direction: 'outgoing'` is reused; a placed call adds no new direction value.
- The log entry is written **at call end**, with the outcome derived from the final state.

## 7. Backend seam (F-046, not this feature)

`CallStore`'s API must stay persistence-agnostic: no method that only makes sense against
localStorage, and a serializable versioned snapshot a port can be swapped beneath. The duplicated
`readStorage`/`writeStorage` try/catch across all three stores is left in place on purpose —
extracting it here would be a cross-store drive-by refactor.
