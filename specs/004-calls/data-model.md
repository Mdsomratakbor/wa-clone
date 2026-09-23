# Data Model & Geometry - Feature 004: Calls

Source of truth: Figma node `0:10395` ("WhatsApp Calls", 375x812), simplified JSON via the local Figma MCP and `figma_get_figma_data`.

## Frame composition (top -> bottom by `y`)

| Node | Name | Position (local) | Height | Fill / Effect | Note |
| ---- | ---- | ---------------- | ------ | ------------- | ---- |
| `0:10635` | Bars / Status Bar / iPhone X | y=0 | 44 | `#171717` time | reused from shell |
| `0:10619` | Navigation Bar | y=0 | 88 | `#FFFFFF` + hairline `#A6A6AA` 0.33 | status-bar region overlays top 44 |
| - `0:10621` | `Edit` (TEXT) | x16, y54 | 22 | `#007AFF` | **leading** action (left) |
| - `0:10622` | `Tabs` (GROUP) | x112, y52 | 151x28 | border `rgba(0,122,255,0.756)` 1px, radius 8 | centred `All | Missed` |
| - - `0:10627` | Tab1 `All` (FRAME) | x0 | 76x28 | bg `#007AFF` radius 8 (rect `0:10628`); text `0:10629` white 13px/500 | active |
| - - `0:10624` | Tab2 `Missed` (FRAME) | x75 | 75x28 | bg none; text `0:10626` `#007AFF` 13px/500 | inactive |
| - `0:10630` | `Call Icon` (IMAGE-SVG) | x335, y54 | 24 | phone-plus, `#007AFF` | trailing `+ new call` |
| `0:10396..0:10558` | Call rows x12 | y=88..704 | 56 ea | `#FFFFFF` | see per-row table |
| `0:10576` | Tab Bar (GROUP) | y=729 | 83 | `#F6F6F6` + hairline top + labels; frame physical order: Status(x0), Calls(x75, active), Camera(x150), Chats(x225), Settings(x300) | **drift**: app keeps 001 order (Clarification 1) |
| `0:10656` | Home Indicator | bottom 34 | 34 | - | shell |

No FAB, no title text on this frame.

## Call row (per-row nodes)

Rows at y = 88 + 56k (k=0..11). Representative children (`row1 = 0:10396`):

| Element | Node | Local x | Size | Spec |
| ------- | ---- | ------- | ---- | ---- |
| Row frame | `0:10396` (… `0:10550`) | - | 375x56 | `#FFFFFF` |
| Avatar | `0:10398` | 16 | 40x40 | photo (in-app: initials) |
| Name | `0:10399` | 68 | 19 (16px/400) | `#000000`; missed -> `#FF3B30` |
| Call glyph | `0:10402` | 67.5 | 15x15 | same template every row, `#8E8E93` |
| Direction label | `0:10400` | 89 | 17 (14px/400) | `outgoing` / `incoming` / `missed` |
| Date | `0:10401` | ~272 (right) | 17 (14px/400) | `#8E8E93`, right-aligned |
| Info button icon | `0:10404` | 337 | 22x22 | `#007AFF` circled "i" |

Row-start ids (Figma order, newest first): `0:10396` (Martin Randolph, outgoing 10/13/19) - `0:10452` (Karen Castillo, outgoing 10/11/19) - `0:10508` (Kieron Dotson, outgoing 10/8/19) - `0:10410` (Karen Castillo, **missed** 9/30/19) - `0:10466` (Zack John, incoming 9/24/19) - `0:10522` (Kieron Dotson, outgoing 9/16/19) - `0:10424` (Kieron Dotson, outgoing 9/15/19) - `0:10480` (Jamie Franco, incoming 9/10/19) - `0:10536` (Martha Craig, incoming 9/6/19) - `0:10438` (Martha Craig, outgoing 9/6/19) - `0:10494` (Maisy Humphrey, outgoing 8/22/19) - `0:10550` (Jamie Franco, **missed** 8/20/19).

Row separators: 0.33px `rgba(60,60,67,0.29)` at every row boundary, inset `x68`, spanning `width 307` (approx. nodes `0:10451` onward).

## Seed (CALL_SEED)

```ts
type CallDirection = 'incoming' | 'outgoing' | 'missed';
interface CallEntry {
  id: string;            // 'call-001' .. 'call-012'
  contactName: string;
  direction: CallDirection;
  date: string;          // '10/13/19' style, as Figma
  avatarRef: string | null;  // null -> UserAvatar initials
}
```

| # | contactName | direction | date |
| - | ----------- | --------- | ---- |
| 1 | Martin Randolph | outgoing | 10/13/19 |
| 2 | Karen Castillo | outgoing | 10/11/19 |
| 3 | Kieron Dotson | outgoing | 10/8/19 |
| 4 | Karen Castillo | missed | 9/30/19 |
| 5 | Zack John | incoming | 9/24/19 |
| 6 | Kieron Dotson | outgoing | 9/16/19 |
| 7 | Kieron Dotson | outgoing | 9/15/19 |
| 8 | Jamie Franco | incoming | 9/10/19 |
| 9 | Martha Craig | incoming | 9/6/19 |
| 10 | Martha Craig | outgoing | 9/6/19 |
| 11 | Maisy Humphrey | outgoing | 8/22/19 |
| 12 | Jamie Franco | missed | 8/20/19 |

Missed rows (`direction === 'missed'`): rows 4 and 12 -> name `#FF3B30`.

## Entity extensions

```ts
// chat.model.ts (shared)
interface NavAction { id: string; label: string; icon?: 'new-call' }  // icon optional
```

## Node -> requirement trace

| Requirement | Primary nodes |
| ----------- | ------------- |
| Nav: Edit leading / segment centre / +call trailing | `0:10621`, `0:10622` (+`0:10627`/`0:10624`), `0:10630` |
| Call rows + missed colour | `0:10396..0:10558`; missed fill `#FF3B30` on `0:10413`, `0:10553` |
| Info button | `0:10404` etc. (`#007AFF` circled "i") |
| Tab bar active Calls | `0:10604` (active) within `0:10576` |
| FAB absent | not in frame child list |
| Chats <-> Calls tab navigation | 001 tab bar (`0:8549`, `0:9004`); new route per design-map row 4 |