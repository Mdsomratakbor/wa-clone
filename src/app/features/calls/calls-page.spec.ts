import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CallStore } from '../../core/call.store';
import { ChatStore } from '../../core/chat.store';
import { CallsPage } from './calls-page';
import { CALL_SEED } from './calls.seed';

describe('CallsPage', () => {
  let fixture: ComponentFixture<CallsPage>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [CallsPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(CallsPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders one row per seeded call', () => {
    const el = render();
    expect(el.querySelectorAll('app-call-list-item').length).toBe(CALL_SEED.length);
  });

  it('renders the header: Edit leading, static filter, new-call trailing, no title', () => {
    const el = render();
    const actions = [
      ...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action'),
    ];
    expect(actions[0]?.textContent?.trim()).toBe('Edit');
    expect(actions.at(-1)?.getAttribute('aria-label')).toBe('New call');
    expect(actions.at(-1)?.querySelector('.navigation-bar__icon')).not.toBeNull();
    expect(el.querySelector('.navigation-bar__title')).toBeNull();
    expect(
      el.querySelector('[data-testid="calls-filter"]')?.hasAttribute('data-nav-center'),
    ).toBe(true);
    expect((el.querySelector('[data-testid="filter-all"]') as HTMLButtonElement).disabled).toBe(true);
    expect((el.querySelector('[data-testid="filter-missed"]') as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it('renders the tab bar with Calls active and no FAB', () => {
    const el = render();
    const tabs = el.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(5);
    const active = el.querySelector('[role="tab"][aria-selected="true"]');
    expect(active?.textContent?.trim()).toBe('Calls');
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
  });

  it('navigates to /status when the Status tab is activated', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    const statusTab = [...el.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find((b) =>
      b.textContent?.trim()?.startsWith('Status'),
    );
    statusTab?.click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/status']);
    expect(el.querySelector('[data-testid="tab-stub"]')).toBeNull();
  });

  it('new-call opens the contact picker (F-045 FR-003)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    const newCall = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')].find(
      (b) => b.getAttribute('aria-label') === 'New call',
    );
    newCall?.click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/calls/new']);
    expect(el.querySelectorAll('app-call-list-item').length).toBe(CALL_SEED.length);
  });

  it('Edit enters edit mode: Done + Clear header, minus circles, no info buttons', () => {
    const el = render();
    const edit = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')].find(
      (b) => b.textContent?.trim() === 'Edit',
    );
    edit?.click();
    fixture.detectChanges();
    const actions = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')];
    expect(actions[0]?.textContent?.trim()).toBe('Done');
    expect(actions.at(-1)?.textContent?.trim()).toBe('Clear');
    expect(el.querySelectorAll('[data-testid="call-remove"]').length).toBe(CALL_SEED.length);
    expect(el.querySelectorAll('[data-testid="call-info"]').length).toBe(0);
    expect((el.querySelector('[data-testid="filter-all"]') as HTMLButtonElement).disabled).toBe(true);
  });

  it('Done exits edit mode and restores the 004 header with info buttons', () => {
    const el = render();
    const edit = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')].find(
      (b) => b.textContent?.trim() === 'Edit',
    );
    edit?.click();
    fixture.detectChanges();
    const done = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')].find(
      (b) => b.textContent?.trim() === 'Done',
    );
    done?.click();
    fixture.detectChanges();
    const actions = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')];
    expect(actions[0]?.textContent?.trim()).toBe('Edit');
    expect(actions.at(-1)?.getAttribute('aria-label')).toBe('New call');
    expect(el.querySelectorAll('[data-testid="call-remove"]').length).toBe(0);
    expect(el.querySelectorAll('[data-testid="call-info"]').length).toBe(CALL_SEED.length);
  });

  it('removing a row via the minus deletes exactly that row', () => {
    const el = render();
    const edit = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')].find(
      (b) => b.textContent?.trim() === 'Edit',
    );
    edit?.click();
    fixture.detectChanges();
    const minus = el.querySelector('[data-testid="call-remove"]') as HTMLButtonElement;
    const removedName = minus?.getAttribute('aria-label');
    minus?.click();
    fixture.detectChanges();
    expect(el.querySelectorAll('app-call-list-item').length).toBe(CALL_SEED.length - 1);
    expect(
      [...el.querySelectorAll('.call-list-item__name')].some(
        (n) => n.textContent?.trim() === removedName?.replace('Remove call for ', ''),
      ),
    ).toBe(false);
  });

  it('Clear empties the list, disables Clear and shows the No calls empty state', () => {
    const el = render();
    const edit = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')].find(
      (b) => b.textContent?.trim() === 'Edit',
    );
    edit?.click();
    fixture.detectChanges();
    const clear = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')].find(
      (b) => b.textContent?.trim() === 'Clear',
    );
    clear?.click();
    fixture.detectChanges();
    expect(el.querySelectorAll('app-call-list-item').length).toBe(0);
    const actions = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')];
    expect(actions.at(-1)?.textContent?.trim()).toBe('Clear');
    expect(actions.at(-1)?.disabled).toBe(true);
    expect(el.querySelector('[data-testid="empty-state"]')?.textContent).toContain('No calls');
  });

  it('row-body activation is a no-op in edit mode', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    const edit = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')].find(
      (b) => b.textContent?.trim() === 'Edit',
    );
    edit?.click();
    fixture.detectChanges();
    const row = el.querySelector('.call-list-item') as HTMLElement;
    row?.click();
    fixture.detectChanges();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(el.querySelectorAll('app-call-list-item').length).toBe(CALL_SEED.length);
  });

  it('row activation opens the chat with the same contact (F-038)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();

    const row = [...el.querySelectorAll<HTMLElement>('.call-list-item')].find((candidate) =>
      candidate.textContent?.includes('Kieron Dotson'),
    );
    row?.click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/chat', 'chat-003']);
  });

  it('row activation works from the keyboard too (F-038)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();

    const row = [...el.querySelectorAll<HTMLElement>('.call-list-item')].find((candidate) =>
      candidate.textContent?.includes('Martin Randolph'),
    );
    row?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/chat', 'chat-007']);
  });

  it('row activation is a no-op when the contact has no chat (F-038)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();

    const row = [...el.querySelectorAll<HTMLElement>('.call-list-item')].find((candidate) =>
      candidate.textContent?.includes('Zack John'),
    );
    row?.click();
    fixture.detectChanges();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  describe('call info sheet (feature 043)', () => {
    function rowLabels(el: HTMLElement): string[] {
      return [
        ...el.querySelectorAll<HTMLElement>('[data-testid="action-sheet-row"]'),
      ].map((row) => (row.textContent ?? '').trim());
    }

    function openSheetForFirstRow(el: HTMLElement): void {
      (el.querySelector('[data-testid="call-info"]') as HTMLButtonElement).click();
      fixture.detectChanges();
    }

    function clickRow(el: HTMLElement, label: string): void {
      const row = [
        ...el.querySelectorAll<HTMLElement>('[data-testid="action-sheet-row"]'),
      ].find((it) => (it.textContent ?? '').trim() === label);
      (row as HTMLButtonElement).click();
      fixture.detectChanges();
    }

    it('the info button opens the sheet and does not navigate (FR-001)', () => {
      const router = TestBed.inject(Router);
      const navSpy = spyOn(router, 'navigate').and.resolveTo(true);
      const el = render();

      expect(el.querySelector('[data-testid="action-sheet"]')).toBeNull();
      openSheetForFirstRow(el);

      expect(el.querySelector('[data-testid="action-sheet"]')).not.toBeNull();
      expect(navSpy).not.toHaveBeenCalled();
    });

    it('the sheet shows the four actions in order (FR-002)', () => {
      const el = render();
      openSheetForFirstRow(el);
      expect(rowLabels(el)).toEqual(['Message', 'Voice call', 'Video call', 'Delete']);
    });

    it('Message opens the chat for the tapped row and marks it read (FR-004)', () => {
      const router = TestBed.inject(Router);
      const navSpy = spyOn(router, 'navigate').and.resolveTo(true);
      const el = render();
      const first = CALL_SEED[0];

      openSheetForFirstRow(el);
      clickRow(el, 'Message');

      const chatId = TestBed.inject(ChatStore).chatIdForContactName(first.contactName);
      expect(navSpy).toHaveBeenCalledWith(['/chat', chatId]);
      expect(el.querySelector('[data-testid="action-sheet"]')).toBeNull();
      expect(TestBed.inject(ChatStore).conversationMessages(chatId as string)).toBeDefined();
    });

    it('Message closes the sheet but stays put when the contact has no chat (FR-004)', () => {
      const router = TestBed.inject(Router);
      const navSpy = spyOn(router, 'navigate').and.resolveTo(true);
      const el = render();
      // call-005 is Zack John, who has no chat in the chat seed - the F-038 "stays put" case.
      const orphanIndex = CALL_SEED.findIndex(
        (call) => TestBed.inject(ChatStore).chatIdForContactName(call.contactName) === null,
      );
      expect(orphanIndex).toBeGreaterThan(-1);

      const infoButtons = el.querySelectorAll<HTMLButtonElement>('[data-testid="call-info"]');
      infoButtons[orphanIndex]?.click();
      fixture.detectChanges();
      expect(el.querySelector('[data-testid="action-sheet"]')).not.toBeNull();

      clickRow(el, 'Message');

      expect(navSpy).not.toHaveBeenCalled();
      expect(el.querySelector('[data-testid="action-sheet"]')).toBeNull();
    });

    it('Delete removes that row only and it stays removed (FR-005)', () => {
      const el = render();
      const store = TestBed.inject(CallStore);
      const target = CALL_SEED[0];
      const before = store.calls().length;

      openSheetForFirstRow(el);
      clickRow(el, 'Delete');

      expect(store.calls().length).toBe(before - 1);
      expect(store.calls().some((call) => call.id === target.id)).toBe(false);
      expect(el.querySelectorAll('app-call-list-item').length).toBe(before - 1);
      expect(el.querySelector('[data-testid="action-sheet"]')).toBeNull();

      const reloaded = new CallStore();
      expect(reloaded.calls().some((call) => call.id === target.id)).toBe(false);
    });

    it('Voice call and Video call dismiss the sheet and change nothing (FR-006)', () => {
      const el = render();
      const store = TestBed.inject(CallStore);

      for (const label of ['Voice call', 'Video call']) {
        openSheetForFirstRow(el);
        clickRow(el, label);
        expect(el.querySelector('[data-testid="action-sheet"]')).toBeNull();
      }

      expect(store.calls().length).toBe(CALL_SEED.length);
      expect(el.querySelectorAll('app-call-list-item').length).toBe(CALL_SEED.length);
    });

    it('the backdrop and Escape both dismiss without side effects (FR-003)', () => {
      const store = TestBed.inject(CallStore);

      for (const close of [
        (el: HTMLElement) =>
          (el.querySelector('[data-testid="action-sheet-backdrop"]') as HTMLElement).click(),
        () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })),
      ]) {
        const el = render();
        openSheetForFirstRow(el);
        close(el);
        fixture.detectChanges();
        expect(el.querySelector('[data-testid="action-sheet"]')).toBeNull();
      }

      expect(store.calls().length).toBe(CALL_SEED.length);
    });

    it('the sheet cannot be opened while editing (FR-007)', () => {
      const el = render();
      const edit = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')].find(
        (b) => b.textContent?.trim() === 'Edit',
      );
      edit?.click();
      fixture.detectChanges();

      expect(el.querySelectorAll('[data-testid="call-info"]').length).toBe(0);
      expect(el.querySelector('[data-testid="action-sheet"]')).toBeNull();
    });

    it('new call opens the picker and does not open the sheet (FR-008, F-045)', () => {
      const router = TestBed.inject(Router);
      const navSpy = spyOn(router, 'navigate').and.resolveTo(true);
      const el = render();
      const newCall = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')].at(-1);

      newCall?.click();
      fixture.detectChanges();

      expect(navSpy).toHaveBeenCalledWith(['/calls/new']);
      expect(el.querySelector('[data-testid="action-sheet"]')).toBeNull();
    });

    // F-045: the sheet's Voice/Video rows stopped being inert (F-043 FR-008).
    it('the sheet Voice call row starts a real voice call (F-045 FR-004)', () => {
      const router = TestBed.inject(Router);
      const navSpy = spyOn(router, 'navigate').and.resolveTo(true);
      const el = render();
      openSheetForFirstRow(el);
      fixture.detectChanges();

      clickRow(el, 'Voice call');

      const session = TestBed.inject(CallStore).session();
      expect(session?.kind).toBe('voice');
      expect(session?.target.contactName).toBe(CALL_SEED[0]?.contactName);
      expect(navSpy).toHaveBeenCalledWith(['/calls/active'], { queryParams: { from: '/calls' } });
    });

    it('the sheet Video call row starts a real video call (F-045 FR-004)', () => {
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate').and.resolveTo(true);
      const el = render();
      openSheetForFirstRow(el);
      fixture.detectChanges();

      clickRow(el, 'Video call');

      expect(TestBed.inject(CallStore).session()?.kind).toBe('video');
    });

    it('the sheet closes after a call starts, rather than staying open (F-045 FR-004)', () => {
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate').and.resolveTo(true);
      const el = render();
      openSheetForFirstRow(el);
      fixture.detectChanges();

      clickRow(el, 'Voice call');

      expect(el.querySelector('[data-testid="action-sheet"]')).toBeNull();
    });

    it('the sheet Message row starts no call (F-045 FR-004)', () => {
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate').and.resolveTo(true);
      const el = render();
      openSheetForFirstRow(el);
      fixture.detectChanges();

      clickRow(el, 'Message');

      // F-043 already covers Message opening the chat. What F-045 must not break
      // is that messaging stays a chat action and does not start a call.
      expect(TestBed.inject(CallStore).session()).toBeNull();
    });

    // FR-012: a log row whose contact has no chat must still call. Bailing on the
    // chat lookup (as openChatFor does) would leave Voice/Video dead again.
    it('a sheet call row starts a call even when the contact has no chat (FR-012)', () => {
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate').and.resolveTo(true);
      const chatStore = TestBed.inject(ChatStore);
      const index = CALL_SEED.findIndex(
        (c) => chatStore.chatIdForContactName(c.contactName) === null,
      );
      expect(index).toBeGreaterThanOrEqual(0);
      const orphan = CALL_SEED[index];

      const el = render();
      const infoButtons = el.querySelectorAll<HTMLButtonElement>('[data-testid="call-info"]');
      infoButtons[index]?.click();
      fixture.detectChanges();
      clickRow(el, 'Voice call');

      const session = TestBed.inject(CallStore).session();
      expect(session?.target.contactName).toBe(orphan?.contactName);
      expect(session?.target.avatarRef).toBeNull();
      expect(session?.target.contactId).toBe('');
    });

    it('the sheet call rows are refused while a call is already live (F-045 FR-011)', () => {
      const router = TestBed.inject(Router);
      const navSpy = spyOn(router, 'navigate').and.resolveTo(true);
      const callStore = TestBed.inject(CallStore);
      callStore.startCall(
        { contactId: 'chat-001', contactName: 'Alex Morgan', avatarRef: null },
        'video',
        0,
      );
      const first = callStore.session();
      const el = render();
      openSheetForFirstRow(el);
      fixture.detectChanges();

      clickRow(el, 'Voice call');

      expect(callStore.session()).toBe(first);
      expect(callStore.session()?.kind).toBe('video');
      expect(navSpy).not.toHaveBeenCalled();
    });

    it('the list keeps 12 rows and no horizontal overflow at 320px (FR-011)', () => {
      const el = render();
      openSheetForFirstRow(el);
      const sheet = el.querySelector<HTMLElement>('[data-testid="action-sheet"]');

      expect(el.querySelectorAll('app-call-list-item').length).toBe(CALL_SEED.length);
      expect(sheet?.scrollWidth).toBeLessThanOrEqual(sheet?.clientWidth ?? 0);
    });
  });

  it('Clear persists: the log stays cleared after a reload (F-038)', () => {
    const el = render();
    const edit = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')].find(
      (b) => b.textContent?.trim() === 'Edit',
    );
    edit?.click();
    fixture.detectChanges();
    const clear = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')].find(
      (b) => b.textContent?.trim() === 'Clear',
    );
    clear?.click();
    fixture.detectChanges();
    expect(TestBed.inject(CallStore).calls()).toEqual([]);

    const reloaded = TestBed.inject(CallStore);
    expect(reloaded.calls()).toEqual([]);
  });

  it('an edit-mode removal persists (F-038)', () => {
    const el = render();
    const edit = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')].find(
      (b) => b.textContent?.trim() === 'Edit',
    );
    edit?.click();
    fixture.detectChanges();
    (el.querySelector('[data-testid="call-remove"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(TestBed.inject(CallStore).calls().length).toBe(CALL_SEED.length - 1);
  });

  it('tab selection is inert while editing', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    const edit = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')].find(
      (b) => b.textContent?.trim() === 'Edit',
    );
    edit?.click();
    fixture.detectChanges();
    const statusTab = [...el.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find((b) =>
      b.textContent?.trim()?.startsWith('Status'),
    );
    const chatsTab = [...el.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find((b) =>
      b.textContent?.trim()?.startsWith('Chats'),
    );
    statusTab?.click();
    chatsTab?.click();
    fixture.detectChanges();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(el.querySelector('[data-testid="call-list"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="tab-stub"]')).toBeNull();
  });
});