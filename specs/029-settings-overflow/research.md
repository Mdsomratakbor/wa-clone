# Design Research: WhatsApp Settings — overflow sheet navigation
# (feature 029)

**Source**: remaining no-op handlers with existing target screens. Wireable rows: the settings
"..." sheet (`SETTINGS_ACTIONS` = Notifications / Storage / More) points at `/settings/notifications` and
`/settings/data-storage` which already exist (F-017/F-018). No capture dependency.

## Research summary

- `SettingsPage.onSettingsAction(id)` is a no-op today; the sheet stays open on any row select
  (unit test "keeps the sheet open when a row is activated"). The Notifications and Storage
  rows duplicate the same targets as the main Settings list rows, which already route.
- Routing on select requires dismissing first (focus returns to the trigger), then `navigate`,
  matching the add-modal (F-023) pattern. "More" has no screen → keep the open-sheet no-op.

## Canonical artifacts

The plan and the task list that used to live in this file now live in the canonical
Speckit artifacts for this feature:

- `plan.md` - approach, phases, review gates, drift policy
- `tasks.md` - the delivery checklist (this file keeps the research record only)