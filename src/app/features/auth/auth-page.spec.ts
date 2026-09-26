import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthPage } from './auth-page';

describe('AuthPage', () => {
  let fixture: ComponentFixture<AuthPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthPage],
    }).compileComponents();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(AuthPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
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

  it('keypad keys, delete and Continue are no-ops', () => {
    const el = render();
    fixture.detectChanges();
    el.querySelectorAll<HTMLButtonElement>('[data-testid="auth-key"]')[0]?.click();
    (el.querySelector('[data-testid="auth-key-delete"]') as HTMLButtonElement).click();
    (el.querySelector('[data-testid="auth-continue"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="auth-page"]')).not.toBeNull();
  });
});