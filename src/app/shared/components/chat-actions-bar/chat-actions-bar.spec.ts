import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatActionsBar } from './chat-actions-bar';

describe('ChatActionsBar', () => {
  let fixture: ComponentFixture<ChatActionsBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatActionsBar],
    }).compileComponents();
  });

  function buttons(): NodeListOf<HTMLButtonElement> {
    return (fixture.nativeElement as HTMLElement).querySelectorAll('button');
  }

  it('renders Archive, Read All and Delete in order', () => {
    fixture = TestBed.createComponent(ChatActionsBar);
    fixture.detectChanges();
    const labels = Array.from(buttons()).map((b) => b.textContent?.trim());
    expect(labels).toEqual(['Archive', 'Read All', 'Delete']);
  });

  it('disable/grays all actions when nothing is selected', () => {
    fixture = TestBed.createComponent(ChatActionsBar);
    fixture.componentRef.setInput('selectedCount', 0);
    fixture.detectChanges();
    for (const button of buttons()) {
      expect(button.disabled).toBe(true);
      expect(getComputedStyle(button).color).toBe('rgb(199, 199, 204)');
    }
  });

  it('enables and recolors actions when at least one is selected', () => {
    fixture = TestBed.createComponent(ChatActionsBar);
    fixture.componentRef.setInput('selectedCount', 2);
    fixture.detectChanges();
    const [archive, readAll, del] = Array.from(buttons());
    expect(archive.disabled).toBe(false);
    expect(readAll.disabled).toBe(false);
    expect(del.disabled).toBe(false);
    expect(getComputedStyle(archive).color).toBe('rgb(0, 122, 255)');
    expect(getComputedStyle(readAll).color).toBe('rgb(0, 122, 255)');
    expect(getComputedStyle(del).color).toBe('rgb(255, 59, 48)');
  });

  it('does not emit while disabled', () => {
    fixture = TestBed.createComponent(ChatActionsBar);
    fixture.componentRef.setInput('selectedCount', 0);
    fixture.detectChanges();
    let emitted = false;
    fixture.componentInstance.delete.subscribe(() => (emitted = true));
    buttons()[2].click();
    expect(emitted).toBe(false);
  });

  it('emits the right action when enabled', () => {
    fixture = TestBed.createComponent(ChatActionsBar);
    fixture.componentRef.setInput('selectedCount', 1);
    fixture.detectChanges();
    const { archive, readAll, delete: del } = fixture.componentInstance;
    const events: string[] = [];
    archive.subscribe(() => events.push('archive'));
    readAll.subscribe(() => events.push('readAll'));
    del.subscribe(() => events.push('delete'));

    buttons()[0].click();
    buttons()[1].click();
    buttons()[2].click();
    expect(events).toEqual(['archive', 'readAll', 'delete']);
  });
});