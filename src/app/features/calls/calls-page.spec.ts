import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CallsPage } from './calls-page';
import { CALL_SEED } from './calls.seed';

describe('CallsPage', () => {
  let fixture: ComponentFixture<CallsPage>;

  beforeEach(async () => {
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

  it('show the stub when a non-chats, non-calls tab is selected', () => {
    const el = render();
    const statusTab = [...el.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find((b) =>
      b.textContent?.trim()?.startsWith('Status'),
    );
    statusTab?.click();
    fixture.detectChanges();
    const stub = el.querySelector('[data-testid="tab-stub"]');
    expect(stub).not.toBeNull();
    expect(stub?.textContent).toContain('Status');
    expect(el.querySelector('[data-testid="call-list"]')).toBeNull();
  });

  it('new-call is a no-op: list untouched, no navigation', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    const newCall = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')].find(
      (b) => b.getAttribute('aria-label') === 'New call',
    );
    newCall?.click();
    fixture.detectChanges();
    expect(router.navigate).not.toHaveBeenCalled();
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
    const el = render();
    const edit = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')].find(
      (b) => b.textContent?.trim() === 'Edit',
    );
    edit?.click();
    fixture.detectChanges();
    const row = el.querySelector('.call-list-item') as HTMLElement;
    row?.click();
    fixture.detectChanges();
    expect(el.querySelectorAll('app-call-list-item').length).toBe(CALL_SEED.length);
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