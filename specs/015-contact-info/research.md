# Design Research: WhatsApp Contact Info

**Source**: Figma `WhatsApp UI Screens (Community)`, fileKey `PcGX72lSWkYIk3pL5V8PS3`,
node `0:9486` "WhatsApp Contact Info" (design-map row 15).

**Capture status**: **BLOCKED — Figma REST API rate-limited (HTTP 429)**. No node payload for
`0:9486` yet (release ~2026-09-28, re-confirmed 2026-09-24, retry-after ≈ 345k s). No geometry/
content below is confirmed; everything flagged PENDING must come from the node payload.

## Declared identity (certain, from design-map + design-analysis)

| Fact | Value |
| ---- | ----- |
| Frame | `0:9486` — "WhatsApp Contact Info" (row 15) |
| Angular target | `feature/contact-info` (pushed screen at `/contact/:id`) |
| Entry | chat-window header tap (avatar + name) — canonical WhatsApp flow |
| Style of surface | pushed screen (no tab bar), Back → `/chat/:id` |
| Contact data | derived from the chat route id → `CHAT_SEED.contactName` |
| Related | Edit Contact `0:10334` (row 19, later); Contact Info sibling surfaces |

## Hypothesis to verify at capture (NOT design facts)

- Hero block: avatar + name + phone row topology, sizes, colors
- Action row under the hero: Messages (primary) + call/video affordances; labels/glyphs
- Info rows: which rows exist, order, glyphs, dividers (expect Media, Groups, Starred-messages-
  style entries; exact set PENDING)
- Nav treatment (Back + contact name as title?), status bar

## Capture plan (run once 429 clears — ~2026-09-28)

```powershell
npx -y figma-developer-mcp fetch --file-key PcGX72lSWkYIk3pL5V8PS3 --node-id 0:9486 --depth 6 --format json
```

Extract into this file ("Node inventory"): frame dims/fills; hero geometry/text; action row
labels; info rows + glyphs; nav treatment. Same retry window: golden
`tests/e2e/golden/0-9486-contact-info.png` + hero/row glyph SVGs.

## Entry-point analysis (certain)

- `ChatHeader` renders avatar + name/subtitle as static content; chat-window-page back →
  `/chats`. Working tab-order budget on `/chat/:id` is 12 tabs — adding a focusable identity
  button shifts it (swap item: bump to 13).
- Contact identity: `CHAT_SEED` items carry `contactName`; no phone/images (impact: phone row +
  avatar are hypothesis/derived, PENDING capture).

## Decisions (draft — owner-confirm at G1)

- Identity button wraps avatar + name/subtitle → `identity` output → navigate
  `['/contact', <chatId>]`.
- Contact page = pushed surface: `NavigationBar` (Back → `/chat/:id`, title = contact name) +
  hero block + action row (Messages primary) + info rows from seed (`CONTACT_ROWS`), no tab bar.
  All inner actions no-op (messaging/calling/rows are later features or map-external).
- Golden gated on capture (pattern 007-014).

## Drift register

- Hero phone line omitted pre-capture (no real phone data) — PENDING capture adds it.
- Info row list is a hypothesis (expect Media/Groups/Starred entries) — G1 data-swap.
- Action row (Messages/call/video) labels/glyphs provisional.
- Title = contact name on the pushed header (vs "Contact info") — PENDING confirmation.

## Asset manifest (deferred to Figma 429 retry)

| Asset | Source | Status |
| ----- | ------ | ------ |
| `tests/e2e/golden/0-9486-contact-info.png` | node `0:9486` export, native | **pending — Figma 429 (~09-28)** |
| hero/action/row glyph SVGs | per-node icons | **pending — Figma 429 (~09-28)** |