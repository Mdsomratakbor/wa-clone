import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { SecurityPage } from './security-page';
import { AccountStore } from '../../core/account.store';

describe('SecurityPage', () => {
  let fixture: ComponentFixture<SecurityPage>;
  let store: AccountStore;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SecurityPage],
      providers: [provideRouter([])],
    }).compileComponents();
    store = TestBed.inject(AccountStore);
    store.reset();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(SecurityPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the pushed header: Back leading, Security title', () => {
    const el = render();
    const actions = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')];
    expect(actions.length).toBe(1);
    expect(actions[0]?.textContent?.trim()).toBe('Back');
    expect(el.querySelector('.navigation-bar__title')?.textContent?.trim()).toBe('Security');
  });

  it('does not render the tab bar (pushed surface)', () => {
    const el = render();
    expect(el.querySelector('[role="tab"]')).toBeNull();
  });

  it('shows Show security notifications as an honestly-disabled toggle (F-057 FR-005)', () => {
    const el = render();
    const toggle = el.querySelector<HTMLElement>('[data-testid="security-notifications"]');
    expect(toggle).not.toBeNull();
    const switchControl = toggle?.querySelector<HTMLButtonElement>('[role="switch"]');
    expect(switchControl?.disabled).toBe(true);
    expect(switchControl?.getAttribute('aria-label')).toBe('Show security notifications');
    expect(toggle?.getAttribute('aria-label')).toBe('Show security notifications');
  });

  it('the Two-step verification row shows the default description while disabled', () => {
    const el = render();
    const status = el.querySelector('[data-testid="security-two-step-status"]');
    expect(status?.textContent?.trim()).toBe(
      'Additional PIN you can create to further protect your account',
    );
  });

  it('the Two-step verification row reflects the enabled state honestly', () => {
    store.setTwoStep('123456', 'a@b.co');
    const el = render();
    const status = el.querySelector('[data-testid="security-two-step-status"]');
    expect(status?.textContent?.trim()).toBe('Enabled');
  });

  it('navigates to the two-step screen when its row is activated (FR-001)', () => {
    const router = TestBed.inject(Router);
    const spy = spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    (el.querySelector('[data-testid="security-two-step"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(['/settings/account/two-step']);
  });

  it('navigates back to /settings/account (FR-001)', () => {
    const router = TestBed.inject(Router);
    const spy = spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    (el.querySelector('.navigation-bar__action') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(['/settings/account']);
  });
});