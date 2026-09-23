import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ChatsPage } from './chats-page';
import { CHAT_SEED } from './chat-list.seed';

describe('ChatsPage', () => {
  let fixture: ComponentFixture<ChatsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatsPage],
      providers: [provideRouter([])],
    }).compileComponents();
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

  it('renders an empty placeholder when there are no conversations', () => {
    fixture = TestBed.createComponent(ChatsPage);
    fixture.componentRef.setInput('conversations', []);
    fixture.detectChanges();
    const empty = fixture.nativeElement.querySelector('[data-testid="empty-state"]');
    expect(empty).not.toBeNull();
    expect(empty?.textContent).toContain('No chats');
  });

  it('switches to a placeholder when a non-chats, non-status, non-calls tab is selected', () => {
    fixture = TestBed.createComponent(ChatsPage);
    fixture.detectChanges();
    const tabs = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '[role="tab"]',
    ) as NodeListOf<HTMLButtonElement>;
    tabs[2].click(); // Camera
    fixture.detectChanges();
    const stub = fixture.nativeElement.querySelector('[data-testid="tab-stub"]');
    expect(stub).not.toBeNull();
    expect(stub?.textContent).toContain('Camera');
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

    it('Read All is a no-op: list and selection unchanged', () => {
      const el = fixture.nativeElement as HTMLElement;
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
});