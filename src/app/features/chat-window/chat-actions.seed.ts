import { Action } from '../../shared/components/action-sheet/action-sheet.model';

export const CHAT_ACTIONS: readonly Action[] = [
  { id: 'chat-mute', label: 'Mute' },
  { id: 'chat-wallpaper', label: 'Wallpaper' },
  { id: 'chat-more', label: 'More' },
];

export const CHAT_MORE_ACTIONS: readonly Action[] = [
  { id: 'chat-clear', label: 'Clear messages' },
  { id: 'chat-delete', label: 'Delete chat' },
];