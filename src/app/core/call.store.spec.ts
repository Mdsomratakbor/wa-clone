import { TestBed } from '@angular/core/testing';
import { CALL_PERSISTENCE_KEY, CallStore } from './call.store';
import { CALL_SEED } from '../features/calls/calls.seed';

describe('CallStore', () => {
  let store: CallStore;

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
});
