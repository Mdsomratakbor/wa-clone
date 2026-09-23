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

  it('edit and new-call are no-ops: list untouched, no navigation', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    const actionIndex = Object.fromEntries(
      [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')].map((b, i) => [
        b.textContent?.trim() || b.getAttribute('aria-label'),
        i,
      ]),
    );
    const actions = [
      ...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action'),
    ];
    actions[(actionIndex['Edit'] as number) ?? 0].click();
    actions[(actionIndex['New call'] as number) ?? actions.length - 1].click();
    fixture.detectChanges();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(el.querySelectorAll('app-call-list-item').length).toBe(CALL_SEED.length);
  });
});