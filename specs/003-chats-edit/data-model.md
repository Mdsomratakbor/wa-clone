# Data Model & Geometry — Feature 003: Chats Edit

Source of truth: Figma node `0:8114` (375×812), simplified JSON via `FIGMA_GET_FILE_JSON`.

## Frame composition (top → bottom by `y`)

| Node | Name | Position (local) | Height | Fill / Effect | Note |
| ---- | ---- | ---------------- | ------ | ------------- | ---- |
| `0:8233` | Bars / Status Bar / iPhone X | y=0 | 44 | `#171717` time | reused from shell |
| `0:8228` | `Done` (TEXT) | x16, y54 | 22 | `#007AFF` `fill19` | trailing nav action (001 swaps Edit) |
| `0:8227` | `Chats` (TEXT) | x16, y91 | 41 | `#000000` `fill4` | nav title |
| `0:8229` | Actions row | y140 | 44 | `#FFFFFF` | `Broadcast Lists` x16 / `New Group` x272, `#C7C7CC` |
| `0:8115…0:8200` | Chat rows ×8 | y=248… (74 ea) | 74 | `#FFFFFF` | identical to base list |
| `0:8213…0:8219` | Seperator lines | x118, w296 | 1 | stroke `#3C3C43` 0.33px | between every row; `0:8212` inside bar |
| `0:8220` | Chat Actions | y=47 from bottom | 83 | `#F6F6F6` + `effect1` | visible band 49px (Research D6) |
| `0:8254` | Home Indicator | bottom 34 | 34 | — | overlays bar's lower 34px |

## Chat row (edit mode) — per row

Every row (`Chat` frame, e.g. `0:8115`, 375×74) adds one `Select Icon`:

| Element | Local x | Size | Spec |
| ------- | ------- | ---- | ---- |
| Select ring | 16 | 21×21 | stroke `#3C3C43` 1.5px @ 42% opacity (idle); selected → solid `#007AFF` + white check (Clarification 2) |
| Avatar | 55 | 52 | image (001 uses `UserAvatar` 48px — carried drift) |
| Name | 119 | 21 (16px/600) | `#000000` |
| Preview / time | 119 right | 17 (14px) | `#8E8E93` |
| Read group | 120 | 17 | `#3497F9` (NOT implemented in 001 — out of scope, Read All no-op) |

Rows reused verbatim from the base list; edit mode only adds the leading circle (`padding-left: 16px → 55px`, circle absolute in gutter).

## Chat Actions bar

| Element | Local x | Size | Spec |
| ------- | ------- | ---- | ---- |
| `Archive` | 16 | 20px text | `#C7C7CC` disabled / `#007AFF` enabled |
| `Read All` | 159.5 (centred) | 20px text | `#C7C7CC` / `#007AFF` |
| `Delete` | 309 | 20px text | `#C7C7CC` / `#FF3B30` |

Bar: 375 wide, `#F6F6F6`, hairline top shadow (`0 -0.33px 0 #A6A6AA`), visible `49px` (below it the shell's `HomeIndicator`).

## In-memory state (page-owned)

```ts
type TabKey = ...;        // unchanged (001)
interface ChatPreview { id; contactName; preview; timestamp; avatarRef }  // unchanged (001)
// ChatsPage:
editing    = signal(false)
selected   = signal<Set<string>>(new Set())
items      = signal<ChatPreview[]>([...CHAT_SEED])   // working copy for Delete/Archive
```

## Node → requirement trace

| Requirement | Primary nodes |
| ----------- | ------------- |
| Edit ↔ Done nav | `0:8228` (`Done`), `0:8227` (`Chats`) |
| Selection circles | `0:8125`, `0:8139`, `0:8147`, `0:8162`, `0:8174`, `0:8186`, `0:8198`, `0:8210` (`Select Icon`) |
| Chat Actions bar | `0:8220` + labels `0:8222` (Archive), `0:8224` (Read All), `0:8223` (Delete) |
| Rows & separators | `0:8115`…`0:8200`; `0:8212`–`0:8219` |
| FAB / tab bar hidden | absent from frame child list under `0:8114` (normal-mode only)