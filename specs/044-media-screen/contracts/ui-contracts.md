# UI Contract: Media, Photos and Links (feature 044)

**Status**: PARTIALLY PROVISIONAL. The **entry row** is design-verified via Contact Info `0:9486`
(already shipped by F-015). The **media screen itself** is PROVISIONAL — G1 blocked (Figma `429`,
reset 2026-10-02 18:38 UTC), and no media grid frame exists among the file's 24 screens.

## Entry (design-verified)

| Property | Value | Source |
|----------|-------|--------|
| Row label | `Media, photos and links` | `0:9486` via F-015 `CONTACT_ROWS` |
| Row id | `contact-media` | `contact-info.seed.ts` |
| Row affordance | chevron, whole row a button | `contact-page.html` |
| Test hook | `contact-row` (with `aria-label` = row label) | existing |
| Reachability | direct contacts only — groups render a participant list instead | `contact-page.html` |

## Screen (provisional)

| Property | Hypothesis | Note |
|----------|------------|------|
| Nav title | the contact's live name | matches `ContactPage.name()`, so renames show through |
| Leading action | `Back`, `icon: 'back'` | as `starred-page.ts` and `broadcasts-page.ts` |
| Columns per row | 3 | conventional mobile grid, no source |
| Tile aspect | square (`aspect-ratio: 1`) | no source |
| Tile content | file glyph + `filename.ext` text | text so a grid of identical glyphs is still readable |
| Empty state | `No media`, `role="status"` | real WhatsApp wording unconfirmed |
| Filter chips | **none** | real WhatsApp segments this screen; omitted rather than invented (Non-Goals) |
| Route | `/contact/:id/media` | `Back` returns to `/contact/:id` |

## Grid tokens

Reuse only the tokens that exist in `src/app/core/tokens/_tokens.scss`: `--wa-surface-variant` (tile
background), `--wa-on-surface` (filename), `--wa-text-secondary` (size), `--wa-file-card` (the
existing translucent grey already used by the message file card) and the `--wa-fs-preview` /
`--wa-fs-hint` scale.

There is no spacing scale in the token map — sibling stylesheets use raw px (`padding: 0 24px` in
`archived-page.scss`), so the tile gap follows that existing convention rather than inventing a
token. No raw hex or rgba is added.

## Test hooks

| Hook | Element | Note |
|------|---------|------|
| `media-page` | the screen root | new |
| `media-grid` | the tile list | new, `role="list"` |
| `media-tile` | each tile | new, `role="button"`, `tabindex="0"` |
| `media-empty` | the empty region | new, `role="status"` |
| `contact-row` | the entry row | existing, matched by `aria-label` |

Each tile's `aria-label` is `filename.ext` plus the file size, so a screen reader announces something
distinguishing rather than "button" four times.
