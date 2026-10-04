# Research: Account Settings Subtree (feature 057)

## 1. What exists today

- `specs/014-account/` opened `/settings/account` (F-014): hero + four hypothesis rows. F-054 added
  row descriptions; F-046 left all four rows **inert** with a recorded destination
  (`disposition.md` → "Account & privacy screens"). `account-page.ts` `onRowActivate` is a no-op.
- Route table (`app.routes.ts`) has `settings/account` only; no sub-routes.
- No "my phone number" model: `phone` exists only per-contact in the chat model (`chat.store.ts:295`).
  Confirmed by grep for `myNumber|my number|ownNumber|deviceNumber` — zero matches.
- Stores and reset conventions (`persistence.port.ts` read/write/remove; F-047):
  - `ChatStore.reset()` and `PrefsStore.reset()` **remove the key and restore defaults**.
  - `CallStore.clearCalls()` writes an empty snapshot — a deliberate, documented divergence (F-013).
  - `StatusStore` has **no reset** — the one gap to fill with the same remove-key convention.
- Persistence guard rules inherited: `persistence/` line 74 best-effort write; stores refuse
  oversized/malformed payloads and normalize at load (see §3).
- `Toggle` has a `disabled` input (F-046) — native disabled, out of tab order. Notifications-page
  shows the unavailable-row pattern to copy for Security's honestly-disabled toggle.

## 2. Design reality

- Figma gate G1 is **BLOCKED** (expired OAuth token, `{"status":403,"err":"Token expired"}`,
  2026-10-03; authoritative reset marker: `specs/design-gap-audit.md`).
- The design file (community Figma, file key `PcGX72lSWkYIk3pL5V8PS3`) maps **24 screens**; none
  of them is a Security / Two-step / Change number / Delete-account sub-screen. The only Account
  node is `0:9371` (itself uncaptured). So every sub-screen here is chrome with **no node**, the
  same class as F-044 media grid / F-045 in-call / F-048 groups / F-056 camera chrome: all values
  PROVISIONAL, token-only, recorded for the post-re-auth reconcile.
- Copy is drafted from WhatsApp's public, real-world surface (the seed descriptions already model
  it) but every string is PROVISIONAL and explicitly not design-verified.

## 3. Normalization precedents to preserve

- F-042 `hydrateDefaults`: only additive fields filled on load; user flags preserved.
- F-045 `normalizeCalls`: derived defaults; never fake a success.
- F-049/F-050 `StatusStore.normalizeEntry`: junk fields **dropped**, never rendered as
  `undefined`; an empty remnant is null.
- F-057 therefore: `normalizeAccount` keeps `twoStep` only if `pin`/`email` are both strings;
  `deviceNumber` defaults to `''` otherwise. A `removeTwoStep` mismatch leaves state untouched and
  returns `false` — the caller announces.

## 4. Hypotheses needing the owner's confirmation, recorded PROVISIONAL

| Rule | Value | Provenance |
| ---- | ----- | ---------- |
| Two-step PIN | exactly 6 digits | WhatsApp's public rule; PROVISIONAL |
| Recovery email | required, must contain `@` | WhatsApp's public rule; PROVISIONAL |
| Confirmation word | exact uppercase `DELETE` | WhatsApp's public delete flow; PROVISIONAL |
| Phone shape | `/^\+?[0-9\s()-]{7,}$/` after trim, new ≠ current | defensive local validation; PROVISIONAL |

The PIN is stored plainly in local storage: the app has no approved crypto dependency, and the
threat model is a single-user demo clone. This is stated honestly in code comments — it is a local
flag, not security.

## 5. Scope guards

- No new dependencies. No `getUserMedia`. No backend calls. No changes to Account row labels or
  descriptions (F-054 strings verbatim). `/auth` stays a placeholder; `deviceNumber` defaults to
  `''`, never a fake sample number.
- The four screens form a coherent feature (single owner directive) and land as one commit series.