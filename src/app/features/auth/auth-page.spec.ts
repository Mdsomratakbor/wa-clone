import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthPage } from './auth-page';

describe('AuthPage', () => {
  let fixture: ComponentFixture<AuthPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(AuthPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function press(el: HTMLElement, digit: string): void {
    const key = [...el.querySelectorAll<HTMLButtonElement>('[data-testid="auth-key"]')].find(
      (candidate) => candidate.getAttribute('aria-label') === digit,
    );
    key?.click();
    fixture.detectChanges();
  }

  function phoneText(el: HTMLElement): string {
    return el.querySelector('[data-testid="auth-phone"]')?.textContent?.trim() ?? '';
  }

  it('renders the brand title and number region', () => {
    const el = render();
    expect(el.querySelector('[data-testid="auth-title"]')?.textContent?.trim()).toBe('WhatsApp');
    expect(el.querySelector('[data-testid="auth-country"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="auth-phone"]')).not.toBeNull();
  });

  it('renders the 10 digit keys, a backspace key and Continue', () => {
    const el = render();
    const keys = el.querySelectorAll<HTMLButtonElement>('[data-testid="auth-key"]');
    expect(keys.length).toBe(10);
    expect(keys[0]?.getAttribute('aria-label')).toBe('1');
    expect(keys[9]?.getAttribute('aria-label')).toBe('0');
    expect(el.querySelector('[data-testid="auth-key-delete"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="auth-continue"]')?.textContent?.trim()).toBe(
      'Continue',
    );
  });

  it('does not render the tab bar or navigation bar (cold-start surface)', () => {
    const el = render();
    expect(el.querySelector('[role="tab"]')).toBeNull();
    expect(el.querySelector('[data-testid="navigation-bar"]')).toBeNull();
  });

  it('starts with an empty phone region, no error and the seeded copy (F-037)', () => {
    const el = render();
    expect(phoneText(el)).toBe('');
    expect(el.querySelector('[data-testid="auth-error"]')).toBeNull();
    expect(el.querySelector('[data-testid="auth-country"]')?.textContent?.trim()).toBe(
      'No country selected',
    );
    expect(el.querySelector('.auth__tagline')?.textContent?.trim()).toBe(
      'Enter your phone number to get started',
    );
  });

  it('appends digits in press order to the phone region (F-037)', () => {
    const el = render();
    press(el, '9');
    press(el, '4');
    press(el, '1');
    press(el, '5');
    expect(phoneText(el)).toBe('9415');
  });

  it('caps the number at 15 digits (F-037)', () => {
    const el = render();
    for (let i = 0; i < 20; i++) {
      press(el, '7');
    }
    expect(phoneText(el).length).toBe(15);
  });

  it('backspace removes the last digit and is a no-op when empty (F-037)', () => {
    const el = render();
    (el.querySelector('[data-testid="auth-key-delete"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(phoneText(el)).toBe('');

    press(el, '1');
    press(el, '2');
    (el.querySelector('[data-testid="auth-key-delete"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(phoneText(el)).toBe('1');
  });

  it('refuses a short number: no navigation, inline error shown (F-037)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();

    (el.querySelector('[data-testid="auth-continue"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(router.navigate).not.toHaveBeenCalled();
    const error = el.querySelector('[data-testid="auth-error"]');
    expect(error?.textContent?.trim()).toBe('Enter your phone number to continue.');
    expect(error?.getAttribute('role')).toBe('status');
  });

  it('clears the error as soon as the keypad is used again (F-037)', () => {
    const el = render();
    (el.querySelector('[data-testid="auth-continue"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="auth-error"]')).not.toBeNull();

    press(el, '5');
    expect(el.querySelector('[data-testid="auth-error"]')).toBeNull();
  });

  it('enters the app once 7 or more digits are entered (F-037)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();

    for (const digit of ['1', '2', '3', '4', '5']) {
      press(el, digit);
    }
    (el.querySelector('[data-testid="auth-continue"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(el.querySelector('[data-testid="auth-error"]')).not.toBeNull();

    press(el, '6');
    press(el, '7');
    (el.querySelector('[data-testid="auth-continue"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/chats']);
  });

  it('exposes the phone region as a live region', () => {
    const el = render();
    expect(
      el.querySelector('[data-testid="auth-phone"]')?.getAttribute('aria-live'),
    ).toBe('polite');
  });
});
