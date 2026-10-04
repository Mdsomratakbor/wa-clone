import { Injectable, signal } from '@angular/core';
import { PersistencePort } from './persistence/persistence.port';
import { ChatKind, ChatPreview } from '../features/chat-list/chat.model';
import { CHAT_SEED } from '../features/chat-list/chat-list.seed';
import { CHAT_SEED as THREAD_SEED } from '../features/chat-window/chat-window.seed';
import { ContactHeader, FileInfo, Message } from '../features/chat-window/chat-window.model';
import { PHOTO_MAX_CHARS } from './status-photo';

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

/**
 * F-058 FR-006. The same safety contract as `StatusStore`'s photo guard: a "local"
 * image must be an inline data URL (`data:image/`), never a remote reference and
 * never `data:image/svg` (attacker markup behind `<img src>`). Records only, never
 * https - a photo src that fetched from the network would not be honest and a
 * data:text payload would be a script source.
 */
export function isSafeImageDataUrl(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.startsWith('data:image/') &&
    !value.startsWith('data:image/svg')
  );
}

/**
 * F-058 FR-003. Human-readable size for the file card. Unit rules are PROVISIONAL
 * (no Figma node); one decimal keeps the display bounded and mirrors the seed's
 * "2.4 MB" shape.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${Math.round(kb * 10) / 10} KB`;
  }
  return `${Math.round((kb / 1024) * 10) / 10} MB`;
}

/**
 * F-058 FR-002/FR-003. Splits a `File.name` into the card's two halves. A name
 * without an extension keeps itself as `filename` with an empty `ext`. F-058
 * produces `ext` lowercased so card and media-grid labels agree with the seed.
 */
export function splitFileName(name: string): { filename: string; ext: string } {
  const dot = name.lastIndexOf('.');
  if (dot <= 0) {
    return { filename: name, ext: '' };
  }
  return { filename: name.slice(0, dot), ext: name.slice(dot + 1).toLowerCase() };
}

/**
 * F-058 FR-005. The chat-list preview string for a file message: the caption when
 * one was typed, else `Photo` for an inline photo, else `name.ext`. The `Photo`
 * label is PROVISIONAL copy recorded in the 058 spec.
 */
export function filePreviewLabel(caption: string, file: FileInfo): string {
  const text = caption.trim();
  if (text.length > 0) {
    return text;
  }
  if (file.dataUrl !== undefined) {
    return 'Photo';
  }
  return file.ext ? `${file.filename}.${file.ext}` : file.filename;
}

function normalizeChats(seed: readonly ChatPreview[]): readonly ChatPreview[] {
  return seed.map((chat) => ({
    ...chat,
    read: false,
    muted: false,
    archived: false,
    ...hydrateDefaults(chat),
  }));
}

// Snapshots persisted before a kind existed carry no `kind`/`participantIds`.
// Only those fields are filled on load: the persisted read/muted/archived flags
// are user state and must survive a reload, so normalizeChats() (which forces
// them false) is deliberately not reused here.
function hydrateDefaults(chat: ChatPreview): Pick<ChatPreview, 'kind' | 'participantIds'> {
  return {
    kind: chat.kind ?? 'direct',
    participantIds: chat.participantIds ?? [],
  };
}

// helpers removed in F-047 - storage via PersistencePort

@Injectable({ providedIn: 'root' })
export class ChatStore {
  private messageSequence = 1000;
  private newChatCounter = 0;

  readonly conversations = signal<readonly ChatPreview[]>(normalizeChats(CHAT_SEED));

  readonly threads = signal<Readonly<Record<string, readonly Message[]>>>({
    [THREADED_CONTACT_ID]: THREAD_SEED,
  });

  readonly starred = signal<string[]>([]);

  constructor(private readonly storage: PersistencePort) {
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

  createGroup(name: string, participantIds: readonly string[] = []): string {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      throw new Error('createGroup requires a non-empty name');
    }
    this.newChatCounter += 1;
    const id = `group-${this.newChatCounter}`;
    const chat: ChatPreview = {
      id,
      contactName: trimmed,
      preview: '',
      timestamp: nowTime(),
      avatarRef: null,
      read: true,
      kind: 'group',
      participantIds: [...participantIds],
    };
    this.conversations.update((chats) => [...chats, chat]);
    this.threads.update((threads) => ({ ...threads, [id]: [] }));
    this.persist();
    return id;
  }

  // F-046 FR-007: createBroadcast was flagged as caller-less, but the audit's
  // evidence was too thin to act on. It has no production UI caller, which is
  // the deferred B3 create form - but it is F-042's mandated store capability
  // (FR-002) and the only way to get a broadcast into the store, so the
  // broadcasts-page suite seeds through it in 15 places. Retained deliberately;
  // the missing caller is recorded in disposition.md as the create-form gap.
  createBroadcast(name: string, recipientIds: readonly string[] = []): string {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      throw new Error('createBroadcast requires a non-empty name');
    }
    this.newChatCounter += 1;
    const id = `broadcast-${this.newChatCounter}`;
    const chat: ChatPreview = {
      id,
      contactName: trimmed,
      preview: '',
      timestamp: nowTime(),
      avatarRef: null,
      read: true,
      kind: 'broadcast',
      participantIds: [...recipientIds],
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
      subtitle: this.subtitleFor(chat),
      avatarRef: chat.avatarRef,
      muted: chat.muted ?? false,
    };
  }

  private isAggregate(chat: ChatPreview): boolean {
    const kind = chat.kind ?? 'direct';
    return kind === 'group' || kind === 'broadcast';
  }

  contactGroups(chatId: string): readonly ChatPreview[] {
    // F-048 FR-003: the kind test is load-bearing, not decorative. createBroadcast()
    // fills participantIds with recipient ids too, so a membership-only filter
    // would report broadcasts as groups.
    return this.conversations().filter(
      (chat) =>
        (chat.kind ?? 'direct') === 'group' && (chat.participantIds ?? []).includes(chatId),
    );
  }

  private resolveContactNames(chatId: string): readonly string[] {
    const chat = this.conversations().find((c) => c.id === chatId);
    if (!chat) {
      return [];
    }
    const byId = new Map(this.conversations().map((c) => [c.id, c.contactName]));
    return (chat.participantIds ?? []).flatMap((id) => {
      const name = byId.get(id);
      return name === undefined ? [] : [name];
    });
  }

  private subtitleFor(chat: ChatPreview): string {
    if ((chat.kind ?? 'direct') !== 'group') {
      return CONTACT_SUBTITLE;
    }
    const participants = this.groupParticipants(chat.id);
    if (participants.length === 0) {
      return 'Group';
    }
    return participants.length === 1 ? '1 participant' : `${participants.length} participants`;
  }

  isMuted(chatId: string): boolean {
    return this.conversations().find((c) => c.id === chatId)?.muted ?? false;
  }

  chatIdForContactName(contactName: string): string | null {
    return this.conversations().find((c) => c.contactName === contactName)?.id ?? null;
  }

  contactConversations(): ChatPreview[] {
    const seen = new Set<string>();
    const contacts: ChatPreview[] = [];
    for (const chat of this.conversations()) {
      if (this.isAggregate(chat) || seen.has(chat.contactName)) {
        continue;
      }
      seen.add(chat.contactName);
      contacts.push(chat);
    }
    return contacts.sort((a, b) => a.contactName.localeCompare(b.contactName));
  }

  broadcasts(): ChatPreview[] {
    return this.conversations().filter((chat) => (chat.kind ?? 'direct') === 'broadcast');
  }

  chatsListConversations(): ChatPreview[] {
    return this.conversations().filter((chat) => !chat.archived && !this.isAggregate(chat));
  }

  groupParticipants(chatId: string): readonly string[] {
    return this.resolveContactNames(chatId);
  }

  // F-046 FR-007: broadcastRecipients was a byte-identical duplicate of
  // groupParticipants with no caller. Removed.

  conversationKind(chatId: string): ChatKind {
    return this.conversations().find((c) => c.id === chatId)?.kind ?? 'direct';
  }

  toggleMuted(chatId: string): void {
    this.conversations.update((chats) =>
      chats.map((chat) =>
        chat.id === chatId ? { ...chat, muted: !(chat.muted ?? false) } : chat,
      ),
    );
    this.persist();
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

  clearMessages(chatId: string): void {
    this.threads.update((threads) => ({ ...threads, [chatId]: [] }));
    this.conversations.update((chats) =>
      chats.map((chat) => (chat.id === chatId ? { ...chat, preview: '', read: true } : chat)),
    );
    this.persist();
  }

  deleteConversation(chatId: string): void {
    this.conversations.update((chats) => chats.filter((chat) => chat.id !== chatId));
    this.threads.update((threads) => {
      const next = { ...threads };
      delete next[chatId];
      return next;
    });
    this.starred.update((list) =>
      list.filter((key) => !key.startsWith(`${chatId}:`)),
    );
    this.persist();
  }

  archiveConversations(ids: readonly string[]): void {
    if (ids.length === 0) {
      return;
    }
    const target = new Set(ids);
    this.conversations.update((chats) =>
      chats.map((chat) =>
        target.has(chat.id) ? { ...chat, archived: true } : chat,
      ),
    );
    this.persist();
  }

  archivedIds(): readonly string[] {
    return this.conversations()
      .filter((chat) => chat.archived)
      .map((chat) => chat.id);
  }

  unarchiveConversations(ids: readonly string[]): void {
    if (ids.length === 0) {
      return;
    }
    const target = new Set(ids);
    this.conversations.update((chats) =>
      chats.map((chat) => (target.has(chat.id) ? { ...chat, archived: false } : chat)),
    );
    this.persist();
  }

  deleteConversations(ids: readonly string[]): void {
    ids.forEach((id) => this.deleteConversation(id));
  }

  // F-046 FR-007: setConversations looked like a test seam that had become public
  // API - it overwrites the whole list and persists, with no production caller.
  // Removed; specs seed through the store's own methods.

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

  /**
   * F-058 FR-005/FR-006. Appends a file message and persists it. Returns `false` -
   * and persists nothing - when the file is missing or its data URL is not safe or
   * exceeds the character budget. The refusal lives here rather than in the page for
   * the F-050 reason: the adapter swallows quota errors by design, so only the store
   * can keep the visible message and the persisted one identical. A blank file is
   * refused; a blank caption is not (file-only message). Prefers the caption as the
   * chat-list preview.
   */
  sendAttachment(chatId: string, text: string, file: FileInfo): boolean {
    const caption = text.trim();
    if (file.dataUrl !== undefined && (!isSafeImageDataUrl(file.dataUrl) || file.dataUrl.length > PHOTO_MAX_CHARS)) {
      return false;
    }
    if (file.dataUrl === undefined && file.filename.length === 0) {
      return false;
    }
    const message: Message = {
      id: this.nextMessageId(),
      sender: 'outgoing',
      text: caption,
      time: nowTime(),
      file,
    };
    this.threads.update((threads) => ({
      ...threads,
      [chatId]: [...(threads[chatId] ?? []), message],
    }));
    this.conversations.update((chats) =>
      chats.map((chat) =>
        chat.id === chatId
          ? { ...chat, preview: filePreviewLabel(caption, file), timestamp: message.time, read: true }
          : chat,
      ),
    );
    this.persist();
    return true;
  }

  markAllRead(): void {
    this.conversations.update((chats) => chats.map((chat) => ({ ...chat, read: true })));
    this.persist();
  }

  reset(): void {
    this.storage.remove(PERSISTENCE_KEY);
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
    this.storage.write(PERSISTENCE_KEY, JSON.stringify(snapshot));
  }

  private hydrate(): void {
    const raw = this.storage.read(PERSISTENCE_KEY);
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
    this.conversations.set(snapshot.conversations.map((chat) => ({ ...chat, ...hydrateDefaults(chat) })));
    this.threads.set(this.sanitizeThreads(snapshot.threads));
    this.starred.set(snapshot.starred ?? []);
    this.messageSequence = snapshot.messageSequence;
    this.newChatCounter = snapshot.newChatCounter;
  }

  /**
   * F-058 FR-006. A loaded `file.dataUrl` that is not a safe inline image is dropped
   * from the message (the card metadata stays, so nothing renderable is lost). A
   * stale or foreign snapshot must not be able to put a network fetch or attacker
   * markup behind an `<img src>`.
   */
  private sanitizeThreads(
    threads: Record<string, readonly Message[]>,
  ): Record<string, readonly Message[]> {
    const next: Record<string, readonly Message[]> = {};
    for (const chatId of Object.keys(threads)) {
      next[chatId] = threads[chatId].map((message) => {
        if (message.file?.dataUrl !== undefined && !isSafeImageDataUrl(message.file.dataUrl)) {
          const file: FileInfo = { ...message.file };
          delete file.dataUrl;
          return { ...message, file };
        }
        return message;
      });
    }
    return next;
  }
}