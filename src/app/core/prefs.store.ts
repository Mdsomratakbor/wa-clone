import { Injectable, signal } from '@angular/core';
import { PersistencePort } from './persistence/persistence.port';

export type PrefsKey =
  | 'enterKeySends'
  | 'showPreviews'
  | 'mediaVisibility';

export type PrefsSnapshot = Record<PrefsKey, boolean>;

// F-046 FR-006 removed sound, vibrate, popup, light and mediaVisibility because
// they had live toggles and no consumer. F-059 FR-008/FR-009 now returns
// `mediaVisibility` because its consumer (in-bubble media privacy masking) lands
// in the same commit - the exact condition 046's disposition required. The four
// Notifications keys stay removed: there is still no notification pipeline.
export const DEFAULT_PREFS: PrefsSnapshot = {
  enterKeySends: true,
  showPreviews: true,
  mediaVisibility: true,
};

export type ChatSort = 'recent' | 'name' | 'unread';

export const DEFAULT_CHAT_SORT: ChatSort = 'recent';

export type FontScale = 'small' | 'default' | 'large' | 'extra-large';

export const FONT_SCALES: readonly FontScale[] = ['small', 'default', 'large', 'extra-large'];

export const DEFAULT_FONT_SCALE: FontScale = 'default';

export type WallpaperId = 'default' | 'sky' | 'sand' | 'mint' | 'blush' | 'slate';

export const DEFAULT_WALLPAPER: WallpaperId = 'default';

// F-059 FR-003. PROVISIONAL set - the design carries a photo wallpaper no capture
// has produced and the Figma token is expired, so ids/labels/colours are declared
// hypotheses recorded in specs/059-chats-settings-complete/research.md for the
// post-re-auth reconcile. `default` maps to `var(--wa-surface)` (byte-identical).
export const WALLPAPERS: readonly { id: WallpaperId; label: string }[] = [
  { id: 'default', label: 'Default' },
  { id: 'sky', label: 'Sky' },
  { id: 'sand', label: 'Sand' },
  { id: 'mint', label: 'Mint' },
  { id: 'blush', label: 'Blush' },
  { id: 'slate', label: 'Slate' },
];

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
  wallpaper?: WallpaperId;
  profile?: ProfileSnapshot;
}

// F-041 bumped 3 -> 4 for fontScale; F-059 bumps 4 -> 5 for wallpaper. hydrate()
// accepts every version from 1 up so a snapshot written at any older feature still
// loads; unknown versions are ignored as foreign.
const PREFS_VERSION = 5;
const KNOWN_PREFS_VERSIONS = [1, 2, 3, 4, PREFS_VERSION];

function isFontScale(value: unknown): value is FontScale {
  return FONT_SCALES.includes(value as FontScale);
}

function isWallpaperId(value: unknown): value is WallpaperId {
  return WALLPAPERS.some((w) => w.id === value);
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
  readonly wallpaper = signal<WallpaperId>(DEFAULT_WALLPAPER);
  readonly profile = signal<ProfileSnapshot>({ ...DEFAULT_PROFILE });

  constructor(private readonly storage: PersistencePort) {
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

  setWallpaper(value: WallpaperId): void {
    this.wallpaper.set(value);
    this.persist();
  }

  updateProfile(name: string, about: string): void {
    this.profile.set({ name, about });
    this.persist();
  }

  reset(): void {
    // FR-013: remove, not an empty envelope. Contrast CallStore.clearCalls(), which
    // writes an empty snapshot - the divergence is preserved deliberately.
    this.storage.remove(PREFS_KEY);
    this.prefs.set({ ...DEFAULT_PREFS });
    this.chatSort.set(DEFAULT_CHAT_SORT);
    this.fontScale.set(DEFAULT_FONT_SCALE);
    this.wallpaper.set(DEFAULT_WALLPAPER);
    this.profile.set({ ...DEFAULT_PROFILE });
  }

  private persist(): void {
    const envelope: PrefsSnapshotEnvelope = {
      version: PREFS_VERSION,
      prefs: this.prefs(),
      chatSort: this.chatSort(),
      fontScale: this.fontScale(),
      wallpaper: this.wallpaper(),
      profile: this.profile(),
    };
    this.storage.write(PREFS_KEY, JSON.stringify(envelope));
  }

  private hydrate(): void {
    const raw = this.storage.read(PREFS_KEY);
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
      wallpaper?: WallpaperId;
      profile?: ProfileSnapshot;
    };
    if (!KNOWN_PREFS_VERSIONS.includes(envelope?.version)) {
      return;
    }
    this.prefs.set(normalizePrefs(envelope.prefs));
    this.chatSort.set(envelope.chatSort ?? DEFAULT_CHAT_SORT);
    this.fontScale.set(isFontScale(envelope.fontScale) ? envelope.fontScale : DEFAULT_FONT_SCALE);
    this.wallpaper.set(isWallpaperId(envelope.wallpaper) ? envelope.wallpaper : DEFAULT_WALLPAPER);
    this.profile.set({ ...DEFAULT_PROFILE, ...envelope.profile });
  }
}
