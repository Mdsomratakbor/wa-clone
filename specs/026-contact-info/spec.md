# Feature Specification: WhatsApp Contact Info — live wiring

**Feature Branch**: `026-contact-info`

**Created**: 2026-09-26

**Status**: **In progress — implementing (spec-driven).**

**Input**: `specs/015-contact-info` (row 15, node `0:10334`) + `specs/019-edit-contact`
(row 19) + `ChatStore` (F-022/23/24/25) + `specs/026-contact-info/research.md`

---

## Summary

F-026 makes the Contact Info stack live against `ChatStore`: the contact screen reads the
conversation's identity instead of a static seed, its **Messages** button opens the thread,
**Edit Contact** saves name+phone into the store (reflected in chats list, chat header, starred
entries — and persisted across reloads), and the **Starred messages** row routes to the Starred
list. Row 15/19 non-goals ("messaging loop is a later feature", "persistence is later") are
completed.

## Functional Requirements

- **FR-001** `ChatPreview` gains optional `phone?: string` (no seed values — additive).
- **FR-002** `ChatStore.updateContact(chatId, name, phone?)` sets `contactName` (trimmed;
  blank falls back to the existing name) and `phone`; persisted (`persist()`).
- **FR-003** `ChatStore.contactName(chatId)` / `contactPhone(chatId)` resolve the conversation's
  identity (`'Contact'` / `''` when unknown).
- **FR-004** `ContactPage` name derives from the store; **Messages** → `openConversation` +
  `/chat/<id>`; **Starred messages** row → `/starred-messages`; Media/Groups rows stay no-ops.
- **FR-005** `EditContactPage` prefills Name/Phone from the store, Save → `updateContact` +
  navigate to `/contact/<id>`; blank name keeps the previous name.
- **FR-006** Renames react everywhere they surface: contact page, chats list row, chat window
  header (`store.contact`), starred entries — and survive reload (F-024).

## Non-Goals

- Phone display row on the contact screen (no Figma row — phone is stored, not shown); media /
  groups targets; deleting contacts; avatar changes.

## User Stories

- **US1 (message)**: From a contact screen I tap **Messages** and land in that chat.
- **US2 (edit)**: I edit the contact, **Save**, and the new name/phone stick — in the contact
  screen, the chat list and the chat header — across reloads.
- **US3 (starred)**: The **Starred messages** row opens the Starred list.

## Acceptance Criteria (validation targets)

1. Unit `chat.store.spec.ts` (extend): updateContact sets name/phone + trims + falls back on
   blank + persists; reset clears.
2. Unit `contact-page.spec.ts` (update): store-driven name (+ rename reflection); Messages →
   navigate; Starred row → navigate; Media/Groups still no-ops.
3. Unit `edit-contact-page.spec.ts` (update): prefills from store; Save updates store +
   navigates; blank-name fallback.
4. E2E `tests/e2e/contact-flow.spec.ts` (authored, runs paused): Messages → thread; edit →
   save → reflected in chat header + list + contact page + after reload; starred row route.
5. Build green + unit green (playwright paused).

## Explicit deviations (documented drift)

1. Phone is stored but not shown on the contact screen (map-external; no Figma phone row).
2. Edit screen has no "Done"/keyboard dismissal beyond Save navigation.

## Caveat (deliberately incomplete until G1)

Avatar/hero glyphs unchanged (existing `UserAvatar`); contact rows geometry deferred to capture
(`0:10334`).