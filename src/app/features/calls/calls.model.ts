export type CallDirection = 'incoming' | 'outgoing' | 'missed';

export interface CallEntry {
  id: string;
  contactName: string;
  direction: CallDirection;
  date: string;
  avatarRef: string | null;
}

export const CALL_DIRECTION_LABELS: Record<CallDirection, string> = {
  incoming: 'incoming',
  outgoing: 'outgoing',
  missed: 'missed',
};

export const isMissedCall = (call: CallEntry): boolean => call.direction === 'missed';