import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationBar } from './navigation-bar';
import { NavAction } from '../../../features/chat-list/chat.model';

describe('NavigationBar', () => {
  let fixture: ComponentFixture<NavigationBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationBar],
    }).compileComponents();
  });

  it('renders title and actions', () => {
    fixture = TestBed.createComponent(NavigationBar);
    fixture.componentRef.setInput('title', 'Chats');
    fixture.componentRef.setInput('leading', [
      { id: 'broadcast-lists', label: 'Broadcast Lists' },
      { id: 'new-group', label: 'New Group' },
    ] satisfies NavAction[]);
    fixture.componentRef.setInput('trailing', [{ id: 'edit', label: 'Edit' }] satisfies NavAction[]);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.navigation-bar__title')?.textContent).toBe('Chats');
    const labels = [...el.querySelectorAll('.navigation-bar__action')].map((n) =>
      n.textContent?.trim(),
    );
    expect(labels).toEqual(['Broadcast Lists', 'New Group', 'Edit']);
  });

  it('emits the action id on click', () => {
    fixture = TestBed.createComponent(NavigationBar);
    fixture.componentRef.setInput('title', 'Chats');
    fixture.componentRef.setInput('trailing', [{ id: 'edit', label: 'Edit' }] satisfies NavAction[]);
    fixture.detectChanges();
    let emitted: string | undefined;
    fixture.componentInstance.action.subscribe((v) => (emitted = v));
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.navigation-bar__action',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[0].click();
    expect(emitted).toBe('edit');
  });

  it('actions are keyboard-focusable buttons', () => {
    fixture = TestBed.createComponent(NavigationBar);
    fixture.componentRef.setInput('title', 'Chats');
    fixture.componentRef.setInput('trailing', [{ id: 'edit', label: 'Edit' }] satisfies NavAction[]);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      '.navigation-bar__action',
    ) as HTMLButtonElement;
    expect(button?.tagName).toBe('BUTTON');
    expect(button?.tabIndex).toBe(0);
  });
});