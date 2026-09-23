import { ContactHeader, Message } from './chat-window.model';

export const CHAT_CONTACT: ContactHeader = {
  name: 'Martha Craig',
  subtitle: 'tap here for contact info',
  avatarRef: null,
};

export const DATE_CHIP_LABEL = 'Fri, Jul 26';

export const CHAT_SEED: readonly Message[] = [
  { id: 'msg-001', sender: 'outgoing', text: 'I will write from Japan', time: '17:47', file: null },
  { id: 'msg-002', sender: 'outgoing', text: 'Good bye!', time: '17:47', file: null },
  { id: 'msg-003', sender: 'outgoing', text: 'Good morning!', time: '10:10', file: null },
  { id: 'msg-004', sender: 'outgoing', text: 'Japan looks amazing!', time: '10:10', file: null },
  {
    id: 'msg-005',
    sender: 'outgoing',
    text: '',
    time: '10:15',
    file: { filename: 'IMG_0475', ext: 'png', size: '2.4 MB' },
  },
  {
    id: 'msg-006',
    sender: 'outgoing',
    text: '',
    time: '10:15',
    file: { filename: 'IMG_0481', ext: 'png', size: '2.8 MB' },
  },
  { id: 'msg-007', sender: 'incoming', text: 'Do you know what time is it?', time: '11:40', file: null },
  { id: 'msg-008', sender: 'outgoing', text: 'It’s morning in Tokyo 😎', time: '11:43', file: null },
  {
    id: 'msg-009',
    sender: 'incoming',
    text: 'What is the most popular meal in Japan?',
    time: '11:45',
    file: null,
  },
  { id: 'msg-010', sender: 'incoming', text: 'Do you like it?', time: '11:45', file: null },
  { id: 'msg-011', sender: 'outgoing', text: 'I think top two are:', time: '11:50', file: null },
  {
    id: 'msg-012',
    sender: 'outgoing',
    text: '',
    time: '11:51',
    file: { filename: 'IMG_0483', ext: 'png', size: '2.8 MB' },
  },
  {
    id: 'msg-013',
    sender: 'outgoing',
    text: '',
    time: '11:51',
    file: { filename: 'IMG_0484', ext: 'png', size: '2.6 MB' },
  },
];