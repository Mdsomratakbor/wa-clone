import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ChatStore } from '../../core/chat.store';
import { NewGroupPage } from './new-group-page';

describe('NewGroupPage', () => {
  let fixture: ComponentFixture<NewGroupPage>;
  let store: ChatStore;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [NewGroupPage],
      providers: [provideRouter([])],
    }).compileComponents();
    store = TestBed.inject(ChatStore);
    store.reset();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(NewGroupPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function typeName(el: HTMLElement, value: string): void {
    const input = el.querySelector<HTMLInputElement>('[data-testid="new-group-name"]');
    input!.value = value;
    input!.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function contactRows(el: HTMLElement): HTMLButtonElement[] {
    return [...el.querySelectorAll<HTMLButtonElement>('[data-testid="new-group-contact"]')];
  }

  it('renders the header: Back leading, New group title, no tab bar (F-040)', () => {
    const el = render();
    const actions = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')];
    expect(actions.length).toBe(1);
    expect(actions[0]?.textContent?.trim()).toBe('Back');
    expect(el.querySelector('.navigation-bar__title')?.textContent?.trim()).toBe('New group');
    expect(el.querySelector('[role="tab"]')).toBeNull();
  });

  it('lists one toggleable row per direct contact, in order (F-040)', () => {
    const el = render();
    const rows = contactRows(el);
    const expected = store.contactConversations().map((chat) => chat.contactName);
    expect(rows.map((row) => row.getAttribute('aria-label'))).toEqual(expected);
    expect(rows.every((row) => row.getAttribute('aria-pressed') === 'false')).toBe(true);
  });

  it('toggles a participant on and off with aria-pressed (F-040)', () => {
    const el = render();
    const row = contactRows(el)[0];
    const name = row.getAttribute('aria-label');

    row.click();
    fixture.detectChanges();
    expect(row.getAttribute('aria-pressed')).toBe('true');
    expect(el.querySelector('.new-group__check')).not.toBeNull();

    row.click();
    fixture.detectChanges();
    expect(row.getAttribute('aria-pressed')).toBe('false');
    expect(el.querySelector('.new-group__check')).toBeNull();
    expect(name).not.toBeNull();
  });

  it('keeps Create disabled until a trimmed name exists (F-040)', () => {
    const el = render();
    const create = el.querySelector<HTMLButtonElement>('[data-testid="new-group-create"]');
    expect(create?.disabled).toBe(true);

    typeName(el, '   ');
    expect(create?.disabled).toBe(true);

    typeName(el, 'Trip');
    expect(create?.disabled).toBe(false);
  });

  it('creates the group with the selected participants and opens the chat (F-040)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    const expected = store.contactConversations();

    typeName(el, '  Weekend plans  ');
    contactRows(el)[0].click();
    contactRows(el)[2].click();
    fixture.detectChanges();
    (el.querySelector('[data-testid="new-group-create"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    const group = store.conversations().find((chat) => chat.kind === 'group');
    expect(group?.contactName).toBe('Weekend plans');
    expect(group?.participantIds).toEqual([expected[0].id, expected[2].id]);
    expect(store.groupParticipants(group!.id)).toEqual([
      expected[0].contactName,
      expected[2].contactName,
    ]);
    expect(router.navigate).toHaveBeenCalledWith(['/chat', group?.id]);
  });

  it('creates a group with no participants when only a name is given (F-040)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    typeName(el, 'Solo');
    (el.querySelector('[data-testid="new-group-create"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(store.conversations().find((chat) => chat.kind === 'group')?.participantIds).toEqual(
      [],
    );
    expect(router.navigate).toHaveBeenCalled();
  });

  it('Back returns to /chats without creating a group (F-040)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    const before = store.conversations().length;
    (el.querySelector('.navigation-bar__action') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/chats']);
    expect(store.conversations().length).toBe(before);
  });

  it('renders the empty state when there are no direct contacts (F-040)', () => {
    for (const chat of [...store.conversations()]) {
      store.deleteConversation(chat.id);
    }
    const el = render();
    expect(el.querySelector('[data-testid="new-group-empty"]')?.textContent?.trim()).toBe(
      'No contacts',
    );
    expect(contactRows(el).length).toBe(0);
  });

  it('never lists an existing group as a participant option (F-040)', () => {
    store.createGroup('Existing group', ['Kieron Dotson']);
    const el = render();
    const names = contactRows(el).map((row) => row.getAttribute('aria-label'));
    expect(names).not.toContain('Existing group');
  });
});
