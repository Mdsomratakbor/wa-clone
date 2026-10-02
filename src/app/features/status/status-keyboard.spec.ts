import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusKeyboard } from './status-keyboard';

describe('StatusKeyboard', () => {
  let fixture: ComponentFixture<StatusKeyboard>;
  let emitted: { type: string; backspace: number; send: number };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StatusKeyboard] }).compileComponents();
  });

  function render(value = ''): void {
    emitted = { type: '', backspace: 0, send: 0 };
    fixture = TestBed.createComponent(StatusKeyboard);
    fixture.componentRef.setInput('value', value);
    // `type`/`backspace`/`send` are `output()`s, so they are subscribed to rather
    // than set as inputs.
    fixture.componentInstance.type.subscribe((c) => (emitted.type += c));
    fixture.componentInstance.backspace.subscribe(() => emitted.backspace++);
    fixture.componentInstance.send.subscribe(() => emitted.send++);
    fixture.detectChanges();
  }

  function key(testid: string): HTMLButtonElement {
    return (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      `[data-testid="${testid}"]`,
    )!;
  }

  it('renders the 26 letters, shift, backspace, space and send as labelled buttons (FR-008)', () => {
    render();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('[data-testid="compose-keyboard"]')).not.toBeNull();
    const letters = [...'qwertyuiopasdfghjklzxcvbnm'];
    for (const letter of letters) {
      const button = key(`compose-key-${letter}`);
      expect(button.getAttribute('type')).toBe('button');
      expect(button.getAttribute('aria-label')).toBe(letter);
    }
    expect(key('compose-key-shift').getAttribute('aria-label')).toBe('Shift');
    expect(key('compose-key-backspace').getAttribute('aria-label')).toBe('Delete');
    expect(key('compose-key-space').getAttribute('aria-label')).toBe('Space');
    expect(key('compose-key-send').getAttribute('aria-label')).toBe('Send status');
  });

  it('a letter key emits the lowercase letter when shift is off (FR-002)', () => {
    render();
    key('compose-key-h').click();
    expect(emitted.type).toBe('h');
  });

  it('shift engages once: the next letter is uppercase, then shift resets (FR-002, FR-003)', () => {
    render();
    const shift = key('compose-key-shift');

    shift.click();
    fixture.detectChanges();
    expect(shift.getAttribute('aria-pressed')).toBe('true');

    key('compose-key-h').click();
    fixture.detectChanges();
    expect(emitted.type).toBe('H');
    expect(shift.getAttribute('aria-pressed')).toBe('false');

    key('compose-key-e').click();
    expect(emitted.type).toBe('He');
  });

  it('shift toggles back off when pressed again (FR-003)', () => {
    render();
    const shift = key('compose-key-shift');

    shift.click();
    shift.click();
    fixture.detectChanges();
    expect(shift.getAttribute('aria-pressed')).toBe('false');

    key('compose-key-a').click();
    expect(emitted.type).toBe('a');
  });

  it('backspace emits once and is genuinely disabled when the value is empty (FR-004)', () => {
    render();
    expect(key('compose-key-backspace').disabled).toBe(true);

    render('on the move');
    key('compose-key-backspace').click();
    expect(emitted.backspace).toBe(1);
  });

  it('space emits a space (FR-005)', () => {
    render();
    key('compose-key-space').click();
    expect(emitted.type).toBe(' ');
  });

  it('send emits and is genuinely disabled while the trimmed value is blank (FR-006)', () => {
    render();
    expect(key('compose-key-send').disabled).toBe(true);
    key('compose-key-send').click();
    expect(emitted.send).toBe(0);

    render('   ');
    expect(key('compose-key-send').disabled).toBe(true);

    render('  at the beach  ');
    expect(key('compose-key-send').disabled).toBe(false);
    key('compose-key-send').click();
    expect(emitted.send).toBe(1);
  });

  it('every rendered key is live: 123/globe/emoji keys do not exist (FR-001)', () => {
    render();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="compose-key-123"]')).toBeNull();
    expect(el.querySelector('[data-testid="compose-key-globe"]')).toBeNull();
    expect(el.querySelector('[data-testid="compose-key-emoji"]')).toBeNull();
    expect(
      [...el.querySelectorAll('button')].every((button) => !button.disabled || button === key('compose-key-send') || button === key('compose-key-backspace')),
    ).toBeTrue();
  });
});