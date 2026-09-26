import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NotificationsPage } from './notifications-page';
import { NOTIFICATIONS_ROWS } from './settings.seed';
import { PrefsStore } from '../../core/prefs.store';

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
    el.querySelectorAll<HTMLButtonElement>('[data-testid="notifications-row"]')[0]?.click();
    fixture.detectChanges();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('renders every row as a switch bound to the store', () => {
    const el = render();
    const rows = el.querySelectorAll<HTMLElement>('[data-testid="notifications-row"]');
    expect(rows.length).toBe(NOTIFICATIONS_ROWS.length);
    expect(rows[0]?.querySelector('button[role="switch"]')).not.toBeNull();
    expect(el.querySelectorAll('button[role="switch"]').length).toBe(NOTIFICATIONS_ROWS.length);
    expect(el.querySelector('button[role="switch"]')?.getAttribute('aria-checked')).toBe('true');
  });

  it('toggling Show previews persists the change', () => {
    const el = render();
    const switches = el.querySelectorAll<HTMLButtonElement>('button[role="switch"]');
    switches[4]?.click();
    fixture.detectChanges();
    expect(TestBed.inject(PrefsStore).prefs().showPreviews).toBe(false);
  });
});