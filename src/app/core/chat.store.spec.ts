import { TestBed } from '@angular/core/testing';
import { ChatStore, THREADED_CONTACT_ID } from './chat.store';
import { ChatPreview } from '../features/chat-list/chat.model';
import { CHAT_SEED } from '../features/chat-list/chat-list.seed';
import { CHAT_SEED as THREAD_SEED } from '../features/chat-window/chat-window.seed';
import { Message } from '../features/chat-window/chat-window.model';

describe('ChatStore', () => {
  let store: ChatStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(ChatStore);
    store.reset();
  });

  it('seeds conversations unread from the chat seed', () => {
    const conversations = store.conversations();
    expect(conversations.length).toBe(CHAT_SEED.length);
    expect(conversations.every((chat) => chat.read === false)).toBe(true);
  });

  it('seeds a threaded history for the threaded contact only', () => {
    expect(store.conversationMessages(THREADED_CONTACT_ID).length).toBe(THREAD_SEED.length);
    expect(store.conversationMessages('chat-001')).toEqual([]);
  });

  it('appends an outgoing message and updates preview, timestamp and read state', () => {
    store.sendMessage(THREADED_CONTACT_ID, 'hello tokyo');

    const thread = store.conversationMessages(THREADED_CONTACT_ID);
    expect(thread.length).toBe(THREAD_SEED.length + 1);
    const sent = thread[thread.length - 1] as Message;
    expect(sent.sender).toBe('outgoing');
    expect(sent.text).toBe('hello tokyo');
    expect(sent.file).toBeNull();
    expect(sent.time).toMatch(/^\d{2}:\d{2}$/);

    const chat = store.conversations().find((c) => c.id === THREADED_CONTACT_ID) as ChatPreview;
    expect(chat.preview).toBe('hello tokyo');
    expect(chat.timestamp).toBe(sent.time);
    expect(chat.read).toBe(true);
  });

  it('sequentially appends multiple messages in order', () => {
    store.sendMessage(THREADED_CONTACT_ID, 'one');
    store.sendMessage(THREADED_CONTACT_ID, 'two');
    const thread = store.conversationMessages(THREADED_CONTACT_ID);
    expect(thread.length).toBe(THREAD_SEED.length + 2);
    expect(thread[thread.length - 2].text).toBe('one');
    expect(thread[thread.length - 1].text).toBe('two');
  });

  it('drops blank and whitespace-only sends', () => {
    store.sendMessage(THREADED_CONTACT_ID, '   ');
    store.sendMessage(THREADED_CONTACT_ID, '');
    expect(store.conversationMessages(THREADED_CONTACT_ID).length).toBe(THREAD_SEED.length);
  });

  it('marks a single conversation read on open and leaves others untouched', () => {
    store.sendMessage('chat-001', 'ping');
    store.openConversation('chat-001');
    const conversations = store.conversations();
    expect(conversations.find((c) => c.id === 'chat-001')?.read).toBe(true);
    expect(conversations.find((c) => c.id === 'chat-002')?.read).toBe(false);
  });

  it('markAllRead marks every conversation read', () => {
    store.markAllRead();
    expect(store.conversations().every((chat) => chat.read === true)).toBe(true);
  });

  it('setConversations overrides the list', () => {
    store.setConversations([]);
    expect(store.conversations().length).toBe(0);
  });

  it('reset restores the seeded state', () => {
    store.sendMessage(THREADED_CONTACT_ID, 'bye');
    store.markAllRead();
    store.reset();
    expect(store.conversationMessages(THREADED_CONTACT_ID).length).toBe(THREAD_SEED.length);
    expect(store.conversations().every((chat) => chat.read === false)).toBe(true);
  });
});