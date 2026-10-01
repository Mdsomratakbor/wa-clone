import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ComposePage } from './compose-page';
import { StatusStore } from '../../core/status.store';
import { Clock } from '../../core/clock';

describe('ComposePage', () => {
  let fixture: ComponentFixture<ComposePage>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ComposePage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(ComposePage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function type(el: HTMLElement, value: string): void {
    const input = el.querySelector<HTMLInputElement>('[data-testid="compose-input"]');
    input!.value = value;
    input!.dispatchEvent(new Event('input'));
  }

  it('renders the full-bleed compose surface with the three top glyphs', () => {
    const el = render();
    const surface = el.querySelector<HTMLElement>('[data-testid="compose-page"]');
    expect(surface).not.toBeNull();
    expect(getComputedStyle(surface!).backgroundColor).toBe('rgb(255, 138, 140)');
    expect(el.querySelector('[data-testid="compose-top"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="compose-close"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="compose-send-text"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="compose-send"]')).not.toBeNull();
  });

  // F-049: the decorative <p> and its fake caret are replaced by a real input,
  // so the placeholder is now an attribute and the caret is the input's own.
  it('renders a real input, not a decorative placeholder, plus the keyboard graphic (FR-001)', () => {
    const el = render();
    const input = el.querySelector<HTMLInputElement>('[data-testid="compose-input"]');

    expect(input).not.toBeNull();
    expect(input?.getAttribute('placeholder')).toBe('Type a status');
    expect(input?.getAttribute('aria-label')).toBe('Type a status');
    expect(el.querySelector('.compose__placeholder')).toBeNull();
    expect(el.querySelector('.compose__caret')).toBeNull();
    expect(el.querySelector('[data-testid="compose-type"]')?.getAttribute('aria-hidden')).toBeNull();

    const kb = el.querySelector<HTMLImageElement>('[data-testid="compose-keyboard"]');
    expect(kb?.src.endsWith('/status-compose-keyboard.png')).toBe(true);
  });

  it('renders no tab bar, navigation bar, FAB or title', () => {
    const el = render();
    expect(el.querySelector('app-navigation-bar')).toBeNull();
    expect(el.querySelector('[role="tab"]')).toBeNull();
    expect(el.querySelector('.fab')).toBeNull();
    expect(el.querySelector('.navigation-bar__title')).toBeNull();
  });

  it('navigates to /status when Close is activated', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    (el.querySelector('[data-testid="compose-close"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/status']);
  });

  // F-049: Send is disabled by a click listener-free attribute, so clicking it
  // does nothing at all - the browser suppresses the event.
  it('Send is genuinely disabled while the text is blank (FR-002)', () => {
    const el = render();
    const send = el.querySelector<HTMLButtonElement>('[data-testid="compose-send"]');

    expect(send?.disabled).toBe(true);

    type(el, '   ');
    fixture.detectChanges();
    expect(send?.disabled).toBe(true);
  });

  it('Send becomes enabled once text is typed (FR-002)', () => {
    const el = render();
    type(el, 'on the move');
    fixture.detectChanges();

    expect(el.querySelector<HTMLButtonElement>('[data-testid="compose-send"]')?.disabled).toBe(false);
  });

  it('Send publishes the trimmed text and navigates to the feed (FR-003)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();

    type(el, '  at the beach  ');
    fixture.detectChanges();
    (el.querySelector('[data-testid="compose-send"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(TestBed.inject(StatusStore).myStatus()?.text).toBe('at the beach');
    expect(router.navigate).toHaveBeenCalledWith(['/status']);
  });

  it('Send publishes nothing and navigates nowhere when the text is blank (FR-004)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();

    type(el, '  ');
    fixture.detectChanges();
    (el.querySelector<HTMLButtonElement>('[data-testid="compose-send"]') as HTMLButtonElement)
      .click();
    fixture.detectChanges();

    expect(TestBed.inject(StatusStore).myStatus()).toBeNull();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('Send uses the injected Clock, not the wall clock (FR-012)', () => {
    const el = render();
    spyOn(TestBed.inject(Clock), 'now').and.returnValue(1_700_000_000_000);

    type(el, 'timed');
    fixture.detectChanges();
    (el.querySelector('[data-testid="compose-send"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(TestBed.inject(StatusStore).myStatus()?.createdAtMs).toBe(1_700_000_000_000);
  });

  it('Send-alt is disabled with an accessible reason, and inert by mouse and keyboard (FR-008)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    const sendText = el.querySelector<HTMLButtonElement>('[data-testid="compose-send-text"]');

    expect(sendText?.disabled).toBe(true);

    const reasonId = sendText?.getAttribute('aria-describedby');
    expect(reasonId).toBe('compose-send-text-reason');
    expect(el.querySelector(`#${reasonId}`)?.textContent).toContain('not available');

    type(el, 'on the move');
    fixture.detectChanges();
    expect(sendText?.disabled).toBe(true);

    sendText?.click();
    sendText?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    sendText?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    fixture.detectChanges();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(TestBed.inject(StatusStore).myStatus()).toBeNull();
  });

  it('the keyboard graphic stays inert (FR-001)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    (el.querySelector('[data-testid="compose-keyboard"]') as HTMLElement).click();
    fixture.detectChanges();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});