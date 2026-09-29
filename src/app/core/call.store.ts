import { Injectable, signal } from '@angular/core';
import {
  CallEntry,
  CallKind,
  CallOutcome,
  CallSession,
  CallTarget,
  formatCallDate,
  isActiveCall,
  reduceSession,
} from '../features/calls/calls.model';
import { CALL_SEED } from '../features/calls/calls.seed';

export const CALL_PERSISTENCE_KEY = 'wa.call-store.v1';

interface CallStoreSnapshot {
  version: 1;
  calls: CallEntry[];
  /** F-045: optional so a pre-F-045 v1 snapshot still loads (defaults to 0). */
  nextCallSeq?: number;
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

// F-045: `outcome` was added after v1 shipped, and hydrate() had no normalizer, so
// a snapshot written before this feature loads with `outcome: undefined` and the
// Calls list renders a blank status. Same defect class F-042's hydrateDefaults()
// caught, so the v1-snapshot test was written first.
function normalizeCalls(calls: readonly CallEntry[]): CallEntry[] {
  return calls.map((call) => ({ ...call, outcome: call.outcome ?? 'completed' }));
}

@Injectable({ providedIn: 'root' })
export class CallStore {
  readonly calls = signal<CallEntry[]>([...CALL_SEED] as CallEntry[]);

  /**
   * F-045: the live call, or null. Not persisted - a reload must not restore a
   * call that is not there (FR-009).
   */
  readonly session = signal<CallSession | null>(null);

  private nextCallSeq = 0;

  constructor() {
    this.hydrate();
  }

  // F-043: the call-info sheet's Delete action calls this directly. No new store
  // method was needed - the sheet is view state and stays on the page, so nothing
  // about it is persisted; the snapshot shape and version are unchanged.
  removeCall(id: string): void {
    this.calls.update((list) => list.filter((entry) => entry.id !== id));
    this.persist();
  }

  clearCalls(): void {
    this.calls.set([]);
    this.persist();
  }

  /**
   * F-045 / FR-011: refuses to replace or stack an active call. Returns whether
   * the call was started, so the caller can leave the session untouched.
   */
  startCall(target: CallTarget, kind: CallKind, nowMs: number): boolean {
    if (isActiveCall(this.session())) {
      return false;
    }
    this.session.set({
      target,
      kind,
      state: 'dialing',
      startedAtMs: nowMs,
      connectedAtMs: null,
      elapsedMs: 0,
      muted: false,
      speakerOn: false,
      videoOn: false,
    });
    return true;
  }

  /** FR-010: the only way time moves. A null or ended session makes this a no-op. */
  advance(nowMs: number): void {
    const session = this.session();
    if (session === null) {
      return;
    }
    const next = reduceSession(session, nowMs);
    if (next !== session) {
      this.session.set(next);
    }
  }

  /**
   * FR-007: ends the call and records it. The outcome is derived from the state
   * actually reached - a call hung up before connecting is `missed`, never
   * `completed`. Returns the appended entry, or null when there was no call.
   */
  endCall(nowMs: number): CallEntry | null {
    const session = this.session();
    if (session === null || session.state === 'ended') {
      return null;
    }
    const outcome: CallOutcome = session.state === 'connected' ? 'completed' : 'missed';
    const entry: CallEntry = {
      id: this.nextCallId(),
      contactName: session.target.contactName,
      direction: 'outgoing',
      date: formatCallDate(nowMs),
      avatarRef: session.target.avatarRef,
      outcome,
    };
    this.session.set({ ...session, state: 'ended' });
    this.calls.update((list) => [entry, ...list]);
    this.persist();
    return entry;
  }

  clearSession(): void {
    this.session.set(null);
  }

  toggleMute(): void {
    this.updateSession((session) => ({ ...session, muted: !session.muted }));
  }

  toggleSpeaker(): void {
    this.updateSession((session) => ({ ...session, speakerOn: !session.speakerOn }));
  }

  toggleVideo(): void {
    this.updateSession((session) => ({ ...session, videoOn: !session.videoOn }));
  }

  private updateSession(patch: (session: CallSession) => CallSession): void {
    const session = this.session();
    if (session === null || session.state === 'ended') {
      return;
    }
    this.session.set(patch(session));
  }

  private nextCallId(): string {
    this.nextCallSeq += 1;
    return `call-${this.nextCallSeq}`;
  }

  private persist(): void {
    const snapshot: CallStoreSnapshot = {
      version: STORE_VERSION,
      calls: this.calls(),
      nextCallSeq: this.nextCallSeq,
    };
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
    this.calls.set(normalizeCalls(snapshot.calls));
    this.nextCallSeq = snapshot.nextCallSeq ?? 0;
  }
}
