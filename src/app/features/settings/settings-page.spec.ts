import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { SettingsPage } from './settings-page';
import { SETTINGS_ROWS } from './settings.seed';

describe('SettingsPage', () => {
  let fixture: ComponentFixture<SettingsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(SettingsPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the header: Back leading, Settings title', () => {
    const el = render();
    const actions = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')];
    expect(actions.length).toBe(1);
    expect(actions[0]?.textContent?.trim()).toBe('Back');
    expect(actions[0]?.querySelector('svg.navigation-bar__icon')).not.toBeNull();
    expect(el.querySelector('.navigation-bar__title')?.textContent?.trim()).toBe('Settings');
  });

  it('renders the profile header with the seeded name', () => {
    const el = render();
    expect(el.querySelector('[data-testid="settings-profile"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="settings-avatar"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="settings-name"]')?.textContent?.trim()).toBe('Ani');
  });

  it('renders one row per seeded setting', () => {
    const el = render();
    const rows = el.querySelectorAll<HTMLButtonElement>('[data-testid="settings-row"]');
    expect(rows.length).toBe(SETTINGS_ROWS.length);
    expect(rows[0]?.getAttribute('aria-label')).toBe('Account');
  });

  it('renders the tab bar with Settings active', () => {
    const el = render();
    const tabs = el.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(5);
    const active = el.querySelector('[role="tab"][aria-selected="true"]');
    expect(active?.textContent?.trim()).toBe('Settings');
  });

  it('navigates to /starred-messages when Back is activated', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    (el.querySelector('.navigation-bar__action') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/starred-messages']);
  });

  it('routes Chats, Camera, Calls and Status tabs away', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    const tab = (name: string) =>
      [...el.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find(
        (b) => b.textContent?.trim()?.startsWith(name),
      );
    tab('Chats')?.click();
    expect(router.navigate).toHaveBeenCalledWith(['/chats']);
    tab('Camera')?.click();
    expect(router.navigate).toHaveBeenCalledWith(['/camera']);
    tab('Calls')?.click();
    expect(router.navigate).toHaveBeenCalledWith(['/calls']);
    tab('Status')?.click();
    expect(router.navigate).toHaveBeenCalledWith(['/status']);
  });

  it('routes to /settings/account from the Account row (feature 014)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    el.querySelectorAll<HTMLButtonElement>('[data-testid="settings-row"]')[0]?.click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/settings/account']);
  });

  it('other row activation is a no-op (sub-pages are later features)', () => {
    const el = render();
    el.querySelectorAll<HTMLButtonElement>('[data-testid="settings-row"]')[1]?.click();
    fixture.detectChanges();
    const rows = el.querySelectorAll('[data-testid="settings-row"]');
    expect(rows[1]?.getAttribute('aria-label')).toBe('Chats Settings');
  });

  it('renders the Settings options trigger with an aria-label', () => {
    const el = render();
    const trigger = el.querySelector<HTMLButtonElement>('[data-testid="settings-options"]');
    expect(trigger).not.toBeNull();
    expect(trigger?.getAttribute('aria-label')).toBe('Settings options');
  });

  it('does not render the settings sheet when closed', () => {
    const el = render();
    expect(el.querySelector('[data-testid="action-sheet"]')).toBeNull();
  });

  it('opens the settings sheet from the trigger', () => {
    const el = render();
    el.querySelector<HTMLButtonElement>('[data-testid="settings-options"]')?.click();
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="action-sheet"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="action-sheet-backdrop"]')).not.toBeNull();
  });

  it('renders the settings rows from the seed', () => {
    const el = render();
    el.querySelector<HTMLButtonElement>('[data-testid="settings-options"]')?.click();
    fixture.detectChanges();
    const rows = Array.from(
      el.querySelectorAll('[data-testid="action-sheet-row"]') as NodeListOf<HTMLElement>,
    );
    expect(rows.map((r) => r.textContent?.trim())).toEqual(['Notifications', 'Storage', 'More']);
  });

  it('keeps the sheet open when a row is activated (targets are later features)', () => {
    const el = render();
    el.querySelector<HTMLButtonElement>('[data-testid="settings-options"]')?.click();
    fixture.detectChanges();
    el.querySelectorAll<HTMLButtonElement>('[data-testid="action-sheet-row"]')[0]?.click();
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="action-sheet"]')).not.toBeNull();
  });

  it('dismisses on backdrop and restores focus to the trigger', () => {
    const el = render();
    el.querySelector<HTMLButtonElement>('[data-testid="settings-options"]')?.click();
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('[data-testid="action-sheet-backdrop"]')?.click();
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="action-sheet"]')).toBeNull();
    expect(document.activeElement).toBe(el.querySelector('[data-testid="settings-options"]'));
  });

  it('dismisses on Escape and restores focus to the trigger', () => {
    const el = render();
    el.querySelector<HTMLButtonElement>('[data-testid="settings-options"]')?.click();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="action-sheet"]')).toBeNull();
    expect(document.activeElement).toBe(el.querySelector('[data-testid="settings-options"]'));
  });
});