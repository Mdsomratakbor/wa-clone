# UI Contract: Call Info Sheet (feature 043)

**Status**: PROVISIONAL — G1 blocked (Figma `429`, reset 2026-10-02 18:38 UTC). No node exists for a
call-info sheet in the design file, so every value below is an agent hypothesis except the parts
inherited from the already-implemented Calls list.

## Trigger

The `ⓘ` button on a `CallListItem`, `data-testid="call-info"`, `aria-label="Call info for {name}"`,
rendered only when `editMode()` is false.

## Sheet

Reuses `app-action-sheet` unchanged. Inherited, therefore design-verified via the Add Modal
(`0:9072`) and Chat Actions (`0:10087`) rows:

| Property | Value | Source |
|----------|-------|--------|
| Container | `role="dialog"`, `aria-modal="true"`, `data-testid="action-sheet"` | `action-sheet.html` |
| Backdrop | full-screen dimmed, `data-testid="action-sheet-backdrop"`, `aria-label="Close"` | `action-sheet.html` |
| Row | `data-testid="action-sheet-row"`, one `<button>` per action | `action-sheet.html` |
| Position | bottom sheet over the Calls list, list not resized | `action-sheet.scss` |
| Dismiss | backdrop click, `Escape` | `action-sheet.html` + wrapper `HostListener` |

PROVISIONAL, hypothesis only:

| Property | Hypothesis | Note |
|----------|------------|------|
| Title | none | the Add Modal has no title; the row behind already shows the contact |
| Row order | Message, Voice call, Video call, Delete | real WhatsApp order, unconfirmed |
| Row labels | `Message`, `Voice call`, `Video call`, `Delete` | unconfirmed |
| `Delete` confirm | none | matches `removeCall()` from edit mode |

## Actions

| id | Label | Behaviour | Testable effect |
|----|-------|-----------|-----------------|
| `message` | Message | close, then `openChatFor(call)` → `/chat/:id` | URL is `/chat/<id>`, target chat is read |
| `voice-call` | Voice call | close only | sheet gone, call list unchanged, URL `/calls` |
| `video-call` | Video call | close only | sheet gone, call list unchanged, URL `/calls` |
| `delete` | Delete | close, then `CallStore.removeCall(id)` | row count −1, gone after a reload |

`voice-call` and `video-call` are rendered, focusable and never `disabled`. Their destination is the
in-call screen, which F-043 does not build (FR-006).

## Test hooks

| Hook | Element |
|------|---------|
| `call-info` | the opening `ⓘ` button (existing) |
| `action-sheet` | the sheet (inherited) |
| `action-sheet-row` | each action button (inherited) |
| `action-sheet-title` | sheet title, absent while `title` is empty (inherited) |
| `call-list`, `call-row` | the Calls list and its rows (existing) |
