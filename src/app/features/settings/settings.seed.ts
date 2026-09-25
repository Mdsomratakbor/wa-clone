import { Action } from '../../shared/components/action-sheet/action-sheet.model';

export const SETTINGS_ACTIONS: readonly Action[] = [
  { id: 'settings-notifications', label: 'Notifications' },
  { id: 'settings-storage', label: 'Storage' },
  { id: 'settings-more', label: 'More' },
];

export interface SettingsProfileSeed {
  name: string;
  subtitle: string;
}

export interface SettingsRowSeed {
  id: string;
  label: string;
}

export const SETTINGS_PROFILE: SettingsProfileSeed = {
  name: 'Ani',
  subtitle: 'Tap to edit profile',
};

export const SETTINGS_ROWS: readonly SettingsRowSeed[] = [
  { id: 'account', label: 'Account' },
  { id: 'chats-settings', label: 'Chats Settings' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'data-storage', label: 'Data and Storage' },
  { id: 'contacts', label: 'Contacts' },
];

export const ACCOUNT_ROWS: readonly SettingsRowSeed[] = [
  { id: 'security', label: 'Security' },
  { id: 'two-step-verification', label: 'Two-step verification' },
  { id: 'change-number', label: 'Change number' },
  { id: 'delete-account', label: 'Delete my account' },
];