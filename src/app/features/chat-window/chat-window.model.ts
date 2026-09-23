export type MessageSender = 'outgoing' | 'incoming';

export interface FileInfo {
  filename: string;
  ext: string;
  size: string;
}

export interface Message {
  id: string;
  sender: MessageSender;
  text: string;
  time: string;
  file: FileInfo | null;
}

export interface ContactHeader {
  name: string;
  subtitle: string;
  avatarRef: string | null;
}