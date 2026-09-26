import { Injectable, signal } from '@angular/core';
import { ChatPreview } from '../features/chat-list/chat.model';
import { CHAT_SEED } from '../features/chat-list/chat-list.seed';
import { CHAT_SEED as THREAD_SEED } from '../features/chat-window/chat-window.seed';
import { Message } from '../features/chat-window/chat-window.model';

export const THREADED_CONTACT_ID = 'chat-006';

let messageSequence = 1000;

function nextMessageId(): string {
  messageSequence += 1;
  return `msg-${messageSequence}`;
}

function nowTime(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function normalizeChats(seed: readonly ChatPreview[]): readonly ChatPreview[] {
  return seed.map((chat) => ({ ...chat, read: false }));
}

@Injectable({ providedIn: 'root' })
export class ChatStore {
  readonly conversations = signal<readonly ChatPreview[]>(normalizeChats(CHAT_SEED));

  readonly threads = signal<Readonly<Record<string, readonly Message[]>>>({
    [THREADED_CONTACT_ID]: THREAD_SEED,
  });

  conversationMessages(chatId: string): readonly Message[] {
    return this.threads()[chatId] ?? [];
  }

  setConversations(list: readonly ChatPreview[]): void {
    this.conversations.set(list);
  }

  openConversation(chatId: string): void {
    this.conversations.update((chats) =>
      chats.map((chat) => (chat.id === chatId && !chat.read ? { ...chat, read: true } : chat)),
    );
  }

  sendMessage(chatId: string, text: string): void {
    const body = text.trim();
    if (!body) {
      return;
    }
    const message: Message = {
      id: nextMessageId(),
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
  }

  markAllRead(): void {
    this.conversations.update((chats) => chats.map((chat) => ({ ...chat, read: true })));
  }

  reset(): void {
    this.conversations.set(normalizeChats(CHAT_SEED));
    this.threads.set({ [THREADED_CONTACT_ID]: THREAD_SEED });
  }
}