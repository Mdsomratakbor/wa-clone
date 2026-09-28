import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MediaPage } from './media-page';
import { ChatStore } from '../../core/chat.store';
import { CHAT_SEED } from '../chat-list/chat-list.seed';
import { CHAT_SEED as THREAD_SEED } from '../chat-window/chat-window.seed';
import { THREADED_CONTACT_ID } from '../../core/chat.store';

describe('MediaPage', () => {
  let fixture: ComponentFixture<MediaPage>;
  let navSpy: jasmine.Spy;

  const expectedFileCount = THREAD_SEED.filter((m) => m.file !== null).length;

  beforeEach(() => {
    localStorage.clear();
    navSpy = jasmine.createSpy('navigate');
  });

  async function configure(chatId: string): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [MediaPage],
      providers: [
        { provide: Router, useValue: { navigate: navSpy } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convert(chatId) } } },
      ],
    }).compileComponents();
  }

  function convert(value: string) {
    return { get: (key: string) => (key === 'id' ? value : null) };
  }

  async function render(chatId: string): Promise<HTMLElement> {
    await configure(chatId);
    fixture = TestBed.createComponent(MediaPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function tileNames(el: HTMLElement): string[] {
    return [...el.querySelectorAll<HTMLElement>('.media__name')].map(
      (node) => node.textContent?.trim() ?? '',
    );
  }

  it('the nav title is the contact name (FR-008)', async () => {
    const el = await render(THREADED_CONTACT_ID);
    const name = CHAT_SEED.find((chat) => chat.id === THREADED_CONTACT_ID)?.contactName;

    expect(name).toBeDefined();
    expect(el.querySelector('.navigation-bar__title')?.textContent?.trim()).toBe(name);
  });

  it('the title follows a rename, because it reads live from the store (FR-008)', async () => {
    const el = await render(THREADED_CONTACT_ID);
    TestBed.inject(ChatStore).updateContact(THREADED_CONTACT_ID, 'Renamed Person');
    fixture.detectChanges();

    expect(el.querySelector('.navigation-bar__title')?.textContent?.trim()).toBe('Renamed Person');
  });

  it('renders one tile per file message, newest first (FR-002, FR-003)', async () => {
    const el = await render(THREADED_CONTACT_ID);
    const tiles = el.querySelectorAll('[data-testid="media-tile"]');
    const files = THREAD_SEED.filter((m) => m.file !== null);

    expect(expectedFileCount).toBe(4);
    expect(tiles.length).toBe(expectedFileCount);
    expect(el.querySelector('[data-testid="media-grid"]')).not.toBeNull();
    expect(tileNames(el)).toEqual(
      files
        .map((m) => `${m.file?.filename}.${m.file?.ext}`)
        .reverse(),
    );
  });

  it('a tile is labelled with its filename and size (FR-003)', async () => {
    const el = await render(THREADED_CONTACT_ID);
    const first = el.querySelector('[data-testid="media-tile"]');
    const newest = [...THREAD_SEED]
      .filter((m) => m.file !== null)
      .at(-1);

    expect(first?.getAttribute('aria-label')).toBe(
      `${newest?.file?.filename}.${newest?.file?.ext}, ${newest?.file?.size}`,
    );
  });

  it('excludes messages with no file (FR-002)', async () => {
    const el = await render(THREADED_CONTACT_ID);
    const names = tileNames(el).join(' ');

    expect(names).not.toContain('.pdf');
    expect(el.querySelectorAll('[data-testid="media-tile"]').length).toBeLessThan(
      THREAD_SEED.length,
    );
  });

  it('shows the empty state for a contact with no thread (FR-004)', async () => {
    const el = await render('chat-001');
    const empty = el.querySelector('[data-testid="media-empty"]');

    expect(empty).not.toBeNull();
    expect(empty?.getAttribute('role')).toBe('status');
    expect(empty?.textContent).toContain('No media');
    expect(el.querySelector('[data-testid="media-grid"]')).toBeNull();
  });

  it('shows the empty state for an unknown contact id rather than throwing (FR-011)', async () => {
    const el = await render('chat-does-not-exist');
    expect(el.querySelector('[data-testid="media-empty"]')).not.toBeNull();
    expect(el.querySelectorAll('[data-testid="media-tile"]').length).toBe(0);
  });

  it('Back returns to the contact (FR-007)', async () => {
    const el = await render(THREADED_CONTACT_ID);
    (el.querySelector('.navigation-bar__action') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(navSpy).toHaveBeenCalledWith(['/contact', THREADED_CONTACT_ID]);
  });

  it('a tile is keyboard reachable (FR-006)', async () => {
    const el = await render(THREADED_CONTACT_ID);
    const first = el.querySelector('[data-testid="media-tile"]');

    expect(first?.getAttribute('role')).toBe('button');
    expect(first?.getAttribute('tabindex')).toBe('0');
  });

  it('activating a tile does not navigate, by mouse or keyboard (FR-006)', async () => {
    const el = await render(THREADED_CONTACT_ID);
    const first = el.querySelector<HTMLElement>('[data-testid="media-tile"]');

    first?.click();
    first?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    first?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    fixture.detectChanges();

    expect(navSpy).not.toHaveBeenCalled();
    expect(el.querySelector('[data-testid="media-grid"]')).not.toBeNull();
  });

  it('the thread is not reordered in the store (FR-005)', async () => {
    await render(THREADED_CONTACT_ID);
    const store = TestBed.inject(ChatStore);
    const order = store
      .conversationMessages(THREADED_CONTACT_ID)
      .map((m) => m.id)
      .slice(0, 3);

    expect(order).toEqual(THREAD_SEED.map((m) => m.id).slice(0, 3));
  });

  it('the grid is three columns and does not overflow (FR-010)', async () => {
    const el = await render(THREADED_CONTACT_ID);
    const grid = el.querySelector<HTMLElement>('[data-testid="media-grid"]');

    expect(getComputedStyle(grid as Element).gridTemplateColumns.split(' ').length).toBe(3);
    expect(grid?.scrollWidth).toBeLessThanOrEqual(grid?.clientWidth ?? 0);
  });
});
