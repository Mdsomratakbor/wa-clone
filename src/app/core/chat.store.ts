import { Injectable, signal } from '@angular/core';
import { ChatPreview } from '../features/chat-list/chat.model';
import { CHAT_SEED } from '../features/chat-list/chat-list.seed';
import { CHAT_SEED as THREAD_SEED } from '../features/chat-window/chat-window.seed';
import { ContactHeader, Message } from '../features/chat-window/chat-window.model';

export const THREADED_CONTACT_ID = 'chat-006';
export const CONTACT_SUBTITLE = 'tap here for contact info';
export const PERSISTENCE_KEY = 'wa.chat-store.v1';

export interface StarredEntry {
  chatId: string;
  messageId: string;
  contactName: string;
  text: string;
  time: string;
}

interface ChatStoreSnapshot {
  version: 1;
  conversations: ChatPreview[];
  threads: Record<string, Message[]>;
  starred: string[];
  messageSequence: number;
  newChatCounter: number;
}

const STORE_VERSION = 1;

function nowTime(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function normalizeChats(seed: readonly ChatPreview[]): readonly ChatPreview[] {
  return seed.map((chat) => ({ ...chat, read: false }));
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable/blocked: persist is best-effort.
  }
}

function clearStorage(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore: storage unavailable.
  }
}

@Injectable({ providedIn: 'root' })
export class ChatStore {
  private messageSequence = 1000;
  private newChatCounter = 0;

  readonly conversations = signal<readonly ChatPreview[]>(normalizeChats(CHAT_SEED));

  readonly threads = signal<Readonly<Record<string, readonly Message[]>>>({
    [THREADED_CONTACT_ID]: THREAD_SEED,
  });

  readonly starred = signal<string[]>([]);

  constructor() {
    this.hydrate();
  }

  conversationMessages(chatId: string): readonly Message[] {
    return this.threads()[chatId] ?? [];
  }

  createConversation(name = 'New contact'): string {
    this.newChatCounter += 1;
    const id = `chat-new-${this.newChatCounter}`;
    const chat: ChatPreview = {
      id,
      contactName: name,
      preview: '',
      timestamp: nowTime(),
      avatarRef: null,
      read: true,
    };
    this.conversations.update((chats) => [...chats, chat]);
    this.threads.update((threads) => ({ ...threads, [id]: [] }));
    this.persist();
    return id;
  }

  toggleStarred(chatId: string, messageId: string): void {
    const key = `${chatId}:${messageId}`;
    this.starred.update((list) =>
      list.includes(key) ? list.filter((k) => k !== key) : [...list, key],
    );
    this.persist();
  }

  isStarred(chatId: string, messageId: string): boolean {
    return this.starred().includes(`${chatId}:${messageId}`);
  }

  starredEntries(): StarredEntry[] {
    const chats = this.conversations();
    const threads = this.threads();
    return this.starred()
      .map((key) => {
        const separator = key.indexOf(':');
        const chatId = key.slice(0, separator);
        const messageId = key.slice(separator + 1);
        const message = threads[chatId]?.find((m) => m.id === messageId);
        if (!message) {
          return null;
        }
        const chat = chats.find((c) => c.id === chatId);
        return {
          chatId,
          messageId,
          contactName: chat?.contactName ?? 'Unknown',
          text: message.text || message.file?.filename || 'image attachment',
          time: message.time,
        };
      })
      .filter((entry): entry is StarredEntry => entry !== null);
  }

  contact(chatId: string): ContactHeader | null {
    const chat = this.conversations().find((c) => c.id === chatId);
    if (!chat) {
      return null;
    }
    return {
      name: chat.contactName,
      subtitle: CONTACT_SUBTITLE,
      avatarRef: chat.avatarRef,
    };
  }

  contactName(chatId: string): string {
    return this.conversations().find((c) => c.id === chatId)?.contactName ?? 'Contact';
  }

  contactPhone(chatId: string): string {
    return this.conversations().find((c) => c.id === chatId)?.phone ?? '';
  }

  updateContact(chatId: string, name: string, phone?: string): void {
    this.conversations.update((chats) =>
      chats.map((chat) => {
        if (chat.id !== chatId) {
          return chat;
        }
        const trimmedName = name.trim() || chat.contactName;
        const trimmedPhone = phone?.trim() ?? '';
        return { ...chat, contactName: trimmedName, phone: trimmedPhone };
      }),
    );
    this.persist();
  }

  setConversations(list: readonly ChatPreview[]): void {
    this.conversations.set(list);
    this.persist();
  }

  openConversation(chatId: string): void {
    this.conversations.update((chats) =>
      chats.map((chat) => (chat.id === chatId && !chat.read ? { ...chat, read: true } : chat)),
    );
    this.persist();
  }

  sendMessage(chatId: string, text: string): void {
    const body = text.trim();
    if (!body) {
      return;
    }
    const message: Message = {
      id: this.nextMessageId(),
      sender: 'outgoing',
      text: body,
      time: nowTime(),
      file: null,
    };
    this.threads.update((threads) => ({
      ...threads,
      [chatId]: [...(threads[chatId] ?? []), message],
    }));
    this.conversations.update((chats) =>
      chats.map((chat) =>
        chat.id === chatId
          ? { ...chat, preview: body, timestamp: message.time, read: true }
          : chat,
      ),
    );
    this.persist();
  }

  markAllRead(): void {
    this.conversations.update((chats) => chats.map((chat) => ({ ...chat, read: true })));
    this.persist();
  }

  reset(): void {
    clearStorage(PERSISTENCE_KEY);
    this.messageSequence = 1000;
    this.newChatCounter = 0;
    this.starred.set([]);
    this.conversations.set(normalizeChats(CHAT_SEED));
    this.threads.set({ [THREADED_CONTACT_ID]: THREAD_SEED });
  }

  private nextMessageId(): string {
    this.messageSequence += 1;
    return `msg-${this.messageSequence}`;
  }

  private persist(): void {
    const snapshot: ChatStoreSnapshot = {
      version: STORE_VERSION,
      conversations: this.conversations() as ChatPreview[],
      threads: this.threads() as Record<string, Message[]>,
      starred: this.starred(),
      messageSequence: this.messageSequence,
      newChatCounter: this.newChatCounter,
    };
    writeStorage(PERSISTENCE_KEY, JSON.stringify(snapshot));
  }

  private hydrate(): void {
    const raw = readStorage(PERSISTENCE_KEY);
    if (raw === null) {
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }
    const snapshot = parsed as ChatStoreSnapshot;
    if (snapshot?.version !== STORE_VERSION) {
      return;
    }
    this.conversations.set(snapshot.conversations);
    this.threads.set(snapshot.threads);
    this.starred.set(snapshot.starred ?? []);
    this.messageSequence = snapshot.messageSequence;
    this.newChatCounter = snapshot.newChatCounter;
  }
}