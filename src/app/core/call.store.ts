import { Injectable, signal } from '@angular/core';
import { CallEntry } from '../features/calls/calls.model';
import { CALL_SEED } from '../features/calls/calls.seed';

export const CALL_PERSISTENCE_KEY = 'wa.call-store.v1';

interface CallStoreSnapshot {
  version: 1;
  calls: CallEntry[];
}

const STORE_VERSION = 1;

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

@Injectable({ providedIn: 'root' })
export class CallStore {
  readonly calls = signal<CallEntry[]>([...CALL_SEED] as CallEntry[]);

  constructor() {
    this.hydrate();
  }

  removeCall(id: string): void {
    this.calls.update((list) => list.filter((entry) => entry.id !== id));
    this.persist();
  }

  clearCalls(): void {
    this.calls.set([]);
    this.persist();
  }

  private persist(): void {
    const snapshot: CallStoreSnapshot = { version: STORE_VERSION, calls: this.calls() };
    writeStorage(CALL_PERSISTENCE_KEY, JSON.stringify(snapshot));
  }

  private hydrate(): void {
    const raw = readStorage(CALL_PERSISTENCE_KEY);
    if (raw === null) {
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }
    const snapshot = parsed as CallStoreSnapshot;
    if (snapshot?.version !== STORE_VERSION || !Array.isArray(snapshot.calls)) {
      return;
    }
    this.calls.set(snapshot.calls);
  }
}
