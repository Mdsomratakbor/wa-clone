import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatListItem } from './chat-list-item';
import { ChatPreview } from '../../../features/chat-list/chat.model';

const CHAT: ChatPreview = {
  id: 'chat-001',
  contactName: 'Maximillian Jacobson',
  preview: 'Bro, I have a good idea!',
  timestamp: '10/30/19',
  avatarRef: null,
};

describe('ChatListItem', () => {
  let fixture: ComponentFixture<ChatListItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatListItem],
    }).compileComponents();
  });

  it('renders name, preview and timestamp', () => {
    fixture = TestBed.createComponent(ChatListItem);
    fixture.componentRef.setInput('chat', CHAT);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.chat-list-item__name')?.textContent).toBe('Maximillian Jacobson');
    expect(el.querySelector('.chat-list-item__preview')?.textContent).toContain('good idea');
    expect(el.querySelector('.chat-list-item__timestamp')?.textContent).toBe('10/30/19');
  });

  it('emits selected when activated', () => {
    fixture = TestBed.createComponent(ChatListItem);
    fixture.componentRef.setInput('chat', CHAT);
    fixture.detectChanges();
    let emitted: ChatPreview | undefined;
    fixture.componentInstance.selected.subscribe((v) => (emitted = v));
    (fixture.nativeElement as HTMLElement).querySelector('.chat-list-item')?.dispatchEvent(
      new MouseEvent('click'),
    );
    expect(emitted?.id).toBe('chat-001');
  });
});