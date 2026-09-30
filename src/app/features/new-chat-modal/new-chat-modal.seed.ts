import { Action } from '../../shared/components/action-sheet/action-sheet.model';

export const NEW_CHAT_ACTIONS: readonly Action[] = [
  { id: 'new-group', label: 'New group' },
  { id: 'new-contact', label: 'New contact' },
  // F-046 FR-002: no community create flow exists. F-009 deferred it as a
  // Non-Goal and F-042 shipped the broadcast list without one, so this row
  // swallowed a tap with the modal left open. Disabled instead.
  { id: 'new-community', label: 'New community', disabled: true },
];