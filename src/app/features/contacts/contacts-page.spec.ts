import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ChatStore } from '../../core/chat.store';
import { ContactsPage } from './contacts-page';

describe('ContactsPage', () => {
  let fixture: ComponentFixture<ContactsPage>;
  let store: ChatStore;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ContactsPage],
      providers: [provideRouter([])],
    }).compileComponents();
    store = TestBed.inject(ChatStore);
    store.reset();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(ContactsPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function rowNames(el: HTMLElement): string[] {
    return [...el.querySelectorAll('.contacts__name')].map((node) => node.textContent?.trim() ?? '');
  }

  function search(el: HTMLElement, value: string): void {
    const input = el.querySelector<HTMLInputElement>('[data-testid="contacts-search"]');
    input!.value = value;
    input!.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  it('renders the header: Back leading, Contacts title, no tab bar (F-039)', () => {
    const el = render();
    const actions = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')];
    expect(actions.length).toBe(1);
    expect(actions[0]?.textContent?.trim()).toBe('Back');
    expect(el.querySelector('.navigation-bar__title')?.textContent?.trim()).toBe('Contacts');
    expect(el.querySelector('[role="tab"]')).toBeNull();
  });

  it('renders one alphabetically ordered row per contact (F-039)', () => {
    const el = render();
    const names = rowNames(el);
    const expected = store.contactConversations().map((chat) => chat.contactName);
    expect(names).toEqual(expected);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    expect(el.querySelectorAll('[data-testid="contacts-row"]').length).toBe(expected.length);
    expect(el.querySelector('[data-testid="contacts-search"]')).not.toBeNull();
  });

  it('labels each row with the contact name (F-039)', () => {
    const el = render();
    const first = store.contactConversations()[0];
    const row = el.querySelector('[data-testid="contacts-row"]');
    expect(row?.getAttribute('aria-label')).toBe(first?.contactName);
    expect(row?.getAttribute('role')).toBe('button');
    expect(row?.getAttribute('tabindex')).toBe('0');
  });

  it('filters by name, case-insensitively, without touching the store (F-039)', () => {
    const el = render();
    const before = store.conversations();
    search(el, 'kar');
    expect(rowNames(el)).toEqual(['Karen Castillo']);
    expect(store.conversations()).toBe(before);

    search(el, 'PARKER');
    expect(rowNames(el)).toEqual(['Andrew Parker']);
  });

  it('shows the clear control only with a query and restores the list (F-039)', () => {
    const el = render();
    expect(el.querySelector('[data-testid="contacts-search-clear"]')).toBeNull();

    search(el, 'kar');
    (el.querySelector('[data-testid="contacts-search-clear"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="contacts-search-clear"]')).toBeNull();
    expect(rowNames(el).length).toBe(store.contactConversations().length);
  });

  it('opens the contact info screen on click and on Enter (F-039)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    const target = store.contactConversations()[0];

    (el.querySelector('[data-testid="contacts-row"]') as HTMLElement).click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/contact', target?.id]);

    (el.querySelector('[data-testid="contacts-row"]') as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter' }),
    );
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledTimes(2);
  });

  it('Back returns to /settings (F-039)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    (el.querySelector('.navigation-bar__action') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/settings']);
  });

  it('renders the no-results state for a query that matches nothing (F-039)', () => {
    const el = render();
    search(el, 'zzzz');
    expect(el.querySelectorAll('[data-testid="contacts-row"]').length).toBe(0);
    expect(el.querySelector('[data-testid="contacts-empty"]')?.textContent?.trim()).toBe(
      'No results',
    );
  });

  it('renders the no-contacts state when there are no conversations (F-039)', () => {
    for (const chat of [...store.conversations()]) {
      store.deleteConversation(chat.id);
    }
    const el = render();
    expect(el.querySelector('[data-testid="contacts-empty"]')?.textContent?.trim()).toBe(
      'No contacts',
    );
  });

  it('ignores a whitespace-only query (F-039)', () => {
    const el = render();
    search(el, '   ');
    expect(rowNames(el).length).toBe(store.contactConversations().length);
  });
});
