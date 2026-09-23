import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Composer } from './composer';

describe('Composer', () => {
  let fixture: ComponentFixture<Composer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Composer],
    }).compileComponents();
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

  it('exposes an accessible toolbar role', () => {
    fixture = TestBed.createComponent(Composer);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.composer')?.getAttribute('role')).toBe('toolbar');
    expect(el.querySelector('.composer')?.getAttribute('aria-label')).toBe('Message composer');
  });
});