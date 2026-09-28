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

export type FontScale = 'small' | 'default' | 'large' | 'extra-large';

export const FONT_SCALES: readonly FontScale[] = ['small', 'default', 'large', 'extra-large'];

export const DEFAULT_FONT_SCALE: FontScale = 'default';

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
  fontScale?: FontScale;
  profile?: ProfileSnapshot;
}

const PREFS_VERSION = 4;

function isFontScale(value: unknown): value is FontScale {
  return FONT_SCALES.includes(value as FontScale);
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
export class PrefsStore {
  readonly prefs = signal<PrefsSnapshot>({ ...DEFAULT_PREFS });
  readonly chatSort = signal<ChatSort>(DEFAULT_CHAT_SORT);
  readonly fontScale = signal<FontScale>(DEFAULT_FONT_SCALE);
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

  setFontScale(value: FontScale): void {
    this.fontScale.set(value);
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
    this.fontScale.set(DEFAULT_FONT_SCALE);
    this.profile.set({ ...DEFAULT_PROFILE });
  }

  private persist(): void {
    const envelope: PrefsSnapshotEnvelope = {
      version: PREFS_VERSION,
      prefs: this.prefs(),
      chatSort: this.chatSort(),
      fontScale: this.fontScale(),
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
      fontScale?: FontScale;
      profile?: ProfileSnapshot;
    };
    if (envelope?.version !== 1 && envelope?.version !== 2 && envelope?.version !== 3 && envelope?.version !== PREFS_VERSION) {
      return;
    }
    this.prefs.set({ ...DEFAULT_PREFS, ...envelope.prefs });
    this.chatSort.set(envelope.chatSort ?? DEFAULT_CHAT_SORT);
    this.fontScale.set(isFontScale(envelope.fontScale) ? envelope.fontScale : DEFAULT_FONT_SCALE);
    this.profile.set({ ...DEFAULT_PROFILE, ...envelope.profile });
  }
}