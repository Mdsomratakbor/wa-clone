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
  // F-054 FR-001: owner-approved one-line context shown under the label on every
  // settings screen. PROVISIONAL copy - design-unverified until the capture token
  // is re-authenticated (see specs/054-settings-row-descriptions).
  description?: string;
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
  { id: 'account', label: 'Account', description: 'Security, two-step verification, change number' },
  { id: 'chats-settings', label: 'Chats Settings', description: 'Theme, wallpapers, font size and chat history' },
  { id: 'notifications', label: 'Notifications', description: 'Message, group and call tones' },
  { id: 'data-storage', label: 'Data and Storage', description: 'Network usage and media auto-download' },
  { id: 'contacts', label: 'Contacts', description: 'View, invite or block contacts' },
];

export const ACCOUNT_ROWS: readonly SettingsRowSeed[] = [
  { id: 'security', label: 'Security', description: 'Account security options' },
  { id: 'two-step-verification', label: 'Two-step verification', description: 'Additional PIN you can create to further protect your account' },
  { id: 'change-number', label: 'Change number', description: 'Transfer your account information to a new phone number' },
  { id: 'delete-account', label: 'Delete my account', description: 'Delete your account and all of your message history' },
];

export const CHATS_SETTINGS_ROWS: readonly SettingsRowSeed[] = [
  { id: 'chats-wallpaper', label: 'Wallpaper', description: 'Set a default wallpaper for your chats' },
  { id: 'chats-font-size', label: 'Font size', description: 'Change the text size in chats' },
  // F-059 FR-004/FR-007: the keyboard screen now hosts the Enter key sends switch;
  // per the clarify pass one preference has exactly one switch, so the standalone
  // enter-sends row below was removed rather than duplicated.
  { id: 'chats-keyboard', label: 'Keyboard', description: "Assigns the Enter key to send messages" },
  // F-046 FR-006: mediaVisibility had a live switch and no consumer, so its key
  // was removed and the row marked unavailable. F-059 FR-008/FR-009 returns the
  // key WITH an in-bubble masking consumer (MessageBubble), so the row is live
  // again and the F-054 copy below is a PROVISIONAL rewrite.
  { id: 'chats-media-visibility', label: 'Media visibility', description: 'Show photos and files inside chats' },
];

export const NOTIFICATIONS_ROWS: readonly SettingsRowSeed[] = [
  // F-046 FR-006 removed sound, vibrate, popup and light keys - live toggles with
  // no consumer. F-060 FR-003 re-enables sound/vibrate BECAUSE their consumer (a
  // send-feedback tone/vibration in the chat window) ships in the same feature;
  // popup/light stay unavailable: a phone-web app has no lock screen or LED, so no
  // honest consumer exists. Descriptions for sound/vibrate are PROVISIONAL F-060
  // copy (the real consumer is outgoing-message feedback, not incoming).
  { id: 'notifications-sound', label: 'Sound', description: 'Play a tone when you send a message' },
  { id: 'notifications-vibrate', label: 'Vibrate', description: 'Vibrate when you send a message' },
  { id: 'notifications-popup', label: 'Popup notification', description: 'When your phone is locked', unavailable: true },
  { id: 'notifications-light', label: 'Light', description: 'Flash for incoming messages', unavailable: true },
  { id: 'notifications-previews', label: 'Show previews', description: 'Show message text in notifications' },
];

export const DATA_STORAGE_ROWS: readonly SettingsRowSeed[] = [
  { id: 'ds-storage-usage', label: 'Storage usage', description: 'Manage the storage used by chats' },
  { id: 'ds-auto-download', label: 'Media auto-download', description: 'Automatically download media you receive' },
  { id: 'ds-images', label: 'Images', description: 'Save incoming photos to your gallery' },
  { id: 'ds-audio', label: 'Audio', description: 'Save incoming audio to your device' },
  { id: 'ds-videos', label: 'Videos', description: 'Save incoming videos to your device' },
  { id: 'ds-documents', label: 'Documents', description: 'Save incoming documents to your device' },
  { id: 'ds-network-usage', label: 'Network usage', description: 'See network usage by chats' },
];