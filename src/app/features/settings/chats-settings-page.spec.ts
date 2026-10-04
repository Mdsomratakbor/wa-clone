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

  // F-054 FR-001/FR-003: every Chats Settings row — chevron, live switch and
  // unavailable switch alike — shows its description under the label.
  it('F-054: every Chats Settings row shows its description under the label', () => {
    const el = render();
    const rows = el.querySelectorAll<HTMLElement>('[data-testid="chats-settings-row"]');
    rows.forEach((row, i) => {
      const seed = CHATS_SETTINGS_ROWS[i];
      expect(row.querySelector('.chats-settings__row-label')?.textContent?.trim()).toBe(
        seed.label,
      );
      expect(row.querySelector('.chats-settings__row-description')?.textContent?.trim()).toBe(
        seed.description,
      );
      expect(row.getAttribute('aria-label')).toBe(seed.label);
      const desc = row.querySelector<HTMLElement>('.chats-settings__row-description');
      expect(desc).not.toBeNull();
      if (!desc) return;
      expect(getComputedStyle(desc).fontSize).toBe('13px');
      expect(getComputedStyle(desc).color).toBe('rgb(142, 142, 147)');
    });
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

  // F-059 FR-002: the Wallpaper row now opens the wallpaper picker. F-046 had
  // deferred it (capture-blocked); the picker ships PROVISIONAL per the 059
  // clarify pass. disposition.md's G4 row is marked RESOLVED in the closure pass.
  it('the Wallpaper row opens the wallpaper picker (F-059 FR-002)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    const first = el.querySelectorAll<HTMLButtonElement>('button[data-testid="chats-settings-row"]')[0];
    expect(first?.getAttribute('aria-label') ?? first?.textContent?.trim()).toContain('Wallpaper');
    first?.click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/settings/chats/wallpaper']);
  });

  it('the Keyboard row opens the keyboard screen (F-059 FR-004)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    const rows = [...el.querySelectorAll<HTMLButtonElement>('button[data-testid="chats-settings-row"]')];
    const keyboard = rows.find((r) => r.getAttribute('aria-label') === 'Keyboard');
    expect(keyboard).toBeDefined();
    keyboard?.click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/settings/chats/keyboard']);
  });

  it('renders Media visibility as the one live, store-bound switch (F-059 FR-009)', () => {
    const el = render();
    const switches = el.querySelectorAll<HTMLButtonElement>('button[role="switch"]');
    expect(switches.length).toBe(1);
    expect(switches[0]?.getAttribute('aria-label')).toBe('Media visibility');
    expect(switches[0]?.getAttribute('aria-checked')).toBe('true');
    expect(switches[0]?.disabled).toBe(false);
  });

  it('keeps Wallpaper/Font size/Keyboard as chevron rows', () => {
    const el = render();
    const buttons = el.querySelectorAll<HTMLButtonElement>(
      'button[data-testid="chats-settings-row"]',
    );
    expect(buttons.length).toBe(3);
    expect(buttons[0]?.querySelector('.chats-settings__chevron')).not.toBeNull();
  });

  it('toggling Media visibility persists the change', () => {
    const el = render();
    const sw = el.querySelector<HTMLButtonElement>('button[role="switch"]');
    sw?.click();
    fixture.detectChanges();
    expect(TestBed.inject(PrefsStore).prefs().mediaVisibility).toBe(false);
  });

  describe('F-059 FR-008/FR-009: Media visibility is live because its consumer ships with it', () => {
    it('renders as an enabled switch, not a disabled placeholder', () => {
      const el = render();
      const row = el.querySelector(
        '[data-testid="chats-settings-row"][aria-label="Media visibility"]',
      );
      const sw = row?.querySelector<HTMLButtonElement>('button[role="switch"]');
      expect(sw).not.toBeNull();
      expect(sw?.disabled).toBe(false);
    });

    it('is not a chevron button: the switch works in place, nothing routes', () => {
      const el = render();
      const row = el.querySelector(
        '[data-testid="chats-settings-row"][aria-label="Media visibility"]',
      );
      expect(row?.querySelector('.chats-settings__chevron')).toBeNull();
    });

    it('toggling it persists to prefs and the row keeps its F-054 description', () => {
      const el = render();
      const row = el.querySelector(
        '[data-testid="chats-settings-row"][aria-label="Media visibility"]',
      );
      expect(
        row?.querySelector('.chats-settings__row-description')?.textContent?.trim(),
      ).toBe('Show photos and files inside chats');
      const sw = row?.querySelector<HTMLButtonElement>('button[role="switch"]');
      sw?.click();
      fixture.detectChanges();
      expect(TestBed.inject(PrefsStore).prefs().mediaVisibility).toBe(false);
    });
  });
});