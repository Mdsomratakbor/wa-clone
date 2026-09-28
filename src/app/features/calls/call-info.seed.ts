import { Action } from '../../shared/components/action-sheet/action-sheet.model';

// PROVISIONAL (G1 blocked): the design file has no call-info sheet, so these ids
// and labels are hypotheses modelled on real WhatsApp. Order is
// Message, Voice call, Video call, Delete.
export const CALL_INFO_ACTIONS: readonly Action[] = [
  { id: 'message', label: 'Message' },
  { id: 'voice-call', label: 'Voice call' },
  { id: 'video-call', label: 'Video call' },
  { id: 'delete', label: 'Delete' },
];
