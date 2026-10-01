import { TestBed } from '@angular/core/testing';
import { LocalStorageAdapter } from './local-storage.adapter';
import { PERSISTENCE_KEY } from '../chat.store';

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    adapter = TestBed.inject(LocalStorageAdapter);
  });

  it('round-trips a payload', () => {
    adapter.write('k', '{"a":1}');
    expect(adapter.read('k')).toBe('{"a":1}');
  });

  it('returns null for an absent key rather than undefined', () => {
    expect(adapter.read('absent')).toBeNull();
  });

  it('remove deletes the key entirely', () => {
    adapter.write('k', 'v');
    adapter.remove('k');
    expect(adapter.read('k')).toBeNull();
    expect(localStorage.getItem('k')).toBeNull();
  });

  it('remove on an absent key is a no-op', () => {
    expect(() => adapter.remove('absent')).not.toThrow();
  });

  describe('unavailable storage', () => {
    function unavailableStorage(): void {
      jasmine.getEnv().allowRespy(true);
      spyOn(localStorage, 'getItem').and.throwError('SecurityError');
      spyOn(localStorage, 'setItem').and.throwError('QuotaExceededError');
      spyOn(localStorage, 'removeItem').and.throwError('SecurityError');
    }

    it('read returns null instead of propagating SecurityError', () => {
      unavailableStorage();
      let result: unknown = 'unset';
      expect(() => {
        result = adapter.read('k');
      }).not.toThrow();
      expect(result).toBeNull();
    });

    it('write is a silent no-op instead of propagating QuotaExceededError', () => {
      unavailableStorage();
      expect(() => adapter.write('k', 'v')).not.toThrow();
    });

    it('remove is a silent no-op instead of propagating', () => {
      unavailableStorage();
      expect(() => adapter.remove('k')).not.toThrow();
    });
  });

  describe('F-047 FR-006: byte-for-byte compatibility with the pre-port code', () => {
    // The regression guard. Before this feature, ChatStore wrote its snapshot
    // through a private `writeStorage(PERSISTENCE_KEY, JSON.stringify(...))`. If
    // the adapter changed the key or the serialization, a user with existing
    // data would silently lose it on upgrade - and no store test would notice,
    // because every store test would be using the same new code on both sides.
    it('writes the chat snapshot under the same key the store reads', () => {
      const snapshot = { version: 1, conversations: [], threads: {} };
      adapter.write(PERSISTENCE_KEY, JSON.stringify(snapshot));

      const raw = localStorage.getItem(PERSISTENCE_KEY);
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw as string)).toEqual(snapshot);
      expect(adapter.read(PERSISTENCE_KEY)).toBe(raw);
    });
  });
});