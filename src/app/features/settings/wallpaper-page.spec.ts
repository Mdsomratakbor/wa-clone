import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { WallpaperPage } from './wallpaper-page';
import { DEFAULT_WALLPAPER, PrefsStore, WALLPAPERS } from '../../core/prefs.store';

describe('WallpaperPage', () => {
  let fixture: ComponentFixture<WallpaperPage>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [WallpaperPage],
      providers: [provideRouter([])],
    }).compileComponents();
    TestBed.inject(PrefsStore).reset();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(WallpaperPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function options(el: HTMLElement): HTMLButtonElement[] {
    return [...el.querySelectorAll<HTMLButtonElement>('[data-testid="wallpaper-option"]')];
  }

  it('renders the header: Back leading, Wallpaper title', () => {
    const el = render();
    const actions = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')];
    expect(actions.length).toBe(1);
    expect(actions[0]?.textContent?.trim()).toBe('Back');
    expect(el.querySelector('.navigation-bar__title')?.textContent?.trim()).toBe('Wallpaper');
  });

  it('does not render the tab bar (pushed surface)', () => {
    const el = render();
    expect(el.querySelector('[role="tab"]')).toBeNull();
  });

  it('renders the PROVISIONAL wallpaper ids and labels in order inside a radiogroup (F-059 FR-003)', () => {
    const el = render();
    const group = el.querySelector('[data-testid="wallpaper-options"]');
    expect(group?.getAttribute('role')).toBe('radiogroup');
    expect(group?.getAttribute('aria-label')).toBe('Wallpaper');

    const rendered = options(el);
    expect(rendered.length).toBe(WALLPAPERS.length);
    expect(rendered.map((b) => b.textContent?.trim())).toEqual(
      WALLPAPERS.map((w) => w.label),
    );
    expect(WALLPAPERS.map((w) => w.id)).toEqual([
      'default',
      'sky',
      'sand',
      'mint',
      'blush',
      'slate',
    ]);
  });

  it('checks the stored id on render and exposes it through aria-checked (F-059 FR-002)', () => {
    TestBed.inject(PrefsStore).setWallpaper('mint');
    const el = render();
    const rendered = options(el);
    expect(rendered.map((b) => b.getAttribute('aria-checked'))).toEqual([
      'false',
      'false',
      'false',
      'true',
      'false',
      'false',
    ]);
    expect(rendered[3]?.classList).toContain('wallpaper__option--selected');
    expect(rendered[0]?.classList).not.toContain('wallpaper__option--selected');
  });

  it('defaults to Default with no stored value (F-059 FR-001)', () => {
    expect(TestBed.inject(PrefsStore).wallpaper()).toBe(DEFAULT_WALLPAPER);
    const el = render();
    const rendered = options(el);
    expect(rendered[0]?.getAttribute('aria-checked')).toBe('true');
  });

  it('every swatch paints through its own data-wallpaper scope (F-059 FR-005)', () => {
    const el = render();
    const swatches = [...el.querySelectorAll<HTMLElement>('.wallpaper__swatch')];
    expect(swatches.length).toBe(WALLPAPERS.length);
    WALLPAPERS.forEach((w, i) => {
      expect(swatches[i]?.getAttribute('data-wallpaper')).toBe(w.id);
    });
  });

  it('activating an option stores it, re-checks it and persists it (F-059 FR-002)', () => {
    const el = render();
    options(el)[5]?.click();
    fixture.detectChanges();

    expect(TestBed.inject(PrefsStore).wallpaper()).toBe('slate');
    const after = options(el);
    expect(after[5]?.getAttribute('aria-checked')).toBe('true');
    expect(after[0]?.getAttribute('aria-checked')).toBe('false');
    expect(localStorage.getItem('wa.prefs.v1')).toContain('slate');
  });

  it('every option label has an aria-label matching its text (a11y)', () => {
    const el = render();
    const rendered = options(el);
    rendered.forEach((option) => {
      const text = (option.textContent ?? '').trim();
      expect(text).not.toBe('');
      expect(option.getAttribute('aria-label')).toBe(text);
    });
  });

  it('navigates to /settings/chats when Back is activated (F-059 FR-006)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    (el.querySelector('.navigation-bar__action') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/settings/chats']);
  });
});