import { Action } from '../../shared/components/action-sheet/action-sheet.model';

export const SETTINGS_ACTIONS: readonly Action[] = [
  { id: 'settings-notifications', label: 'Notifications' },
  { id: 'settings-storage', label: 'Storage' },
  // F-046 FR-003: the overflow destination list does not exist. F-011 deferred
  // it, so this row swallowed a tap with the sheet open. Disabled instead.
  { id: 'settings-more', label: 'More', disabled: true },
];

export interface SettingsProfileSeed {
  name: string;
  subtitle: string;
}

export interface SettingsRowSeed {
  id: string;
  label: string;
  // F-046: a preference with no consumer behind it. Distinct from a chevron row,
  // because a chevron implies "opens a screen" while an unavailable setting is a
  // switch that currently does nothing - and the two need different markup.
  unavailable?: boolean;
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
  // F-046 FR-006: mediaVisibility had a live switch and no consumer. Marked
  // unavailable and the key removed from PrefsStore.
  { id: 'chats-media-visibility', label: 'Media visibility', unavailable: true },
];

export const NOTIFICATIONS_ROWS: readonly SettingsRowSeed[] = [
  // F-046 FR-006: sound, vibrate, popup and light had live switches and no
  // consumer - there is no notification delivery in the app at all. Marked
  // unavailable and the keys removed from PrefsStore. `notifications-previews`
  // is NOT unavailable: it is wired to the chat-list preview (F-046 FR-006).
  { id: 'notifications-sound', label: 'Sound', unavailable: true },
  { id: 'notifications-vibrate', label: 'Vibrate', unavailable: true },
  { id: 'notifications-popup', label: 'Popup notification', unavailable: true },
  { id: 'notifications-light', label: 'Light', unavailable: true },
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