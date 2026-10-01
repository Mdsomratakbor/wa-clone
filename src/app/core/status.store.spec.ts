import { TestBed } from '@angular/core/testing';
import { StatusStore, STATUS_PERSISTENCE_KEY } from './status.store';
import { PersistencePort } from './persistence/persistence.port';
import { LocalStorageAdapter } from './persistence/local-storage.adapter';
import { InMemoryPersistencePort } from './persistence/in-memory.port';

describe('StatusStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  function fresh(): StatusStore {
    return TestBed.inject(StatusStore);
  }

  it('publishes a status with the injected time and returns it (F-049 FR-005)', () => {
    const store = fresh();

    const entry = store.publish('at the beach', 1_700_000_000_000);

    expect(entry).toEqual({ id: 'status-1', text: 'at the beach', createdAtMs: 1_700_000_000_000 });
    expect(store.myStatus()).toEqual(entry);
  });

  it('trims leading and trailing whitespace (F-049 FR-003)', () => {
    const store = fresh();

    expect(store.publish('  on the move  ', 1)?.text).toBe('on the move');
    expect(store.myStatus()?.text).toBe('on the move');
  });

  it('refuses blank and whitespace-only text without creating or writing (F-049 FR-004)', () => {
    const store = fresh();
    const before = localStorage.getItem(STATUS_PERSISTENCE_KEY);

    expect(store.publish('', 1)).toBeNull();
    expect(store.publish('   \n\t ', 1)).toBeNull();
    expect(store.myStatus()).toBeNull();
    expect(localStorage.getItem(STATUS_PERSISTENCE_KEY)).toBe(before);
  });

  it('a second publish replaces rather than stacks (F-049 FR-005)', () => {
    const store = fresh();

    store.publish('first', 1);
    const second = store.publish('second', 2);

    expect(second?.id).toBe('status-2');
    expect(store.myStatus()?.text).toBe('second');
  });

  it('ids are monotonic and do not collide after a reload (F-049 FR-007)', () => {
    const store = fresh();
    store.publish('first', 1);

    const reloaded = new StatusStore(new LocalStorageAdapter());

    expect(reloaded.publish('second', 2)?.id).toBe('status-2');
    expect(reloaded.myStatus()?.id).toBe('status-2');
  });

  it('a published status survives a reload (F-049 FR-006)', () => {
    fresh().publish('still here', 42);

    expect(new StatusStore(new LocalStorageAdapter()).myStatus()).toEqual({
      id: 'status-1',
      text: 'still here',
      createdAtMs: 42,
    });
  });

  it('ignores a snapshot with a foreign version (F-049 FR-006)', () => {
    localStorage.setItem(
      STATUS_PERSISTENCE_KEY,
      JSON.stringify({ version: 99, myStatus: { id: 'x', text: 'no', createdAtMs: 1 } }),
    );

    expect(fresh().myStatus()).toBeNull();
  });

  it('ignores an unparseable snapshot rather than throwing (F-049 FR-006)', () => {
    localStorage.setItem(STATUS_PERSISTENCE_KEY, '{not json');

    expect(fresh().myStatus()).toBeNull();
  });

  it('ignores a malformed myStatus rather than rendering undefined (F-049 FR-006)', () => {
    for (const bad of [{ id: 'status-1' }, { id: 1, text: 'x', createdAtMs: 1 }, 'nope', 7]) {
      localStorage.setItem(
        STATUS_PERSISTENCE_KEY,
        JSON.stringify({ version: 1, myStatus: bad, nextStatusSeq: 3 }),
      );
      expect(fresh().myStatus()).toBeNull();
    }
  });

  it('loads a snapshot with no counter and starts issuing (F-049 FR-007)', () => {
    localStorage.setItem(
      STATUS_PERSISTENCE_KEY,
      JSON.stringify({
        version: 1,
        myStatus: { id: 'status-9', text: 'legacy', createdAtMs: 5 },
      }),
    );

    const store = fresh();

    expect(store.myStatus()?.text).toBe('legacy');
    expect(store.publish('next', 6)?.id).toBe('status-1');
  });

  it('an empty store writes nothing on load (F-049 FR-013)', () => {
    fresh();

    expect(localStorage.getItem(STATUS_PERSISTENCE_KEY)).toBeNull();
  });

  it('a snapshot without a myStatus key loads as empty (F-049 FR-006)', () => {
    localStorage.setItem(STATUS_PERSISTENCE_KEY, JSON.stringify({ version: 1 }));

    expect(fresh().myStatus()).toBeNull();
  });

  it('works against a non-persistent port, as when storage is unavailable (F-049 FR-003)', () => {
    // Storage resilience lives in LocalStorageAdapter, which swallows quota and
    // SecurityError. So the port contract is "read yields null when nothing is
    // available", not "write throws" - the store must stay usable in memory and
    // must not invent a resilience the other three stores do not have.
    const unavailable: PersistencePort = {
      read: () => null,
      write: () => undefined,
      remove: () => undefined,
    };
    const store = new StatusStore(unavailable);

    expect(store.myStatus()).toBeNull();
    expect(store.publish('in memory only', 1)?.text).toBe('in memory only');
    expect(store.myStatus()?.text).toBe('in memory only');
  });

  it('reads through the port rather than touching localStorage (F-047 seam)', () => {
    const port = new InMemoryPersistencePort();
    const store = new StatusStore(port);

    store.publish('via port', 1);

    expect(port.read(STATUS_PERSISTENCE_KEY)).toContain('via port');
  });
});
