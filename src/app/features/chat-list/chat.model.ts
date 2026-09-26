export type TabKey = 'settings' | 'chats' | 'camera' | 'calls' | 'status';

export interface ChatPreview {
  id: string;
  contactName: string;
  preview: string;
  timestamp: string;
  avatarRef: string | null;
  read?: boolean;
}

export interface TabItem {
  key: TabKey;
  label: string;
  active: boolean;
}

export interface NavAction {
  id: string;
  label: string;
  icon?: 'new-call' | 'back';
  disabled?: boolean;
}