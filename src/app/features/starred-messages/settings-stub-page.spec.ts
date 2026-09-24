import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { SettingsStubPage } from './settings-stub-page';

describe('SettingsStubPage', () => {
  let fixture: ComponentFixture<SettingsStubPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsStubPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(SettingsStubPage);
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

  it('renders the placeholder body', () => {
    const el = render();
    expect(el.querySelector('[data-testid="settings-page"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="settings-page"]')?.textContent?.trim()).toContain(
      'coming soon',
    );
  });

  it('navigates to /starred-messages when Back is activated', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    (el.querySelector('.navigation-bar__action') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/starred-messages']);
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