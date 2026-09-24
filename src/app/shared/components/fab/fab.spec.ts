import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Fab } from './fab';

describe('Fab', () => {
  let fixture: ComponentFixture<Fab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fab],
    }).compileComponents();
  });

  it('renders with aria label', () => {
    fixture = TestBed.createComponent(Fab);
    fixture.componentRef.setInput('label', 'Start new chat');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('button')?.getAttribute('aria-label')).toBe('Start new chat');
  });

  it('emits pressed on click', () => {
    fixture = TestBed.createComponent(Fab);
    fixture.detectChanges();
    let pressed = 0;
    fixture.componentInstance.pressed.subscribe(() => pressed++);
    (fixture.nativeElement as HTMLElement).querySelector('button')?.click();
    expect(pressed).toBe(1);
  });

  it('focus() focuses the trigger button', () => {
    fixture = TestBed.createComponent(Fab);
    fixture.detectChanges();
    fixture.componentInstance.focus();
    const el = fixture.nativeElement as HTMLElement;
    expect(document.activeElement).toBe(el.querySelector('button'));
  });
});