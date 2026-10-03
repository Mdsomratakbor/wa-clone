import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { PrefsStore } from '../../core/prefs.store';
import { SettingsPage } from './settings-page';
import { ActionSheet } from '../../shared/components/action-sheet/action-sheet';
import { SETTINGS_ROWS } from './settings.seed';

describe('SettingsPage', () => {
  let fixture: ComponentFixture<SettingsPage>;

  beforeEach(async () => {
    localStorage.clear();
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

  it('renders a stored profile name and updates reactively (F-036)', () => {
    const prefs = TestBed.inject(PrefsStore);
    const el = render();
    expect(el.querySelector('[data-testid="settings-name"]')?.textContent?.trim()).toBe('Ani');

    prefs.updateProfile('Anita', 'Building things');
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="settings-name"]')?.textContent?.trim()).toBe('Anita');
    expect(el.querySelector('.settings__subtitle')?.textContent?.trim()).toBe('Tap to edit profile');
  });

  it('renders one row per seeded setting', () => {
    const el = render();
    const rows = el.querySelectorAll<HTMLButtonElement>('[data-testid="settings-row"]');
    expect(rows.length).toBe(SETTINGS_ROWS.length);
    expect(rows[0]?.getAttribute('aria-label')).toBe('Account');
  });

  // F-054 FR-001/FR-003: each Settings row shows an owner-approved one-line
  // description beneath its label; the aria-label stays the label so the row's
  // accessible name is the control it activates, never the description copy.
  it('F-054: every Settings row shows its description under the label', () => {
    const el = render();
    const rows = el.querySelectorAll<HTMLButtonElement>('[data-testid="settings-row"]');
    rows.forEach((row, i) => {
      const seed = SETTINGS_ROWS[i];
      expect(row.querySelector('.settings__row-label')?.textContent?.trim()).toBe(seed.label);
      expect(row.querySelector('.settings__row-description')?.textContent?.trim()).toBe(
        seed.description,
      );
      expect(row.getAttribute('aria-label')).toBe(seed.label);
      const desc = row.querySelector<HTMLElement>('.settings__row-description');
      expect(desc).not.toBeNull();
      if (!desc) return;
      expect(getComputedStyle(desc).fontSize).toBe('13px');
      expect(getComputedStyle(desc).color).toBe('rgb(142, 142, 147)');
    });
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

  it('routes to /settings/chats from the Chats Settings row (feature 016)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    el.querySelectorAll<HTMLButtonElement>('[data-testid="settings-row"]')[1]?.click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/settings/chats']);
  });

  it('routes to /settings/notifications from the Notifications row (feature 017)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    el.querySelectorAll<HTMLButtonElement>('[data-testid="settings-row"]')[2]?.click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/settings/notifications']);
  });

  it('routes to /settings/data-storage from the Data and Storage row (feature 018)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    el.querySelectorAll<HTMLButtonElement>('[data-testid="settings-row"]')[3]?.click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/settings/data-storage']);
  });

  it('routes to /settings/profile from the profile header tap (feature 020)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    el.querySelector<HTMLButtonElement>('[data-testid="settings-profile"]')?.click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/settings/profile']);
  });

  it('the Contacts row navigates to /contacts (F-039)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    const rows = el.querySelectorAll<HTMLButtonElement>('[data-testid="settings-row"]');
    expect(rows[4]?.getAttribute('aria-label')).toBe('Contacts');
    rows[4]?.click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/contacts']);
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

  it('routes to /settings/notifications from the overflow Notifications row and closes the sheet', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    el.querySelector<HTMLButtonElement>('[data-testid="settings-options"]')?.click();
    fixture.detectChanges();
    el.querySelectorAll<HTMLButtonElement>('[data-testid="action-sheet-row"]')[0]?.click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/settings/notifications']);
    expect(el.querySelector('[data-testid="action-sheet"]')).toBeNull();
    expect(document.activeElement).toBe(el.querySelector('[data-testid="settings-options"]'));
  });

  it('routes to /settings/data-storage from the overflow Storage row and closes the sheet', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    el.querySelector<HTMLButtonElement>('[data-testid="settings-options"]')?.click();
    fixture.detectChanges();
    el.querySelectorAll<HTMLButtonElement>('[data-testid="action-sheet-row"]')[1]?.click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/settings/data-storage']);
    expect(el.querySelector('[data-testid="action-sheet"]')).toBeNull();
  });

  it('F-046 FR-003: the More row is honestly disabled, not a silent no-op', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    el.querySelector<HTMLButtonElement>('[data-testid="settings-options"]')?.click();
    fixture.detectChanges();
    const more = el.querySelectorAll<HTMLButtonElement>('[data-testid="action-sheet-row"]')[2];
    // It stays visible and labelled, but the user cannot activate it at all.
    expect(more?.textContent?.trim()).toBe('More');
    expect(more?.disabled).toBe(true);
    more?.click();
    fixture.detectChanges();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('F-046 FR-003: an unhandled overflow action dismisses the sheet rather than leaving it open', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    el.querySelector<HTMLButtonElement>('[data-testid="settings-options"]')?.click();
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="action-sheet"]')).not.toBeNull();
    const sheet = fixture.debugElement
      .query(By.directive(ActionSheet))
      .componentInstance as ActionSheet;
    sheet.action.emit('settings-action-that-does-not-exist');
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="action-sheet"]')).toBeNull();
    expect(router.navigate).not.toHaveBeenCalled();
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