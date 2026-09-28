# Research: WhatsApp Font size (chat text scale)

**Feature**: `041-font-size`  •  **Design row**: 16 (`Chats Settings`, frame `0:9973`)

**Source**: gap audit tier B5 - the `Font size` row is rendered by `/settings/chats` but
`onRowActivate()` is an empty no-op, so a designed control does nothing. The audit ranks B4/B5
next as "visible, persisted, app-wide".

## Captured design evidence

The Figma REST API answered **one** request on 2026-09-28 before returning `429`
(`Retry after 375849s` -> quota reset **2026-10-02 18:38 UTC**). That single payload is the
depth-limited node tree for `0:9973`:

- Frame `0:9973` "WhatsApp Chats Settings", 375 wide, fill `#EFEFF4`, absolute layout.
- Nav bar `0:10011` (88 tall, `#F6F6F6`, 1px top+bottom hairline), leading `Back` at x=9/y=54,
  title text `0:10016` = **"Chats"**, 17px semibold, `#000000`, centred, 22px line height.
- Four `Rows` groups: `0:9974` @y=123 (h=47, one `Row`), `0:9981` @y=205 (h=85, one `Row`),
  `0:9991` @y=313 (h=47, one `Row`), `0:9998` @y=395 (h=141, **three** `Row`s with two
  `Seperator` svgs at y=46.5 / 93.5, x=16, w=359, 1px, `rgba(60,60,67,0.29)`).
- A body text `0:9990` @y=53: "Automatically save photos and videos you receive to your iPhone's
  Camera Roll." - 12px regular, `#636366`, 16px line height - which belongs to the media
  auto-download row, not to a font-size screen.
- Each `Row` is an instance of the shared row template `EL-1683d8f0`; **the row labels were not
  readable** in this payload, so the exact `Font size` label and its neighbours stay UNKNOWN.
- Tab bar (`0:10038`, 5 tabs) and home indicator are part of the phone frame.

Consequences for this feature:

1. The `Font size` **row** on Chats Settings is real, so the entry point is design-verified; the
   label text is not yet.
2. There is **no** font-size screen in the design file - the picker chrome is a hypothesis and is
   labelled PROVISIONAL until the capture gate clears.
3. The four `Rows` groups (1 + 1 + 1 + 3 = 6 rows) do not match the current 5-row seed
   (`CHATS_SETTINGS_ROWS`). That mismatch is a **separate** finding about F-016's provisional
   inventory, recorded in the drift note; it is out of scope for F-041, which only wires one row.

## Decisions and their basis

| Decision | Basis | Confidence |
| -------- | ----- | ---------- |
| Scope = chat text only | owner answer, matches real WhatsApp | clarified |
| Four steps `Small`/`Default`/`Large`/`Extra large` | real WhatsApp set; **no design node** | hypothesis |
| Multipliers 0.85 / 1 / 1.15 / 1.3 | chosen for legibility; **no design node** | hypothesis |
| `radiogroup` of four options | native radio semantics, arrow-key navigation for free | a11y decision |
| No per-row trailing value on Chats Settings | would need a captured row treatment | deferred to G1 |
| No live preview block on the screen | would need captured copy + layout | deferred to G1 |

## Why a scoped scale, not a global token bump

`--wa-fs-preview` and `--wa-fs-chat-title` are shared by ~20 feature stylesheets (settings,
contacts, calls, status, starred, contact-info, auth, new-group, shared list items and the action
sheet). Redefining them in `:root` would rescale every screen and break the clarified
chat-text-only scope. Because the tokens are CSS custom properties, a **descendant scope** works
without touching any consumer stylesheet:

```scss
$wa-font-scale: (small: 0.85, default: 1, large: 1.15, extra-large: 1.3);

@each $step, $factor in $wa-font-scale {
  [data-font-scale='#{$step}'] {
    --wa-font-scale: #{$factor};
    --wa-fs-message: calc(#{map.get($wa-fs, message)} * var(--wa-font-scale));
    /* ...bubble-time, date, preview, chat-title */
  }
}
```

Zero consumer changes; the two chat surfaces only need `[attr.data-font-scale]`. `calc(16px * 1.15)`
is valid CSS, and at `default` the computed value is identical to the captured one, so the default
rendering is unchanged byte-for-byte.

## Storage

`wa.prefs.v1` is a versioned envelope (`{version, prefs, chatSort, profile?}`), currently version 3.
`fontScale` is a sibling of `chatSort` (not a boolean, so it cannot join `PrefsSnapshot`).
Hydration must accept versions 1-4 and default a missing or invalid value, so snapshots written by
F-027 through F-040 keep working - the same additive-defaults rule F-040 used for
`ChatPreview.kind`.

## Risk

- `extra-large` at 375px: bubbles are capped by `--wa-message-max-width: 262px` and chat rows are
  two-line clamped, so the real risk is a horizontal overflow regression - covered by FR-013 and the
  e2e spec (authored only).
- The scale attribute must reach `ArchivedPage` too, or the archived list would render at a
  different size than the main list.
