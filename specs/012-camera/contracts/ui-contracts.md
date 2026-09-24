# UI Contracts: Camera (feature 012)

Anything not independently derivable from the `001` design tokens is **provisional** until the
`0:9155` node payload is captured (Figma 429 → ~09-28). Testids are hard contract; labels/glyphs
are PENDING.

## Route / track

| Item | Contract |
| ---- | -------- |
| route | `/camera`, lazy `CameraPage` (features/camera/camera-page) |
| top-level screen | inside shared app shell (status bar above, home indicator below), tab bar visible with `camera` active — **PENDING (immersive hypothesis walk-back)** |
| entry | Camera tab on chats/calls/status → `router.navigate(['/camera'])` |

## Screen

| Testid | Element | Accessible name | Notes |
| ------ | ------- | --------------- | ----- |
| `camera-page` | root viewport host | — | dark surface (provisional #000-ish); `data-testid` on the component host |
| `camera-close` | button | "Close camera" | `router.navigate(['/chats'])` |
| `camera-shutter` | button (shutter control) | "Take photo" | control-only this feature (Non-Goal: no capture) |
| `camera-flip` | button | "Switch camera" | control-only |

## Tab bar (same shared component as siblings)

- `settings`: local stub (existing convention — matches chats/calls/status `activeTab` fallback)
- `chats` → `/chats`
- `camera` → no-op (active)
- `calls` → `/calls`
- `status` → `/status`

## Keyboard / a11y

- All controls are focusable; visible focus ring via shared `001` tokens.
- Close as a real, labelled button (not a fake "X").

## Responsive (FR-005)

- No horizontal overflow at any breakpoint (contract pattern 006-011).

## Golden

- `tests/e2e/golden/0-9155-camera.png` (native 1x); threshold = measured baseline + 0.05.

## Explicit deviation candidates (drift gate G1)

1. Tab-bar visibility on the Camera screen (immersive vs shell).
2. Exact control set/labels/glyphs (Close/Shutter/Flip hypothesis).
3. Close destination (`/chats` hypothesis).