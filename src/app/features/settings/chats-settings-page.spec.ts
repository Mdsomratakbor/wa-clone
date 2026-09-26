import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { ChatsSettingsPage } from './chats-settings-page';
import { CHATS_SETTINGS_ROWS } from './settings.seed';
import { PrefsStore } from '../../core/prefs.store';

describe('ChatsSettingsPage', () => {
  let fixture: ComponentFixture<ChatsSettingsPage>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ChatsSettingsPage],
      providers: [provideRouter([])],
    }).compileComponents();
    TestBed.inject(PrefsStore).reset();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(ChatsSettingsPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the header: Back leading, Chats Settings title', () => {
    const el = render();
    const actions = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')];
    expect(actions.length).toBe(1);
    expect(actions[0]?.textContent?.trim()).toBe('Back');
    expect(el.querySelector('.navigation-bar__title')?.textContent?.trim()).toBe(
      'Chats Settings',
    );
  });

  it('renders one row per seeded chats setting', () => {
    const el = render();
    const rows = el.querySelectorAll<HTMLButtonElement>('[data-testid="chats-settings-row"]');
    expect(rows.length).toBe(CHATS_SETTINGS_ROWS.length);
    expect(rows[0]?.getAttribute('aria-label')).toBe('Wallpaper');
  });

  it('does not render the tab bar (pushed surface)', () => {
    const el = render();
    expect(el.querySelector('[role="tab"]')).toBeNull();
  });

  it('navigates to /settings when Back is activated', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    (el.querySelector('.navigation-bar__action') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/settings']);
  });

  it('row activation is a no-op', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    el.querySelectorAll<HTMLButtonElement>('[data-testid="chats-settings-row"]')[0]?.click();
    fixture.detectChanges();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('renders Enter key sends and Media visibility as switches bound to the store', () => {
    const el = render();
    const labelled = [
      ...el.querySelectorAll<HTMLElement>('[data-testid="chats-settings-row"]'),
    ];
    const enter = labelled.find((r) => r.getAttribute('aria-label') === 'Enter key sends');
    const media = labelled.find((r) => r.getAttribute('aria-label') === 'Media visibility');
    expect(enter?.querySelector('button[role="switch"]')).not.toBeNull();
    expect(media?.querySelector('button[role="switch"]')).not.toBeNull();

    const switches = el.querySelectorAll<HTMLButtonElement>('button[role="switch"]');
    expect(switches.length).toBe(2);
    expect(switches[0]?.getAttribute('aria-checked')).toBe('true');
    expect(switches[1]?.getAttribute('aria-checked')).toBe('true');
  });

  it('keeps Wallpaper/Font size/Keyboard as chevron rows', () => {
    const el = render();
    const buttons = el.querySelectorAll<HTMLButtonElement>(
      'button[data-testid="chats-settings-row"]',
    );
    expect(buttons.length).toBe(3);
    expect(buttons[0]?.querySelector('.chats-settings__chevron')).not.toBeNull();
  });

  it('toggling Enter key sends persists the change', () => {
    const el = render();
    const switches = el.querySelectorAll<HTMLButtonElement>('button[role="switch"]');
    switches[0]?.click();
    fixture.detectChanges();
    expect(TestBed.inject(PrefsStore).prefs().enterKeySends).toBe(false);
    expect(TestBed.inject(PrefsStore).prefs().mediaVisibility).toBe(true);
  });
});