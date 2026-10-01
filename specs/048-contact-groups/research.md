# Research: Shared Groups (feature 048)

## Gap audit B8

`specs/design-gap-audit.md` lists B8 as the `Groups` row on the Contact info screen being inert.
`figma/design-map.md` row 15 records the same thing: *"`Media, photos and links` opens a per-contact
media grid since F-044 (`Groups` still inert)"*.

## Why F-044 refused this, and why it is now in scope

`044-media-screen` listed the `Groups` row as a non-goal with this rationale:

> B8 needs shared-group membership data the store lacks: the seed's groups carry `participantIds`,
> but nothing declares *shared* groups between two contacts.

That was accurate about the **seed** and slightly pessimistic about the **model**. Two facts
established by inspection settle it:

1. `ChatPreview.participantIds` is the membership record. `createGroup(name, participantIds)`
   (`chat.store.ts:99`) stores it verbatim, and F-040's New Group screen (`new-group-page.ts:59`)
   feeds it the ids of the contacts the user ticked.
2. A shared-group list is therefore a *filter*, not an invention: groups where
   `participantIds` contains the contact's id. No social graph has to be asserted for the
   derivation to be correct.

The remaining half of F-044's concern — that the seed declares no group at all — is real and is
resolved by an owner decision instead (see Clarifications): derive only, seed nothing. The empty
list is then the true state of a fresh install.

## What the seed actually contains

`CHAT_SEED` (`chat-list.seed.ts:4-12`) is nine direct chats, `chat-001`…`chat-009`. No entry sets
`kind`, and `hydrateDefaults` normalises a missing `kind` to `direct`. So on a first run **every**
contact's Groups screen is empty, and the only thing that can populate it is the F-040 New Group
flow at runtime. This is recorded as the intended default, not a defect.

## participant ids are conversation ids

`resolveContactNames()` (`chat.store.ts:205`) maps `participantIds` through a
`Map(c.id -> c.contactName)` built from the conversations array and drops unknown ids. That is only
coherent if the ids are conversation ids of direct chats — which is exactly what the contacts list
yields. It also means a stale id (one whose contact was removed) silently contributes nothing,
matching the existing `?? []` tolerance rather than throwing.

## Broadcasts carry participant ids too

`createBroadcast()` (`chat.store.ts:135-148`) sets `participantIds: [...recipientIds]` and
`kind: 'broadcast'`. A membership filter that only tests `participantIds` would therefore report a
broadcast as a "group". `conversationKind()` (`chat.store.ts:266`) already exists and returns
`'direct'` by default, so the kind test is free. FR-003 exists solely to pin this, and it gets a
dedicated test because a broadcast is not reachable in the running app (F-042 ships
`createBroadcast` without a UI caller) — so nothing else would ever catch a regression.

## Reusable surface

`chat-list-item` (`shared/components/chat-list-item/chat-list-item.ts`) takes a required
`input.required<ChatPreview>()`, has `selectMode`/`checked` inputs and a `selected` output, and
already renders avatar + name + timestamp with the preview text gated on
`prefs.prefs().showPreviews` (F-046 FR-006). Reusing it unchanged gives keyboard reachability and the
show-previews behaviour for free, and satisfies Constitution Art. III.

It does **not** render a member count. Adding one would mean a new variant on a shared component for
a screen with no design source, so it is a non-goal rather than a build item.

## Precedent for a read-only pushed sub-screen

`044-media-screen` shipped `/contact/:id/media` as a pushed, read-only sub-screen built only from
tokens plus `navigation-bar`, with an empty state in a `role="status"` region and `Back` returning to
`/contact/:id`. F-048 is the same shape with one difference: unlike F-044's media tiles — an
observable no-op because no viewer exists in this design — a group row navigates to a chat that
genuinely exists.

## Design availability

`figma/design-map.md` row 15 is Contact Info (`0:9486`), which supplies the `Groups` row's label,
position and chevron. There is no node for a shared-Groups screen anywhere in the 24 frames, so no
node ID is cited and the chrome is PROVISIONAL under the blocked capture gate (reset
**2026-10-02 18:38 UTC**). This does not block the feature — the owner's decision is to ship
provisional chrome rather than leave a designed row inert.

## Risk: the screen looks broken to a user

Nine of nine seeded contacts show an empty state. The mitigation is that the empty state is explicit
and honest copy in a live region, not a blank list, and F-040 makes population one tap away. This is
recorded as a known first-run characteristic in the spec rather than engineered around by seeding
data that would have to be retracted later.