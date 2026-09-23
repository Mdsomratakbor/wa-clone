# Feature Specification: WhatsApp Chat — Chat Window

**Feature Branch**: `002-chat-window`

**Created**: 2026-09-23

**Status**: Implemented — all validation targets pass (2026-09-23)

**Input**: Figma design analysis → design-map row 2, node `0:8257`

## Context

The Chat Window is the conversation thread screen. It shows a full-screen wallpaper behind an iOS-style header (contact name + actions), a scrollable message thread, and a bottom composer bar. Each message renders as a rounded bubble — green (`#DCF7C5`) for outgoing messages with blue read ticks, near-white (`#FAFAFA`) for incoming messages — with an inline timestamp and optional file card. A centered date chip (`Fri, Jul 26`) separates the header area from the thread.

This feature reproduces the **static visual and interaction structure** of the design: the thread with exact seeded message content, the contact header with `Back` / avatar / name / subtitle / video·call actions, and the composer (`＋ · input · 🤷 stickers · camera · mic`). No messaging/send logic, persistence, or backend.

## Figma Reference

| Item | Value |
| ---- | ----- |
| Figma file | WhatsApp UI Screens (Community) — `PcGX72lSWkYIk3pL5V8PS3` |
| Page / Canvas | `WhatsApp` (`0:8102`) |
| Frame | `WhatsApp Chat` — `0:8257` (API form) / `0-8257` (URL form) |
| Frame size | 375 × 812 |
| Figma source | [open in Figma](https://www.figma.com/design/PcGX72lSWkYIk3pL5V8PS3/WhatsApp-UI-Screens--Community-?node-id=0-8257&p=f) |

## User Scenarios & Testing

### User Story 1 — Read the conversation thread (Priority: P1)

As a user I can read the full conversation with Martha Craig, seeing each message as a bubble (outgoing green / incoming white), the timestamp, a centered date chip, and file-card bubbles for the four shared images.

**Why this priority**: This is the entire purpose of the screen.

**Independent Test**: Canon be fully tested by rendering the thread and verifying all 13 messages display their exact text, side (left/right), bubble color, timestamp, and file-card content in top→bottom order.

**Acceptance Scenarios**:

1. **Given** the app routes to the chat for `Martha Craig`, **When** the thread renders, **Then** all 13 seeded messages are visible top→bottom: 10 outgoing text, 3 incoming text, 4 file cards, each with the exact Figma string and `hh:mm` timestamp.
2. **Given** a message was sent by me, **When** it renders, **Then** it is right-aligned on `#DCF7C5` with a blue `<Read>` double-tick beside the timestamp.
3. **Given** a message was received, **When** it renders, **Then** it is left-aligned on `#FAFAFA` with no read tick.
4. **Given** a file message, **When** it renders, **Then** it shows a file card (`File` rect + document icon + filename) with a bottom row of `size · ext`, timestamp, and ticks on the bubble background.
5. **Given** a message text is longer than the bubble budget, **When** it renders, **Then** text wraps to a second line and the timestamp drops to a bottom row inside the bubble (taller bubble), never overlapping the text.
6. **Given** the date-chip region, **When** the thread renders, **Then** a centered pill `Fri, Jul 26` (`#DDDDE9` bg, `#3C3C43` text) appears above the first message.

### User Story 2 — Use the chat header (Priority: P2)

As a user I can identify the contact, trigger contact info, and reach back / video-call / call affordances from the header.

**Why this priority**: Chrome shared with every future conversation screen; Back enables returning to the Chats list.

**Independent Test**: Header renders name `Martha Craig`, subtitle `tap here for contact info`, `Back` chevron, avatar, and video/call icons per Figma; `Back` returns to `/chats`.

**Acceptance Scenarios**:

1. **Given** the Chat Window, **When** I inspect the header, **Then** it shows the avatar, `Martha Craig`, `tap here for contact info`, and `Back` / `Video Call` / `Call` icons (`#007AFF`) on `#F6F6F6`.
2. **Given** the header is visible, **When** I activate `Back`, **Then** the app returns to the Chats list (URL row `/chats`).
3. **Given** the video/call subtitles are visible, **When** I focus them, **Then** a visible focus indicator is shown (no routing wired in 002).

### User Story 3 — Use the composer (Priority: P3)

As a user I can see and use the message input bar affordances.

**Why this priority**: Completes the screen; no messaging behaviour in 002.

**Independent Test**: Composer renders `＋`, empty white input with emoji sticker, camera, and mic per Figma; all controls are keyboard-focusable.

**Acceptance Scenarios**:

1. **Given** the Chat Window, **When** I inspect the composer, **Then** it shows `＋ Add`, the empty white input (no placeholder — matches Figma), the emoji `Stickers` control inside the input, and `Camera` / `Record Audio` icons on `#F6F6F6`.
2. **Given** the composer controls, **When** I focus `＋`/camera/mic/emoji or type in the input, **Then** focus affordances are visible; no send/record behaviour runs (out of scope).

### Edge Cases

- Zero messages: the thread area renders only the wallpaper background (no placeholder needed — owner decision pending).
- Very long message text: wraps at word boundaries; an unbroken long word must not overflow the bubble (overflow wrap = break-word; maximum bubble width ~`80%` of the thread, mirroring the design's `262px/375px` ceiling at `0:8414`).
- Wallpaper image: Figma image fill (`imageRef 351acdb5…`) is not embeddable (no render/export scope) — owner decision pending on approximation.
- Avatar image: Figma photo fill (`imageRef fe10b423…`) is not embeddable — reuse `UserAvatar` initials fallback (owner decision pending).
- Row 7 in the Figma layout (`Do you like it?`) has an unusually tall single-line bubble (`50px`); all other single-line bubbles are `34px`. Decided: height is content-driven (see Behaviour), so it renders `34px` — recorded design drift, verified in golden phase.
- Composer visible band renders `46px`, not the Figma `80px`: the frame height includes the `34px` occluded by the sibling `HomeIndicator` (already a separate element in our shell). Header renders its `44px` nav band below the shell status bar, which stays on `#EFEFF4` (unlike Figma's panelled header). Both recorded as shell-context drift, verified in golden phase.

## Clarifications — Decisions Recorded (2026-09-23)

| # | Ambiguity | Decision |
| - | --------- | -------- |
| 1 | Wallpaper background | **Approved**: neutral approximation — solid `#EFEFF4` fills the thread area; header/composer remain `#F6F6F6`. No render export (imageRef non-embeddable) |
| 2 | Header avatar | **Approved**: reuse `UserAvatar` initials fallback — `name="Martha Craig"` → `MC`, 36px. No gradient |
| 3 | Interaction scope | **Approved**: bubbles and video/call icons are focusable no-ops; `Back` navigates to `/chats`; composer `<input>` accepts typed text locally (no send); `＋`/camera/mic/emoji are no-ops |
| 4 | Empty thread | **Approved**: wallpaper-only thread area (header + composer intact) |
| 5 | Typography source | **Established**: simplified Figma JSON omits font metrics → type sizes derived from text-node bounds (message 16px, timestamp 11px, header name 16px, subtitle 14px, date chip 12px) and verified against the golden render, same method as feature 001 |

## Requirements

### Functional Requirements

- **FR-001**: System MUST render a scrollable message thread with a centered date chip `Fri, Jul 26` at the top.
- **FR-002**: Each message MUST render per its Figma node: text and timestamp in the exact seeded order and copy; outgoing `#DCF7C5` right-aligned with blue read ticks; incoming `#FAFAFA` left-aligned without ticks (colors from `fills` tokens).
- **FR-003**: File-card messages MUST render a rounded `File` rect (`rgba(118,118,128,0.12)`), a document icon, the filename (`rgba(0,0,0,0.70)`), and a bottom row `size · ext` (`rgba(0,0,0,0.40)`) beside the timestamp.
- **FR-004**: System MUST render the chat header (`#F6F6F6`, 88px): `Back` chevron, 36px avatar, `Martha Craig`, `tap here for contact info` (`#8E8E93`), `Video Call` and `Call` icons all accent `#007AFF`.
- **FR-005**: System MUST render the composer (`#F6F6F6`, 80px): `＋ Add`, white input with emoji sticker inside, `Camera`, `Record Audio` (all accent `#007AFF`), no placeholder text (matches Figma).
- **FR-006**: System MUST render the wallpaper behind the thread per the owner-approved approximation (Clarification 1), status bar (`9:41`) and home indicator as per the Figma frame.
- **FR-007**: Data MUST be static seed data (no backend, no persistence) replicating the Figma thread copy exactly.
- **FR-008**: Routing — `/chat/:id` renders the Chat Window for the seeded contact; `Back` returns to `/chats`.
- **FR-009**: The UI MUST adapt responsively per the breakpoints in `plan.md` (owner-approved drift: centered ≤480px shell, no horizontal overflow).

### Key Entities

- **Message**: id, sender `outgoing | incoming`, text, time (static string), optional file `{filename, ext, size}`.
- **ChatHeaderAction**: key, label, icon(asset), role (back / info / call).
- **ComposerControl**: key, label, icon(asset) — add / emoji / camera / mic.

## Contract

### Inputs

| Field | Type | Required | Constraints |
| ----- | ---- | -------- | ----------- |
| `messages` | `Message[]` | Yes | Static seed; ordered as rendered |
| `contact` | `Contact` (name, subtitle) | Yes | `Martha Craig` / `tap here for contact info` |
| `contactAvatarRef` | `string \| null` | Optional | Image source; `null` → `UserAvatar` initials fallback |

### Outputs

| Field | Type | Constraints |
| ----- | ---- | ----------- |
| Rendered thread | view | Bubbles ordered top→bottom; wallpaper behind; date chip atop |
| Header | view | `Back` / avatar / name / subtitle / video / call per FR-004 |
| Composer | view | `＋` / input / emoji / camera / mic per FR-005 |
| Route | `/chat/:id` | Renders feature; `Back` → `/chats` |

### Errors

| Condition | Behaviour |
| --------- | --------- |
| `contactAvatarRef` image fails | `UserAvatar` initials fallback |
| Very long message text / word | Wrap + `overflow-wrap: break-word`; max bubble width ~80% of thread |
| `messages` empty | Wallpaper-only thread (Clarification 4) |

## Behaviour

1. **Given** `/chat/chat-006`, **When** the Chat Window loads, **Then** header, date chip, 13-message thread, and composer render per Figma (`0:8257`).
2. **Given** a message with text wider than the bubble budget, **When** rendered, **Then** it wraps and its timestamp moves to a bottom row inside the bubble (e.g. `What is the most popular meal in Japan?` → 2-line `50px` bubble).
3. **Given** an outgoing message, **When** rendered, **Then** right-aligned `#DCF7C5` + `Read` double-tick (`#3497F9`) beside the timestamp.
4. **Given** an incoming message, **When** rendered, **Then** left-aligned `#FAFAFA`, no tick.
5. **Given** keyboard focus, **When** travelling through header actions and composer controls, **Then** a visible focus indicator shows (accessibility default).
6. **Given** the wallpaper approximation (decision pending), **When** the thread renders, **Then** it fills the area between header and composer with no horizontal overflow.

## Constraints

- MUST NOT implement send/messaging, composition logic, voice recording, media handling, real contacts, video/call functionality, backend, auth, or persistence.
- MUST NOT persist thread or scroll state.
- MUST NOT render user content with unsafe HTML (interpolation only; no `bypassSecurityTrustHtml`).
- MUST NOT introduce new UI frameworks/libraries beyond Angular + Angular Material + SCSS.
- MUST NOT hard-code Figma credentials or tokens in the repo.
- MUST keep implementation static & visual-fidelity-focused; bubble/tap/scroll effects follow accessibility and platform defaults since Figma defines none.
- MUST treat wallpaper/avatar approximation and content-driven bubble heights as recorded drift verified in the golden phase.

## Validation Targets

### Unit (Karma/Jasmine)
- `MessageBubble` renders text/time/side/fill/read-tick from input; wraps long text; file variant shows filename, `size · ext`.
- `ChatHeader` renders name, subtitle, back/video/call actions; emits `back`.
- `Composer` renders `＋`/input/emoji/camera/mic; emits no events on 002 interactions (or stays local-only).
- Chat window page renders the seeded thread count/order; avatar falls back to initials; wallpaper class applied.

### E2E / Visual (Playwright)
- Load `/chat/chat-006`, assert header copy, date chip, 13 messages, composer controls, bubble side classes.
- Assert `Back` returns to `/chats`.
- Keyboard-focus flows through header + composer with visible indicators.
- Responsive check at 800px + 1440px: centered shell, `scrollWidth ≤ clientWidth`.
- Screenshot comparison against Figma render of node `0:8257` (375×812 golden).

### Definition of Done
- Spec, plan, tasks approved; clarifications resolved.
- All unit + E2E validation targets pass.
- Playwright visual check recorded (golden vs `0:8257` render; documented drift).
- Design-map `002` row marked implemented.

## Assumptions

- Type metrics derived from text-node bounds (method established in feature 001); verified via golden, not claimed exact.
- Static seed mirrors the Figma thread copy exactly, including timestamps (`17:47` … `11:51` in Figma's on-canvas order, not recomputed).
- Message node `0:8405` renders as a standard single-line bubble (`34px`) — content-driven height, recorded drift.
- Wallpaper/avatar approximations are owner-approved drift (Clarifications 1–2), documented in `research.md`/`design-analysis.md`.