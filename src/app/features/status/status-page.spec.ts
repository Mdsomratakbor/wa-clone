import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { StatusPage } from './status-page';
import { StatusStore } from '../../core/status.store';

describe('StatusPage', () => {
  let fixture: ComponentFixture<StatusPage>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [StatusPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(StatusPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the header: Privacy leading, Status title, no trailing action', () => {
    const el = render();
    const actions = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')];
    expect(actions.length).toBe(1);
    expect(actions[0]?.textContent?.trim()).toBe('Privacy');
    expect(el.querySelector('.navigation-bar__title')?.textContent?.trim()).toBe('Status');
  });

  it('renders the My Status row: avatar, badge, name, subtitle and action circles', () => {
    const el = render();
    expect(el.querySelector('[data-testid="status-my"]')).not.toBeNull();
    expect(
      el.querySelector('[data-testid="status-avatar"]')?.querySelector('.user-avatar'),
    ).not.toBeNull();
    expect(el.querySelector('[data-testid="status-badge"]')).not.toBeNull();
    expect(el.querySelector('.status-page__name')?.textContent?.trim()).toBe('My Status');
    expect(el.querySelector('.status-page__subtitle')?.textContent?.trim()).toBe('Add to my status');
    expect(el.querySelector('[data-testid="status-camera"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="status-note"]')).not.toBeNull();
  });

  it('renders the tip with the no-recent-updates message when nothing is published', () => {
    const el = render();
    const tip = el.querySelector('[data-testid="status-tip"]');
    expect(tip).not.toBeNull();
    expect(tip?.textContent).toContain('No recent updates to show right now.');
    expect(el.querySelector('[data-testid="status-mine"]')).toBeNull();
  });

  it('the published status replaces the tip in a live region (FR-009)', () => {
    const store = TestBed.inject(StatusStore);
    store.publish('at the beach', 1);
    const el = render();

    const mine = el.querySelector('[data-testid="status-mine"]');
    expect(mine).not.toBeNull();
    expect(mine?.getAttribute('role')).toBe('status');
    expect(mine?.textContent).toContain('at the beach');
    expect(el.querySelector('[data-testid="status-tip"]')).toBeNull();
  });

  it('the My Status subtitle follows the published status (FR-010)', () => {
    const store = TestBed.inject(StatusStore);
    const el = render();
    expect(el.querySelector('[data-testid="status-my-subtitle"]')?.textContent?.trim()).toBe(
      'Add to my status',
    );
    fixture.destroy();

    store.publish('on the move', 1);
    const second = render();
    expect(
      second.querySelector('[data-testid="status-my-subtitle"]')?.textContent?.trim(),
    ).toBe('on the move');
  });

  it('renders a status containing markup as that literal text (FR-011)', () => {
    const store = TestBed.inject(StatusStore);
    store.publish('<img src=x onerror=alert(1)>', 1);
    const el = render();

    const text = el.querySelector('[data-testid="status-mine"]')?.textContent;
    expect(text).toContain('<img src=x onerror=alert(1)>');
    expect(el.querySelector('[data-testid="status-mine"] img')).toBeNull();
  });

  it('renders the tab bar with Status active and no FAB', () => {
    const el = render();
    const tabs = [...el.querySelectorAll<HTMLElement>('[role="tab"]')];
    expect(tabs.length).toBe(5);
    expect(tabs.map((t) => t.textContent?.trim()?.replace(/\s+/g, ' '))).toEqual(
      jasmine.arrayContaining(['Settings', 'Chats', 'Camera', 'Calls', 'Status']),
    );
    const active = el.querySelector('[role="tab"][aria-selected="true"]');
    expect(active?.textContent?.trim()).toBe('Status');
    expect(el.querySelector('.fab')).toBeNull();
  });

  it('navigates to /chats when the Chats tab is activated', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    const chatsTab = [...el.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find((b) =>
      b.textContent?.trim()?.startsWith('Chats'),
    );
    chatsTab?.click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/chats']);
  });

  it('navigates to /calls when the Calls tab is activated', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    const callsTab = [...el.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find((b) =>
      b.textContent?.trim()?.startsWith('Calls'),
    );
    callsTab?.click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/calls']);
  });

  it('navigates to /camera when the Camera tab is activated (feature 012)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    const cameraTab = [...el.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find((b) =>
      b.textContent?.trim()?.startsWith('Camera'),
    );
    cameraTab?.click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/camera']);
    expect(el.querySelector('[data-testid="tab-stub"]')).toBeNull();
  });

  it('keeps the feed when the active Status tab is re-selected', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    const statusTab = [...el.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find((b) =>
      b.textContent?.trim()?.startsWith('Status'),
    );
    statusTab?.click();
    fixture.detectChanges();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(el.querySelector('[data-testid="status-feed"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="tab-stub"]')).toBeNull();
  });

  it('camera and note navigate to compose', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();

    (el.querySelector('[data-testid="status-camera"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/status/compose']);

    (el.querySelector('[data-testid="status-note"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/status/compose']);
  });

  it('Privacy opens settings (F-035)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();

    (el.querySelector('.navigation-bar__action') as HTMLElement).click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/settings']);
  });

  it('the My Status row opens the composer on click and on Enter (F-035)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();

    (el.querySelector('[data-testid="status-my"]') as HTMLElement).click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/status/compose']);

    (el.querySelector('[data-testid="status-my"]') as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter' }),
    );
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledTimes(2);
  });

  it('wiring the row leaves the feed, header and tip untouched (F-035)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();

    expect(el.querySelector('[data-testid="status-feed"]')).not.toBeNull();
    expect(el.querySelector('.status-page__name')?.textContent?.trim()).toBe('My Status');
    expect(el.querySelector('.status-page__tip-text')).not.toBeNull();

    (el.querySelector('[data-testid="status-my"]') as HTMLElement).click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/status/compose']);
    expect(el.querySelector('[data-testid="status-feed"]')).not.toBeNull();
    expect(el.querySelectorAll('.status-page__circle').length).toBe(2);
  });
});