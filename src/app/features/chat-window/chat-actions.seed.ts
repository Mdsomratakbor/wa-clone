import { Action } from '../../shared/components/action-sheet/action-sheet.model';

export const CHAT_ACTIONS: readonly Action[] = [
  { id: 'chat-mute', label: 'Mute' },
  // F-046 FR-001: no wallpaper destination exists, and the picker cannot be built
  // until the capture gate clears (2026-10-02 18:38 UTC) because there is no
  // wallpaper imagery to select. Disabled rather than a tap that does nothing.
  { id: 'chat-wallpaper', label: 'Wallpaper', disabled: true },
  { id: 'chat-more', label: 'More' },
];

export const CHAT_MORE_ACTIONS: readonly Action[] = [
  { id: 'chat-clear', label: 'Clear messages' },
  { id: 'chat-delete', label: 'Delete chat' },
];