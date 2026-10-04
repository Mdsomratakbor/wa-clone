export type MessageSender = 'outgoing' | 'incoming';

export interface FileInfo {
  filename: string;
  ext: string;
  size: string;
  // F-058 FR-002/FR-006: additive. A downscaled inline JPEG data URL (never https://,
  // never SVG) for a photo attachment. Absent for documents and for every pre-058
  // message (the seed's file cards), which must keep loading unchanged.
  dataUrl?: string;
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
  muted?: boolean;
}