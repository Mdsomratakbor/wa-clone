# UI Contracts: Calling Flow and In-Call Screen (feature 045)

**Status**: G1 **BLOCKED and not clearable** — neither screen in this feature has a Figma node.

## 1. Design-verified: the entry points

These are already rendered by shipped code and are cited to real nodes. They are contracts, not
hypotheses.

| Control | Source | Node | Contract |
| ------- | ------ | ---- | -------- |
| Calls `+ new call` | design row 4, Calls | `0:10395` | Nav-trailing icon button on the Calls list. Currently inert. |
| Chat header `Call` | design row 2, Chat window | `chat-header.html:75` | Phone glyph, nav-trailing on the chat header. Currently inert, `aria-label="Call, coming soon"`. |
| Chat header `Video call` | design row 2, Chat window | `chat-header.html:63` | Video glyph, nav-trailing. Currently inert, `aria-label="Video call, coming soon"`. |

**Removal of "coming soon" is a required part of this contract.** Those labels are a design
confession in the accessibility tree: they tell a screen-reader user the feature does not exist.
Once the control is live, the label names the action and its target.

## 2. PROVISIONAL: the in-call screen

**No node exists.** Not "pending capture" — absent from the file. The quota reset on
**2026-10-02 18:38 UTC** does not change this.

Hypotheses, all modelled on real WhatsApp:

- **Field**: full-bleed dark field (a new token; see §4).
- **Top**: contact avatar (large), contact name, call kind (`Voice call` / `Video call`).
- **Duration**: `mm:ss` beneath the name, driven by the injected clock. Real WhatsApp starts it at
  0 on connect; so does this.
- **Controls**: a two-row grid, four controls. `Mute`, `Speaker`, `Video` (toggle, labelled
  unavailable — there is no stream), and `Hang up`, which is the red circle, visually dominant, on
  its own row.
- **Disclosure**: a small line reading `Simulated call`. Copy is a hypothesis; its **presence** is
  not optional (FR-004, Non-Goals).

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

- `Mute` / `Speaker` / `Video` are `aria-pressed` toggles. A toggle that changes nothing is still
  required to report its state honestly.
- `Hang up` is `aria-label`led and is the only way out; there is no implicit timeout.
- The video affordance is labelled **unavailable**, not presented as working.
- The duration uses **`role="timer"`**, not a live region. `role="status"` implies `aria-live`, which
  would announce a new value every second — the single worst accessibility outcome available to this
  screen. `role="timer"` is the correct semantic for content that updates on a timer.
- The disclosure is readable text, not a `title` attribute or an icon.

## 6. Data contract

- `CallEntry.outcome?: CallOutcome` — **optional**, normalized at load, so a pre-F-045 `v1` snapshot
  loads intact.
- Snapshot `version` stays `1`; `nextCallSeq` defaults. A `version: 2` bump would discard every
  user's call log to ship an optional field.
- Generated ids are `call-<n>`, monotonic, following the `group-<n>` convention in `ChatStore`.
- `direction: 'outgoing'` is reused; a placed call adds no new direction value.
