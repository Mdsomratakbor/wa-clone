import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddModal } from './add-modal';
import { NEW_CHAT_ACTIONS } from './new-chat-modal.seed';

describe('AddModal', () => {
  let fixture: ComponentFixture<AddModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddModal],
    }).compileComponents();
  });

  it('renders the action sheet with the supplied actions', () => {
    fixture = TestBed.createComponent(AddModal);
    fixture.componentRef.setInput('actions', NEW_CHAT_ACTIONS);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const rows = el.querySelectorAll('[data-testid="action-sheet-row"]');
    expect(rows.length).toBe(NEW_CHAT_ACTIONS.length);
    new Map(NEW_CHAT_ACTIONS.map((a) => [a.id, a.label])).forEach((label) => {
      expect(el.textContent).toContain(label);
    });
  });

  it('re-emits the row action id', () => {
    fixture = TestBed.createComponent(AddModal);
    fixture.componentRef.setInput('actions', NEW_CHAT_ACTIONS);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const seen: string[] = [];
    fixture.componentInstance.action.subscribe((id) => seen.push(id));
    el.querySelectorAll<HTMLButtonElement>('[data-testid="action-sheet-row"]')[1].click();
    expect(seen).toEqual([NEW_CHAT_ACTIONS[1].id]);
  });

  it('re-emits dismiss on backdrop activation', () => {
    fixture = TestBed.createComponent(AddModal);
    fixture.componentRef.setInput('actions', NEW_CHAT_ACTIONS);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    let dismissed = 0;
    fixture.componentInstance.dismiss.subscribe(() => dismissed++);
    el.querySelector<HTMLButtonElement>('[data-testid="action-sheet-backdrop"]')?.click();
    expect(dismissed).toBe(1);
  });

  it('emits dismiss on the Escape key', () => {
    fixture = TestBed.createComponent(AddModal);
    fixture.componentRef.setInput('actions', NEW_CHAT_ACTIONS);
    fixture.detectChanges();
    let dismissed = 0;
    fixture.componentInstance.dismiss.subscribe(() => dismissed++);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(dismissed).toBe(1);
  });
});