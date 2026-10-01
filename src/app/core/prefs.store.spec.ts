import { TestBed } from '@angular/core/testing';
import {
  DEFAULT_CHAT_SORT,
  DEFAULT_FONT_SCALE,
  DEFAULT_PREFS,
  DEFAULT_PROFILE,
  PREFS_KEY,
  PrefsStore,
} from './prefs.store';

describe('PrefsStore', () => {
  let store: PrefsStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
    store = TestBed.inject(PrefsStore);
  });

  it('starts with the default preferences', () => {
    expect(store.prefs()).toEqual(DEFAULT_PREFS);
    expect(store.chatSort()).toBe(DEFAULT_CHAT_SORT);
  });

  it('toggle flips a preference and persists it', () => {
    store.toggle('enterKeySends');
    expect(store.prefs().enterKeySends).toBe(false);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    expect(TestBed.inject(PrefsStore).prefs().enterKeySends).toBe(false);
  });

  it('set writes an explicit value and persists it', () => {
    store.set('showPreviews', false);
    expect(store.prefs().showPreviews).toBe(false);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    expect(TestBed.inject(PrefsStore).prefs().showPreviews).toBe(false);
  });

  it('reset clears storage and restores defaults', () => {
    store.toggle('showPreviews');
    store.toggle('enterKeySends');
    store.setChatSort('name');
    store.reset();
    expect(store.prefs()).toEqual(DEFAULT_PREFS);
    expect(store.chatSort()).toBe(DEFAULT_CHAT_SORT);
    expect(localStorage.getItem(PREFS_KEY)).toBeNull();
  });

  it('setChatSort persists the sort choice across reloads', () => {
    store.setChatSort('unread');
    expect(store.chatSort()).toBe('unread');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    expect(TestBed.inject(PrefsStore).chatSort()).toBe('unread');
  });

  it('accepts a v1 envelope, keeping the default chat sort', () => {
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ version: 1, prefs: { ...DEFAULT_PREFS, showPreviews: false } }),
    );
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const reloaded = TestBed.inject(PrefsStore);
    expect(reloaded.prefs().showPreviews).toBe(false);
    expect(reloaded.chatSort()).toBe(DEFAULT_CHAT_SORT);
  });

  describe('F-046 FR-006: removed keys normalize away on load', () => {
    it('drops the five removed keys from a persisted v4 snapshot without throwing', () => {
      // A user who used the app before this feature has these keys on disk. The
      // envelope version is deliberately not bumped, so hydrate() must normalize.
      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({
          version: 4,
          prefs: {
            ...DEFAULT_PREFS,
            sound: false,
            vibrate: false,
            popup: false,
            light: false,
            mediaVisibility: false,
          },
          chatSort: 'name',
        }),
      );
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const reloaded = TestBed.inject(PrefsStore);
      expect(reloaded.prefs()).toEqual(DEFAULT_PREFS);
      // And the rest of the envelope is still honoured, not discarded.
      expect(reloaded.chatSort()).toBe('name');
    });

    it('keeps the two surviving prefs across the same reload', () => {
      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({
          version: 4,
          prefs: { ...DEFAULT_PREFS, showPreviews: false, enterKeySends: false, sound: true },
          chatSort: 'recent',
        }),
      );
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const reloaded = TestBed.inject(PrefsStore);
      expect(reloaded.prefs().showPreviews).toBe(false);
      expect(reloaded.prefs().enterKeySends).toBe(false);
    });
  });

  it('starts with the default profile (F-036)', () => {
    expect(store.profile()).toEqual(DEFAULT_PROFILE);
    expect(store.profile().name).toBe('Ani');
    expect(store.profile().about).toBe('');
  });

  it('updateProfile persists the name and about across reloads (F-036)', () => {
    store.updateProfile('Anita', 'Building things');
    expect(store.profile()).toEqual({ name: 'Anita', about: 'Building things' });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    expect(TestBed.inject(PrefsStore).profile()).toEqual({
      name: 'Anita',
      about: 'Building things',
    });
  });

  it('hydrates a v2 envelope without a profile using the default profile (F-036)', () => {
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ version: 2, prefs: DEFAULT_PREFS, chatSort: 'name' }),
    );
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const reloaded = TestBed.inject(PrefsStore);
    expect(reloaded.chatSort()).toBe('name');
    expect(reloaded.profile()).toEqual(DEFAULT_PROFILE);
  });

  it('reset restores the default profile and clears storage (F-036)', () => {
    store.updateProfile('Someone', 'About me');
    store.reset();
    expect(store.profile()).toEqual(DEFAULT_PROFILE);
    expect(localStorage.getItem(PREFS_KEY)).toBeNull();
  });

  it('starts with the default font scale (F-041 FR-001)', () => {
    expect(store.fontScale()).toBe(DEFAULT_FONT_SCALE);
    expect(DEFAULT_FONT_SCALE).toBe('default');
  });

  it('setFontScale persists the step across reloads (F-041 FR-003, FR-014)', () => {
    store.setFontScale('large');
    expect(store.fontScale()).toBe('large');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    expect(TestBed.inject(PrefsStore).fontScale()).toBe('large');
  });

  it('persists a version 4 envelope (F-041 FR-002)', () => {
    store.setFontScale('small');
    const raw = localStorage.getItem(PREFS_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string).version).toBe(4);
    expect(JSON.parse(raw as string).fontScale).toBe('small');
  });

  it('hydrates a v3 envelope with the default font scale (F-041 FR-002)', () => {
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ version: 3, prefs: DEFAULT_PREFS, chatSort: 'recent' }),
    );
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const reloaded = TestBed.inject(PrefsStore);
    expect(reloaded.fontScale()).toBe(DEFAULT_FONT_SCALE);
    expect(reloaded.prefs()).toEqual(DEFAULT_PREFS);
  });

  it('keeps a stored font scale when hydrating a v4 envelope (F-041 FR-014)', () => {
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({
        version: 4,
        prefs: DEFAULT_PREFS,
        chatSort: 'recent',
        fontScale: 'extra-large',
      }),
    );
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    expect(TestBed.inject(PrefsStore).fontScale()).toBe('extra-large');
  });

  it('falls back to the default font scale for an unknown stored value (F-041 FR-002)', () => {
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({
        version: 4,
        prefs: DEFAULT_PREFS,
        chatSort: 'recent',
        fontScale: 'enormous',
      }),
    );
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    expect(TestBed.inject(PrefsStore).fontScale()).toBe(DEFAULT_FONT_SCALE);
  });

  it('reset restores the default font scale (F-041 FR-003)', () => {
    store.setFontScale('extra-large');
    store.reset();
    expect(store.fontScale()).toBe(DEFAULT_FONT_SCALE);
    expect(localStorage.getItem(PREFS_KEY)).toBeNull();
  });

  describe('F-047 FR-007a: the failure paths, covered before anything is moved', () => {
    // Written against the current implementation, and required to pass before
    // the storage helpers move behind a port. See research.md section 7: chat and
    // call both guarded JSON.parse, prefs did not, and no store tested an
    // unavailable localStorage at all - so every branch those helpers exist for
    // was untested.

    // Jasmine restores a spyOn after each spec, so no manual teardown is needed.

    function unavailableStorage(): void {
      jasmine.getEnv().allowRespy(true);
      spyOn(localStorage, 'getItem').and.throwError('SecurityError');
      spyOn(localStorage, 'setItem').and.throwError('QuotaExceededError');
      spyOn(localStorage, 'removeItem').and.throwError('SecurityError');
    }

    it('a corrupt payload falls back to defaults instead of throwing (chat and call already guard this)', () => {
      localStorage.setItem(PREFS_KEY, 'not json at all{');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});

      let recovered: PrefsStore | undefined;
      expect(() => {
        recovered = TestBed.inject(PrefsStore);
      }).not.toThrow();
      expect(recovered?.prefs()).toEqual(DEFAULT_PREFS);
      expect(recovered?.chatSort()).toBe(DEFAULT_CHAT_SORT);
      expect(recovered?.fontScale()).toBe(DEFAULT_FONT_SCALE);
      expect(recovered?.profile()).toEqual(DEFAULT_PROFILE);
    });

    it('boots to defaults when localStorage is unavailable', () => {
      unavailableStorage();
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});

      let recovered: PrefsStore | undefined;
      expect(() => {
        recovered = TestBed.inject(PrefsStore);
      }).not.toThrow();
      expect(recovered?.prefs()).toEqual(DEFAULT_PREFS);
      expect(recovered?.profile()).toEqual(DEFAULT_PROFILE);
    });

    it('still applies changes in memory when persisting throws', () => {
      // The distinction that matters: storage failure must not roll back or block
      // the user's action. The value is held for this session and silently not
      // persisted, which is the correct degradation.
      store.set('showPreviews', false);
      unavailableStorage();
      expect(() => store.set('showPreviews', false)).not.toThrow();
      expect(() => store.toggle('enterKeySends')).not.toThrow();
      expect(() => store.setChatSort('name')).not.toThrow();
      expect(() => store.updateProfile('Ada', 'hi')).not.toThrow();
      expect(store.prefs().enterKeySends).toBe(false);
      expect(store.chatSort()).toBe('name');
      expect(store.profile()).toEqual({ name: 'Ada', about: 'hi' });
    });

    it('reset does not throw when removeItem is unavailable', () => {
      unavailableStorage();
      expect(() => store.reset()).not.toThrow();
      expect(store.prefs()).toEqual(DEFAULT_PREFS);
    });
  });
});