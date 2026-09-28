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
    store.toggle('mediaVisibility');
    store.toggle('sound');
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
      JSON.stringify({ version: 1, prefs: { ...DEFAULT_PREFS, sound: false } }),
    );
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const reloaded = TestBed.inject(PrefsStore);
    expect(reloaded.prefs().sound).toBe(false);
    expect(reloaded.chatSort()).toBe(DEFAULT_CHAT_SORT);
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
});