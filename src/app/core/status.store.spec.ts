import { TestBed } from '@angular/core/testing';
import { StatusStore, STATUS_PERSISTENCE_KEY } from './status.store';
import { PHOTO_MAX_CHARS } from './status-photo';
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

  it('reset removes the key and restores the empty state (F-057 FR-008)', () => {
    const port = new InMemoryPersistencePort();
    const store = new StatusStore(port);
    store.publish('to erase', 1);

    store.reset();

    expect(port.read(STATUS_PERSISTENCE_KEY)).toBeNull();
    expect(store.myStatus()).toBeNull();
    expect(store.publish('after reset', 1)?.id).toBe('status-1');
  });

  // ---------------------------------------------------------------- F-050 ------

  const PHOTO = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
  const photoBytes = (length: number): string =>
    `data:image/jpeg;base64,${'A'.repeat(length)}`;

  it('publishPhoto stores an empty text and the photo, and returns the entry (F-050 FR-005)', () => {
    const store = fresh();

    const entry = store.publishPhoto(PHOTO, 1_700_000_000_000);

    expect(entry?.id).toBe('status-1');
    expect(entry?.text).toBe('');
    expect(entry?.createdAtMs).toBe(1_700_000_000_000);
    expect(entry?.photo?.dataUrl).toBe(PHOTO);
    expect(store.myStatus()).toEqual(entry);
  });

  it('a photo replaces a text status, and text replaces a photo (F-050 FR-005)', () => {
    const store = fresh();
    store.publish('first', 1);

    const photo = store.publishPhoto(PHOTO, 2);
    expect(photo?.id).toBe('status-2');
    expect(store.myStatus()?.text).toBe('');
    expect(store.myStatus()?.photo?.dataUrl).toBe(PHOTO);

    const backToText = store.publish('words again', 3);
    expect(backToText?.id).toBe('status-3');
    expect(store.myStatus()?.text).toBe('words again');
    expect(store.myStatus()?.photo).toBeUndefined();
  });

  it('ids stay monotonic across text and photo publishes (F-050 FR-005)', () => {
    const store = fresh();

    store.publishPhoto(PHOTO, 1);
    store.publish('text', 2);
    const third = store.publishPhoto(PHOTO, 3);

    expect(third?.id).toBe('status-3');
  });

  it('a photo survives a reload (F-050 FR-005, FR-008)', () => {
    fresh().publishPhoto(PHOTO, 1_700_000_000_000);

    const reloaded = new StatusStore(new LocalStorageAdapter());

    expect(reloaded.myStatus()?.photo?.dataUrl).toBe(PHOTO);
    expect(reloaded.myStatus()?.text).toBe('');
  });

  it('refuses an over-budget payload and leaves the previous status intact (F-050 FR-007)', () => {
    const store = fresh();
    store.publish('keep me', 1);
    const before = localStorage.getItem(STATUS_PERSISTENCE_KEY);

    const refused = store.publishPhoto(photoBytes(PHOTO_MAX_CHARS + 1), 2);

    expect(refused).toBeNull();
    expect(store.myStatus()?.text).toBe('keep me');
    // Nothing was written, so nothing can be lost on reload.
    expect(localStorage.getItem(STATUS_PERSISTENCE_KEY)).toBe(before);
  });

  it('refuses a payload that is not a data image URL (F-050 FR-004, FR-007)', () => {
    const store = fresh();

    expect(store.publishPhoto('', 1)).toBeNull();
    expect(store.publishPhoto('   ', 1)).toBeNull();
    expect(store.publishPhoto('<img src=x onerror=alert(1)>', 1)).toBeNull();
    expect(store.publishPhoto('https://example.com/photo.jpg', 1)).toBeNull();
    expect(store.publishPhoto('data:text/html;base64,PHNjcmlwdD4=', 1)).toBeNull();
    expect(store.myStatus()).toBeNull();
  });

  it('a payload exactly at the budget is accepted (F-050 FR-007)', () => {
    const store = fresh();
    const atBudget = photoBytes(PHOTO_MAX_CHARS - 'data:image/jpeg;base64,'.length);

    expect(store.publishPhoto(atBudget, 1)).not.toBeNull();
  });

  it('an F-049 snapshot with no photo key loads unchanged (F-050 FR-006)', () => {
    localStorage.setItem(
      STATUS_PERSISTENCE_KEY,
      JSON.stringify({
        version: 1,
        myStatus: { id: 'status-1', text: 'legacy', createdAtMs: 5 },
        nextStatusSeq: 1,
      }),
    );

    const store = fresh();

    expect(store.myStatus()?.text).toBe('legacy');
    expect(store.myStatus()?.photo).toBeUndefined();
    expect(store.publish('next', 6)?.id).toBe('status-2');
  });

  it('a snapshot whose photo is malformed loads as a text status with the photo dropped (F-050 FR-006)', () => {
    // Dropping the photo keeps a valid text status usable. Discarding the whole entry
    // over a junk photo field would be the worse failure.
    localStorage.setItem(
      STATUS_PERSISTENCE_KEY,
      JSON.stringify({
        version: 1,
        myStatus: { id: 'status-1', text: 'still here', createdAtMs: 5, photo: { dataUrl: 42 } },
        nextStatusSeq: 1,
      }),
    );

    const store = fresh();

    expect(store.myStatus()?.text).toBe('still here');
    expect(store.myStatus()?.photo).toBeUndefined();
  });

  it('a snapshot whose photo is a non-image data URL is dropped (F-050 FR-006, FR-007)', () => {
    localStorage.setItem(
      STATUS_PERSISTENCE_KEY,
      JSON.stringify({
        version: 1,
        myStatus: {
          id: 'status-1',
          text: '',
          createdAtMs: 5,
          photo: { dataUrl: 'data:text/html;base64,PHNjcmlwdD4=', width: 1, height: 1 },
        },
        nextStatusSeq: 1,
      }),
    );

    const store = fresh();

    expect(store.myStatus()).toBeNull();
  });

  it('a snapshot that is neither text nor photo loads as no status (F-050 FR-006)', () => {
    // A hand-edited or truncated snapshot can hold whitespace where text should be.
    // It is not a status, and the feed must not claim one exists.
    localStorage.setItem(
      STATUS_PERSISTENCE_KEY,
      JSON.stringify({
        version: 1,
        myStatus: { id: 'status-1', text: '   ', createdAtMs: 5 },
        nextStatusSeq: 1,
      }),
    );

    const store = fresh();

    expect(store.myStatus()).toBeNull();
    // The counter survives, so a later publish cannot reuse an id that was issued.
    expect(store.publish('real', 6)?.id).toBe('status-2');
  });

  it('publishes a photo through a non-persistent port (F-050 FR-005, F-047 seam)', () => {
    const unavailable: PersistencePort = {
      read: () => null,
      write: () => undefined,
      remove: () => undefined,
    };
    const store = new StatusStore(unavailable);

    expect(store.publishPhoto(PHOTO, 1)?.photo?.dataUrl).toBe(PHOTO);
    expect(store.myStatus()?.photo?.dataUrl).toBe(PHOTO);
  });
});
