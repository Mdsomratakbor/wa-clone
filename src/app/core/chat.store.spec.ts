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

  it('seeds conversations unmuted', () => {
    expect(store.isMuted(THREADED_CONTACT_ID)).toBe(false);
    expect(store.contact(THREADED_CONTACT_ID)?.muted).toBe(false);
  });

  it('toggleMuted flips the muted state and surfaces it on the contact header', () => {
    store.toggleMuted(THREADED_CONTACT_ID);
    expect(store.isMuted(THREADED_CONTACT_ID)).toBe(true);
    expect(store.contact(THREADED_CONTACT_ID)?.muted).toBe(true);
    store.toggleMuted(THREADED_CONTACT_ID);
    expect(store.isMuted(THREADED_CONTACT_ID)).toBe(false);
  });

  it('persists muted state across a reload and clears it on reset', () => {
    store.toggleMuted(THREADED_CONTACT_ID);
    const reloaded = new ChatStore();
    expect(reloaded.isMuted(THREADED_CONTACT_ID)).toBe(true);
    reloaded.reset();
    expect(reloaded.isMuted(THREADED_CONTACT_ID)).toBe(false);
  });

  it('isMuted falls back to false for unknown chats', () => {
    expect(store.isMuted('chat-404')).toBe(false);
  });

  it('clearMessages empties the thread and the preview but keeps the conversation', () => {
    store.clearMessages(THREADED_CONTACT_ID);
    expect(store.conversationMessages(THREADED_CONTACT_ID)).toEqual([]);
    expect(store.conversations().some((c) => c.id === THREADED_CONTACT_ID)).toBe(true);
    expect(store.conversations().find((c) => c.id === THREADED_CONTACT_ID)?.preview).toBe('');
  });

  it('clearMessages persists across a reload', () => {
    store.clearMessages(THREADED_CONTACT_ID);
    const reloaded = new ChatStore();
    expect(reloaded.conversationMessages(THREADED_CONTACT_ID)).toEqual([]);
    reloaded.reset();
    expect(reloaded.conversationMessages(THREADED_CONTACT_ID).length).toBe(THREAD_SEED.length);
  });

  it('clearMessages keeps the conversation sendable', () => {
    store.clearMessages(THREADED_CONTACT_ID);
    store.sendMessage(THREADED_CONTACT_ID, 'Fresh start');
    expect(store.conversationMessages(THREADED_CONTACT_ID).length).toBe(1);
  });

  it('deleteConversation removes the row, its thread and its starred keys', () => {
    store.toggleStarred(THREADED_CONTACT_ID, store.conversationMessages(THREADED_CONTACT_ID)[0].id);
    store.deleteConversation(THREADED_CONTACT_ID);
    expect(store.conversations().some((c) => c.id === THREADED_CONTACT_ID)).toBe(false);
    expect(store.conversationMessages(THREADED_CONTACT_ID)).toEqual([]);
    expect(store.starred()).toEqual([]);
    expect(store.contact(THREADED_CONTACT_ID)).toBeNull();
  });

  it('deleteConversation leaves other conversations untouched and persists', () => {
    const otherId = CHAT_SEED[0].id;
    store.deleteConversation(THREADED_CONTACT_ID);
    const reloaded = new ChatStore();
    expect(reloaded.conversations().some((c) => c.id === otherId)).toBe(true);
    expect(reloaded.conversations().some((c) => c.id === THREADED_CONTACT_ID)).toBe(false);
  });

  it('reset restores a deleted conversation', () => {
    store.deleteConversation(THREADED_CONTACT_ID);
    store.reset();
    expect(store.conversations().some((c) => c.id === THREADED_CONTACT_ID)).toBe(true);
    expect(store.conversationMessages(THREADED_CONTACT_ID).length).toBe(THREAD_SEED.length);
  });

  it('archiveConversations flags exactly the given conversations', () => {
    const [first, second] = CHAT_SEED;
    store.archiveConversations([first.id]);
    expect(store.conversations().find((c) => c.id === first.id)?.archived).toBe(true);
    expect(store.conversations().find((c) => c.id === second.id)?.archived).toBe(false);
    expect(store.archivedIds()).toEqual([first.id]);
  });

  it('archiveConversations keeps the thread and starred entries intact', () => {
    store.toggleStarred(THREADED_CONTACT_ID, store.conversationMessages(THREADED_CONTACT_ID)[0].id);
    store.archiveConversations([THREADED_CONTACT_ID]);
    expect(store.conversationMessages(THREADED_CONTACT_ID).length).toBe(THREAD_SEED.length);
    expect(store.starred().length).toBe(1);
  });

  it('archiveConversations persists across a reload and reset restores it', () => {
    const [first] = CHAT_SEED;
    store.archiveConversations([first.id]);
    const reloaded = new ChatStore();
    expect(reloaded.archivedIds()).toEqual([first.id]);
    reloaded.reset();
    expect(reloaded.archivedIds()).toEqual([]);
  });

  it('archiveConversations ignores an empty selection', () => {
    const before = store.conversations();
    store.archiveConversations([]);
    expect(store.conversations()).toBe(before);
  });

  it('deleteConversations removes a bulk selection with threads and starred keys', () => {
    const [first, second] = CHAT_SEED;
    store.toggleStarred(THREADED_CONTACT_ID, store.conversationMessages(THREADED_CONTACT_ID)[0].id);
    store.deleteConversations([first.id, second.id, 'chat-404']);
    expect(store.conversations().some((c) => c.id === first.id)).toBe(false);
    expect(store.conversations().some((c) => c.id === second.id)).toBe(false);
    expect(store.starred().length).toBe(1);
  });

  it('deleteConversations persists across a reload', () => {
    const [first] = CHAT_SEED;
    store.deleteConversations([first.id]);
    const reloaded = new ChatStore();
    expect(reloaded.conversations().some((c) => c.id === first.id)).toBe(false);
  });

  it('deleteConversations ignores an empty selection', () => {
    const before = store.conversations();
    store.deleteConversations([]);
    expect(store.conversations()).toBe(before);
  });

  it('unarchiveConversations clears exactly the given conversations', () => {
    const [first, second] = CHAT_SEED;
    store.archiveConversations([first.id, second.id]);
    store.unarchiveConversations([first.id]);
    expect(store.conversations().find((c) => c.id === first.id)?.archived).toBe(false);
    expect(store.conversations().find((c) => c.id === second.id)?.archived).toBe(true);
    expect(store.archivedIds()).toEqual([second.id]);
  });

  it('unarchiveConversations persists across a reload and ignores an empty selection', () => {
    const [first] = CHAT_SEED;
    store.archiveConversations([first.id]);
    store.unarchiveConversations([first.id]);
    const reloaded = new ChatStore();
    expect(reloaded.archivedIds()).toEqual([]);
    const before = reloaded.conversations();
    reloaded.unarchiveConversations([]);
    expect(reloaded.conversations()).toBe(before);
  });

  it('contactConversations dedupes by contact name, first occurrence wins (F-039)', () => {
    const contacts = store.contactConversations();
    const names = contacts.map((chat) => chat.contactName);
    expect(new Set(names).size).toBe(names.length);

    const duplicate = store
      .conversations()
      .filter((chat) => chat.contactName === contacts[0]?.contactName)
      .map((chat) => chat.id);
    if (duplicate.length > 1) {
      expect(contacts[0]?.id).toBe(duplicate[0]);
    }
  });

  it('contactConversations sorts alphabetically and follows the store (F-039)', () => {
    const names = store.contactConversations().map((chat) => chat.contactName);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));

    const [first] = store.conversations();
    store.deleteConversation(first.id);
    expect(store.contactConversations().map((chat) => chat.id)).not.toContain(first.id);
  });

  it('contactConversations is empty when there are no conversations (F-039)', () => {
    for (const chat of [...store.conversations()]) {
      store.deleteConversation(chat.id);
    }
    expect(store.contactConversations()).toEqual([]);
  });

  it('createGroup makes a group conversation with participants and an empty thread (F-040)', () => {
    const id = store.createGroup('Weekend plans', ['chat-001', 'chat-002']);
    const group = store.conversations().find((chat) => chat.id === id);

    expect(id).toMatch(/^group-\d+$/);
    expect(group?.kind).toBe('group');
    expect(group?.contactName).toBe('Weekend plans');
    expect(group?.participantIds).toEqual(['chat-001', 'chat-002']);
    expect(group?.read).toBe(true);
    expect(group?.preview).toBe('');
    expect(store.conversationMessages(id)).toEqual([]);
  });

  it('createGroup trims the name, allows no participants and cannot collide with direct ids (F-040)', () => {
    const groupId = store.createGroup('  Trip  ');
    const directId = store.createConversation();
    expect(store.conversations().find((chat) => chat.id === groupId)?.contactName).toBe('Trip');
    expect(store.conversations().find((chat) => chat.id === groupId)?.participantIds).toEqual([]);
    expect(groupId).not.toBe(directId);
  });

  it('createGroup refuses a blank name (F-040 clarified)', () => {
    const before = store.conversations().length;
    expect(() => store.createGroup('   ')).toThrow();
    expect(store.conversations().length).toBe(before);
  });

  it('groupParticipants resolves current names and drops deleted contacts (F-040 clarified)', () => {
    const first = store.contactConversations()[0];
    const second = store.contactConversations()[1];
    const id = store.createGroup('Live names', [first.id, second.id]);

    expect(store.groupParticipants(id)).toEqual([first.contactName, second.contactName]);

    store.updateContact(first.id, 'Renamed Person');
    expect(store.groupParticipants(id)).toEqual(['Renamed Person', second.contactName]);

    store.deleteConversation(second.id);
    expect(store.groupParticipants(id)).toEqual(['Renamed Person']);
  });

  it('a created group persists across a reload (F-040)', () => {
    const contact = store.contactConversations()[0];
    const id = store.createGroup('Persisted group', [contact.id]);
    const reloaded = new ChatStore();
    const group = reloaded.conversations().find((chat) => chat.id === id);
    expect(group?.kind).toBe('group');
    expect(group?.participantIds).toEqual([contact.id]);
    expect(reloaded.groupParticipants(id)).toEqual([contact.contactName]);
  });

  it('groups are excluded from contactConversations and reported with a group subtitle (F-040)', () => {
    const contact = store.contactConversations()[0];
    const id = store.createGroup('Hidden group', [contact.id]);

    expect(store.contactConversations().map((chat) => chat.contactName)).not.toContain(
      'Hidden group',
    );
    expect(store.contactConversations().some((chat) => chat.id === id)).toBe(false);

    expect(store.contact(id)?.subtitle).toBe('1 participant');
    const two = store.createGroup('Pair', [contact.id, store.contactConversations()[1].id]);
    expect(store.contact(two)?.subtitle).toBe('2 participants');
    const empty = store.createGroup('Nameless');
    expect(store.contact(empty)?.subtitle).toBe('Group');
    expect(store.contact('chat-006')?.subtitle).toBe(CONTACT_SUBTITLE);
  });

  it('createBroadcast makes a broadcast with recipients and an empty thread (F-042 FR-002)', () => {
    const id = store.createBroadcast('All hands', ['chat-001', 'chat-002']);
    const broadcast = store.conversations().find((chat) => chat.id === id);

    expect(id).toMatch(/^broadcast-\d+$/);
    expect(broadcast?.kind).toBe('broadcast');
    expect(broadcast?.contactName).toBe('All hands');
    expect(broadcast?.participantIds).toEqual(['chat-001', 'chat-002']);
    expect(broadcast?.read).toBe(true);
    expect(broadcast?.preview).toBe('');
    expect(store.conversationMessages(id)).toEqual([]);
    expect(store.conversationKind(id)).toBe('broadcast');
  });

  it('createBroadcast trims the name, allows no recipients and cannot collide (F-042 FR-002)', () => {
    const groupId = store.createGroup('A group');
    const id = store.createBroadcast('  Shop updates  ');
    const broadcast = store.conversations().find((chat) => chat.id === id);

    expect(broadcast?.contactName).toBe('Shop updates');
    expect(broadcast?.participantIds).toEqual([]);
    expect(id).not.toBe(groupId);
    expect(id).not.toMatch(/^chat-/);
  });

  it('createBroadcast refuses a blank name (F-042 FR-002a)', () => {
    expect(() => store.createBroadcast('   ')).toThrow();
    expect(() => store.createBroadcast('')).toThrow();
  });

  it('broadcast ids continue the shared counter without colliding with groups (F-042 FR-002)', () => {
    const groupId = store.createGroup('Counter group');
    const first = store.createBroadcast('Counter one');
    const second = store.createBroadcast('Counter two');
    const suffix = groupId.split('-')[1];

    expect(first).toBe(`broadcast-${Number(suffix) + 1}`);
    expect(second).toBe(`broadcast-${Number(suffix) + 2}`);
  });

  it('groupParticipants resolves current names and drops deleted contacts (F-046 FR-007)', () => {
    const first = store.contactConversations()[0];
    const second = store.contactConversations()[1];
    const id = store.createBroadcast('Live recipients', [first.id, second.id, 'chat-missing']);

    expect(store.groupParticipants(id)).toEqual([first.contactName, second.contactName]);

    store.updateContact(first.id, 'Renamed Recipient');
    expect(store.groupParticipants(id)).toEqual(['Renamed Recipient', second.contactName]);

    store.deleteConversation(second.id);
    expect(store.groupParticipants(id)).toEqual(['Renamed Recipient']);
  });

  it('groupParticipants is empty for an unknown chat (F-046 FR-007)', () => {
    expect(store.groupParticipants('broadcast-404')).toEqual([]);
  });

  it('broadcasts lists only broadcasts, in insertion order (F-042 FR-004)', () => {
    expect(store.broadcasts()).toEqual([]);

    const first = store.createBroadcast('First list');
    const second = store.createBroadcast('Second list');
    store.createGroup('A group');

    expect(store.broadcasts().map((chat) => chat.id)).toEqual([first, second]);
  });

  it('a broadcast is excluded from the Chats list, direct and group chats are not (F-042 FR-003)', () => {
    const before = store.chatsListConversations().length;
    const id = store.createBroadcast('Not in chats');

    const listed = store.chatsListConversations();
    expect(listed.some((chat) => chat.id === id)).toBe(false);
    expect(listed.length).toBe(before);
    expect(listed.some((chat) => chat.kind === 'group')).toBe(false);

    const groupId = store.createGroup('Also not in chats');
    expect(store.chatsListConversations().some((chat) => chat.id === groupId)).toBe(false);
    expect(store.chatsListConversations().every((chat) => chat.kind === 'direct')).toBe(true);
  });

  it('the Chats list still hides archived chats (F-042 regression, F-032 behaviour)', () => {
    const [first] = store.chatsListConversations();
    store.archiveConversations([first.id]);
    expect(store.chatsListConversations().some((chat) => chat.id === first.id)).toBe(false);
  });

  it('broadcasts are excluded from contactConversations (F-042 FR-010)', () => {
    const contact = store.contactConversations()[0];
    const id = store.createBroadcast('Not a contact', [contact.id]);

    expect(store.contactConversations().some((chat) => chat.id === id)).toBe(false);
    expect(store.contactConversations().map((chat) => chat.contactName)).not.toContain(
      'Not a contact',
    );
    expect(store.contactConversations().some((chat) => chat.id === contact.id)).toBe(true);
  });

  it('a created broadcast persists across a reload (F-042 FR-002)', () => {
    const contact = store.contactConversations()[0];
    const id = store.createBroadcast('Persisted list', [contact.id]);
    const reloaded = new ChatStore();
    const broadcast = reloaded.conversations().find((chat) => chat.id === id);

    expect(broadcast?.kind).toBe('broadcast');
    expect(broadcast?.participantIds).toEqual([contact.id]);
    expect(reloaded.groupParticipants(id)).toEqual([contact.contactName]);
    expect(reloaded.broadcasts().map((chat) => chat.id)).toEqual([id]);
  });

  it('a v1 snapshot hydrates with no broadcast and keeps every other chat (F-042 FR-001)', () => {
    window.localStorage.setItem(
      PERSISTENCE_KEY,
      JSON.stringify({
        version: 1,
        conversations: [
          { id: 'chat-x', contactName: 'Legacy', preview: 'hi', timestamp: '10:00' },
          {
            id: 'chat-y',
            contactName: 'Archived friend',
            preview: '',
            timestamp: '09:00',
            read: true,
            muted: true,
            archived: true,
          },
        ],
        threads: {},
        starred: [],
        messageSequence: 0,
        newChatCounter: 7,
      }),
    );
    const reloaded = new ChatStore();
    const legacy = reloaded.conversations().find((chat) => chat.id === 'chat-x');

    expect(legacy?.kind).toBe('direct');
    expect(legacy?.participantIds).toEqual([]);
    expect(reloaded.broadcasts()).toEqual([]);
    expect(reloaded.chatsListConversations().map((chat) => chat.id)).toEqual(['chat-x']);

    const archived = reloaded.conversations().find((chat) => chat.id === 'chat-y');
    expect(archived?.read).toBe(true);
    expect(archived?.muted).toBe(true);
    expect(archived?.archived).toBe(true);
    expect(reloaded.archivedIds()).toEqual(['chat-y']);
  });

  it('the broadcast name is shown as the conversation title (F-042 FR-009)', () => {
    const id = store.createBroadcast('Status updates');
    expect(store.contact(id)?.name).toBe('Status updates');
  });
});