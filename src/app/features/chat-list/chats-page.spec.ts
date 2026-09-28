import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ChatsPage } from './chats-page';
import { ChatStore } from '../../core/chat.store';
import { PrefsStore } from '../../core/prefs.store';
import { CHAT_SEED } from './chat-list.seed';
import { NEW_CHAT_ACTIONS } from '../new-chat-modal/new-chat-modal.seed';

function clickNavAction(el: HTMLElement, label: string): void {
  const button = Array.from(
    el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action'),
  ).find((b) => b.textContent?.trim() === label);
  button?.click();
}

describe('ChatsPage', () => {
  let fixture: ComponentFixture<ChatsPage>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ChatsPage],
      providers: [provideRouter([])],
    }).compileComponents();
    TestBed.inject(ChatStore).reset();
    TestBed.inject(PrefsStore).reset();
  });

  it('renders one row per seeded conversation', () => {
    fixture = TestBed.createComponent(ChatsPage);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('app-chat-list-item');
    expect(rows.length).toBe(CHAT_SEED.length);
  });

  it('carries the stored font scale on the list body (F-041 FR-008)', () => {
    TestBed.inject(PrefsStore).setFontScale('small');
    fixture = TestBed.createComponent(ChatsPage);
    fixture.detectChanges();
    const body = (fixture.nativeElement as HTMLElement).querySelector('.chats-page__body');
    expect(body?.getAttribute('data-font-scale')).toBe('small');
  });

  it('renders the default font scale when none is stored (F-041 FR-008)', () => {
    fixture = TestBed.createComponent(ChatsPage);
    fixture.detectChanges();
    const body = (fixture.nativeElement as HTMLElement).querySelector('.chats-page__body');
    expect(body?.getAttribute('data-font-scale')).toBe('default');
  });

  it('renders the navigation bar with the Chats title', () => {
    fixture = TestBed.createComponent(ChatsPage);
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.navigation-bar__title');
    expect(title?.textContent).toBe('Chats');
  });

  it('hides the Archived row when nothing is archived (F-034)', () => {
    fixture = TestBed.createComponent(ChatsPage);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="archived-row"]')).toBeNull();
  });

  it('renders the Archived row when a chat is archived and opens the screen (F-034)', () => {
    const store = TestBed.inject(ChatStore);
    const router = TestBed.inject(Router);
    const navigate = spyOn(router, 'navigate').and.resolveTo(true);
    store.archiveConversations([CHAT_SEED[0].id]);
    fixture = TestBed.createComponent(ChatsPage);
    fixture.detectChanges();
    const row = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '[data-testid="archived-row"]',
    );
    expect(row).not.toBeNull();
    expect(row?.getAttribute('aria-label')).toBe('Archived');
    expect(row?.textContent?.trim()).toBe('Archived');
    row?.click();
    expect(navigate).toHaveBeenCalledWith(['/archived']);
  });

  it('keeps the Archived row out of edit mode and out of search results (F-034)', () => {
    const store = TestBed.inject(ChatStore);
    store.archiveConversations([CHAT_SEED[0].id]);
    fixture = TestBed.createComponent(ChatsPage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="archived-row"]')).not.toBeNull();

    clickNavAction(el, 'Edit');
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="archived-row"]')).toBeNull();

    clickNavAction(el, 'Done');
    fixture.detectChanges();
    const search = el.querySelector<HTMLInputElement>('[data-testid="chat-search"]')!;
    search.value = 'a';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="archived-row"]')).toBeNull();
  });

  it('hides the Archived row once the last archived chat is restored (F-034)', () => {
    const store = TestBed.inject(ChatStore);
    store.archiveConversations([CHAT_SEED[0].id]);
    fixture = TestBed.createComponent(ChatsPage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="archived-row"]')).not.toBeNull();
    store.unarchiveConversations([CHAT_SEED[0].id]);
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="archived-row"]')).toBeNull();
  });

  it('renders an empty placeholder when the store has no conversations', () => {
    TestBed.inject(ChatStore).setConversations([]);
    fixture = TestBed.createComponent(ChatsPage);
    fixture.detectChanges();
    const empty = fixture.nativeElement.querySelector('[data-testid="empty-state"]');
    expect(empty).not.toBeNull();
    expect(empty?.textContent).toContain('No chats');
  });

  it('navigates to /camera when the Camera tab is selected (feature 012)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(ChatsPage);
    fixture.detectChanges();
    const tabs = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '[role="tab"]',
    ) as NodeListOf<HTMLButtonElement>;
    tabs[2].click(); // Camera
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/camera']);
  });

  it('navigates to /settings when the Settings tab is selected (feature 013)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(ChatsPage);
    fixture.detectChanges();
    const tabs = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '[role="tab"]',
    ) as NodeListOf<HTMLButtonElement>;
    tabs[0].click(); // Settings
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/settings']);
  });

  it('navigates to /calls when the Calls tab is selected', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(ChatsPage);
    fixture.detectChanges();
    const tabs = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '[role="tab"]',
    ) as NodeListOf<HTMLButtonElement>;
    tabs[3].click(); // Calls
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/calls']);
  });

  it('navigates to /status when the Status tab is selected', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(ChatsPage);
    fixture.detectChanges();
    const tabs = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '[role="tab"]',
    ) as NodeListOf<HTMLButtonElement>;
    tabs[4].click(); // Status
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/status']);
    expect(fixture.nativeElement.querySelector('[data-testid="tab-stub"]')).toBeNull();
  });

  describe('search and sort', () => {
    function names(): string[] {
      const el = fixture.nativeElement as HTMLElement;
      return [...el.querySelectorAll('.chat-list-item')].map(
        (row) => row.getAttribute('aria-label') ?? '',
      );
    }

    function typeSearch(query: string): void {
      const el = fixture.nativeElement as HTMLElement;
      const input = el.querySelector<HTMLInputElement>('[data-testid="chat-search"]') as
        HTMLInputElement | null;
      input!.value = query;
      input!.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    }

    beforeEach(() => {
      fixture = TestBed.createComponent(ChatsPage);
      fixture.detectChanges();
    });

    it('renders the search bar and the Recent/Name/Unread sort segment', () => {
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('[data-testid="chat-search"]')).not.toBeNull();
      const options = [
        ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
          '[data-testid="chat-sort-option"]',
        ),
      ];
      expect(options.map((o) => o.textContent?.trim())).toEqual([
        'Recent',
        'Name',
        'Unread',
      ]);
      expect(options[0]?.getAttribute('aria-pressed')).toBe('true');
    });

    it('filters the list by name as you type', () => {
      typeSearch('maximillian');
      expect(names().length).toBe(1);
      expect(names()[0]).toBe('Maximillian Jacobson');
    });

    it('filters the list by preview text as you type', () => {
      typeSearch('good idea');
      expect(names().length).toBe(1);
      expect(names()[0]).toBe('Maximillian Jacobson');
    });

    it('clears the search and restores every conversation', () => {
      typeSearch('no such contact');
      expect(fixture.nativeElement.querySelector('[data-testid="search-empty"]')).not.toBeNull();
      (fixture.nativeElement.querySelector('[data-testid="chat-search-clear"]') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(names().length).toBe(CHAT_SEED.length);
      expect(fixture.nativeElement.querySelector('[data-testid="search-empty"]')).toBeNull();
    });

    it('orders by name when the Name sort is selected', () => {
const options = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
        '[data-testid="chat-sort-option"]',
      ),
    ];
    options[1]?.click(); // Name
      fixture.detectChanges();
      const expected = [...CHAT_SEED]
        .map((c) => c.contactName)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      expect(names()).toEqual(expected);
    });

    it('orders unread first when the Unread sort is selected', () => {
      TestBed.inject(ChatStore).openConversation('chat-001');
      fixture.detectChanges();
const options = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
        '[data-testid="chat-sort-option"]',
      ),
    ];
    options[2]?.click(); // Unread
      fixture.detectChanges();
      expect(names()[names().length - 1]).toBe('Maximillian Jacobson');
    });

    it('reflects a persisted sort preference on render', () => {
      TestBed.inject(PrefsStore).setChatSort('name');
      fixture = TestBed.createComponent(ChatsPage);
      fixture.detectChanges();
      const expected = [...CHAT_SEED]
        .map((c) => c.contactName)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      expect(names()).toEqual(expected);
    });

    it('hides search and sort while editing', () => {
      const el = fixture.nativeElement as HTMLElement;
      (Array.from(el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')).find(
        (b) => b.textContent?.trim() === 'Edit',
      ) as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(el.querySelector('[data-testid="chat-search"]')).toBeNull();
      expect(el.querySelector('[data-testid="chat-sort"]')).toBeNull();
    });
  });

  describe('nav actions', () => {
    it('New Group opens the group creation screen (F-040)', () => {
      const router = TestBed.inject(Router);
      const navSpy = spyOn(router, 'navigate').and.resolveTo(true);
      fixture = TestBed.createComponent(ChatsPage);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      const before = TestBed.inject(ChatStore).conversations().length;

      clickNavAction(el, 'New Group');
      fixture.detectChanges();

      expect(navSpy).toHaveBeenCalledWith(['/new-group']);
      expect(TestBed.inject(ChatStore).conversations().length).toBe(before);
    });

    it('Broadcast Lists stays a no-op (F-001/003)', () => {
      const router = TestBed.inject(Router);
      const navSpy = spyOn(router, 'navigate').and.resolveTo(true);
      fixture = TestBed.createComponent(ChatsPage);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;

      clickNavAction(el, 'Broadcast Lists');
      fixture.detectChanges();

      expect(navSpy).not.toHaveBeenCalled();
    });
  });

  describe('edit mode', () => {
    function clickAction(el: HTMLElement, label: string): void {
      const button = Array.from(
        el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action'),
      ).find((b) => b.textContent?.trim() === label);
      button?.click();
    }

    beforeEach(() => {
      fixture = TestBed.createComponent(ChatsPage);
      fixture.detectChanges();
    });

    it('enters edit mode on Edit: Done, circles, action bar; no FAB/tab bar', () => {
      const el = fixture.nativeElement as HTMLElement;
      clickAction(el, 'Edit');
      fixture.detectChanges();

      const trailing = Array.from(
        el.querySelectorAll('.navigation-bar__group--trailing .navigation-bar__action'),
      ).map((b) => b.textContent?.trim());
      expect(trailing).toEqual(['Done']);
      expect(el.querySelectorAll('[data-testid="select-circle"]').length).toBe(CHAT_SEED.length);
      expect(el.querySelector('[data-testid="chat-actions"]')).not.toBeNull();
      expect(el.querySelector('[role="tablist"]')).toBeNull();
      expect(el.querySelector('.fab')).toBeNull();
      expect(el.querySelector('.chat-list-item')?.getAttribute('role')).toBe('checkbox');
    });

    it('Done exits edit mode and restores the normal UI', () => {
      const el = fixture.nativeElement as HTMLElement;
      clickAction(el, 'Edit');
      fixture.detectChanges();
      clickAction(el, 'Done');
      fixture.detectChanges();

      const trailing = Array.from(
        el.querySelectorAll('.navigation-bar__group--trailing .navigation-bar__action'),
      ).map((b) => b.textContent?.trim());
      expect(trailing).toEqual(['Edit']);
      expect(el.querySelector('[data-testid="chat-actions"]')).toBeNull();
      expect(el.querySelector('[role="tablist"]')).not.toBeNull();
      expect(el.querySelector('.fab')).not.toBeNull();
      expect(el.querySelectorAll('[data-testid="select-circle"]').length).toBe(0);
    });

    it('toggles selection when a row is activated in edit mode', () => {
      const el = fixture.nativeElement as HTMLElement;
      clickAction(el, 'Edit');
      fixture.detectChanges();

      const row = el.querySelector('.chat-list-item') as HTMLElement;
      const barButton = el.querySelector<HTMLButtonElement>(
        '[data-testid="chat-actions"] button',
      ) as HTMLButtonElement;
      expect(barButton.disabled).toBe(true);

      row.click();
      fixture.detectChanges();
      expect(el.querySelector('.chat-list-item')?.getAttribute('aria-checked')).toBe('true');
      expect(
        el
          .querySelector('[data-testid="select-circle"]')
          ?.classList.contains('chat-list-item__select--checked'),
      ).toBe(true);
      expect(barButton.disabled).toBe(false);

      row.click();
      fixture.detectChanges();
      expect(el.querySelector('.chat-list-item')?.getAttribute('aria-checked')).toBe('false');
      expect(barButton.disabled).toBe(true);
    });

    it('does not navigate away from the list while editing', async () => {
      const el = fixture.nativeElement as HTMLElement;
      clickAction(el, 'Edit');
      fixture.detectChanges();
      (el.querySelector('.chat-list-item') as HTMLElement).click();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[data-testid="chat-list"]')).not.toBeNull();
    });

    it('Delete removes exactly the selected rows and clears selection', () => {
      const el = fixture.nativeElement as HTMLElement;
      clickAction(el, 'Edit');
      fixture.detectChanges();

      const rows = el.querySelectorAll<HTMLElement>('.chat-list-item');
      rows[0].click();
      rows[1].click();
      fixture.detectChanges();
      const deleteBtn = Array.from(
        el.querySelectorAll<HTMLButtonElement>('[data-testid="chat-actions"] button'),
      ).find((b) => b.textContent?.trim() === 'Delete');
      deleteBtn?.click();
      fixture.detectChanges();

      expect(el.querySelectorAll('.chat-list-item').length).toBe(CHAT_SEED.length - 2);
      expect(
        (el.querySelector('[data-testid="chat-actions"] button') as HTMLButtonElement).disabled,
      ).toBe(true);
    });

    it('Archive removes the selected rows', () => {
      const el = fixture.nativeElement as HTMLElement;
      clickAction(el, 'Edit');
      fixture.detectChanges();

      (el.querySelector('.chat-list-item') as HTMLElement).click();
      fixture.detectChanges();
      const archiveBtn = Array.from(
        el.querySelectorAll<HTMLButtonElement>('[data-testid="chat-actions"] button'),
      ).find((b) => b.textContent?.trim() === 'Archive');
      archiveBtn?.click();
      fixture.detectChanges();

      expect(el.querySelectorAll('.chat-list-item').length).toBe(CHAT_SEED.length - 1);
    });

    it('Archive keeps the conversation in the store flagged as archived (F-032)', () => {
      const el = fixture.nativeElement as HTMLElement;
      const store = TestBed.inject(ChatStore);
      clickAction(el, 'Edit');
      fixture.detectChanges();

      (el.querySelector('.chat-list-item') as HTMLElement).click();
      fixture.detectChanges();
      const archiveBtn = Array.from(
        el.querySelectorAll<HTMLButtonElement>('[data-testid="chat-actions"] button'),
      ).find((b) => b.textContent?.trim() === 'Archive');
      archiveBtn?.click();
      fixture.detectChanges();

      expect(store.conversations().length).toBe(CHAT_SEED.length);
      expect(store.archivedIds()).toEqual([CHAT_SEED[0].id]);
    });

    it('archived chats stay hidden on a fresh page instance (F-032)', () => {
      const el = fixture.nativeElement as HTMLElement;
      clickAction(el, 'Edit');
      fixture.detectChanges();
      (el.querySelector('.chat-list-item') as HTMLElement).click();
      fixture.detectChanges();
      const archiveBtn = Array.from(
        el.querySelectorAll<HTMLButtonElement>('[data-testid="chat-actions"] button'),
      ).find((b) => b.textContent?.trim() === 'Archive');
      archiveBtn?.click();
      fixture.detectChanges();

      const reopened = TestBed.createComponent(ChatsPage);
      reopened.detectChanges();
      expect(
        (reopened.nativeElement as HTMLElement).querySelectorAll('.chat-list-item').length,
      ).toBe(CHAT_SEED.length - 1);
    });

    it('Delete survives a fresh page instance (F-032)', () => {
      const el = fixture.nativeElement as HTMLElement;
      clickAction(el, 'Edit');
      fixture.detectChanges();
      (el.querySelector('.chat-list-item') as HTMLElement).click();
      fixture.detectChanges();
      const deleteBtn = Array.from(
        el.querySelectorAll<HTMLButtonElement>('[data-testid="chat-actions"] button'),
      ).find((b) => b.textContent?.trim() === 'Delete');
      deleteBtn?.click();
      fixture.detectChanges();

      const reopened = TestBed.createComponent(ChatsPage);
      reopened.detectChanges();
      expect(
        (reopened.nativeElement as HTMLElement).querySelectorAll('.chat-list-item').length,
      ).toBe(CHAT_SEED.length - 1);
    });

    it('an archived chat is not matched by search (F-032)', () => {
      const store = TestBed.inject(ChatStore);
      store.archiveConversations([CHAT_SEED[0].id]);
      fixture = TestBed.createComponent(ChatsPage);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      const search = el.querySelector<HTMLInputElement>('[data-testid="chat-search"]')!;
      search.value = CHAT_SEED[0].contactName;
      search.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(el.querySelectorAll('.chat-list-item').length).toBe(0);
      expect(el.querySelector('[data-testid="search-empty"]')?.textContent).toContain(
        'No chats found',
      );
    });

    it('renders a mute badge only on the muted row (F-033)', () => {
      const store = TestBed.inject(ChatStore);
      store.toggleMuted(CHAT_SEED[0].id);
      fixture = TestBed.createComponent(ChatsPage);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      const badges = el.querySelectorAll('[data-testid^="chat-mute-badge-"]');
      expect(badges.length).toBe(1);
      expect(badges[0].getAttribute('data-testid')).toBe(`chat-mute-badge-${CHAT_SEED[0].id}`);
    });

    it('removes the mute badge after unmuting and keeps it across a reload (F-033)', () => {
      const store = TestBed.inject(ChatStore);
      store.toggleMuted(CHAT_SEED[0].id);
      fixture = TestBed.createComponent(ChatsPage);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelectorAll('[data-testid^="chat-mute-badge-"]').length).toBe(1);

      const reloaded = TestBed.createComponent(ChatsPage);
      reloaded.detectChanges();
      expect(
        (reloaded.nativeElement as HTMLElement).querySelectorAll(
          '[data-testid^="chat-mute-badge-"]',
        ).length,
      ).toBe(1);

      store.toggleMuted(CHAT_SEED[0].id);
      fixture.detectChanges();
      expect(el.querySelectorAll('[data-testid^="chat-mute-badge-"]').length).toBe(0);
    });

    it('keeps the mute badge in edit mode and drops it with a deleted row (F-033)', () => {
      const store = TestBed.inject(ChatStore);
      store.toggleMuted(CHAT_SEED[0].id);
      fixture = TestBed.createComponent(ChatsPage);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      clickAction(el, 'Edit');
      fixture.detectChanges();
      expect(el.querySelectorAll('[data-testid^="chat-mute-badge-"]').length).toBe(1);

      (el.querySelector('.chat-list-item') as HTMLElement).click();
      fixture.detectChanges();
      const deleteBtn = Array.from(
        el.querySelectorAll<HTMLButtonElement>('[data-testid="chat-actions"] button'),
      ).find((b) => b.textContent?.trim() === 'Delete');
      deleteBtn?.click();
      fixture.detectChanges();
      expect(el.querySelectorAll('[data-testid^="chat-mute-badge-"]').length).toBe(0);
    });

    it('Read All marks every conversation read without touching the list', () => {
      const el = fixture.nativeElement as HTMLElement;
      const store = TestBed.inject(ChatStore);
      clickAction(el, 'Edit');
      fixture.detectChanges();

      (el.querySelector('.chat-list-item') as HTMLElement).click();
      fixture.detectChanges();
      const readAllBtn = Array.from(
        el.querySelectorAll<HTMLButtonElement>('[data-testid="chat-actions"] button'),
      ).find((b) => b.textContent?.trim() === 'Read All');
      readAllBtn?.click();
      fixture.detectChanges();

      expect(el.querySelectorAll('.chat-list-item').length).toBe(CHAT_SEED.length);
      expect(el.querySelector('.chat-list-item')?.getAttribute('aria-checked')).toBe('true');
      expect(store.conversations().every((c) => c.read === true)).toBe(true);
      expect(el.querySelectorAll('[data-testid^="read-tick-"]').length).toBe(CHAT_SEED.length);
    });

    it('empties to the No chats placeholder while staying in edit mode', () => {
      const el = fixture.nativeElement as HTMLElement;
      clickAction(el, 'Edit');
      fixture.detectChanges();

      for (const row of el.querySelectorAll<HTMLElement>('.chat-list-item')) {
        row.click();
        fixture.detectChanges();
      }
      const deleteBtn = Array.from(
        el.querySelectorAll<HTMLButtonElement>('[data-testid="chat-actions"] button'),
      ).find((b) => b.textContent?.trim() === 'Delete');
      deleteBtn?.click();
      fixture.detectChanges();

      expect(el.querySelector('[data-testid="empty-state"]')?.textContent).toContain('No chats');
      expect(el.querySelector('[data-testid="chat-actions"]')).not.toBeNull();
      expect(
        Array.from(
          el.querySelectorAll('.navigation-bar__group--trailing .navigation-bar__action'),
        ).map((b) => b.textContent?.trim()),
      ).toEqual(['Done']);
    });
  });

  describe('new chat modal', () => {
    function fabButton(el: HTMLElement): HTMLButtonElement {
      return el.querySelector('.fab') as HTMLButtonElement;
    }

    function openModal(el: HTMLElement): void {
      fabButton(el).click();
      fixture.detectChanges();
    }

    beforeEach(() => {
      fixture = TestBed.createComponent(ChatsPage);
      fixture.detectChanges();
    });

    it('opens the action sheet from the FAB', () => {
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('[data-testid="action-sheet"]')).toBeNull();
      openModal(el);
      expect(el.querySelector('[data-testid="action-sheet"]')).not.toBeNull();
      expect(el.querySelector('[data-testid="action-sheet-backdrop"]')).not.toBeNull();
    });

    it('renders the new chat rows from the seed', () => {
      const el = fixture.nativeElement as HTMLElement;
      openModal(el);
      expect(
        el.querySelectorAll('[data-testid="action-sheet-row"]').length,
      ).toBe(NEW_CHAT_ACTIONS.length);
      NEW_CHAT_ACTIONS.forEach((action, index) => {
        expect(
          el.querySelectorAll<HTMLButtonElement>('[data-testid="action-sheet-row"]')[index]
            .textContent?.trim(),
        ).toBe(action.label);
      });
    });

    it('keeps the sheet open when New community is activated (target is a later feature)', () => {
      const router = TestBed.inject(Router);
      const navSpy = spyOn(router, 'navigate').and.resolveTo(true);
      const el = fixture.nativeElement as HTMLElement;
      openModal(el);
      const newCommunity = Array.from(
        el.querySelectorAll<HTMLButtonElement>('[data-testid="action-sheet-row"]'),
      ).find((b) => b.textContent?.trim() === 'New community');
      newCommunity?.click();
      fixture.detectChanges();
      expect(el.querySelector('[data-testid="action-sheet"]')).not.toBeNull();
      expect(el.querySelector('[data-testid="chat-list"]')).not.toBeNull();
      expect(navSpy).not.toHaveBeenCalled();
    });

    it('dismisses on backdrop and restores focus to the FAB', () => {
      const el = fixture.nativeElement as HTMLElement;
      openModal(el);
      el.querySelector<HTMLButtonElement>('[data-testid="action-sheet-backdrop"]')?.click();
      fixture.detectChanges();
      expect(el.querySelector('[data-testid="action-sheet"]')).toBeNull();
      expect(document.activeElement).toBe(fabButton(el));
    });

    it('dismisses on Escape and restores focus to the FAB', () => {
      const el = fixture.nativeElement as HTMLElement;
      openModal(el);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();
      expect(el.querySelector('[data-testid="action-sheet"]')).toBeNull();
      expect(document.activeElement).toBe(fabButton(el));
    });

    it('does not open a second sheet while one is already open', () => {
      const el = fixture.nativeElement as HTMLElement;
      openModal(el);
      fabButton(el).click();
      fixture.detectChanges();
      expect(el.querySelectorAll('[data-testid="action-sheet"]').length).toBe(1);
    });

    it('New contact closes the sheet, creates a conversation and navigates to it', () => {
      const router = TestBed.inject(Router);
      const navSpy = spyOn(router, 'navigate').and.resolveTo(true);
      const el = fixture.nativeElement as HTMLElement;
      const store = TestBed.inject(ChatStore);
      const before = store.conversations().length;
      openModal(el);

      const newContact = Array.from(
        el.querySelectorAll<HTMLButtonElement>('[data-testid="action-sheet-row"]'),
      ).find((b) => b.textContent?.trim() === 'New contact');
      newContact?.click();
      fixture.detectChanges();

      expect(el.querySelector('[data-testid="action-sheet"]')).toBeNull();
      expect(store.conversations().length).toBe(before + 1);
      expect(store.conversations()[store.conversations().length - 1].contactName).toBe(
        'New contact',
      );
      expect(navSpy).toHaveBeenCalledWith(['/chat', 'chat-new-1']);
    });

    it('New group closes the sheet and opens the group creation screen (F-040)', () => {      const router = TestBed.inject(Router);
      const navSpy = spyOn(router, 'navigate').and.resolveTo(true);
      const el = fixture.nativeElement as HTMLElement;
      const store = TestBed.inject(ChatStore);
      const before = store.conversations().length;
      openModal(el);

      const newGroup = Array.from(
        el.querySelectorAll<HTMLButtonElement>('[data-testid="action-sheet-row"]'),
      ).find((b) => b.textContent?.trim() === 'New group');
      newGroup?.click();
      fixture.detectChanges();

      expect(el.querySelector('[data-testid="action-sheet"]')).toBeNull();
      expect(store.conversations().length).toBe(before);
      expect(navSpy).toHaveBeenCalledWith(['/new-group']);
    });
  });
});