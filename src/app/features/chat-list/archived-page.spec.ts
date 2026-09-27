import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ArchivedPage } from './archived-page';
import { ChatStore } from '../../core/chat.store';
import { CHAT_SEED } from './chat-list.seed';

describe('ArchivedPage', () => {
  let fixture: ComponentFixture<ArchivedPage>;
  let navSpy: jasmine.Spy;
  let store: ChatStore;

  beforeEach(async () => {
    localStorage.clear();
    navSpy = jasmine.createSpy('navigate');
    await TestBed.configureTestingModule({
      imports: [ArchivedPage],
      providers: [{ provide: Router, useValue: { navigate: navSpy } }],
    }).compileComponents();
    store = TestBed.inject(ChatStore);
    store.reset();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(ArchivedPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the empty state when nothing is archived', () => {
    const el = render();
    expect(el.querySelector('[data-testid="archived-page"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="archived-empty"]')?.textContent).toContain(
      'No archived chats',
    );
  });

  it('lists exactly the archived conversations', () => {
    const [first, second] = CHAT_SEED;
    store.archiveConversations([first.id, second.id]);
    const el = render();
    expect(el.querySelectorAll('.archived__row').length).toBe(2);
    const names = Array.from(el.querySelectorAll('.chat-list-item__name')).map((n) =>
      n.textContent?.trim(),
    );
    expect(names).toEqual([first.contactName, second.contactName]);
    expect(el.querySelector('[data-testid="archived-empty"]')).toBeNull();
  });

  it('does not list unarchived conversations', () => {
    const [first] = CHAT_SEED;
    store.archiveConversations([first.id]);
    const el = render();
    expect(el.querySelectorAll('.archived__row').length).toBe(1);
    expect(el.querySelector('.chat-list-item__name')?.textContent).toContain(
      first.contactName,
    );
  });

  it('the back action returns to the chats list', () => {
    const el = render();
    const back = el.querySelector<HTMLButtonElement>(
      '.navigation-bar__group--leading button',
    );
    expect(back?.textContent?.trim()).toBe('Chats');
    back?.click();
    expect(navSpy).toHaveBeenCalledWith(['/chats']);
  });

  it('tapping a row unarchives the chat and opens its thread', () => {
    const [first] = CHAT_SEED;
    store.archiveConversations([first.id]);
    const el = render();
    (el.querySelector('.archived__row .chat-list-item') as HTMLElement).click();
    fixture.detectChanges();
    expect(store.archivedIds()).toEqual([]);
    expect(navSpy).toHaveBeenCalledWith(['/chat', first.id]);
    expect(el.querySelector('[data-testid="archived-empty"]')).not.toBeNull();
  });

  it('reflects a restore performed elsewhere', () => {
    const [first] = CHAT_SEED;
    store.archiveConversations([first.id]);
    const el = render();
    expect(el.querySelectorAll('.archived__row').length).toBe(1);
    store.unarchiveConversations([first.id]);
    fixture.detectChanges();
    expect(el.querySelectorAll('.archived__row').length).toBe(0);
  });
});