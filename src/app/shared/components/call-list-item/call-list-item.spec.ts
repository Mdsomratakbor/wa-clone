import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CallEntry } from '../../../features/calls/calls.model';
import { CallListItem } from './call-list-item';

const CALL: CallEntry = {
  id: 'call-001',
  contactName: 'Martin Randolph',
  direction: 'outgoing',
  date: '10/13/19',
  avatarRef: null,
};

const MISSED: CallEntry = {
  id: 'call-004',
  contactName: 'Karen Castillo',
  direction: 'missed',
  date: '9/30/19',
  avatarRef: null,
};

describe('CallListItem', () => {
  let fixture: ComponentFixture<CallListItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CallListItem],
    }).compileComponents();
  });

  function render(call: CallEntry): HTMLElement {
    fixture = TestBed.createComponent(CallListItem);
    fixture.componentRef.setInput('call', call);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the name, date, direction label, glyph and info button', () => {
    const el = render(CALL);
    expect(el.querySelector('.call-list-item__name')?.textContent?.trim()).toBe('Martin Randolph');
    expect(el.querySelector('.call-list-item__date')?.textContent?.trim()).toBe('10/13/19');
    expect(el.querySelector('.call-list-item__direction')?.textContent?.trim()).toBe('outgoing');
    expect(el.querySelector('.call-list-item__glyph')).not.toBeNull();
    expect(el.querySelector('[data-testid="call-info"]')).not.toBeNull();
    expect(el.querySelector('app-user-avatar')).not.toBeNull();
  });

  it('applies the missed style to the name when the call is missed', () => {
    const el = render(MISSED);
    expect(el.querySelector('.call-list-item__name')?.classList.contains('call-list-item__name--missed')).toBe(
      true,
    );
    const normal = render(CALL);
    expect(
      normal.querySelector('.call-list-item__name')?.classList.contains('call-list-item__name--missed'),
    ).toBe(false);
  });

  it('exposes button semantics with a descriptive label', () => {
    const el = render(CALL);
    const row = el.querySelector('.call-list-item');
    expect(row?.getAttribute('role')).toBe('button');
    expect(row?.getAttribute('aria-label')).toBe('Martin Randolph, outgoing, 10/13/19');
  });

  it('emits the call when the row is activated by click', () => {
    render(CALL);
    let emitted: CallEntry | undefined;
    fixture.componentInstance.selected.subscribe((v) => (emitted = v));
    (fixture.nativeElement.querySelector('.call-list-item') as HTMLElement).click();
    expect(emitted).toBe(CALL);
  });

  it('emits the call when activated by keyboard', () => {
    render(CALL);
    let emitted: CallEntry | undefined;
    fixture.componentInstance.selected.subscribe((v) => (emitted = v));
    const row = fixture.nativeElement.querySelector('.call-list-item') as HTMLElement;
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(emitted).toBe(CALL);
  });

  it('emits info from the info button without activating the row', () => {
    render(CALL);
    let emitted: CallEntry | undefined;
    const activateSpy = jasmine.createSpy();
    fixture.componentInstance.info.subscribe((v) => (emitted = v));
    fixture.componentInstance.selected.subscribe(activateSpy);
    (fixture.nativeElement.querySelector('[data-testid="call-info"]') as HTMLElement).click();
    fixture.detectChanges();
    expect(emitted).toBe(CALL);
    expect(activateSpy).not.toHaveBeenCalled();
  });

  it('hides the info button and shifts content in edit mode', () => {
    const el = render(CALL);
    fixture.componentRef.setInput('editMode', true);
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="call-info"]')).toBeNull();
    expect(el.querySelector('[data-testid="call-remove"]')).not.toBeNull();
    expect(el.querySelector('.call-list-item')?.classList.contains('call-list-item--edit')).toBe(true);
  });

  it('renders the red minus with a descriptive label in edit mode', () => {
    render(CALL);
    fixture.componentRef.setInput('editMode', true);
    fixture.detectChanges();
    const minus = fixture.nativeElement.querySelector('[data-testid="call-remove"]');
    expect(minus?.getAttribute('aria-label')).toBe('Remove call for Martin Randolph');
    expect(minus?.querySelector('svg')).not.toBeNull();
  });

  it('emits remove from the minus without activating the row', () => {
    render(CALL);
    fixture.componentRef.setInput('editMode', true);
    fixture.detectChanges();
    let removed: CallEntry | undefined;
    const activateSpy = jasmine.createSpy();
    fixture.componentInstance.remove.subscribe((v) => (removed = v));
    fixture.componentInstance.selected.subscribe(activateSpy);
    (fixture.nativeElement.querySelector('[data-testid="call-remove"]') as HTMLElement).click();
    fixture.detectChanges();
    expect(removed).toBe(CALL);
    expect(activateSpy).not.toHaveBeenCalled();
  });

  it('restores the info button when edit mode is off', () => {
    const el = render(CALL);
    fixture.componentRef.setInput('editMode', true);
    fixture.detectChanges();
    fixture.componentRef.setInput('editMode', false);
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="call-info"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="call-remove"]')).toBeNull();
  });
});