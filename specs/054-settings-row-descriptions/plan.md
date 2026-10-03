# Plan: Settings Row Descriptions (054)

**Feature**: `054-settings-row-descriptions` · **Spec**: [`spec.md`](./spec.md)

## Approach

The five settings screens already share a row seed (`SettingsRowSeed`) and a per-screen HTML
pattern: label + chevron (Settings, Account, Data & Storage, Chats Settings chevron branch) or
label + toggle (Chats Settings, Notifications switch rows). A description is additive:

- `settings.seed.ts` adds `description?: string` and fills it on every row of the five lists.
- Each screen's template wraps the label with an optional description span in **every** row branch
  (chevron, live toggle, and `unavailable` toggle) — shared markup shape per screen, no new
  component (the five screens already duplicate row markup; a shared component is a refactor, not
  this feature).
- Each screen's stylesheet adds a text container (label + description stacked, 2px gap) and a
  description style that uses existing tokens (`--wa-fs-control`, `--wa-text-secondary`), so no
  token map changes.

### Row markup shape (per screen, namespaced per screen block)

```html
<span class="settings__row-text">
  <span class="settings__row-label">{{ row.label }}</span>
  @if (row.description) {
    <span class="settings__row-description">{{ row.description }}</span>
  }
</span>
```

`.settings__row-text` is a column flex (`gap: 2px`, `min-width: 0`, `flex: 1`) so the label line
ellipsizes before the right control; the chevron/toggle keeps `margin-left: auto; flex: 0 0 auto`.

### Why this shape

- The optional field renders nothing when absent, so the four row kinds stay uniform and the
  `aria-label` contract (pinned by tests) is untouched.
- No store/route change; the copy lives in the seed next to the label, and the Spec appendix holds
  the literal strings for the reconcile.
- `--wa-fs-control` is already the settings subtitle size (`settings__subtitle`), so description
  styling is precedent, not invention.

## Review Gates

- **G1 — capture**: **blocked** — the OAuth token expired (`403 Token expired`, 2026-10-03), so
  rows 13/14/16/17/18 cannot be fetched. The copy and treatment are owner-approved PROVISIONAL
  hypotheses recorded in the spec; reconcile after owner re-auth.
- **G2 — build + unit**: `npm run build` green; full `ng test` suite green (exact count) before
  the feat and test commits.
- **G3 — closure**: drift notes in specs 013/014/016/017/018, design-map rows 13/14/16/17/18,
  gap-audit changelog entry, traceability, converge.

## Drift Policy

- The five superseded specs describe rows as bare label + control. Each gains a drift note: rows
  now render an owner-approved second description line (F-054), which their capture-gated geometry
  may or may not confirm.
- New copy values always go through `/speckit.clarify` first; the appendix is amended with the
  answer, never silently.

## Risks

- **Switch-row alignment**: describing a toggle row must not misalign the toggle. `align-items:
  center` on the row + `flex: 0 0 auto` on the toggle keeps it centred regardless of the text block
  growing to two lines.
- **`unavailable` rows**: the description must render inside the existing non-interactive row so
  the "disabled" semantics (no chevron, disabled toggle) stay exactly as F-046 defined them.
- **Test pinning**: suites assert `aria-label` equals the label; templates keep that attribute
  verbatim so no existing expectation changes.