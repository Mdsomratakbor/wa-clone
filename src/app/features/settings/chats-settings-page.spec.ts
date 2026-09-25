import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { ChatsSettingsPage } from './chats-settings-page';
import { CHATS_SETTINGS_ROWS } from './settings.seed';

describe('ChatsSettingsPage', () => {
  let fixture: ComponentFixture<ChatsSettingsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatsSettingsPage],
      providers: [provideRouter([])],
    }).compileComponents();
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
});