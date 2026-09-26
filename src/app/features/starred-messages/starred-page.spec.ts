import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { StarredPage } from './starred-page';
import { ChatStore } from '../../core/chat.store';

describe('StarredPage', () => {
  let fixture: ComponentFixture<StarredPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarredPage],
      providers: [provideRouter([])],
    }).compileComponents();
    TestBed.inject(ChatStore).reset();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(StarredPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the header: Settings leading with back chevron, Starred Messages title', () => {
    const el = render();
    const actions = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')];
    expect(actions.length).toBe(1);
    expect(actions[0]?.textContent?.trim()).toBe('Settings');
    expect(actions[0]?.querySelector('svg.navigation-bar__icon')).not.toBeNull();
    expect(el.querySelector('.navigation-bar__title')?.textContent?.trim()).toBe(
      'Starred Messages',
    );
  });

  it('renders the empty-state tip: avatar, title and body', () => {
    const el = render();
    expect(el.querySelector('[data-testid="starred-page"]')).not.toBeNull();
    const avatar = el.querySelector<HTMLImageElement>('[data-testid="starred-tip-avatar"]');
    expect(avatar).not.toBeNull();
    expect(avatar?.getAttribute('alt')).toBe('');
    expect(avatar?.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelector('[data-testid="starred-tip-title"]')?.textContent?.trim()).toBe(
      'No Starred Messages',
    );
    expect(
      el.querySelector('[data-testid="starred-tip-body"]')?.textContent?.trim(),
    ).toBe('Tap and hold on any message to star it, so you can easily find it later.');
  });

  it('navigates to /settings when Back is activated', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    (el.querySelector('.navigation-bar__action') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/settings']);
  });

  it('replaces the tip with starred rows and navigates to the chat on tap', () => {
    const store = TestBed.inject(ChatStore);
    store.toggleStarred('chat-006', 'msg-007');
    store.toggleStarred('chat-006', 'msg-001');
    const router = TestBed.inject(Router);
    const navSpy = spyOn(router, 'navigate').and.resolveTo(true);

    const el = render();
    expect(el.querySelector('[data-testid="starred-tip"]')).toBeNull();
    const rows = el.querySelectorAll('[data-testid="starred-row"]');
    expect(rows.length).toBe(2);
    expect(el.querySelector('.starred__name')?.textContent).toBe('Martha Craig');
    expect(el.querySelector('.starred__text')?.textContent).toBe(
      'Do you know what time is it?',
    );
    expect(el.querySelector('.starred__time')?.textContent).toBe('11:40');
    expect(el.querySelector('.starred__star')).not.toBeNull();

    (rows[0] as HTMLElement).click();
    fixture.detectChanges();
    expect(navSpy).toHaveBeenCalledWith(['/chat', 'chat-006']);
  });

  it('keeps the empty-state tip when nothing is starred', () => {
    const el = render();
    expect(el.querySelector('[data-testid="starred-tip"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="starred-list"]')).toBeNull();
  });
});