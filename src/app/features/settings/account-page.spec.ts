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

  // F-046: recorded deferral, not a decision. The Account rows still swallow
  // activation; `disposition.md` names the Account & privacy screens as the
  // destination. The assertion is unchanged, the name is not: "is a no-op"
  // read like the intended behaviour of a finished screen.
  it('Account rows are still inert: deferred to the Account & privacy feature (F-046 G4)', () => {
    const el = render();
    const rows = el.querySelectorAll<HTMLButtonElement>('[data-testid="account-row"]');
    expect(rows.length).toBeGreaterThan(0);
    rows[0]?.click();
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="account-page"]')).not.toBeNull();
  });
});