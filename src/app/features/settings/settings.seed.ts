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

export const CHATS_SETTINGS_ROWS: readonly SettingsRowSeed[] = [
  { id: 'chats-wallpaper', label: 'Wallpaper' },
  { id: 'chats-font-size', label: 'Font size' },
  { id: 'chats-keyboard', label: 'Keyboard' },
  { id: 'chats-enter-sends', label: 'Enter key sends' },
  { id: 'chats-media-visibility', label: 'Media visibility' },
];

export const NOTIFICATIONS_ROWS: readonly SettingsRowSeed[] = [
  { id: 'notifications-sound', label: 'Sound' },
  { id: 'notifications-vibrate', label: 'Vibrate' },
  { id: 'notifications-popup', label: 'Popup notification' },
  { id: 'notifications-light', label: 'Light' },
  { id: 'notifications-previews', label: 'Show previews' },
];

export const DATA_STORAGE_ROWS: readonly SettingsRowSeed[] = [
  { id: 'ds-storage-usage', label: 'Storage usage' },
  { id: 'ds-auto-download', label: 'Media auto-download' },
  { id: 'ds-images', label: 'Images' },
  { id: 'ds-audio', label: 'Audio' },
  { id: 'ds-videos', label: 'Videos' },
  { id: 'ds-documents', label: 'Documents' },
  { id: 'ds-network-usage', label: 'Network usage' },
];