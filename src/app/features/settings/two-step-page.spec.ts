import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TwoStepPage } from './two-step-page';
import { AccountStore } from '../../core/account.store';

describe('TwoStepPage', () => {
  let fixture: ComponentFixture<TwoStepPage>;
  let store: AccountStore;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [TwoStepPage],
      providers: [provideRouter([])],
    }).compileComponents();
    store = TestBed.inject(AccountStore);
    store.reset();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(TwoStepPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function type(el: HTMLElement, testid: string, value: string): void {
    const input = el.querySelector<HTMLInputElement>(`[data-testid="${testid}"]`);
    input!.value = value;
    input!.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  it('renders the pushed header and the disabled state initially (FR-002)', () => {
    const el = render();
    const actions = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')];
    expect(actions.length).toBe(1);
    expect(actions[0]?.textContent?.trim()).toBe('Back');
    expect(el.querySelector('.navigation-bar__title')?.textContent?.trim()).toBe(
      'Two-step verification',
    );
    expect(el.querySelector('[data-testid="two-step-disabled"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="two-step-enabled"]')).toBeNull();
    expect(el.querySelector('[role="tab"]')).toBeNull();
  });

  it('keeps Set PIN disabled until a valid 6-digit PIN, a match and an @ email all hold (FR-006)', () => {
    const el = render();
    const setButton = el.querySelector<HTMLButtonElement>('[data-testid="two-step-set"]');

    expect(setButton?.disabled).toBe(true);

    type(el, 'two-step-pin', '123456');
    type(el, 'two-step-pin-confirm', '123456');
    type(el, 'two-step-email', 'no-at-sign');
    fixture.detectChanges();
    expect(setButton?.disabled).toBe(true);

    type(el, 'two-step-pin', '12345');
    type(el, 'two-step-email', 'a@b.co');
    fixture.detectChanges();
    expect(setButton?.disabled).toBe(true);

    type(el, 'two-step-pin', '123456');
    type(el, 'two-step-pin-confirm', '123457');
    fixture.detectChanges();
    expect(setButton?.disabled).toBe(true);
  });

  it('persists the PIN and email, announces and flips to the enabled state (FR-006)', () => {
    const el = render();
    type(el, 'two-step-pin', '123456');
    type(el, 'two-step-pin-confirm', '123456');
    type(el, 'two-step-email', 'a@b.co');
    fixture.detectChanges();

    (el.querySelector('[data-testid="two-step-set"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(store.account().twoStep).toEqual({ pin: '123456', email: 'a@b.co' });
    expect(el.querySelector('[data-testid="two-step-enabled"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="two-step-disabled"]')).toBeNull();
    expect(el.querySelector('[data-testid="two-step-status"]')?.textContent?.trim()).toBe(
      'Two-step verification is enabled',
    );
    expect(el.querySelector('[data-testid="two-step-email-line"]')?.textContent?.trim()).toBe(
      'Recovery email: a@b.co',
    );
  });

  it('renders the enabled state with the stored recovery email (FR-006)', () => {
    store.setTwoStep('123456', 'secure@example.com');
    const el = render();
    expect(el.querySelector('[data-testid="two-step-enabled"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="two-step-email-line"]')?.textContent?.trim()).toBe(
      'Recovery email: secure@example.com',
    );
  });

  it('Change PIN replaces the stored PIN and email (FR-006)', () => {
    store.setTwoStep('111111', 'old@example.com');
    const el = render();

    (el.querySelector('[data-testid="two-step-change"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    type(el, 'two-step-pin', '222222');
    type(el, 'two-step-pin-confirm', '222222');
    type(el, 'two-step-email', 'new@example.com');
    fixture.detectChanges();

    (el.querySelector('[data-testid="two-step-set"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(store.account().twoStep).toEqual({ pin: '222222', email: 'new@example.com' });
  });

  it('Remove with the wrong PIN is refused: announced and state untouched (FR-006)', () => {
    store.setTwoStep('123456', 'a@b.co');
    const el = render();

    (el.querySelector('[data-testid="two-step-remove"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    type(el, 'two-step-remove-pin', '999999');
    (el.querySelector('[data-testid="two-step-remove-confirm"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(store.account().twoStep).toEqual({ pin: '123456', email: 'a@b.co' });
    expect(el.querySelector('[data-testid="two-step-status"]')?.textContent?.trim()).toBe(
      'Incorrect PIN. Two-step verification was not removed.',
    );
  });

  it('Remove with the correct PIN clears two-step and returns to the disabled state (FR-006)', () => {
    store.setTwoStep('123456', 'a@b.co');
    const el = render();

    (el.querySelector('[data-testid="two-step-remove"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    type(el, 'two-step-remove-pin', '123456');
    (el.querySelector('[data-testid="two-step-remove-confirm"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(store.account().twoStep).toBeNull();
    expect(el.querySelector('[data-testid="two-step-disabled"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="two-step-status"]')?.textContent?.trim()).toBe(
      'Two-step verification is disabled',
    );
  });

  it('navigates back to /settings/account (FR-002)', () => {
    const router = TestBed.inject(Router);
    const spy = spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    (el.querySelector('.navigation-bar__action') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(['/settings/account']);
  });
});