# UI Contracts: Camera Capture & Preview (feature 056)

Everything not derivable from the `001` design tokens stays PROVISIONAL until `0:9155` is captured
(expired Figma token → HTTP 403). Testids are hard contract; labels/copy are PROVISIONAL and listed
verbatim in `spec.md` §PROVISIONAL inventory.

## Route / track

| Item | Contract |
| ---- | -------- |
| route | `/camera`, lazy `CameraPage` (features/camera/camera-page) — unchanged (F-012) |
| top-level | inside shared shell; tab bar visible, `camera` active — unchanged (F-012) |
| Close | `router.navigate(['/chats'])` from viewfinder and capture state; never publishes |

## Testids (hard contract)

| Testid | Element | Accessible name (PROVISIONAL) | Notes |
| ------ | ------- | ------------------------------ | ----- |
| `camera-page` | root viewport host | — | unchanged (F-012) |
| `camera-viewfinder` | button (viewport) | "Choose a photo" | opens the picker; contains filler/grid/preview |
| `camera-flash` | button | "Flash" + `aria-pressed` | top-left; toggle, pressed state visible |
| `camera-close` | button | "Close camera" | top-right; unchanged (F-012) |
| `camera-quality` | chip | "HD" | viewfinder state only; decorative chrome, `aria-hidden` |
| `camera-filler` | div | — | provisional gradient surface |
| `camera-grid` | div | — | provisional focus grid |
| `camera-hint` | p | — | "Tap viewfinder to choose a photo" |
| `camera-preview` | img | "Captured photo — to be sent to your status" | capture state only |
| `camera-file` | input[type=file] | labelled by association | accept="image/*"; visually hidden, a11y-reachable, pointer-unreachable (F-050 pattern) |
| `camera-gallery` | button | "Choose from gallery" | bottom-left; opens the picker; shows last captured as thumbnail (session) |
| `camera-shutter` | button | "Take photo" ↔ "Retake" | center; viewfinder → picker, capture → retake |
| `camera-flip` | button | "Switch camera" + `aria-pressed` | bottom-right, viewfinder only |
| `camera-send` | button | "Send to status" | bottom-right, capture only; enabled once a photo is ready |
| `camera-status` | p role="status" | — | live region; announced text = decoding/ready/error |

## Live-region text (PROVISIONAL)

| State | Text |
| ----- | ---- |
| decoding | "Preparing photo…" |
| ready | "Photo ready" |
| non-image | "Could not read that image" |
| store refusal | "This photo is too large to save" |

## Store / clock

- `StatusStore.publishPhoto(dataUrl, Clock.now())` — reused as-is; `text: ''`; monotonic id; refusal
  returns `null` and is announced, never swallowed.
- No wall-clock reads; no network; no `getUserMedia`; no new dependency.

## A11y / keyboard

- All controls focusable with the shared visible-focus ring.
- The live `role="status"` region is present and announces state changes politely.
- Hidden file input stays labelled (see table) so keyboard/screen-reader users can still pick a file.
- Flash/Flip use `aria-pressed`; a true disabled state is never faked (Send is genuinely disabled).

## Responsive (FR-009)

- No horizontal overflow at any breakpoint (pattern 006-011/012). The bottom bar reflows only via
  gaps normalized by the shell; no new breakpoints required.

## Explicit deviation candidates (drift gate G1)

1. Flip/Flash as `aria-pressed` toggles rather than hardware-backed controls.
2. Send destination = user's Status (hypothesis; owner confirm-at-G1).
3. All viewfinder/chrome geometry and copy (PROVISIONAL inventory).