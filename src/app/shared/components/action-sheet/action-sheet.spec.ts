import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionSheet } from './action-sheet';
import { Action } from './action-sheet.model';

describe('ActionSheet', () => {
  let fixture: ComponentFixture<ActionSheet>;

  const ACTIONS: readonly Action[] = [
    { id: 'alpha', label: 'Alpha row' },
    { id: 'beta', label: 'Beta row' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionSheet],
    }).compileComponents();
  });

  it('renders nothing when there are no actions', () => {
    fixture = TestBed.createComponent(ActionSheet);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="action-sheet"]')).toBeNull();
    expect(el.querySelector('[data-testid="action-sheet-backdrop"]')).toBeNull();
  });

  it('renders one labelled row per action without hard-coding content', () => {
    fixture = TestBed.createComponent(ActionSheet);
    fixture.componentRef.setInput('actions', ACTIONS);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const rows = el.querySelectorAll<HTMLButtonElement>('[data-testid="action-sheet-row"]');
    expect(rows.length).toBe(ACTIONS.length);
    expect(Array.from(rows).map((r) => r.textContent?.trim())).toEqual([
      'Alpha row',
      'Beta row',
    ]);
  });

  it('emits the action id when a row is activated', () => {
    fixture = TestBed.createComponent(ActionSheet);
    fixture.componentRef.setInput('actions', ACTIONS);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const seen: string[] = [];
    fixture.componentInstance.action.subscribe((id) => seen.push(id));
    el.querySelectorAll<HTMLButtonElement>('[data-testid="action-sheet-row"]')[1].click();
    expect(seen).toEqual(['beta']);
  });

  it('emits dismiss when the backdrop is activated', () => {
    fixture = TestBed.createComponent(ActionSheet);
    fixture.componentRef.setInput('actions', ACTIONS);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    let dismissed = 0;
    fixture.componentInstance.dismiss.subscribe(() => dismissed++);
    el.querySelector<HTMLButtonElement>('[data-testid="action-sheet-backdrop"]')?.click();
    expect(dismissed).toBe(1);
  });

  it('renders the title and uses it as the dialog label', () => {
    fixture = TestBed.createComponent(ActionSheet);
    fixture.componentRef.setInput('actions', ACTIONS);
    fixture.componentRef.setInput('title', 'Choose action');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="action-sheet-title"]')?.textContent).toBe(
      'Choose action',
    );
    expect(el.querySelector('[data-testid="action-sheet"]')?.getAttribute('aria-label')).toBe(
      'Choose action',
    );
  });
});