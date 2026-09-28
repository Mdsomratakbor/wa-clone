# UI Contracts: Font size (feature 041)

**Provisional**: the `/settings/chats/font-size` screen has no Figma node. Every visual below is a
declared hypothesis and must be reconciled at G1 (capture blocked until 2026-10-02 18:38 UTC).

## `FontSizePage` - `/settings/chats/font-size`

| Element | Contract |
| ------- | -------- |
| Nav bar | `title="Font size"`, leading `Back` -> `/settings/chats`, no trailing action, no tab bar |
| Root | `<main class="font-size" data-testid="font-size-page">` |
| Group | `role="radiogroup"`, `aria-label="Font size"`, `data-testid="font-size-options"` |
| Option | `role="radio"`, `[attr.aria-checked]`, `data-testid="font-size-option"`, label text = step label |
| Checked option | `aria-checked="true"` + a visible selected treatment (PROVISIONAL: accent label colour + filled marker) |
| Unchecked option | `aria-checked="false"`, keyboard reachable, visible focus ring |
| Ordering | `Small`, `Default`, `Large`, `Extra large` (top to bottom) |

## Chats Settings row

| Element | Contract |
| ------- | -------- |
| `Font size` row | unchanged visually; activating it navigates to `/settings/chats/font-size` |
| Other rows | unchanged behaviour (F-016) |

## Scaled surfaces

| Element | Contract |
| ------- | -------- |
| `ChatsPage` root | `data-font-scale` = one of `small`/`default`/`large`/`extra-large` |
| `ArchivedPage` root | same, so archived matches the main list |
| `ChatWindowPage` root | same, covering bubbles, bubble timestamps and the date divider |
| Scaled tokens | `--wa-fs-message`, `--wa-fs-bubble-time`, `--wa-fs-date`, `--wa-fs-preview`, `--wa-fs-chat-title` |
| Not scaled | nav bar, tab bar, status bar, settings rows, contacts, calls, status, starred, contact-info, auth, new-group |

## Test hooks

`font-size-page`, `font-size-options`, `font-size-option`, plus the existing
`chats-settings-row` (row index/label lookup) and `chat-list-page` / `chat-window-page` roots for the
scale attribute assertion.
