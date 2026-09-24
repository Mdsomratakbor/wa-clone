import { Action } from '../../shared/components/action-sheet/action-sheet.model';

export const SETTINGS_ACTIONS: readonly Action[] = [
  { id: 'settings-notifications', label: 'Notifications' },
  { id: 'settings-storage', label: 'Storage' },
  { id: 'settings-more', label: 'More' },
];