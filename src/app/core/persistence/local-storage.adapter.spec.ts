import { TestBed } from '@angular/core/testing';
import { LocalStorageAdapter } from './local-storage.adapter';
import { PersistencePort } from './persistence.port';
import { InMemoryPersistencePort } from './in-memory.port';
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

  describe('F-047 FR-009: the port itself resolves at the root', () => {
    // `providedIn: 'root'` on LocalStorageAdapter registers LocalStorageAdapter.
    // `extends PersistencePort` is a *compile-time* relationship that Angular's
    // injector knows nothing about, so on its own it registers no binding for the
    // abstract token. This test is the only thing that notices: it first failed with
    // NG0201, and it is deliberately configured with an **empty** TestBed rather
    // than appConfig.providers, because "no test needs one for a happy path"
    // (FR-009) is the whole point — appConfig is invisible to TestBed, so passing
    // appConfig.providers here would prove something weaker and would hide the
    // ~210 feature specs that inject these stores with no providers of their own.
    it('resolves PersistencePort with no provider declared anywhere in the test', () => {
      const port = TestBed.inject(PersistencePort);

      expect(port).toBeInstanceOf(LocalStorageAdapter);
      port.write('k', 'v');
      expect(port.read('k')).toBe('v');
    });
  });
});

// Separate describe: `TestBed.overrideProvider` must run before the injector is
// created, so it cannot live under the suite whose beforeEach already injected.
describe('F-047 FR-010: the root default does not obstruct substitution', () => {
  it('yields a double when a test overrides the port token', () => {
    const double = new InMemoryPersistencePort();
    TestBed.configureTestingModule({
      providers: [{ provide: PersistencePort, useValue: double }],
    });

    const port = TestBed.inject(PersistencePort);

    expect(port).toBe(double);
    // And it is genuinely in effect: the double's storage is what the caller sees,
    // with no localStorage behind it. An override that resolved but did not take
    // effect would pass a bare identity check and still defeat every seam test.
    port.write('k', 'v');
    expect(port.read('k')).toBe('v');
    expect(localStorage.getItem('k')).toBeNull();
  });

  it('still resolves the port when the test declares no provider at all', () => {
    TestBed.configureTestingModule({});

    expect(TestBed.inject(PersistencePort)).toBeInstanceOf(LocalStorageAdapter);
  });
});