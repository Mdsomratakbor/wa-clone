import { Injectable, signal } from '@angular/core';
import { PersistencePort } from './persistence/persistence.port';
import { StatusEntry, StatusPhoto } from './status.model';
import { PHOTO_MAX_CHARS } from './status-photo';

export const STATUS_PERSISTENCE_KEY = 'wa.status-store.v1';

interface StatusStoreSnapshot {
  version: 1;
  myStatus: StatusEntry | null;
  /** F-049: optional so a snapshot written without a counter still loads. */
  nextStatusSeq?: number;
}

const STORE_VERSION = 1;

/**
 * F-050 FR-004 / FR-007. A photo must be an inline image data URL, never a remote
 * reference: a `https://` src would make a "local" status fetch from the network, and a
 * `data:text/html` payload would put attacker-controlled markup behind an `<img src>`.
 */
function isPhotoDataUrl(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('data:image/') && !value.startsWith('data:image/svg');
}

function isStatusPhoto(value: unknown): value is StatusPhoto {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const photo = value as Partial<StatusPhoto>;
  return (
    isPhotoDataUrl(photo.dataUrl) &&
    typeof photo.width === 'number' &&
    typeof photo.height === 'number'
  );
}

/**
 * F-049: an object is accepted only if all three fields have the right primitive
 * type. A half-written entry would render "undefined" in the feed, which is the
 * same defect class as the `outcome` bug in call.store.ts's normalizeCalls().
 *
 * F-050 FR-006: a malformed `photo` is **dropped** rather than failing the whole
 * entry, so a junk photo field cannot cost the user a valid text status. A `photo`
 * that survives is still validated, because an unchecked photo would put `undefined`
 * into an `<img src>`.
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

/**
 * F-050 FR-006: normalize a loaded entry, dropping a photo that is not usable.
 *
 * Returns `null` when nothing renderable is left. That case is real, not defensive:
 * an entry whose only content was its photo, with that photo malformed, would leave a
 * "published" status with no text and no image — and the feed would then claim a
 * status exists while showing nothing, which is the F-046 dishonesty rule one level
 * up. An empty status is not a status.
 */
function normalizeEntry(value: StatusEntry): StatusEntry | null {
  const hasText = value.text.trim().length > 0;
  if (value.photo !== undefined && !isStatusPhoto(value.photo)) {
    const withoutPhoto: StatusEntry = {
      id: value.id,
      text: value.text,
      createdAtMs: value.createdAtMs,
    };
    return hasText ? withoutPhoto : null;
  }
  if (!hasText && value.photo === undefined) {
    return null;
  }
  return value;
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

  /**
   * F-050 FR-005 / FR-007. Replaces whatever status is there, text or photo, and
   * returns the created entry or `null` when nothing was published.
   *
   * The size check lives here rather than in the page because
   * `LocalStorageAdapter.write` swallows `QuotaExceededError` by design (F-047
   * FR-002). Left to the adapter, an oversized photo would be published, shown to
   * the user and then silently gone on reload, with no error anywhere. Refusing up
   * front is the only way to keep the visible status and the persisted status the
   * same thing, and a refusal leaves the previous status untouched.
   */
  publishPhoto(dataUrl: string, nowMs: number): StatusEntry | null {
    if (!isPhotoDataUrl(dataUrl) || dataUrl.length > PHOTO_MAX_CHARS) {
      return null;
    }
    // Width and height are not passed in: the only producer is the downscale helper,
    // and a caller that guessed them would render a wrongly-sized feed photo. They
    // are recorded as unknown rather than invented.
    const entry: StatusEntry = {
      id: this.nextId(),
      text: '',
      createdAtMs: nowMs,
      photo: { dataUrl, width: 0, height: 0 },
    };
    this.myStatus.set(entry);
    this.persist();
    return entry;
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
    this.myStatus.set(
      snapshot.myStatus === null ? null : normalizeEntry(snapshot.myStatus),
    );
    this.nextStatusSeq = snapshot.nextStatusSeq ?? 0;
  }
}
