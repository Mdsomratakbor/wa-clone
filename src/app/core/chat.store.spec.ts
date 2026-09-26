import { TestBed } from '@angular/core/testing';
import { ChatStore, THREADED_CONTACT_ID, CONTACT_SUBTITLE, PERSISTENCE_KEY } from './chat.store';
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

  it('createConversation appends an empty-thread conversation with a unique id', () => {
    const id1 = store.createConversation();
    const id2 = store.createConversation();
    expect(id1).toBe('chat-new-1');
    expect(id2).toBe('chat-new-2');

    const conversations = store.conversations();
    expect(conversations.length).toBe(CHAT_SEED.length + 2);
    const created = conversations.find((c) => c.id === id2) as ChatPreview;
    expect(created.contactName).toBe('New contact');
    expect(created.preview).toBe('');
    expect(created.read).toBe(true);
    expect(store.conversationMessages(id2)).toEqual([]);
  });

  it('createConversation accepts a custom contact name', () => {
    const id = store.createConversation('Sam');
    expect(store.conversations().find((c) => c.id === id)?.contactName).toBe('Sam');
  });

  it('a created conversation supports sending and contact lookup', () => {
    const id = store.createConversation();
    store.sendMessage(id, 'hi!');

    const thread = store.conversationMessages(id);
    expect(thread.length).toBe(1);
    expect(thread[0].sender).toBe('outgoing');
    expect(store.conversations().find((c) => c.id === id)?.preview).toBe('hi!');

    expect(store.contact(id)?.name).toBe('New contact');
    expect(store.contact(id)?.subtitle).toBe(CONTACT_SUBTITLE);
    expect(store.contact(THREADED_CONTACT_ID)?.name).toBe('Martha Craig');
    expect(store.contact('chat-404')).toBeNull();
  });

  it('reset clears created conversations and the id counter', () => {
    const id = store.createConversation();
    store.reset();
    expect(store.conversations().find((c) => c.id === id)).toBeUndefined();
    expect(store.createConversation()).toBe('chat-new-1');
  });

  it('reset restores the seeded state', () => {
    store.sendMessage(THREADED_CONTACT_ID, 'bye');
    store.markAllRead();
    store.reset();
    expect(store.conversationMessages(THREADED_CONTACT_ID).length).toBe(THREAD_SEED.length);
    expect(store.conversations().every((chat) => chat.read === false)).toBe(true);
  });

  it('persists mutations and hydrates a fresh store with continuing counters', () => {
    store.sendMessage(THREADED_CONTACT_ID, 'persist-me');
    const created = store.createConversation();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const reloaded = TestBed.inject(ChatStore);
    store = reloaded;

    const thread = reloaded.conversationMessages(THREADED_CONTACT_ID);
    expect(thread.length).toBe(THREAD_SEED.length + 1);
    expect(thread[thread.length - 1].text).toBe('persist-me');
    expect(reloaded.conversations().some((c) => c.id === created)).toBe(true);
    expect(reloaded.conversationMessages(created)).toEqual([]);
    expect(reloaded.createConversation()).toBe('chat-new-2');
  });

  it('hydrates read state and openConversation changes', () => {
    store.markAllRead();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const reloaded = TestBed.inject(ChatStore);
    store = reloaded;

    expect(reloaded.conversations().every((c) => c.read === true)).toBe(true);
  });

  it('falls back to seeded defaults on absent storage', () => {
    window.localStorage.removeItem(PERSISTENCE_KEY);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const reloaded = TestBed.inject(ChatStore);
    store = reloaded;

    expect(reloaded.conversations().length).toBe(CHAT_SEED.length);
    expect(reloaded.conversationMessages(THREADED_CONTACT_ID).length).toBe(THREAD_SEED.length);
  });

  it('falls back to seeded defaults on corrupt storage', () => {
    window.localStorage.setItem(PERSISTENCE_KEY, 'not-json{');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const reloaded = TestBed.inject(ChatStore);
    store = reloaded;

    expect(reloaded.conversations().length).toBe(CHAT_SEED.length);
  });

  it('falls back to seeded defaults on a version mismatch', () => {
    window.localStorage.setItem(
      PERSISTENCE_KEY,
      JSON.stringify({ version: 99, conversations: [], threads: {} }),
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const reloaded = TestBed.inject(ChatStore);
    store = reloaded;

    expect(reloaded.conversations().length).toBe(CHAT_SEED.length);
  });

  it('reset clears the persisted snapshot', () => {
    store.sendMessage(THREADED_CONTACT_ID, 'gonna-clear');
    store.reset();
    expect(window.localStorage.getItem(PERSISTENCE_KEY)).toBeNull();
  });

  it('toggleStarred adds, queries and removes star keys', () => {
    expect(store.isStarred(THREADED_CONTACT_ID, 'msg-007')).toBe(false);
    store.toggleStarred(THREADED_CONTACT_ID, 'msg-007');
    expect(store.isStarred(THREADED_CONTACT_ID, 'msg-007')).toBe(true);
    store.toggleStarred(THREADED_CONTACT_ID, 'msg-007');
    expect(store.isStarred(THREADED_CONTACT_ID, 'msg-007')).toBe(false);
  });

  it('derives starred entries with contact, text and time', () => {
    store.toggleStarred(THREADED_CONTACT_ID, 'msg-007');
    store.toggleStarred(THREADED_CONTACT_ID, 'msg-001');

    const entries = store.starredEntries();
    expect(entries.length).toBe(2);
    expect(entries[0]).toEqual({
      chatId: THREADED_CONTACT_ID,
      messageId: 'msg-007',
      contactName: 'Martha Craig',
      text: 'Do you know what time is it?',
      time: '11:40',
    });
    expect(entries[1].messageId).toBe('msg-001');
  });

  it('drops starred entries whose message no longer exists', () => {
    store.toggleStarred(THREADED_CONTACT_ID, 'msg-013');
    store.toggleStarred(THREADED_CONTACT_ID, 'ghost-404');
    const entries = store.starredEntries();
    expect(entries.length).toBe(1);
    expect(entries[0].messageId).toBe('msg-013');
  });

  it('persists starred state across a reload', () => {
    store.toggleStarred(THREADED_CONTACT_ID, 'msg-007');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const reloaded = TestBed.inject(ChatStore);
    store = reloaded;

    expect(reloaded.isStarred(THREADED_CONTACT_ID, 'msg-007')).toBe(true);
    expect(reloaded.starredEntries().length).toBe(1);
  });

  it('reset clears starred state', () => {
    store.toggleStarred(THREADED_CONTACT_ID, 'msg-007');
    store.reset();
    expect(store.isStarred(THREADED_CONTACT_ID, 'msg-007')).toBe(false);
  });

  it('updateContact sets name and phone, trims and persists', () => {
    store.updateContact(THREADED_CONTACT_ID, '  Martha Craig II  ', '  +1 555-0100 ');

    const chat = store.conversations().find((c) => c.id === THREADED_CONTACT_ID) as ChatPreview;
    expect(chat.contactName).toBe('Martha Craig II');
    expect(chat.phone).toBe('+1 555-0100');
    expect(store.contactName(THREADED_CONTACT_ID)).toBe('Martha Craig II');
    expect(store.contactPhone(THREADED_CONTACT_ID)).toBe('+1 555-0100');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const reloaded = TestBed.inject(ChatStore);
    store = reloaded;
    expect(reloaded.contactName(THREADED_CONTACT_ID)).toBe('Martha Craig II');
    expect(reloaded.contactPhone(THREADED_CONTACT_ID)).toBe('+1 555-0100');
  });

  it('updateContact keeps the existing name when the new name is blank', () => {
    store.updateContact(THREADED_CONTACT_ID, '   ', '555');
    expect(store.contactName(THREADED_CONTACT_ID)).toBe('Martha Craig');
    expect(store.contactPhone(THREADED_CONTACT_ID)).toBe('555');
  });

  it('contactName and contactPhone fall back for unknown chats', () => {
    expect(store.contactName('chat-404')).toBe('Contact');
    expect(store.contactPhone('chat-404')).toBe('');
  });
});