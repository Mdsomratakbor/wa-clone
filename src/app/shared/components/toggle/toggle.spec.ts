import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Toggle } from './toggle';

describe('Toggle', () => {
  let fixture: ComponentFixture<Toggle>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Toggle],
    }).compileComponents();
    fixture = TestBed.createComponent(Toggle);
    fixture.componentRef.setInput('checked', true);
    fixture.componentRef.setInput('label', 'Enter key sends');
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('renders a switch control reflecting the checked state', () => {
    const button = el.querySelector<HTMLButtonElement>('button[role="switch"]');
    expect(button).not.toBeNull();
    expect(button?.getAttribute('aria-checked')).toBe('true');
    expect(button?.getAttribute('aria-label')).toBe('Enter key sends');
  });

  it('emits the flipped state on activation', () => {
    let emitted: boolean | undefined;
    fixture.componentInstance.checkedChange.subscribe((value: boolean) => (emitted = value));
    el.querySelector<HTMLButtonElement>('button[role="switch"]')?.click();
    expect(emitted).toBe(false);
  });
});