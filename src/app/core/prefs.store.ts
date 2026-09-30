import { Injectable, signal } from '@angular/core';

export type PrefsKey =
  | 'enterKeySends'
  | 'showPreviews';

export type PrefsSnapshot = Record<PrefsKey, boolean>;

// F-046 FR-006: sound, vibrate, popup, light and mediaVisibility were removed
// because they had live toggles and no consumer - displaying a value in a switch's
// own [checked] is not consuming it. `enterKeySends` (composer.ts) and
// `showPreviews` (chat-list-item) are the two with a real behaviour behind them.
//
// The envelope version is deliberately NOT bumped. hydrate() merges
// { ...DEFAULT_PREFS, ...envelope.prefs }, so a persisted snapshot still carrying
// the removed keys normalizes to the defaults, and dropping five booleans is not
// worth discarding every user's stored prefs.
export const DEFAULT_PREFS: PrefsSnapshot = {
  enterKeySends: true,
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

// F-046 FR-006: a blind { ...DEFAULT_PREFS, ...envelope.prefs } spread would carry
// removed keys into the live snapshot, leaving the runtime state wider than the
// PrefsSnapshot type. Keys not in DEFAULT_PREFS are dropped and missing ones take
// the default, so a snapshot written before this feature still loads cleanly.
function normalizePrefs(raw: Partial<PrefsSnapshot> | undefined): PrefsSnapshot {
  const normalized = { ...DEFAULT_PREFS };
  if (!raw) {
    return normalized;
  }
  for (const key of Object.keys(DEFAULT_PREFS) as PrefsKey[]) {
    const value = raw[key];
    if (typeof value === 'boolean') {
      normalized[key] = value;
    }
  }
  return normalized;
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
    this.prefs.set(normalizePrefs(envelope.prefs));
    this.chatSort.set(envelope.chatSort ?? DEFAULT_CHAT_SORT);
    this.fontScale.set(isFontScale(envelope.fontScale) ? envelope.fontScale : DEFAULT_FONT_SCALE);
    this.profile.set({ ...DEFAULT_PROFILE, ...envelope.profile });
  }
}