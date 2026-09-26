import { TestBed } from '@angular/core/testing';
import {
  DEFAULT_CHAT_SORT,
  DEFAULT_PREFS,
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
});