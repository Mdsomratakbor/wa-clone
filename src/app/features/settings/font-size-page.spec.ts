import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ChatsSettingsPage } from './chats-settings-page';
import { FONT_SCALE_LABELS, FontSizePage } from './font-size-page';
import { DEFAULT_FONT_SCALE, FONT_SCALES, PrefsStore } from '../../core/prefs.store';

describe('FontSizePage', () => {
  let fixture: ComponentFixture<FontSizePage>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [FontSizePage],
      providers: [provideRouter([])],
    }).compileComponents();
    TestBed.inject(PrefsStore).reset();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(FontSizePage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function options(el: HTMLElement): HTMLButtonElement[] {
    return [...el.querySelectorAll<HTMLButtonElement>('[data-testid="font-size-option"]')];
  }

  it('renders the header: Back leading, Font size title', () => {
    const el = render();
    const actions = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')];
    expect(actions.length).toBe(1);
    expect(actions[0]?.textContent?.trim()).toBe('Back');
    expect(el.querySelector('.navigation-bar__title')?.textContent?.trim()).toBe('Font size');
  });

  it('does not render the tab bar (pushed surface)', () => {
    const el = render();
    expect(el.querySelector('[role="tab"]')).toBeNull();
  });

  it('renders the four size options in order inside a radiogroup (FR-005)', () => {
    const el = render();
    const group = el.querySelector('[data-testid="font-size-options"]');
    expect(group?.getAttribute('role')).toBe('radiogroup');
    expect(group?.getAttribute('aria-label')).toBe('Font size');

    const rendered = options(el);
    expect(rendered.length).toBe(4);
    expect(rendered.map((b) => b.textContent?.trim())).toEqual([
      'Small',
      'Default',
      'Large',
      'Extra large',
    ]);
    expect(FONT_SCALES).toEqual(['small', 'default', 'large', 'extra-large']);
  });

  it('checks the stored step on render and exposes it through aria-checked (FR-006)', () => {
    TestBed.inject(PrefsStore).setFontScale('large');
    const el = render();
    const rendered = options(el);
    expect(rendered.map((b) => b.getAttribute('aria-checked'))).toEqual([
      'false',
      'false',
      'true',
      'false',
    ]);
    expect(rendered[2]?.classList).toContain('font-size__option--selected');
    expect(rendered[0]?.classList).not.toContain('font-size__option--selected');
  });

  it('defaults to Default with no stored value (FR-001)', () => {
    expect(TestBed.inject(PrefsStore).fontScale()).toBe(DEFAULT_FONT_SCALE);
    const el = render();
    const rendered = options(el);
    expect(rendered[1]?.getAttribute('aria-checked')).toBe('true');
  });

  it('activating a step stores it, re-checks it and persists it (FR-003, FR-006)', () => {
    const el = render();
    options(el)[3]?.click();
    fixture.detectChanges();

    expect(TestBed.inject(PrefsStore).fontScale()).toBe('extra-large');
    const after = options(el);
    expect(after[3]?.getAttribute('aria-checked')).toBe('true');
    expect(after[1]?.getAttribute('aria-checked')).toBe('false');
    expect(localStorage.getItem('wa.prefs.v1')).toContain('extra-large');
  });

  it('every step label has an aria-label matching its text (a11y)', () => {
    const el = render();
    const rendered = options(el);
    rendered.forEach((option) => {
      const text = (option.textContent ?? '').trim();
      expect(text).not.toBe('');
      expect(option.getAttribute('aria-label')).toBe(text);
    });
    expect(rendered[3]?.getAttribute('aria-label')).toBe(FONT_SCALE_LABELS['extra-large']);
  });

  it('navigates to /settings/chats when Back is activated (FR-004)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    (el.querySelector('.navigation-bar__action') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/settings/chats']);
  });
});

describe('ChatsSettingsPage font size row', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ChatsSettingsPage],
      providers: [provideRouter([])],
    }).compileComponents();
    TestBed.inject(PrefsStore).reset();
  });

  it('the Font size row navigates to the font size screen (FR-007)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const fixture = TestBed.createComponent(ChatsSettingsPage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const row = [...el.querySelectorAll<HTMLButtonElement>('[data-testid="chats-settings-row"]')].find(
      (r) => r.getAttribute('aria-label') === 'Font size',
    );
    row?.click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/settings/chats/font-size']);
  });

  // F-059 FR-002: the Wallpaper row is no longer inert - it opens the wallpaper
  // picker. F-046 deferred it (capture-blocked); the picker ships PROVISIONAL.
  // See `specs/046-inert-control-sweep/disposition.md` G4 (marked RESOLVED) and
  // `specs/059-chats-settings-complete/spec.md`.
  it('the Wallpaper row opens the wallpaper picker (F-059 FR-002)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const fixture = TestBed.createComponent(ChatsSettingsPage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const wall = [...el.querySelectorAll<HTMLButtonElement>('[data-testid="chats-settings-row"]')].find(
      (r) => r.getAttribute('aria-label') === 'Wallpaper',
    );
    expect(wall).toBeDefined();
    wall?.click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/settings/chats/wallpaper']);
  });
});
