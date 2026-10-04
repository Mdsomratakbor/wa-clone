import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { KeyboardPage } from './keyboard-page';
import { PrefsStore } from '../../core/prefs.store';

describe('KeyboardPage', () => {
  let fixture: ComponentFixture<KeyboardPage>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [KeyboardPage],
      providers: [provideRouter([])],
    }).compileComponents();
    TestBed.inject(PrefsStore).reset();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(KeyboardPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the header: Back leading, Keyboard title', () => {
    const el = render();
    const actions = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')];
    expect(actions.length).toBe(1);
    expect(actions[0]?.textContent?.trim()).toBe('Back');
    expect(el.querySelector('.navigation-bar__title')?.textContent?.trim()).toBe('Keyboard');
  });

  it('does not render the tab bar (pushed surface)', () => {
    const el = render();
    expect(el.querySelector('[role="tab"]')).toBeNull();
  });

  it('hosts one switch bound to the stored Enter key sends pref (F-059 FR-007)', () => {
    const el = render();
    const row = el.querySelector('[data-testid="keyboard-enter-sends"]');
    const sw = row?.querySelector<HTMLButtonElement>('button[role="switch"]');
    expect(sw).not.toBeNull();
    expect(sw?.getAttribute('aria-label')).toBe('Enter key sends');
    expect(sw?.getAttribute('aria-checked')).toBe('true');
    expect(sw?.disabled).toBe(false);
    expect(el.querySelectorAll('button[role="switch"]').length).toBe(1);
  });

  it('reflects a persisted off state on render (F-059 FR-007)', () => {
    TestBed.inject(PrefsStore).set('enterKeySends', false);
    const el = render();
    const sw = el.querySelector<HTMLButtonElement>('button[role="switch"]');
    expect(sw?.getAttribute('aria-checked')).toBe('false');
  });

  it('toggling the switch persists the pref (F-059 FR-011)', () => {
    const el = render();
    const sw = el.querySelector<HTMLButtonElement>('button[role="switch"]');
    sw?.click();
    fixture.detectChanges();
    expect(TestBed.inject(PrefsStore).prefs().enterKeySends).toBe(false);
    expect(localStorage.getItem('wa.prefs.v1')).toContain('false');
  });

  it('shows the F-054 description under the label', () => {
    const el = render();
    const row = el.querySelector('[data-testid="keyboard-enter-sends"]');
    expect(
      row?.querySelector('.keyboard__row-description')?.textContent?.trim(),
    ).toBe('Assigns the Enter key to send messages');
  });

  it('navigates to /settings/chats when Back is activated (F-059 FR-006)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    (el.querySelector('.navigation-bar__action') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/settings/chats']);
  });
});