import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ChangeNumberPage } from './change-number-page';
import { AccountStore } from '../../core/account.store';

describe('ChangeNumberPage', () => {
  let fixture: ComponentFixture<ChangeNumberPage>;
  let store: AccountStore;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ChangeNumberPage],
      providers: [provideRouter([])],
    }).compileComponents();
    store = TestBed.inject(AccountStore);
    store.reset();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(ChangeNumberPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function type(el: HTMLElement, testid: string, value: string): void {
    const input = el.querySelector<HTMLInputElement>(`[data-testid="${testid}"]`);
    input!.value = value;
    input!.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  it('renders the pushed header and prefills the stored current number (FR-003)', () => {
    store.setDeviceNumber('+1 555-0100');
    const el = render();
    const actions = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')];
    expect(actions.length).toBe(1);
    expect(actions[0]?.textContent?.trim()).toBe('Back');
    expect(el.querySelector('.navigation-bar__title')?.textContent?.trim()).toBe('Change number');
    expect(el.querySelector<HTMLInputElement>('[data-testid="change-number-current"]')?.value).toBe(
      '+1 555-0100',
    );
    expect(el.querySelector('[role="tab"]')).toBeNull();
  });

  it('keeps the submit disabled until both numbers are valid and different (FR-007)', () => {
    const el = render();
    const submit = el.querySelector<HTMLButtonElement>('[data-testid="change-number-submit"]');

    type(el, 'change-number-new', '+1 555-0100');
    expect(submit?.disabled).toBe(true);

    type(el, 'change-number-current', '+1 555-0100');
    type(el, 'change-number-new', '+1 555-0100');
    expect(submit?.disabled).toBe(true);

    type(el, 'change-number-current', '+1 555-0100');
    type(el, 'change-number-new', 'abc');
    expect(submit?.disabled).toBe(true);
  });

  it('persists the new number, announces and clears the form (FR-007)', () => {
    const el = render();
    type(el, 'change-number-current', '+1 555-0100');
    type(el, 'change-number-new', '+44 20 7946 0958');
    const submit = el.querySelector<HTMLButtonElement>('[data-testid="change-number-submit"]');
    expect(submit?.disabled).toBe(false);

    submit?.click();
    fixture.detectChanges();

    expect(store.account().deviceNumber).toBe('+44 20 7946 0958');
    expect(el.querySelector('[data-testid="change-number-status"]')?.textContent?.trim()).toBe(
      'Your number has been changed',
    );
    expect(el.querySelector<HTMLInputElement>('[data-testid="change-number-current"]')?.value).toBe(
      '+44 20 7946 0958',
    );
    expect(el.querySelector<HTMLInputElement>('[data-testid="change-number-new"]')?.value).toBe('');
  });

  it('navigates back to /settings/account (FR-003)', () => {
    const router = TestBed.inject(Router);
    const spy = spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    (el.querySelector('.navigation-bar__action') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(['/settings/account']);
  });
});