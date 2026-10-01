import { TestBed } from '@angular/core/testing';
import { CALL_PERSISTENCE_KEY, CallStore } from './call.store';
import { CALL_SEED } from '../features/calls/calls.seed';
import { CallTarget, CONNECT_AFTER_MS, DIALING_MS, RINGING_MS } from '../features/calls/calls.model';

describe('CallStore', () => {
  let store: CallStore;

  const MARTHA: CallTarget = {
    contactId: 'chat-006',
    contactName: 'Martha Craig',
    avatarRef: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
    store = TestBed.inject(CallStore);
  });

  function reload(): CallStore {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    return TestBed.inject(CallStore);
  }

  it('seeds the call log from the design seed (F-038)', () => {
    expect(store.calls().length).toBe(CALL_SEED.length);
    expect(store.calls()[0]?.id).toBe(CALL_SEED[0]?.id);
    expect(store.calls().map((call) => call.contactName)).toEqual(
      CALL_SEED.map((call) => call.contactName),
    );
  });

  it('removeCall drops one entry and persists across reloads (F-038)', () => {
    store.removeCall('call-001');
    expect(store.calls().length).toBe(CALL_SEED.length - 1);
    expect(store.calls().some((call) => call.id === 'call-001')).toBe(false);

    const reloaded = reload();
    expect(reloaded.calls().length).toBe(CALL_SEED.length - 1);
    expect(reloaded.calls().some((call) => call.id === 'call-001')).toBe(false);
  });

  it('clearCalls empties the log and the empty state survives a reload (F-038)', () => {
    store.clearCalls();
    expect(store.calls()).toEqual([]);

    const reloaded = reload();
    expect(reloaded.calls()).toEqual([]);
  });

  it('ignores an unknown snapshot version (F-038)', () => {
    localStorage.setItem(
      CALL_PERSISTENCE_KEY,
      JSON.stringify({ version: 99, calls: [{ id: 'x' }] }),
    );
    const reloaded = reload();
    expect(reloaded.calls().length).toBe(CALL_SEED.length);
  });

  it('ignores a corrupt payload (F-038)', () => {
    localStorage.setItem(CALL_PERSISTENCE_KEY, 'not-json');
    const reloaded = reload();
    expect(reloaded.calls().length).toBe(CALL_SEED.length);
  });

  // F-045 T001: the v1 snapshot has no `outcome` and no `nextCallSeq`. Written
  // before the field existed so the normalizer is proven, not assumed.
  describe('F-045 v1 snapshot compatibility (T001)', () => {
    function writeLegacySnapshot(
      calls: readonly unknown[] = [
        {
          id: 'call-001',
          contactName: 'Martin Randolph',
          direction: 'outgoing',
          date: '10/13/19',
          avatarRef: null,
        },
      ],
    ): void {
      localStorage.setItem(
        CALL_PERSISTENCE_KEY,
        JSON.stringify({
          version: 1,
          calls,
        }),
      );
    }

    it('normalizes a legacy entry with no outcome (FR-008)', () => {
      writeLegacySnapshot();
      const reloaded = reload();
      expect(reloaded.calls()[0]?.outcome).toBe('completed');
    });

    // Owner clarify: a blanket 'completed' default would report the two seeded
    // missed calls (call-004, call-012) as completed - the "fake a success"
    // outcome the spec forbids. The default is derived from `direction`.
    it('derives a legacy missed entry as missed, never completed (FR-008)', () => {
      writeLegacySnapshot([
        {
          id: 'call-004',
          contactName: 'Karen Castillo',
          direction: 'missed',
          date: '9/30/19',
          avatarRef: null,
        },
      ]);

      expect(reload().calls()[0]?.outcome).toBe('missed');
    });

    it('derives an incoming legacy entry as completed (FR-008)', () => {
      writeLegacySnapshot([
        {
          id: 'call-005',
          contactName: 'Zack John',
          direction: 'incoming',
          date: '9/24/19',
          avatarRef: null,
        },
      ]);

      expect(reload().calls()[0]?.outcome).toBe('completed');
    });

    it('an outcome already on disk is preserved, not overwritten (FR-008)', () => {
      writeLegacySnapshot([
        {
          id: 'call-004',
          contactName: 'Karen Castillo',
          direction: 'missed',
          date: '9/30/19',
          avatarRef: null,
          outcome: 'completed',
        },
      ]);

      expect(reload().calls()[0]?.outcome).toBe('completed');
    });

    it('defaults the id counter so a legacy log does not reissue call-1 (FR-007)', () => {
      writeLegacySnapshot();
      const reloaded = reload();
      reloaded.startCall(MARTHA, 'voice', 0);
      const entry = reloaded.endCall(1000);
      expect(entry?.id).toBe('call-1');
      expect(reloaded.calls().some((c) => c.id === 'call-1')).toBe(true);
    });
  });

  // F-045 T005: the call state machine.
  describe('F-045 call session (T005)', () => {
    it('starts in dialing with no duration (FR-004)', () => {
      expect(store.startCall(MARTHA, 'voice', 1000)).toBe(true);
      const session = store.session();
      expect(session?.state).toBe('dialing');
      expect(session?.elapsedMs).toBe(0);
      expect(session?.connectedAtMs).toBeNull();
    });

    it('promotes dialing -> ringing at the boundary (FR-004)', () => {
      store.startCall(MARTHA, 'voice', 0);
      store.advance(DIALING_MS);
      expect(store.session()?.state).toBe('ringing');
    });

    it('stays dialing before the boundary (FR-004)', () => {
      store.startCall(MARTHA, 'voice', 0);
      store.advance(DIALING_MS - 1);
      expect(store.session()?.state).toBe('dialing');
    });

    it('auto-answers to connected after ringing (FR-004)', () => {
      store.startCall(MARTHA, 'voice', 0);
      store.advance(CONNECT_AFTER_MS);
      expect(store.session()?.state).toBe('connected');
    });

    it('the duration counts only from connected, and starts at zero (FR-010)', () => {
      store.startCall(MARTHA, 'voice', 0);
      store.advance(CONNECT_AFTER_MS);
      expect(store.session()?.elapsedMs).toBe(0);
      store.advance(CONNECT_AFTER_MS + 5000);
      expect(store.session()?.elapsedMs).toBe(5000);
    });

    it('advance() after the call ends is a no-op (FR-010)', () => {
      store.startCall(MARTHA, 'voice', 0);
      store.advance(CONNECT_AFTER_MS);
      store.endCall(CONNECT_AFTER_MS);
      const ended = store.session();
      store.advance(CONNECT_AFTER_MS + 60_000);
      expect(store.session()).toBe(ended);
    });

    it('advance() with no session is a no-op (FR-010)', () => {
      expect(() => store.advance(1000)).not.toThrow();
      expect(store.session()).toBeNull();
    });

    it('refuses a second call while one is active, leaving the session untouched (FR-011)', () => {
      store.startCall(MARTHA, 'voice', 0);
      const first = store.session();
      expect(store.startCall({ ...MARTHA, contactName: 'Other' }, 'video', 500)).toBe(false);
      expect(store.session()).toBe(first);
    });

    it('allows a new call once the previous one ended (FR-011)', () => {
      store.startCall(MARTHA, 'voice', 0);
      store.advance(CONNECT_AFTER_MS);
      store.endCall(CONNECT_AFTER_MS);
      store.clearSession();
      expect(store.startCall(MARTHA, 'video', 10_000)).toBe(true);
    });

    it('toggles mutate real session state (FR-006)', () => {
      store.startCall(MARTHA, 'video', 0);
      store.toggleMute();
      expect(store.session()?.muted).toBe(true);
      store.toggleSpeaker();
      expect(store.session()?.speakerOn).toBe(true);
      store.toggleVideo();
      expect(store.session()?.videoOn).toBe(true);
    });

    it('toggles after the call ends change nothing (FR-006)', () => {
      store.startCall(MARTHA, 'voice', 0);
      store.advance(CONNECT_AFTER_MS);
      store.endCall(CONNECT_AFTER_MS);
      store.toggleMute();
      expect(store.session()?.muted).toBe(false);
    });
  });

  // F-045: the log entry written at call end.
  describe('F-045 call log entry (T005)', () => {
    it('records completed when the call connected (FR-007)', () => {
      store.startCall(MARTHA, 'voice', 0);
      store.advance(CONNECT_AFTER_MS);
      const entry = store.endCall(CONNECT_AFTER_MS + 1000);
      expect(entry?.outcome).toBe('completed');
      expect(entry?.direction).toBe('outgoing');
      expect(entry?.contactName).toBe('Martha Craig');
    });

    it('records missed when hung up during ringing, never completed (FR-007)', () => {
      store.startCall(MARTHA, 'voice', 0);
      store.advance(DIALING_MS + 1);
      const entry = store.endCall(DIALING_MS + 1);
      expect(entry?.outcome).toBe('missed');
    });

    it('records missed when hung up while still dialing (FR-007)', () => {
      store.startCall(MARTHA, 'voice', 0);
      const entry = store.endCall(0);
      expect(entry?.outcome).toBe('missed');
    });

    it('appends exactly one entry per call and prepends it (FR-007)', () => {
      const before = store.calls().length;
      store.startCall(MARTHA, 'voice', 0);
      store.advance(CONNECT_AFTER_MS);
      store.endCall(CONNECT_AFTER_MS);
      expect(store.calls().length).toBe(before + 1);
      expect(store.calls()[0]?.contactName).toBe('Martha Craig');
    });

    it('endCall with no call appends nothing (FR-007)', () => {
      const before = store.calls().length;
      expect(store.endCall(0)).toBeNull();
      expect(store.calls().length).toBe(before);
    });

    it('the entry persists across a reload with a monotonic id (FR-007)', () => {
      store.startCall(MARTHA, 'voice', 0);
      store.advance(CONNECT_AFTER_MS);
      store.endCall(CONNECT_AFTER_MS);
      const reloaded = reload();
      expect(reloaded.calls()[0]?.outcome).toBe('completed');

      reloaded.startCall(MARTHA, 'voice', 0);
      reloaded.advance(CONNECT_AFTER_MS);
      const second = reloaded.endCall(CONNECT_AFTER_MS);
      expect(second?.id).toBe('call-2');
    });

    it('does not persist the session, so a reload has no in-progress call (FR-009)', () => {
      store.startCall(MARTHA, 'voice', 0);
      store.advance(CONNECT_AFTER_MS);
      const reloaded = reload();
      expect(reloaded.session()).toBeNull();
    });

    it('carries a null avatar for a contact with no matching chat (FR-012)', () => {
      store.startCall({ contactId: null, contactName: 'Nobody', avatarRef: null }, 'voice', 0);
      store.advance(CONNECT_AFTER_MS);
      const entry = store.endCall(CONNECT_AFTER_MS);
      expect(entry?.avatarRef).toBeNull();
      expect(entry?.contactName).toBe('Nobody');
    });
  });

  describe('F-047 FR-007a: storage-unavailable fallback', () => {
    // CallStore is the store with no clearStorage and no reset() - research.md
    // section 3. Its two helpers were still completely untested on the failure
    // branch, which is the only branch these helpers exist for.

    function unavailableStorage(): void {
      jasmine.getEnv().allowRespy(true);
      spyOn(localStorage, 'getItem').and.throwError('SecurityError');
      spyOn(localStorage, 'setItem').and.throwError('QuotaExceededError');
    }

    it('boots to the seed when localStorage cannot be read', () => {
      unavailableStorage();
      let recovered: CallStore | undefined;
      expect(() => {
        recovered = new CallStore();
      }).not.toThrow();
      expect(recovered?.calls().length).toBe(CALL_SEED.length);
      expect(recovered?.session()).toBeNull();
    });

    it('records the call in memory when persisting throws', () => {
      unavailableStorage();
      expect(() => store.startCall(MARTHA, 'voice', 0)).not.toThrow();
      store.advance(CONNECT_AFTER_MS);
      let ended: unknown;
      expect(() => {
        ended = store.endCall(CONNECT_AFTER_MS);
      }).not.toThrow();
      expect(ended).not.toBeNull();
      expect(store.calls().length).toBe(CALL_SEED.length + 1);
    });

    it('removeCall and clearCalls do not throw when persisting throws', () => {
      unavailableStorage();
      expect(() => store.removeCall(CALL_SEED[0]!.id)).not.toThrow();
      expect(store.calls().length).toBe(CALL_SEED.length - 1);
      expect(() => store.clearCalls()).not.toThrow();
      expect(store.calls()).toEqual([]);
    });
  });
});
