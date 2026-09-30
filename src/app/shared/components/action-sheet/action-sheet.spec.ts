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

  describe('F-046: honestly disabled rows', () => {
    const MIXED: readonly Action[] = [
      { id: 'alpha', label: 'Alpha row' },
      { id: 'beta', label: 'Beta row', disabled: true },
    ];

    it('renders a disabled action as a natively disabled button', () => {
      fixture = TestBed.createComponent(ActionSheet);
      fixture.componentRef.setInput('actions', MIXED);
      fixture.detectChanges();
      const rows = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
        '[data-testid="action-sheet-row"]',
      );
      expect(rows[0].disabled).toBe(false);
      expect(rows[1].disabled).toBe(true);
    });

    it('does not emit when a disabled row is clicked', () => {
      fixture = TestBed.createComponent(ActionSheet);
      fixture.componentRef.setInput('actions', MIXED);
      fixture.detectChanges();
      const seen: string[] = [];
      fixture.componentInstance.action.subscribe((id) => seen.push(id));
      const rows = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
        '[data-testid="action-sheet-row"]',
      );
      rows[1].click();
      expect(seen).toEqual([]);
    });

    it('keeps a disabled row visible and labelled, so the destination work has a home', () => {
      fixture = TestBed.createComponent(ActionSheet);
      fixture.componentRef.setInput('actions', MIXED);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      const rows = el.querySelectorAll('[data-testid="action-sheet-row"]');
      expect(rows.length).toBe(2);
      expect(rows[1].textContent?.trim()).toBe('Beta row');
      expect(
        el.querySelector('.action-sheet__row--disabled [data-testid="action-sheet-row"]'),
      ).not.toBeNull();
    });

    it('treats an action with no disabled flag as enabled', () => {
      fixture = TestBed.createComponent(ActionSheet);
      fixture.componentRef.setInput('actions', ACTIONS);
      fixture.detectChanges();
      const rows = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
        '[data-testid="action-sheet-row"]',
      );
      expect(Array.from(rows).every((r) => !r.disabled)).toBe(true);
    });
  });
});