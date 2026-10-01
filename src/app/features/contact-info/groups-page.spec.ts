import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsPage } from './groups-page';
import { ChatStore } from '../../core/chat.store';
import { PrefsStore } from '../../core/prefs.store';
import { CHAT_SEED } from '../chat-list/chat-list.seed';

// participantIds are conversation ids, so they are taken from the seed rather
// than from contactConversations(), which sorts alphabetically by name and so
// does not start at chat-001.
const CONTACT_ID = CHAT_SEED[0].id;
const OTHER_ID = CHAT_SEED[1].id;

describe('GroupsPage', () => {
  let fixture: ComponentFixture<GroupsPage>;
  let navSpy: jasmine.Spy;

  beforeEach(() => {
    localStorage.clear();
    navSpy = jasmine.createSpy('navigate');
  });

  function convert(value: string) {
    return { get: (key: string) => (key === 'id' ? value : null) };
  }

  // The seed runs after configureTestingModule: injecting the store first would
  // instantiate the module and make the later configuration throw.
  async function render(
    chatId: string,
    seed?: (store: ChatStore) => void,
  ): Promise<HTMLElement> {
    await TestBed.configureTestingModule({
      imports: [GroupsPage],
      providers: [
        { provide: Router, useValue: { navigate: navSpy } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convert(chatId) } } },
      ],
    }).compileComponents();

    const store = TestBed.inject(ChatStore);
    if (seed) {
      seed(store);
    }

    fixture = TestBed.createComponent(GroupsPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function rowNames(el: HTMLElement): string[] {
    return [...el.querySelectorAll<HTMLElement>('.chat-list-item__name')].map(
      (node) => node.textContent?.trim() ?? '',
    );
  }

  it('lists one row per shared group, named by the group (FR-005)', async () => {
    const el = await render(CONTACT_ID, (store) => {
      store.createGroup('Weekend plans', [CONTACT_ID]);
      store.createGroup('Others only', [OTHER_ID]);
    });

    expect(el.querySelectorAll('[data-testid="groups-list"] .chat-list-item').length).toBe(1);
    expect(rowNames(el)).toEqual(['Weekend plans']);
    expect(el.querySelector('[data-testid="groups-empty"]')).toBeNull();
  });

  it('shows the empty state in a live region for a contact in no group (FR-006)', async () => {
    const el = await render(CONTACT_ID);
    const empty = el.querySelector('[data-testid="groups-empty"]');

    expect(empty).not.toBeNull();
    expect(empty?.getAttribute('role')).toBe('status');
    expect(empty?.textContent).toContain('No groups');
    expect(el.querySelector('[data-testid="groups-list"]')).toBeNull();
  });

  it('the nav title is Groups (FR-009)', async () => {
    const el = await render(CONTACT_ID);
    expect(el.querySelector('.navigation-bar__title')?.textContent?.trim()).toBe('Groups');
  });

  it('Back returns to the contact (FR-008)', async () => {
    const el = await render(CONTACT_ID);
    (el.querySelector('.navigation-bar__action') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(navSpy).toHaveBeenCalledWith(['/contact', 'chat-001']);
  });

  it('activating a row opens the group chat (FR-007)', async () => {
    let groupId = '';
    const el = await render(CONTACT_ID, (store) => {
      groupId = store.createGroup('Weekend plans', [CONTACT_ID]);
    });

    const row = el.querySelector<HTMLElement>('[data-testid="groups-list"] .chat-list-item');
    row?.click();
    fixture.detectChanges();

    expect(groupId).toMatch(/^group-\d+$/);
    expect(navSpy).toHaveBeenCalledWith(['/chat', groupId]);
  });

  it('a row is keyboard reachable and labelled with the group name (FR-009)', async () => {
    const el = await render(CONTACT_ID, (store) => {
      store.createGroup('Weekend plans', [CONTACT_ID]);
    });
    const row = el.querySelector('[data-testid="groups-list"] .chat-list-item');

    expect(row?.getAttribute('role')).toBe('button');
    expect(row?.getAttribute('tabindex')).toBe('0');
    expect(row?.getAttribute('aria-label')).toBe('Weekend plans');
  });

  it('a row can be opened by keyboard, not only by mouse (FR-007, FR-009)', async () => {
    let groupId = '';
    const el = await render(CONTACT_ID, (store) => {
      groupId = store.createGroup('Weekend plans', [CONTACT_ID]);
    });

    const row = el.querySelector<HTMLElement>('[data-testid="groups-list"] .chat-list-item');
    row?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();

    expect(navSpy).toHaveBeenCalledWith(['/chat', groupId]);
  });

  it('shows the empty state for an unknown contact id rather than throwing (FR-010)', async () => {
    const el = await render('chat-does-not-exist');
    expect(el.querySelector('[data-testid="groups-empty"]')).not.toBeNull();
    expect(el.querySelectorAll('[data-testid="groups-list"] .chat-list-item').length).toBe(0);
  });

  it('does not overflow horizontally (FR-011)', async () => {
    const el = await render(CONTACT_ID, (store) => {
      store.createGroup('A very long group name that must not widen the row', [
        CONTACT_ID,
      ]);
    });
    const main = el.querySelector<HTMLElement>('[data-testid="groups-page"]');

    expect(rowNames(el).length).toBe(1);
    expect(main?.scrollWidth).toBeLessThanOrEqual(main?.clientWidth ?? 0);
  });

  it('the row preview is gated by showPreviews, inherited from chat-list-item (FR-005)', async () => {
    let groupId = '';
    const el = await render(CONTACT_ID, (store) => {
      groupId = store.createGroup('Weekend plans', [CONTACT_ID]);
      store.sendMessage(groupId, 'see you there');
    });
    const prefs = TestBed.inject(PrefsStore);
    const preview = () =>
      el.querySelector(`[data-testid="preview-text-${groupId}"]`)?.textContent?.trim();

    expect(preview()).toBe('see you there');

    prefs.set('showPreviews', false);
    fixture.detectChanges();
    expect(preview()).toBe('');

    prefs.set('showPreviews', true);
    fixture.detectChanges();
    expect(preview()).toBe('see you there');
  });

  it('the font scale is applied to the page, as every chat-list-item host does (F-041)', async () => {
    const el = await render(CONTACT_ID);
    const main = el.querySelector('[data-testid="groups-page"]');
    expect(main?.getAttribute('data-font-scale')).toBe('default');
  });
});
