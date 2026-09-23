import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatsPage } from './chats-page';
import { CHAT_SEED } from './chat-list.seed';

describe('ChatsPage', () => {
  let fixture: ComponentFixture<ChatsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatsPage],
    }).compileComponents();
  });

  it('renders one row per seeded conversation', () => {
    fixture = TestBed.createComponent(ChatsPage);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('app-chat-list-item');
    expect(rows.length).toBe(CHAT_SEED.length);
  });

  it('renders the navigation bar with the Chats title', () => {
    fixture = TestBed.createComponent(ChatsPage);
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.navigation-bar__title');
    expect(title?.textContent).toBe('Chats');
  });

  it('renders an empty placeholder when there are no conversations', () => {
    fixture = TestBed.createComponent(ChatsPage);
    fixture.componentRef.setInput('conversations', []);
    fixture.detectChanges();
    const empty = fixture.nativeElement.querySelector('[data-testid="empty-state"]');
    expect(empty).not.toBeNull();
    expect(empty?.textContent).toContain('No chats');
  });

  it('switches to a placeholder when a non-chats tab is selected', () => {
    fixture = TestBed.createComponent(ChatsPage);
    fixture.detectChanges();
    const tabs = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '[role="tab"]',
    ) as NodeListOf<HTMLButtonElement>;
    tabs[4].click(); // Status
    fixture.detectChanges();
    const stub = fixture.nativeElement.querySelector('[data-testid="tab-stub"]');
    expect(stub).not.toBeNull();
    expect(stub?.textContent).toContain('Status');
  });
});