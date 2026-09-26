import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ChatsPage } from './chats-page';
import { ChatStore } from '../../core/chat.store';
import { CHAT_SEED } from './chat-list.seed';
import { NEW_CHAT_ACTIONS } from '../new-chat-modal/new-chat-modal.seed';

describe('ChatsPage', () => {
  let fixture: ComponentFixture<ChatsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatsPage],
      providers: [provideRouter([])],
    }).compileComponents();
    TestBed.inject(ChatStore).reset();
  });

  it('renders one row per seeded conversation', () => {
    fixture = TestBed.createComponent(ChatsPage);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('app-chat-list-item');
    expect(rows.length).toBe(CHAT_SEED.length);
  });

  it('renders the navigation bar with the Chats title', () => {
    fixture = TestBed.createComponent(ChatsPage);
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.navigation-bar__title');
    expect(title?.textContent).toBe('Chats');
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

    it('keeps the sheet open when a row is activated (targets are later features)', () => {
      const el = fixture.nativeElement as HTMLElement;
      openModal(el);
      el.querySelectorAll<HTMLButtonElement>('[data-testid="action-sheet-row"]')[0].click();
      fixture.detectChanges();
      expect(el.querySelector('[data-testid="action-sheet"]')).not.toBeNull();
      expect(el.querySelector('[data-testid="chat-list"]')).not.toBeNull();
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

    it('New group stays no-op: sheet open, no navigation', () => {
      const router = TestBed.inject(Router);
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

      expect(el.querySelector('[data-testid="action-sheet"]')).not.toBeNull();
      expect(store.conversations().length).toBe(before);
      expect(navSpy).not.toHaveBeenCalled();
    });
  });
});