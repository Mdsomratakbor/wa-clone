import { Injectable, signal } from '@angular/core';

export type PrefsKey =
  | 'enterKeySends'
  | 'mediaVisibility'
  | 'sound'
  | 'vibrate'
  | 'popup'
  | 'light'
  | 'showPreviews';

export type PrefsSnapshot = Record<PrefsKey, boolean>;

export const DEFAULT_PREFS: PrefsSnapshot = {
  enterKeySends: true,
  mediaVisibility: true,
  sound: true,
  vibrate: true,
  popup: true,
  light: true,
  showPreviews: true,
};

export type ChatSort = 'recent' | 'name' | 'unread';

export const DEFAULT_CHAT_SORT: ChatSort = 'recent';

export interface ProfileSnapshot {
  name: string;
  about: string;
}

export const DEFAULT_PROFILE: ProfileSnapshot = { name: 'Ani', about: '' };

export const PREFS_KEY = 'wa.prefs.v1';

interface PrefsSnapshotEnvelope {
  version: number;
  prefs: PrefsSnapshot;
  chatSort: ChatSort;
  profile?: ProfileSnapshot;
}

const PREFS_VERSION = 3;

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
export class PrefsStore {
  readonly prefs = signal<PrefsSnapshot>({ ...DEFAULT_PREFS });
  readonly chatSort = signal<ChatSort>(DEFAULT_CHAT_SORT);
  readonly profile = signal<ProfileSnapshot>({ ...DEFAULT_PROFILE });

  constructor() {
    this.hydrate();
  }

  toggle(key: PrefsKey): void {
    this.prefs.update((current) => ({ ...current, [key]: !current[key] }));
    this.persist();
  }

  set(key: PrefsKey, value: boolean): void {
    this.prefs.update((current) => ({ ...current, [key]: value }));
    this.persist();
  }

  setChatSort(value: ChatSort): void {
    this.chatSort.set(value);
    this.persist();
  }

  updateProfile(name: string, about: string): void {
    this.profile.set({ name, about });
    this.persist();
  }

  reset(): void {
    clearStorage(PREFS_KEY);
    this.prefs.set({ ...DEFAULT_PREFS });
    this.chatSort.set(DEFAULT_CHAT_SORT);
    this.profile.set({ ...DEFAULT_PROFILE });
  }

  private persist(): void {
    const envelope: PrefsSnapshotEnvelope = {
      version: PREFS_VERSION,
      prefs: this.prefs(),
      chatSort: this.chatSort(),
      profile: this.profile(),
    };
    writeStorage(PREFS_KEY, JSON.stringify(envelope));
  }

  private hydrate(): void {
    const raw = readStorage(PREFS_KEY);
    if (raw === null) {
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }
    const envelope = parsed as {
      version: number;
      prefs: PrefsSnapshot;
      chatSort?: ChatSort;
      profile?: ProfileSnapshot;
    };
    if (envelope?.version !== 1 && envelope?.version !== 2 && envelope?.version !== PREFS_VERSION) {
      return;
    }
    this.prefs.set({ ...DEFAULT_PREFS, ...envelope.prefs });
    this.chatSort.set(envelope.chatSort ?? DEFAULT_CHAT_SORT);
    this.profile.set({ ...DEFAULT_PROFILE, ...envelope.profile });
  }
}