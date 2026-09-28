import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BroadcastsPage } from './broadcasts-page';
import { ChatStore } from '../../core/chat.store';
import { PrefsStore } from '../../core/prefs.store';

describe('BroadcastsPage', () => {
  let fixture: ComponentFixture<BroadcastsPage>;
  let navSpy: jasmine.Spy;
  let store: ChatStore;

  beforeEach(async () => {
    localStorage.clear();
    navSpy = jasmine.createSpy('navigate');
    await TestBed.configureTestingModule({
      imports: [BroadcastsPage],
      providers: [{ provide: Router, useValue: { navigate: navSpy } }],
    }).compileComponents();
    store = TestBed.inject(ChatStore);
    store.reset();
    TestBed.inject(PrefsStore).reset();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(BroadcastsPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the header: Back leading, Broadcast lists title (FR-005)', () => {
    const el = render();
    const actions = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')];
    expect(actions.length).toBe(1);
    expect(actions[0]?.textContent?.trim()).toBe('Back');
    expect(el.querySelector('.navigation-bar__title')?.textContent?.trim()).toBe('Broadcast lists');
  });

  it('does not render the tab bar (pushed surface) (FR-005)', () => {
    expect(render().querySelector('[role="tab"]')).toBeNull();
  });

  it('shows the empty state when there are no broadcasts (FR-006, FR-012)', () => {
    const el = render();
    const empty = el.querySelector('[data-testid="broadcasts-empty"]');
    expect(empty).not.toBeNull();
    expect(empty?.getAttribute('role')).toBe('status');
    expect(empty?.textContent).toContain('No broadcasts');
    expect(el.querySelector('[data-testid="broadcasts-list"]')).toBeNull();
  });

  it('renders one ChatListItem row per broadcast (FR-006)', () => {
    store.createBroadcast('All hands');
    store.createBroadcast('Shop updates');
    const el = render();

    expect(el.querySelector('[data-testid="broadcasts-empty"]')).toBeNull();
    const rows = el.querySelectorAll('app-chat-list-item');
    expect(rows.length).toBe(2);
    expect(rows[0]?.textContent).toContain('All hands');
    expect(rows[1]?.textContent).toContain('Shop updates');
  });

  it('does not render direct or group chats (FR-006)', () => {
    store.createGroup('A group');
    const el = render();
    const names = [...el.querySelectorAll('app-chat-list-item')].map((row) =>
      row.textContent?.trim(),
    );
    expect(names).toEqual([]);
  });

  it('opening a row marks the broadcast read and navigates to the chat (FR-007)', () => {
    const id = store.createBroadcast('All hands');
    const el = render();
    (el.querySelector('.broadcasts__row .chat-list-item') as HTMLElement).click();
    fixture.detectChanges();

    expect(store.conversations().find((chat) => chat.id === id)?.read).toBe(true);
    expect(navSpy).toHaveBeenCalledWith(['/chat', id]);
  });

  it('navigates to /chats when Back is activated (FR-005)', () => {
    const el = render();
    (el.querySelector('.navigation-bar__action') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(navSpy).toHaveBeenCalledWith(['/chats']);
  });

  it('follows a broadcast created after render (FR-006)', () => {
    const el = render();
    expect(el.querySelector('[data-testid="broadcasts-empty"]')).not.toBeNull();

    store.createBroadcast('Late list');
    fixture.detectChanges();
    expect(el.querySelectorAll('app-chat-list-item').length).toBe(1);
  });

  it('carries the stored font scale (F-041 FR-008 parity)', () => {
    TestBed.inject(PrefsStore).setFontScale('large');
    const el = render();
    expect(
      el.querySelector('[data-testid="broadcasts-page"]')?.getAttribute('data-font-scale'),
    ).toBe('large');
  });
});
