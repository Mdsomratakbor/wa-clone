export type TabKey = 'settings' | 'chats' | 'camera' | 'calls' | 'status';

export type ChatKind = 'direct' | 'group';

export interface ChatPreview {
  id: string;
  contactName: string;
  preview: string;
  timestamp: string;
  avatarRef: string | null;
  read?: boolean;
  phone?: string;
  muted?: boolean;
  archived?: boolean;
  kind?: ChatKind;
  participantIds?: readonly string[];
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