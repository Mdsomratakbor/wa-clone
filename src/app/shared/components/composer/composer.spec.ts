import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Composer } from './composer';
import { PrefsStore } from '../../../core/prefs.store';

describe('Composer', () => {
  let fixture: ComponentFixture<Composer>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Composer],
    }).compileComponents();
    TestBed.inject(PrefsStore).reset();
  });

  it('renders the composer controls', () => {
    fixture = TestBed.createComponent(Composer);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.composer__add')).not.toBeNull();
    expect(el.querySelector('.composer__sticker')).not.toBeNull();
    expect(el.querySelector('.composer__camera')).not.toBeNull();
    expect(el.querySelector('.composer__mic')).not.toBeNull();
  });

  it('provides an empty text input without placeholder', () => {
    fixture = TestBed.createComponent(Composer);
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      'input.composer__input',
    );
    expect(input).not.toBeNull();
    expect(input?.placeholder).toBe('');
  });

  it('accepts typed text locally', () => {
    fixture = TestBed.createComponent(Composer);
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      'input.composer__input',
    );
    input!.value = 'hello';
    input!.dispatchEvent(new Event('input'));
    expect(input!.value).toBe('hello');
  });

  it('reveals Send when the draft is non-empty and hides the mic', () => {
    fixture = TestBed.createComponent(Composer);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[aria-label="Send message"]')).toBeNull();
    expect(el.querySelector('.composer__mic')).not.toBeNull();

    const input = el.querySelector<HTMLInputElement>('input.composer__input');
    input!.value = 'hello';
    input!.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(el.querySelector('[aria-label="Send message"]')).not.toBeNull();
    expect(el.querySelector('.composer__mic')).toBeNull();
  });

  it('returns to mic when the draft is emptied', () => {
    fixture = TestBed.createComponent(Composer);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector<HTMLInputElement>('input.composer__input');
    input!.value = 'hello';
    input!.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(el.querySelector('[aria-label="Send message"]')).not.toBeNull();

    input!.value = '';
    input!.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(el.querySelector('[aria-label="Send message"]')).toBeNull();
    expect(el.querySelector('.composer__mic')).not.toBeNull();
  });

  it('emits the trimmed text and clears the draft on Send', () => {
    fixture = TestBed.createComponent(Composer);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    let sent: string | undefined;
    fixture.componentInstance.send.subscribe((v: string) => (sent = v));

    const input = el.querySelector<HTMLInputElement>('input.composer__input');
    input!.value = '  hello tokyo  ';
    input!.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (el.querySelector('[aria-label="Send message"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(sent).toBe('hello tokyo');
    expect(input!.value).toBe('');
    expect(el.querySelector('[aria-label="Send message"]')).toBeNull();
  });

  it('sends on Enter and drops blank drafts', () => {
    fixture = TestBed.createComponent(Composer);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    let sent: string | undefined;
    fixture.componentInstance.send.subscribe((v: string) => (sent = v));

    const input = el.querySelector<HTMLInputElement>('input.composer__input');
    input!.value = '  ';
    input!.dispatchEvent(new Event('input'));
    input!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(sent).toBeUndefined();

    input!.value = 'go';
    input!.dispatchEvent(new Event('input'));
    input!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(sent).toBe('go');
    expect(input!.value).toBe('');
  });

  it('keeps Enter inert when the Enter key sends toggle is off', () => {
    TestBed.inject(PrefsStore).set('enterKeySends', false);
    fixture = TestBed.createComponent(Composer);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    let sent: string | undefined;
    fixture.componentInstance.send.subscribe((v: string) => (sent = v));

    const input = el.querySelector<HTMLInputElement>('input.composer__input');
    input!.value = 'go';
    input!.dispatchEvent(new Event('input'));
    input!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(sent).toBeUndefined();
    expect(input!.value).toBe('go');
    expect(el.querySelector('[aria-label="Send message"]')).not.toBeNull();
  });

  it('exposes an accessible toolbar role', () => {
    fixture = TestBed.createComponent(Composer);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.composer')?.getAttribute('role')).toBe('toolbar');
    expect(el.querySelector('.composer')?.getAttribute('aria-label')).toBe('Message composer');
  });
});