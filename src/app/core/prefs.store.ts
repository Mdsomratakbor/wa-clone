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

export const PREFS_KEY = 'wa.prefs.v1';

interface PrefsSnapshotEnvelope {
  version: 1;
  prefs: PrefsSnapshot;
}

const PREFS_VERSION = 1;

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

  reset(): void {
    clearStorage(PREFS_KEY);
    this.prefs.set({ ...DEFAULT_PREFS });
  }

  private persist(): void {
    const envelope: PrefsSnapshotEnvelope = {
      version: PREFS_VERSION,
      prefs: this.prefs(),
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
    const envelope = parsed as PrefsSnapshotEnvelope;
    if (envelope?.version !== PREFS_VERSION) {
      return;
    }
    this.prefs.set({ ...DEFAULT_PREFS, ...envelope.prefs });
  }
}