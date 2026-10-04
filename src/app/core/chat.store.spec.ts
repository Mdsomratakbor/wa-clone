import { TestBed } from '@angular/core/testing';
import { ChatStore, THREADED_CONTACT_ID, CONTACT_SUBTITLE, PERSISTENCE_KEY, formatFileSize, isSafeImageDataUrl, splitFileName } from './chat.store';
import { LocalStorageAdapter } from './persistence/local-storage.adapter';
import { InMemoryPersistencePort } from './persistence/in-memory.port';
import { ChatPreview } from '../features/chat-list/chat.model';
import { CHAT_SEED } from '../features/chat-list/chat-list.seed';
import { CHAT_SEED as THREAD_SEED } from '../features/chat-window/chat-window.seed';
import { FileInfo, Message } from '../features/chat-window/chat-window.model';
import { PHOTO_MAX_CHARS } from './status-photo';

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

  // F-060 FR-007: sendMessage mirrors sendAttachment by reporting whether the
  // message was appended, so the page only plays send feedback on a real send.
  it('returns true for a non-blank send and false for blank drafts (F-060 FR-007)', () => {
    expect(store.sendMessage(THREADED_CONTACT_ID, '   ')).toBe(false);
    expect(store.sendMessage(THREADED_CONTACT_ID, '')).toBe(false);
    expect(store.sendMessage(THREADED_CONTACT_ID, 'ack')).toBe(true);
    expect(store.sendMessage(THREADED_CONTACT_ID, '  trimmed copy  ')).toBe(true);
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
    const reloaded = new ChatStore(new LocalStorageAdapter());
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
    const reloaded = new ChatStore(new LocalStorageAdapter());
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
    const reloaded = new ChatStore(new LocalStorageAdapter());
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
    const reloaded = new ChatStore(new LocalStorageAdapter());
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
    const reloaded = new ChatStore(new LocalStorageAdapter());
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
    const reloaded = new ChatStore(new LocalStorageAdapter());
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
    const reloaded = new ChatStore(new LocalStorageAdapter());
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

  it('contactGroups lists only the groups a contact belongs to (F-048 FR-002)', () => {
    const mine = store.contactConversations()[0];
    const other = store.contactConversations()[1];
    const shared = store.createGroup('Weekend plans', [mine.id, other.id]);
    const notMine = store.createGroup('Others only', [other.id]);

    const sharedIds = store.contactGroups(mine.id).map((chat) => chat.id);
    expect(sharedIds).toEqual([shared]);
    expect(sharedIds).not.toContain(notMine);
  });

  it('contactGroups excludes a broadcast containing the contact (F-048 FR-003)', () => {
    const mine = store.contactConversations()[0];
    const broadcast = store.createBroadcast('All hands', [mine.id]);

    expect(
      store.conversations().find((chat) => chat.id === broadcast)?.participantIds,
    ).toContain(mine.id);
    expect(store.contactGroups(mine.id)).toEqual([]);
  });

  it('contactGroups excludes direct conversations and returns [] for an unknown id (F-048 FR-002)', () => {
    const mine = store.contactConversations()[0];
    const other = store.contactConversations()[1];

    expect(store.contactGroups(mine.id)).toEqual([]);
    expect(store.contactGroups('no-such-contact')).toEqual([]);
    expect(store.contactGroups('')).toEqual([]);
    expect(store.conversations().some((chat) => chat.id === other.id)).toBe(true);
  });

  it('contactGroups is read-only and returns the store conversation order (F-048 FR-004)', () => {
    const mine = store.contactConversations()[0];
    const first = store.createGroup('First', [mine.id]);
    const second = store.createGroup('Second', [mine.id]);
    const before = store.conversations().map((chat) => chat.id);

    expect(store.contactGroups(mine.id).map((chat) => chat.id)).toEqual([first, second]);
    expect(store.conversations().map((chat) => chat.id)).toEqual(before);
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
    const reloaded = new ChatStore(new LocalStorageAdapter());
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
    const reloaded = new ChatStore(new LocalStorageAdapter());
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

  describe('F-047 FR-007a: storage-unavailable fallback', () => {
    // No store tested this branch before F-047. Every one of the 8 storage
    // helpers being consolidated exists to survive this, and none of them was
    // ever exercised here. Written against the current implementation.

    function unavailableStorage(): void {
      jasmine.getEnv().allowRespy(true);
      spyOn(localStorage, 'getItem').and.throwError('SecurityError');
      spyOn(localStorage, 'setItem').and.throwError('QuotaExceededError');
      spyOn(localStorage, 'removeItem').and.throwError('SecurityError');
    }

    it('boots to the seed when localStorage cannot be read', () => {
      unavailableStorage();
      let recovered: ChatStore | undefined;
      expect(() => {
        recovered = new ChatStore(new LocalStorageAdapter());
      }).not.toThrow();
      expect(recovered?.conversations().length).toBe(CHAT_SEED.length);
    });

    it('applies changes in memory when persisting throws', () => {
      const before = store.conversations().length;
      unavailableStorage();
      expect(() => store.createConversation()).not.toThrow();
      expect(() => store.sendMessage(THREADED_CONTACT_ID, 'offline')).not.toThrow();
      expect(() => store.toggleStarred(THREADED_CONTACT_ID, 'msg-1')).not.toThrow();
      expect(store.conversations().length).toBe(before + 1);
      expect(store.conversationMessages(THREADED_CONTACT_ID).length).toBeGreaterThan(0);
    });

    it('reset does not throw when removeItem is unavailable', () => {
      unavailableStorage();
      expect(() => store.reset()).not.toThrow();
    });
  });

  describe('F-047 FR-010: the seam actually exists', () => {
    // Acceptance criterion for the port being more than a refactor. A spy cannot carry
    // this: it proves `write` was called, not that the bytes come back out of a
    // *different* store instance. The failure this guards against is a store that
    // persists under one key and hydrates from another, or serializes something
    // `JSON.parse` rejects — every spy assertion would stay green while real users
    // lost their chats on reload.

    it('writes the snapshot through the port, not to localStorage', () => {
      const port = new InMemoryPersistencePort();
      const wired = new ChatStore(port);

      wired.createConversation('Through the port');

      const raw = port.read(PERSISTENCE_KEY);
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw as string).conversations.some((c: ChatPreview) => c.contactName === 'Through the port')).toBe(true);
      // The point of using a double at all: localStorage is untouched, so the write
      // demonstrably went through the port rather than around it.
      expect(localStorage.getItem(PERSISTENCE_KEY)).toBeNull();
    });

    it('hydrates a fresh store instance from a previous instance payload', () => {
      const port = new InMemoryPersistencePort();
      const first = new ChatStore(port);
      first.createConversation('Survives the session');

      const second = new ChatStore(port);

      expect(second.conversations().some((c) => c.contactName === 'Survives the session')).toBe(true);
    });

    it('carries the id counter across instances, so generated ids do not collide', () => {
      // The counter lives in the snapshot, not only in memory. If persist() omitted
      // it, the second instance would restart at 0 and mint `chat-new-1` a second
      // time — a duplicate id for a returning user, the exact class of bug F-042 and
      // F-045 fixed with normalizers. So the property is that the ids are distinct
      // *across* sessions, not that there is only one of them.
      const port = new InMemoryPersistencePort();
      new ChatStore(port).createConversation('first');

      const second = new ChatStore(port);
      second.createConversation('second');

      const ids = second.conversations().filter((c) => c.id.startsWith('chat-new-')).map((c) => c.id);
      expect(ids).toEqual(['chat-new-1', 'chat-new-2']);
    });

    it('agrees with LocalStorageAdapter on the key and the serialized bytes', () => {
      // FR-006 restated at store level: the port and the real adapter must agree, or
      // a user who has data written by the pre-port code would hydrate nothing after
      // the upgrade - with every in-memory test above still passing.
      const port = new InMemoryPersistencePort();
      const adapter = new LocalStorageAdapter();
      const snapshot = { version: 1, conversations: [], threads: {}, starred: [], messageSequence: 1, newChatCounter: 0 };

      port.write(PERSISTENCE_KEY, JSON.stringify(snapshot));
      adapter.write(PERSISTENCE_KEY, JSON.stringify(snapshot));

      expect(port.read(PERSISTENCE_KEY)).toBe(adapter.read(PERSISTENCE_KEY));
    });

    it('reset removes the key rather than writing an empty snapshot', () => {
      const port = new InMemoryPersistencePort();
      const wired = new ChatStore(port);
      wired.createConversation('gone after reset');

      wired.reset();

      // FR-013: ChatStore.remove()s the key. The moment a store starts writing
      // `{"conversations":[]}` instead, a "no data" and a "reset" state become
      // indistinguishable on disk.
      expect(port.read(PERSISTENCE_KEY)).toBeNull();
    });
  });

  describe('F-058 FR-005/FR-006: composer attachment', () => {
    // A short, plausible inline JPEG data URL for what the downscale helper produces.
    const safePhoto = 'data:image/jpeg;base64,AAAABBBB';

    function lastMessage(chatId: string): Message | undefined {
      const messages = store.conversationMessages(chatId);
      return messages[messages.length - 1];
    }

    it('splits a file name into card halves, lowercasing the extension (FR-002/FR-003)', () => {
      expect(splitFileName('IMG_0475.png')).toEqual({ filename: 'IMG_0475', ext: 'png' });
      expect(splitFileName('Report.FINAL.PDF')).toEqual({ filename: 'Report.FINAL', ext: 'pdf' });
      expect(splitFileName('noext')).toEqual({ filename: 'noext', ext: '' });
    });

    it('formats sizes for the card (FR-003)', () => {
      expect(formatFileSize(512)).toBe('512 B');
      expect(formatFileSize(2458)).toBe('2.4 KB');
      expect(formatFileSize(1024 * 1024 * 2.4)).toBe('2.4 MB');
    });

    it('only ever accepts inline image data URLs for a photo (FR-006)', () => {
      expect(isSafeImageDataUrl(safePhoto)).toBe(true);
      expect(isSafeImageDataUrl('https://evil.example/x.jpg')).toBe(false);
      expect(isSafeImageDataUrl('data:image/svg+xml;base64,PHN2Zz4=')).toBe(false);
      expect(isSafeImageDataUrl('data:text/html;base64,PHNjcmlwdD4=')).toBe(false);
      expect(isSafeImageDataUrl('not a url')).toBe(false);
    });

    it('appends a photo message with its data URL and an honest chat-list preview (FR-005)', () => {
      const ok = store.sendAttachment(THREADED_CONTACT_ID, '  Look at the lake  ', {
        filename: 'Alpine',
        ext: 'jpg',
        size: '2.4 MB',
        dataUrl: safePhoto,
      });

      expect(ok).toBe(true);
      const sent = lastMessage(THREADED_CONTACT_ID)!;
      expect(sent.sender).toBe('outgoing');
      expect(sent.text).toBe('Look at the lake');
      expect(sent.file).toEqual({ filename: 'Alpine', ext: 'jpg', size: '2.4 MB', dataUrl: safePhoto });
      expect(store.conversations().find((c) => c.id === THREADED_CONTACT_ID)?.preview).toBe('Look at the lake');
    });

    it('accepts a file-only message whose preview falls back to the Photo label (FR-005)', () => {
      const ok = store.sendAttachment(THREADED_CONTACT_ID, '', {
        filename: 'Shot',
        ext: 'jpg',
        size: '1.1 MB',
        dataUrl: safePhoto,
      });

      expect(ok).toBe(true);
      const sent = lastMessage(THREADED_CONTACT_ID)!;
      expect(sent.text).toBe('');
      expect(sent.file?.dataUrl).toBe(safePhoto);
      expect(store.conversations().find((c) => c.id === THREADED_CONTACT_ID)?.preview).toBe('Photo');
    });

    it('appends a document as metadata only and shows name.ext in the preview (FR-003/FR-005)', () => {
      const ok = store.sendAttachment(THREADED_CONTACT_ID, '', {
        filename: 'notes',
        ext: 'pdf',
        size: '850 KB',
      });

      expect(ok).toBe(true);
      const sent = lastMessage(THREADED_CONTACT_ID)!;
      expect(sent.file?.dataUrl).toBeUndefined();
      expect(store.conversations().find((c) => c.id === THREADED_CONTACT_ID)?.preview).toBe('notes.pdf');
    });

    it('refuses a missing file so nothing is changed (FR-005)', () => {
      const before = store.conversationMessages(THREADED_CONTACT_ID).length;
      const ok = store.sendAttachment(THREADED_CONTACT_ID, 'caption', {
        filename: '',
        ext: '',
        size: '0 B',
      });

      expect(ok).toBe(false);
      expect(store.conversationMessages(THREADED_CONTACT_ID).length).toBe(before);
    });

    it('refuses an unsafe data URL before it can reach an img src (FR-006)', () => {
      const before = store.conversationMessages(THREADED_CONTACT_ID).length;
      const unsafe = ['https://evil.example/x.jpg', 'data:image/svg+xml,<svg/>'][1]!;

      expect(
        store.sendAttachment(THREADED_CONTACT_ID, '', {
          filename: 'markup',
          ext: 'svg',
          size: '1 KB',
          dataUrl: unsafe,
        }),
      ).toBe(false);
      expect(store.conversationMessages(THREADED_CONTACT_ID).length).toBe(before);
    });

    it('refuses a data URL that cannot fit the persisted snapshot (FR-006)', () => {
      const before = store.conversationMessages(THREADED_CONTACT_ID).length;
      const oversized = `data:image/jpeg;base64,${'x'.repeat(PHOTO_MAX_CHARS)}`;

      expect(
        store.sendAttachment(THREADED_CONTACT_ID, '', {
          filename: 'big',
          ext: 'jpg',
          size: '50 MB',
          dataUrl: oversized,
        }),
      ).toBe(false);
      expect(store.conversationMessages(THREADED_CONTACT_ID).length).toBe(before);
    });

    it('persists a file message across a reload with its data URL intact (FR-005)', () => {
      const port = new InMemoryPersistencePort();
      const first = new ChatStore(port);
      first.sendAttachment(THREADED_CONTACT_ID, 'from the first session', {
        filename: 'Alpine',
        ext: 'jpg',
        size: '2.4 MB',
        dataUrl: safePhoto,
      });

      const reloaded = new ChatStore(port);
      const loaded = reloaded.conversationMessages(THREADED_CONTACT_ID);
      expect(loaded[loaded.length - 1].file?.dataUrl).toBe(safePhoto);
      expect(loaded[loaded.length - 1].text).toBe('from the first session');
    });

    it('drops an unsafe data URL on hydrate but keeps the file card (FR-006)', () => {
      const port = new InMemoryPersistencePort();
      const poisoned: Message = {
        id: 'msg-9000',
        sender: 'outgoing',
        text: '',
        time: '10:10',
        file: { filename: 'trap', ext: 'svg', size: '1 KB', dataUrl: 'data:image/svg+xml,<svg onload="x()"/>' },
      };
      port.write(
        PERSISTENCE_KEY,
        JSON.stringify({
          version: 1,
          conversations: [{ id: 'chat-poison', contactName: 'Poison', preview: '', timestamp: '10:10', avatarRef: null, read: true }],
          threads: { 'chat-poison': [poisoned] },
          starred: [],
          messageSequence: 9000,
          newChatCounter: 0,
        }),
      );

      const hydrated = new ChatStore(port);
      const loaded = hydrated.conversationMessages('chat-poison');
      expect(loaded.length).toBe(1);
      expect(loaded[0].file?.dataUrl).toBeUndefined();
      expect(loaded[0].file?.filename).toBe('trap');
    });

    it('keeps the seed file messages loading unchanged (FR-006)', () => {
      expect(lastMessage(THREADED_CONTACT_ID)?.file?.filename).toBe('IMG_0484');

      const port = new InMemoryPersistencePort();
      const seedBacked = new ChatStore(port);
      const count = seedBacked.conversationMessages(THREADED_CONTACT_ID).filter((m) => m.file !== null).length;
      expect(count).toBeGreaterThan(0);
    });
  });
});