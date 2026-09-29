import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CallPickerPage } from './call-picker-page';
import { CallStore } from '../../core/call.store';
import { Clock } from '../../core/clock';
import { ChatStore } from '../../core/chat.store';

describe('CallPickerPage (feature 045)', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [CallPickerPage],
      providers: [
        provideRouter([
          { path: 'calls/new', component: CallPickerPage },
          { path: 'calls', component: CallPickerPage },
          { path: 'calls/active', component: CallPickerPage },
        ]),
      ],
    }).compileComponents();
    TestBed.inject(ChatStore).reset();
    // CallStore has no reset(); the live session is not persisted, so clearing it
    // plus the storage key in this beforeEach is the full isolation it needs.
    TestBed.inject(CallStore).clearSession();
  });

  interface Harness {
    el: HTMLElement;
    router: Router;
    store: CallStore;
    chatStore: ChatStore;
    clock: Clock;
    fixture: ComponentFixture<unknown>;
  }

  async function render(): Promise<Harness> {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/calls/new', CallPickerPage);
    return {
      el: harness.fixture.nativeElement as HTMLElement,
      router: TestBed.inject(Router),
      store: TestBed.inject(CallStore),
      chatStore: TestBed.inject(ChatStore),
      clock: TestBed.inject(Clock),
      fixture: harness.fixture,
    };
  }

  function rows(el: HTMLElement): HTMLElement[] {
    return [...el.querySelectorAll<HTMLElement>('[data-testid="call-picker-row"]')];
  }

  function rowNamed(el: HTMLElement, name: string): HTMLElement {
    const row = rows(el).find((r) => r.textContent?.includes(name));
    if (!row) {
      throw new Error(`no row named ${name}`);
    }
    return row;
  }

  function typeSearch(h: Harness, value: string): void {
    const input = h.el.querySelector<HTMLInputElement>(
      '[data-testid="call-picker-search"]',
    ) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    h.fixture.detectChanges();
  }

  it('lists every contact (FR-015)', async () => {
    const h = await render();

    const all = h.chatStore.contactConversations();
    expect(rows(h.el).length).toBe(all.length);
    expect(all.length).toBeGreaterThan(0);
  });

  it('filters by contact name (FR-015)', async () => {
    const h = await render();
    typeSearch(h, 'martha');

    expect(rows(h.el).length).toBe(1);
    expect(rows(h.el)[0]?.textContent).toContain('Martha Craig');
  });

  it('filtering is case-insensitive (FR-015)', async () => {
    const h = await render();
    typeSearch(h, 'MARTHA');

    expect(rows(h.el).length).toBe(1);
  });

  it('a search with no match shows No results, not an empty box (FR-016)', async () => {
    const h = await render();
    typeSearch(h, 'zzzz-no-such-contact');

    expect(rows(h.el).length).toBe(0);
    expect(h.el.querySelector('[data-testid="call-picker-empty"]')?.textContent?.trim()).toBe(
      'No results',
    );
  });

  it('clearing the search restores the full list (FR-016)', async () => {
    const h = await render();
    typeSearch(h, 'martha');
    expect(rows(h.el).length).toBe(1);

    h.el.querySelector<HTMLButtonElement>('[data-testid="call-picker-search-clear"]')?.click();
    h.fixture.detectChanges();

    expect(rows(h.el).length).toBe(h.chatStore.contactConversations().length);
  });

  it('an empty search does not render the clear button (FR-016)', async () => {
    const h = await render();

    expect(h.el.querySelector('[data-testid="call-picker-search-clear"]')).toBeNull();
  });

  it('selecting a contact starts a real voice call and opens the in-call screen (FR-003)', async () => {
    const h = await render();
    rowNamed(h.el, 'Martha Craig').click();
    await h.fixture.whenStable();

    const session = h.store.session();
    expect(session).not.toBeNull();
    expect(session?.kind).toBe('voice');
    expect(session?.target.contactName).toBe('Martha Craig');
    expect(session?.state).toBe('dialing');
    expect(h.router.url).toBe('/calls/active?from=%2Fcalls');
  });

  it('the started session is created from the injected clock (FR-010)', async () => {
    const h = await render();
    const before = h.clock.now();

    rowNamed(h.el, 'Martha Craig').click();
    await h.fixture.whenStable();

    const session = h.store.session();
    expect(session?.startedAtMs).toBeGreaterThanOrEqual(before);
  });

  it('a row is reachable by keyboard, not click only (FR-013)', async () => {
    const h = await render();
    const row = rowNamed(h.el, 'Martha Craig');

    expect(row.getAttribute('role')).toBe('button');
    expect(row.getAttribute('tabindex')).toBe('0');
    expect(row.getAttribute('aria-label')).toBe('Call Martha Craig');
  });

  it('a row starts the call on Enter (FR-013, FR-003)', async () => {
    const h = await render();
    rowNamed(h.el, 'Martha Craig').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await h.fixture.whenStable();

    expect(h.store.session()?.target.contactName).toBe('Martha Craig');
  });

  it('selecting while a call is active neither replaces it nor navigates (FR-011)', async () => {
    const h = await render();
    h.store.startCall(
      { contactId: 'chat-001', contactName: 'Alex Morgan', avatarRef: null },
      'voice',
      0,
    );
    const first = h.store.session();

    rowNamed(h.el, 'Martha Craig').click();
    await h.fixture.whenStable();

    expect(h.store.session()).toBe(first);
    expect(h.store.session()?.target.contactName).toBe('Alex Morgan');
    expect(h.router.url).toBe('/calls/new');
  });

  it('Back returns to the Calls list (FR-015)', async () => {
    const h = await render();
    h.el.querySelector<HTMLButtonElement>('.navigation-bar__action')?.click();
    await h.fixture.whenStable();

    expect(h.router.url).toBe('/calls');
  });
});
