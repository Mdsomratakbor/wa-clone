import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NotificationsPage } from './notifications-page';
import { NOTIFICATIONS_ROWS } from './settings.seed';
import { DEFAULT_PREFS, PrefsStore } from '../../core/prefs.store';

describe('NotificationsPage', () => {
  let fixture: ComponentFixture<NotificationsPage>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [NotificationsPage],
      providers: [provideRouter([])],
    }).compileComponents();
    TestBed.inject(PrefsStore).reset();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(NotificationsPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the header: Back leading, Notifications title', () => {
    const el = render();
    const actions = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')];
    expect(actions.length).toBe(1);
    expect(actions[0]?.textContent?.trim()).toBe('Back');
    expect(el.querySelector('.navigation-bar__title')?.textContent?.trim()).toBe(
      'Notifications',
    );
  });

  it('renders one row per seeded notification setting', () => {
    const el = render();
    const rows = el.querySelectorAll<HTMLButtonElement>('[data-testid="notifications-row"]');
    expect(rows.length).toBe(NOTIFICATIONS_ROWS.length);
    expect(rows[0]?.getAttribute('aria-label')).toBe('Sound');
  });

  // F-054 FR-001/FR-003: every Notifications row — live switch and unavailable
  // switch alike — shows its description under the label.
  it('F-054: every Notifications row shows its description under the label', () => {
    const el = render();
    const rows = el.querySelectorAll<HTMLElement>('[data-testid="notifications-row"]');
    rows.forEach((row, i) => {
      const seed = NOTIFICATIONS_ROWS[i];
      expect(row.querySelector('.notifications__row-label')?.textContent?.trim()).toBe(
        seed.label,
      );
      expect(row.querySelector('.notifications__row-description')?.textContent?.trim()).toBe(
        seed.description,
      );
      expect(row.getAttribute('aria-label')).toBe(seed.label);
      const desc = row.querySelector<HTMLElement>('.notifications__row-description');
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

  it('F-046 FR-011: no row is a chevron button any more', () => {
    const el = render();
    // The @else branch that rendered a <button> is gone, so there is no longer a
    // row that could fall through to an empty handler.
    expect(el.querySelector('button[data-testid="notifications-row"]')).toBeNull();
    expect(el.querySelector('.notifications__chevron')).toBeNull();
  });

  it('renders every row as a switch, with Sound, Vibrate and Show previews live', () => {
    const el = render();
    const rows = el.querySelectorAll<HTMLElement>('[data-testid="notifications-row"]');
    expect(rows.length).toBe(NOTIFICATIONS_ROWS.length);
    expect(el.querySelectorAll('button[role="switch"]').length).toBe(NOTIFICATIONS_ROWS.length);
    const switches = Array.from(
      el.querySelectorAll<HTMLButtonElement>('button[role="switch"]'),
    );
    // F-060 FR-003: sound/vibrate returned WITH the send-feedback consumer, so
    // three rows are live switches; popup/light still have no consumer and are
    // disabled (F-046).
    const live = switches.filter((s) => !s.disabled);
    expect(live.map((s) => s.getAttribute('aria-label'))).toEqual([
      'Sound',
      'Vibrate',
      'Show previews',
    ]);
  });

  it('toggling Show previews persists the change', () => {
    const el = render();
    const switches = el.querySelectorAll<HTMLButtonElement>('button[role="switch"]');
    const previews = Array.from(switches).find(
      (s) => s.getAttribute('aria-label') === 'Show previews',
    );
    previews?.click();
    fixture.detectChanges();
    expect(TestBed.inject(PrefsStore).prefs().showPreviews).toBe(false);
  });

  // F-060 FR-003/FR-005: the re-enabled delivery toggles are store-bound switches
  // gated by the send-feedback consumer.
  it('toggling Sound and Vibrate persists the change (F-060)', () => {
    const el = render();
    const switches = el.querySelectorAll<HTMLButtonElement>('button[role="switch"]');
    const byLabel = (label: string) =>
      Array.from(switches).find((s) => s.getAttribute('aria-label') === label);

    byLabel('Sound')?.click();
    byLabel('Vibrate')?.click();
    fixture.detectChanges();

    const prefs = TestBed.inject(PrefsStore).prefs();
    expect(prefs.sound).toBe(false);
    expect(prefs.vibrate).toBe(false);
  });

  describe('F-046 FR-006 + F-060 FR-003: the two still-consumer-less settings are honestly disabled', () => {
    ['Popup notification', 'Light'].forEach((label) => {
      it(`renders ${label} as a disabled switch`, () => {
        const el = render();
        const sw = Array.from(
          el.querySelectorAll<HTMLButtonElement>('button[role="switch"]'),
        ).find((s) => s.getAttribute('aria-label') === label);
        expect(sw).toBeDefined();
        expect(sw?.disabled).toBe(true);
      });
    });

    it('emits nothing when any of them is activated', () => {
      const el = render();
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate').and.resolveTo(true);
      el.querySelectorAll<HTMLButtonElement>('button[role="switch"]:disabled').forEach((s) => {
        s.click();
        s.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      });
      fixture.detectChanges();
      expect(TestBed.inject(PrefsStore).prefs()).toEqual(DEFAULT_PREFS);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('keeps all five rows visible and labelled', () => {
      const el = render();
      const text = el.querySelector('[data-testid="notifications-list"]')?.textContent ?? '';
      ['Sound', 'Vibrate', 'Popup notification', 'Light', 'Show previews'].forEach((label) => {
        expect(text).toContain(label);
      });
    });
  });
});