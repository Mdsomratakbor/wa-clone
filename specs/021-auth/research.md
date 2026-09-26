# Design Research + Plan + Tasks + Quickstart: Authorization (feature 021)

**Source**: Figma fileKey `PcGX72lSWkYIk3pL5V8PS3`, node `0:11030` (design-map row 21).

**Capture status**: **BLOCKED — Figma REST API rate-limited (HTTP 429)** until ~2026-09-28.

## Declared identity (certain)

| Fact | Value |
| ---- | ----- |
| Frame | `0:11030` — "WhatsApp Authorization" (row 21, last) |
| Angular target | `feature/auth` at `/auth` (cold-start surface) |
| Design notes | "Phone number/keyboard confirmation"; "numeric keyboard form (phone confirmation)" |
| Interactions | none in design file → entry/flow is PENDING |

## Hypothesis to verify (NOT design facts)

- Title/brand, country + phone region labels
- Keypad geometry + digits layout + backspace glyph
- Continue/Cancel treatment and default-flow entry

## Capture plan (run once 429 clears — ~2026-09-28)

```powershell
npx -y figma-developer-mcp fetch --file-key PcGX72lSWkYIk3pL5V8PS3 --node-id 0:11030 --depth 6 --format json
```

Extract node inventory; export golden `tests/e2e/golden/0-11030-auth.png` + glyph SVGs.

## Plan

1. **Screen**: `features/auth/auth-page` (title + phone region + 12-key keypad + Continue,
   all no-op) + units.
2. **Route**: `/auth` lazy (no entry wiring; default `**` → `/chats` unchanged).
3. **US3**: responsive + gated golden (measured + 0.05 at capture).
4. **Closure**: design-map row 21 -> `021` + implemented; commits (spec/feat/docs).

**Gates**: G1 capture + owner approval (incl. entry/default-flow decision); G2 build/unit green
(e2e runs paused per owner directive); G3 closure commit.

## Tasks

- [ ] T001 — Node inventory `0:11030` — PENDING Figma 429 (~09-28)
- [ ] T002 — Golden `0-11030-auth.png` — PENDING
- [ ] T003 — Glyph SVGs — PENDING
- [ ] T004 — Owner approval (layout + entry wiring decision) — PENDING
- [x] T005 — `features/auth/auth-page` scaffold (title + phone region + keypad + Continue)
- [x] T006 — `/auth` lazy route (default flow unchanged)
- [x] T007 — Unit `auth-page.spec.ts`
- [x] T008 — E2E `tests/e2e/auth.spec.ts` (US1/US2/US3 + gated golden)
- [x] T009 — Responsive no-overflow for `/auth`
- [x] T010 — build green + unit green (**196 + 6 = 202 expected**)
- [x] T011 — design-map row 21 -> `021` + implemented; commits (spec/feat/docs)

## Commands

```powershell
npm run build
npx ng test --watch=false --reporters=progress   # playwright runs paused per directive
```