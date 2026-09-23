# Research: WhatsApp Status — Feed (node `0:8498`)

**Source**: Figma `WhatsApp UI Screens (Community)` file `PcGX72lSWkYIk3pL5V8PS3`, frame
`WhatsApp Status` `0:8498` (375x812, background `#EFEFF4`).

## Layout inventory (from node payloads)

| Zone | Node | y | h | Notes |
| ---- | ---- | - | - | ----- |
| Status bar | `0:8528` Bars / Status Bar / iPhone X | 0 | 44 | shell reuse |
| Navigation Bar | `0:8524` | 0 | 88 | hairline `#A6A6AA` 0.33 bottom; bg `#F6F6F6` |
| — leading `Privacy` | `0:8526` | 54 | 22 | x16, `#007AFF`, 17/400/22 |
| — title `Status` | `0:8527` | 54 | 22 | centred x161.5, `#000`, 17/600/22 |
| — trailing | — | — | — | **none present in this frame** |
| My Status | `0:8500` group | 123 | 76 | bg `#FFFFFF`; hairline top/bottom `rgba(60,60,67,0.29)` |
| — avatar Oval 2 | `0:8515` | 9 | 58 | imageRef `7b517fd1166e1c96bb4d606ab3bc83385540dadb` (photo) |
| — badge Add New Photo | `0:8518` | 47.5 | 20 | 20x20 `#007AFF` circle + white plus, x51 |
| — name My Status | `0:8517` | 17 | 21 | x80, `#000`, 16/600/21 |
| — subtitle Add to my status | `0:8516` | 42 | 16 | x80, `#8E8E93`, 14/400/16 |
| — actions | `0:8501` group | 20 | 36 | x271, 88 wide: camera circle (0-36) + pencil circle (52-88) |
| Tip | `0:8521` | 234 | 43 | bg `#FFFFFF`; hairlines; 35px gap above |
| — tip text | `0:8523` | 14 | 16 | x67, `#8E8E93`, 14/400/16, `No recent updates to show right now.` |
| Tab Bar | `0:8549` group | 729 | 83 | Status active (Tab 1 physical x0); physical order drift |
| Home indicator | `0:8594` | 778 | 34 | shell reuse |

Layout math for implementation:
- Row: content left edge x13 -> horizontal padding-left **13**; avatar 58 -> name at x80 ->
  flex `gap: 9` (13+58+9=80).
- Badge sits INSIDE the avatar's bottom-right corner: avatar x13..71, badge x51..71, y47.5..67.5
  vs avatar y9..67 -> `right:0; bottom:0.5px` on a 58px avatar box.
- Trailing: camera circle right margin (375-359)=**16**, gap `<button>`-to-`<button>` (36+16 gap
  between circle starts, circle size 36) -> `gap:16; margin-right:16`.
- Tip text starts x67 -> `padding-left:67`.

## Glyph inventory (exported from Figma, stored `tests/e2e/golden/`)

- `status-actions.svg` (88x36): two circles `#EDEDFF` (camera glyph `#007AFF`, pencil glyph
  `#007AFF`). Split for inline use: camera button = circle + camera path; note button = circle +
  pencil path, both 36x36 viewBox.
- `status-add-new-photo.svg` (20x20): `#007AFF` disc + white plus — inline badge, `aria-hidden`.
- `status-my-avatar.png` (256x256): own-profile photo; the app renders the initials placeholder
  (Clarification 3), so this is archival only.

## Decisions

1. **Avatar**: initials placeholder via `user-avatar [name]="My Status"` `[size]="58"` — consistent
   with the app's no-photo principle (features 001-005). Photo drift absorbed by golden slack.
2. **Tab physical-order drift**: the frame draws Status first (Tab 1); the app keeps the shared
   feature-001 order (Settings-Chats-Camera-Calls-Status) so Status is active but rightmost.
   Approved (Clarification 5); recorded here and in `design-map.md` drift tracking.
3. **Nav trailing**: none per frame. Reuse `NavigationBar` with `trailing=[]`.
4. **Tip vs empty-state**: the tip is always-present feed chrome (not a reactive "no rows" state),
   so it does not reuse the `empty-state` pattern from features 003/005.
5. **Row separators**: both screen rows use hairline `rgba(60,60,67,0.29)` 0.33 top+bottom, matching
   `call-list-item`/`chat-list-item` separators.
6. **Focus indicator**: reuse the established visible ring (inset `box-shadow` `--wa-accent`) on
   Privacy/camera/note buttons and the row.

## Drift register

| Item | Source | App | Approved |
| ---- | ------ | --- | -------- |
| Own-avatar photo vs initials | Figma | initials chip | Clarification 3 (005 pattern) |
| Washed gray/blue render overlay | all Figma frames 001-005 | clean render | feature 001 |
| Tab physical order (Status first) | `0:8498` tab group | shared 001 order | Clarification 5 |

## Notes

- Frame fills expose no design tokens (styles API empty); values are read from nodes.
- Segmented controls / edit modes do not exist on this screen; no `clear`/`remove`/guard logic.
- Later compose feature `0:9634` (row 7) will attach behavior to the camera/note buttons and
  possibly turn the badge into the compose entry point.
- **Measured 2026-09-23**: golden baseline ratio **0.04 (10565 px)**; shipped threshold **0.09**
  (+0.05 slack). Unit **90/90**, e2e **171/171**. The simple feed screen sits well below the
  ~0.10 band of features 004/005.