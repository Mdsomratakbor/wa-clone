# Feature Specification: WhatsApp Chat — mute / unmute

**Feature Branch**: `030-chat-mute`

**Created**: 2026-09-26

**Status**: **In progress — implementing (spec-driven).**

**Input**: `ChatWindowPage` + `ChatActionsModal` (F-010 sheet, `CHAT_ACTIONS` = Mute / Wallpaper /
More) + `ChatStore` + `specs/030-chat-mute/research.md`

---

## Summary

F-030 makes the chat "..." **Mute** row live: tapping it toggles a persisted per-conversation
muted state. The sheet row flips **Mute ↔ Unmute** and the chat header shows a muted bell while
muted. Wallpaper and More stay no-ops.

## Functional Requirements

- **FR-001** `ChatPreview` gains optional `muted?: boolean`; `ChatStore.normalizeChats` seeds
  `muted: false`.
- **FR-002** `ChatStore.isMuted(chatId)` / `toggleMuted(chatId)`; toggled state persisted
  (F-024 snapshot) and cleared by `reset()`.
- **FR-003** `store.contact(chatId)` returns `muted` (F-030 header affordance) via
  `ContactHeader.muted?: boolean`.
- **FR-004** Chat header renders a muted-bell badge (`data-testid="chat-header__muted-bell"`,
  `aria-label="Muted"`) when the conversation is muted.
- **FR-005** Chat actions sheet: Mute row label is `Mute` when unmuted, `Unmute` when muted
  (`muted` input on `ChatActionsModal`).
- **FR-006** Activating Mute/Unmute toggles the store and keeps the sheet open (label reflects
  the new state immediately); Wallpaper/More remain no-ops.
- **FR-007** Mute state survives reload.

## Non-Goals

- Mute sub-menu (8 hours / always); per-target notification muting; muted chat-list row badge
  (golden `0-8855` surface untouched); wallpaper/"More" flows.

## User Stories

- **US1 (mute)**: In a chat I tap "..." → Mute; the row becomes Unmute and a muted bell shows in
  the header; reloading keeps it.
- **US2 (unmute)**: Tapping Unmute restores the plain header and the Mute label.

## Acceptance Criteria (validation targets)

1. Unit `chat.store.spec.ts` (extend): toggleMuted flips, persists across reload, reset clears.
2. Unit `chat-header.spec.ts` (extend): muted bell appears with `{ muted: true }` and not with a
   plain contact.
3. Unit `chat-actions-modal.spec.ts` (new): label Mute/Unmute from the `muted` input; emits id.
4. Unit `chat-window-page.spec.ts` (update): Mute toggles state + label, sheet stays open;
   header bell appears; Wallpaper stays a no-op.
5. E2E `tests/e2e/chat-mute.spec.ts` (authored, runs paused): mute → Unmute + bell; persisted
   across reload; unmute restores.
6. Unit **build green** + full suite green (playwright paused).

## Explicit deviations (documented drift)

1. F-010's "all rows no-ops" is partially superseded: Mute is live; Wallpaper/More stay no-ops
  (drift noted in `specs/010`).
2. Mute is a simple on/off toggle (no duration sub-menu) — declared simplification.

## Caveat (deliberately incomplete until G1)

Bell glyph/metric is provisional (map-external; no Figma mute affordance in `0:8257` chat
capture) — exact treatment deferred to capture when it unblocks.