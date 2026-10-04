import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AccountPage } from './account-page';
import { ACCOUNT_ROWS } from './settings.seed';

describe('AccountPage', () => {
  let fixture: ComponentFixture<AccountPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(AccountPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the header: Back leading, Account title', () => {
    const el = render();
    const actions = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')];
    expect(actions.length).toBe(1);
    expect(actions[0]?.textContent?.trim()).toBe('Back');
    expect(el.querySelector('.navigation-bar__title')?.textContent?.trim()).toBe('Account');
  });

  it('renders the hero block', () => {
    const el = render();
    expect(el.querySelector('[data-testid="account-hero"]')).not.toBeNull();
  });

  it('renders one row per seeded account setting', () => {
    const el = render();
    const rows = el.querySelectorAll<HTMLButtonElement>('[data-testid="account-row"]');
    expect(rows.length).toBe(ACCOUNT_ROWS.length);
    expect(rows[0]?.getAttribute('aria-label')).toBe('Security');
  });

  // F-054 FR-001/FR-003: every Account row shows its description under the label.
  it('F-054: every Account row shows its description under the label', () => {
    const el = render();
    const rows = el.querySelectorAll<HTMLButtonElement>('[data-testid="account-row"]');
    rows.forEach((row, i) => {
      const seed = ACCOUNT_ROWS[i];
      expect(row.querySelector('.account__row-label')?.textContent?.trim()).toBe(seed.label);
      expect(row.querySelector('.account__row-description')?.textContent?.trim()).toBe(
        seed.description,
      );
      expect(row.getAttribute('aria-label')).toBe(seed.label);
      const desc = row.querySelector<HTMLElement>('.account__row-description');
      expect(desc).not.toBeNull();
      if (!desc) return;
      expect(getComputedStyle(desc).fontSize).toBe('13px');
      expect(getComputedStyle(desc).color).toBe('rgb(142, 142, 147)');
    });
  });

  it('does not render the tab bar (pushed surface)', () => {
    const el = render();
    expect(el.querySelector('[role="tab"]')).toBeNull();
  });

  it('navigates to /settings when Back is activated', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    (el.querySelector('.navigation-bar__action') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/settings']);
  });

  // F-057 FR-001..FR-004: the F-046 deferral is resolved - every Account row now
  // navigates to its screen. This replaces the old "still inert" assertion, whose
  // name described the defect this feature removes.
  it('navigates to each sub-screen when its row is activated (F-057)', () => {
    const router = TestBed.inject(Router);
    const spy = spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    const rows = el.querySelectorAll<HTMLButtonElement>('[data-testid="account-row"]');

    const expected: Record<string, string> = {
      Security: '/settings/account/security',
      'Two-step verification': '/settings/account/two-step',
      'Change number': '/settings/account/change-number',
      'Delete my account': '/settings/account/delete',
    };

    rows.forEach((row) => {
      const label = row.getAttribute('aria-label') ?? '';
      row.click();
      fixture.detectChanges();
      expect(spy.calls.mostRecent().args[0]).toEqual([expected[label]]);
    });
  });
});