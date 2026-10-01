import { Injectable, signal } from '@angular/core';
import { PersistencePort } from './persistence/persistence.port';
import { StatusEntry } from './status.model';

export const STATUS_PERSISTENCE_KEY = 'wa.status-store.v1';

interface StatusStoreSnapshot {
  version: 1;
  myStatus: StatusEntry | null;
  /** F-049: optional so a snapshot written without a counter still loads. */
  nextStatusSeq?: number;
}

const STORE_VERSION = 1;

/**
 * F-049: an object is accepted only if all three fields have the right primitive
 * type. A half-written entry would render "undefined" in the feed, which is the
 * same defect class as the `outcome` bug in call.store.ts's normalizeCalls().
 */
function isStatusEntry(value: unknown): value is StatusEntry {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const entry = value as Partial<StatusEntry>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.text === 'string' &&
    typeof entry.createdAtMs === 'number'
  );
}

@Injectable({ providedIn: 'root' })
export class StatusStore {
  /**
   * F-049: at most one status, because the design has exactly one `My Status`
   * row. A list would retain entries nothing renders, and picking which one the
   * row shows would be an unsourced rule.
   */
  readonly myStatus = signal<StatusEntry | null>(null);

  private nextStatusSeq = 0;

  constructor(private readonly storage: PersistencePort) {
    this.hydrate();
  }

  /**
   * F-049 / FR-004: refuses blank or whitespace-only text. Returns the created
   * entry, or null when nothing was published - the caller can branch without
   * re-reading the signal.
   */
  publish(text: string, nowMs: number): StatusEntry | null {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      return null;
    }
    const entry: StatusEntry = { id: this.nextId(), text: trimmed, createdAtMs: nowMs };
    this.myStatus.set(entry);
    this.persist();
    return entry;
  }

  // The counter is incremented before the entry is built, so the id in the
  // signal and the id in the snapshot are the same value. Incrementing after the
  // write would let a failed write hand the next status a duplicate id.
  private nextId(): string {
    this.nextStatusSeq += 1;
    return `status-${this.nextStatusSeq}`;
  }

  private persist(): void {
    const snapshot: StatusStoreSnapshot = {
      version: STORE_VERSION,
      myStatus: this.myStatus(),
      nextStatusSeq: this.nextStatusSeq,
    };
    this.storage.write(STATUS_PERSISTENCE_KEY, JSON.stringify(snapshot));
  }

  private hydrate(): void {
    const raw = this.storage.read(STATUS_PERSISTENCE_KEY);
    if (raw === null) {
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }
    const snapshot = parsed as Partial<StatusStoreSnapshot> | null;
    if (snapshot === null || typeof snapshot !== 'object' || snapshot.version !== STORE_VERSION) {
      return;
    }
    if (snapshot.myStatus !== null && !isStatusEntry(snapshot.myStatus)) {
      return;
    }
    this.myStatus.set(snapshot.myStatus ?? null);
    this.nextStatusSeq = snapshot.nextStatusSeq ?? 0;
  }
}
