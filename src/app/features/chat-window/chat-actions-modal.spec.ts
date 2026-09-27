import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatActionsModal } from './chat-actions-modal';

describe('ChatActionsModal', () => {
  let fixture: ComponentFixture<ChatActionsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatActionsModal],
    }).compileComponents();
  });

  it('renders the chat action rows from the seed (Mute by default)', () => {
    fixture = TestBed.createComponent(ChatActionsModal);
    fixture.detectChanges();
    const rows = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        '[data-testid="action-sheet-row"]',
      ) as NodeListOf<HTMLElement>,
    );
    expect(rows.map((r) => r.textContent?.trim())).toEqual(['Mute', 'Wallpaper', 'More']);
  });

  it('renders Unmute when the conversation is muted', () => {
    fixture = TestBed.createComponent(ChatActionsModal);
    fixture.componentRef.setInput('muted', true);
    fixture.detectChanges();
    const rows = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        '[data-testid="action-sheet-row"]',
      ) as NodeListOf<HTMLElement>,
    );
    expect(rows.map((r) => r.textContent?.trim())).toEqual(['Unmute', 'Wallpaper', 'More']);
  });

  it('emits the action id when a row is activated', () => {
    fixture = TestBed.createComponent(ChatActionsModal);
    fixture.detectChanges();
    let emitted = '';
    fixture.componentInstance.action.subscribe((id) => (emitted = id));
    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        '[data-testid="action-sheet-row"]',
      ) as NodeListOf<HTMLElement>,
    );
    buttons[0]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(emitted).toBe('chat-mute');
  });

  it('emits dismiss on the backdrop', () => {
    fixture = TestBed.createComponent(ChatActionsModal);
    fixture.detectChanges();
    let emitted = false;
    fixture.componentInstance.dismiss.subscribe(() => (emitted = true));
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLElement>('[data-testid="action-sheet-backdrop"]')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(emitted).toBe(true);
  });

  it('emits dismiss on Escape', () => {
    fixture = TestBed.createComponent(ChatActionsModal);
    fixture.detectChanges();
    let emitted = false;
    fixture.componentInstance.dismiss.subscribe(() => (emitted = true));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(emitted).toBe(true);
  });
});