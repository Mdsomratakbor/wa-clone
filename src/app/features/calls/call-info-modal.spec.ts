import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CallInfoModal } from './call-info-modal';

describe('CallInfoModal', () => {
  let fixture: ComponentFixture<CallInfoModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CallInfoModal] }).compileComponents();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(CallInfoModal);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function rowLabels(el: HTMLElement): string[] {
    return [...el.querySelectorAll<HTMLElement>('[data-testid="action-sheet-row"]')].map((row) =>
      (row.textContent ?? '').trim(),
    );
  }

  it('renders the four actions in order (FR-002)', () => {
    expect(rowLabels(render())).toEqual(['Message', 'Voice call', 'Video call', 'Delete']);
  });

  it('presents a labelled modal dialog (FR-010)', () => {
    const sheet = render().querySelector('[data-testid="action-sheet"]');
    expect(sheet?.getAttribute('role')).toBe('dialog');
    expect(sheet?.getAttribute('aria-modal')).toBe('true');
    expect(sheet?.getAttribute('aria-label')).toBe('Actions');
  });

  it('renders no title unless one is given (contract hypothesis)', () => {
    expect(render().querySelector('[data-testid="action-sheet-title"]')).toBeNull();

    fixture.componentRef.setInput('title', 'Martin Randolph');
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('[data-testid="action-sheet-title"]');
    expect(title?.textContent?.trim()).toBe('Martin Randolph');
    expect(
      fixture.nativeElement
        .querySelector('[data-testid="action-sheet"]')
        ?.getAttribute('aria-label'),
    ).toBe('Martin Randolph');
  });

  it('emits the action id when a row is activated (FR-002)', () => {
    const el = render();
    const spy = jasmine.createSpy('action');
    fixture.componentInstance.action.subscribe(spy);
    fixture.componentRef.setInput('title', '');
    fixture.detectChanges();

    const rows = el.querySelectorAll<HTMLElement>('[data-testid="action-sheet-row"]');
    rows[3]?.click();
    expect(spy).toHaveBeenCalledWith('delete');
  });

  it('emits dismiss on backdrop activation (FR-003)', () => {
    const el = render();
    const spy = jasmine.createSpy('dismiss');
    fixture.componentInstance.dismiss.subscribe(spy);

    (el.querySelector('[data-testid="action-sheet-backdrop"]') as HTMLElement).click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('emits dismiss on Escape (FR-003)', () => {
    render();
    const spy = jasmine.createSpy('dismiss');
    fixture.componentInstance.dismiss.subscribe(spy);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('does not disable the call actions (FR-006)', () => {
    const el = render();
    const disabled = [...el.querySelectorAll('[data-testid="action-sheet-row"]')].filter(
      (row) => (row as HTMLButtonElement).disabled,
    );
    expect(disabled).toEqual([]);
  });
});
