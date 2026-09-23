# Figma Design Analysis — WhatsApp UI (Community)

**File**: `WhatsApp UI Screens (Community)` · key `PcGX72lSWkYIk3pL5V8PS3`
**Canvas**: `WhatsApp` (`0:8102`)
**Analysis date**: 2026-09-23
**Method**: Figma API — `GET /v1/files/{key}/nodes` on canvas and key frames. Values below are extracted from raw node payloads, not guessed.

---

## 6.1 Application Screens

All screens are iPhone-resolution frames (**375 × 812 pt**, `#EFEFF4` background):

| Screen | Node | Purpose |
| ------ | ---- | ------- |
| WhatsApp Chats | `0:8855` | Main chat list (nav bar + list + tab bar + FAB) |
| WhatsApp Chats Edit | `0:8114` | Chats in selection/edit mode |
| WhatsApp Chat | `0:8257` | Conversation view (bubbles, composer, header) |
| WhatsApp Status | `0:8498`, `0:9634` | Status feed / status compose with keyboard |
| WhatsApp Calls | `0:10395` / `0:8597` | Calls list (normal / edit) |
| WhatsApp Starred Messages | `0:8820` | Starred message list |
| WhatsApp Add/Chats Settings/Chat Actions Modals | `0:9072`, `0:9778`, `0:10087` | Bottom action sheets over dimmed overlay |
| WhatsApp Camera | `0:9155` | Camera viewport with controls |
| WhatsApp Settings | `0:9198` | Settings rows |
| WhatsApp Account | `0:9371` | Account info rows |
| WhatsApp Contact Info | `0:9486` | Contact header + action rows |
| WhatsApp Chats Settings / Notifications / Data & Storage | `0:9973`, `0:10758`, `0:10894` | Settings sub-pages |
| WhatsApp Edit Contact | `0:10334` | Contact editing form |
| WhatsApp Edit Profile | `0:10659` | Profile editing form |
| WhatsApp Authorization | `0:11030` | Phone number/keyboard confirmation |
| Cover | `7:257` | Community cover artboard (non-UI) |

## 6.2 User Flows

Flows are implied by screen composition; the annotation layer (`interactions`) contains **no** prototype links, so flows are *inferred*:

1. **Chats → Chat**: tap chat row (`Chats` list) → `Chat` conversation screen.
2. **Chats → New Chat**: tap FAB (`Actions`) → `Add Modal` action sheet.
3. **Chats → Edit**: tap `Edit` → `Chats Edit` (selection mode, per-row actions).
4. **Chat → Message**: type + send in `Send Message` composer.
5. **Tab navigation**: `Settings · Chats · Camera · Calls · Status` tab bar switches top-level screens.
6. **Status → Compose**: status feed → status compose with keyboard.
7. **Calls → Info/Actions**: call row tap → contact/call actions.
8. **Settings → sub-pages**: Account, Chats Settings, Notifications, Data & Storage, Contact Info, Edit Profile.
9. **Authorization**: numeric keyboard form (phone confirmation).

> **Ambiguity**: `interactions` arrays are empty across inspected frames — no user-flow wiring exists in the file. Flows above are hypotheses to confirm with the owner.

## 6.3 UI Components

Reusable patterns observed (repeated n times across screens):

| Component | Observed in | Figma node examples |
| --------- | ----------- | ------------------- |
| Chat list item (avatar, name, preview, time) | Chats ×9, Chats Edit ×8 | `0:8115`, `0:8873` |
| Call list item (avatar, name, time, call icon, video icon) | Calls ×12, Calls Edit ×12 | `0:8598`, `0:10396` |
| Message bubble (text/image, sent/received, time) | Chat ×13 | `0:8260` … `0:8414` |
| Message composer (`Send Message`) | Chat | `0:8452` |
| Navigation bar | every screen | `0:8225`, `0:8995`, `0:9298`, `0:10619` |
| Tab bar (5 items) | Chats, Calls, Status, Settings | `0:8549`, `0:9004`, `0:9301` |
| Status bar (iOS) / Home indicator | every screen | `0:8233`, `0:8254` |
| Action sheet | 3 modals | `0:9075`, `0:9928`, `0:10283` |
| Settings row group | Settings, Account, Notifications, Data&Storage | `0:9207`, `0:9372`, `0:10803` |
| FAB (`Actions`) | Chats, Chats Edit | `0:8229`, `0:8991` |
| Date divider | Chat | `0:8423` |

## 6.4 Design Tokens

The file defines **no** styles or variables (token extraction returned `0` tokens, `sources: extracted 0 / style 0 / variable 0`). The values below are **node-extracted primitives** that should be promoted to CSS custom properties in the app.

### Colors
| Token | Value | Usage |
| ----- | ----- | ----- |
| `--wa-surface` | `#EFEFF4` | Screen background (System Grouped) |
| `--wa-surface-variant` | `#FFFFFF` | Row/surface background (nav bar, bubbles) |
| `--wa-on-surface` | `#000000` | Primary text |
| `--wa-text-secondary` | `#8E8E93` | Chat preview, timestamps, hint text |
| `--wa-text-tertiary` | `#545458` | Inactive tab label |
| `--wa-accent` | `#007AFF` | Interactive: tab active label, nav actions, link text |
| `--wa-date` | `#3C3C43` | Date divider text |
| `--wa-status-time` | `#171717` | Status bar time |
| `--wa-border` | `#A6A6AA` | Hairline separators/edges |

### Typography (SF Pro Text — the design's font family)
| Token | Size | Weight | Line-height | Letter-spacing | Use |
| ----- | ---- | ------ | ----------- | -------------- | --- |
| chat-title | 16 | 600 | 21 | −0.33 | Contact name in rows / nav bar |
| chat-preview | 14 | 400 | 16.71–21 | −0.15 | Message preview, row timestamp |
| nav-title | 17 | 600 | 22 | −0.4 | Screen titles (`Chats`) |
| nav-action | 17 | 400 | 20.29–22 | −0.4 | `Edit`, `Broadcast Lists`, `New Group` |
| message-text | 16 | 400 | 19.09 | −0.3 | Bubble text |
| bubble-time | 11 | 400 | 13.13 | +0.5 | In-bubble timestamp |
| date-divider | 12 | 600 | 14.32 | 0 | Date separators |
| tab-label | 10 | 500 | 11.93 | +0.1 | Tab bar labels |
| status-time | 15 | 600 | 17.9 | −0.3 | Status bar `9:41` |
| hint-text | 12 | 400 | 16 | −0.01 | Contact info hint |
| link-text | 17 | 400 | 20.29 | −0.4 | `Broadcast Lists`, `New Group` (blue) |

### Spacing & Structure
- Screens: 375 wide; content full-height 812.
- Chat rows: fixed row height with avatar + 2-line text block (separator below).
- Bubble density on Chat screen: stack of text/content bubbles with timestamps, date divider `Fri, Jul 26`.
- **Ambiguity**: spacing (gaps, paddings, inset values) is not expressed as auto-layout metadata consistently; exact px gaps must be measured during implementation from specific nodes.

### Effects (shadows / separators)
| Effect | Value |
| ------ | ----- |
| Nav bar bottom hairline | `#A6A6AA`, y offset ±0.33, blur 0 |
| Nav bar shadow | `#3C3C43` alpha 0.29, y 0.33, blur 0 |
| Composer area shadow | `#EEEEF4` y −0.4 + `#626262` alpha 0.20 y 0.4 |

### Component dimensions
| Component | Size |
| --------- | ---- |
| Canvas / frame | 375 × 812 |
| Status bar | ~44 (iPhone X spec) |
| Tab bar | ~49 + home indicator 34 |
| Chat row | ~64–76 (single/2-line preview) |

> Exact component metrics (row heights, avatar sizes, bubble radii) are **not yet measured**; they must be read from the specific node bboxes during each feature's implementation. Do not invent values in specs.

## 6.5 UI States

Present in design data:

- **Default / rest**: all rows and controls as laid out.
- **Active tab**: label/icon rendered in accent `#007AFF` vs `#545458` for inactive (Tab Bar node).
- **Selected — chats edit**: Chats Edit adds per-row actions and selection chrome not present in normal Chats.
- **Date/timestamp states**: `10:10` etc. are static strings; no live-clock behavior defined.

Not defined in the file (recorded as unknown, **not inferred**):
- Hover, focus, pressed, disabled, loading, empty, error, unread-count states.
- Navigation rails / desktop or tablet layouts.

## 6.6 Responsive Behavior

- **Mobile**: all frames are iPhone 375×812 artworks — this is the designed (and only) target.
- **Desktop / Tablet**: no layouts, frames, or constraints for breakpoints exist in the file → **unknown / not designed**.
- **Owner decision (2026-09-23)**: responsive adaptation **is required**. Breakpoints for desktop/tablet must be authored in the feature `plan.md` as **explicit, owner-approved design drift** (no Figma source), traceable to the spec and noted in `design-map.md`. Never implement responsive rules silently.
- Cross-axis behavior: constraints are `SCALE` on frames; no auto-layout stretch rules established.

## Known Limitations

1. No Figma **styles/variables** exist — all tokens are node-extracted; review before treating as authoritative.
2. Variables API returns 403 (token lacks `file_variables:read`). If the owner adds variables, refresh this doc.
3. No prototype `interactions` — user flows inferred.
4. Images in bubbles (e.g., `IMG_0481.png`) are not bundled here; referenced by fill `imageRef` only.
5. Missing states (hover/focus/empty/loading/disabled) — confirm scope with the owner before implementing.
6. **Golden-render artifact (2026-09-23)**: the PNG served by Figma for frame `0:8855`
   (`tests/e2e/golden/0-8855-chats.png`) does NOT reflect node fill tokens. Probes show
   timestamp text `#3C3C43` → rendered `#3E70A7`, preview `#8E8E93` → `#C6C6CC`, white rows →
   `#F6F6F6`, and blue tints in the status/preview areas (`#9AC7FA`, `#B0D5FF`). The render
   carries a washed gray/blue overlay. Node fills are treated as authoritative; the golden is
   used only as a coarse visual-regression guard (`maxDiffPixelRatio 0.25`, see
   `playwright.config.ts`).
7. Avatar photos are not embeddable from `imageRef` hashes; the app renders `#007AFF`
   initials circles (approved avatar-fidelity caveat in `specs/001-chat-list/spec.md`).