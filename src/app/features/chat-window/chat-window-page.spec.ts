import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatWindowPage } from './chat-window-page';
import { CHAT_CONTACT, CHAT_SEED } from './chat-window.seed';

function stubRoute(id: string | null): ActivatedRoute {
  return {
    snapshot: { paramMap: { get: (key: string) => (key === 'id' ? id : null) } },
  } as unknown as ActivatedRoute;
}

describe('ChatWindowPage', () => {
  let fixture: ComponentFixture<ChatWindowPage>;
  let navSpy: jasmine.Spy;

  beforeEach(async () => {
    navSpy = jasmine.createSpy('navigate');
    await TestBed.configureTestingModule({
      imports: [ChatWindowPage],
      providers: [
        { provide: ActivatedRoute, useValue: stubRoute('chat-006') },
        { provide: Router, useValue: { navigate: navSpy } },
      ],
    }).compileComponents();
  });

  it('renders the contact header from the seeded contact', () => {
    fixture = TestBed.createComponent(ChatWindowPage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.chat-header__name')?.textContent).toBe(CHAT_CONTACT.name);
  });

  it('renders the full seeded thread for chat-006', () => {
    fixture = TestBed.createComponent(ChatWindowPage);
    fixture.detectChanges();
    const bubbles = fixture.nativeElement.querySelectorAll('app-message-bubble');
    expect(bubbles.length).toBe(CHAT_SEED.length);
  });

  it('renders the date chip between the first and third message', () => {
    fixture = TestBed.createComponent(ChatWindowPage);
    fixture.detectChanges();
    const rows = Array.from(fixture.nativeElement.querySelectorAll('li') as NodeListOf<HTMLElement>);
    const chipIndex = rows.findIndex((r) => r.querySelector('.chat-window__date-chip') !== null);
    expect(chipIndex).toBe(2);
  });

  it('navigates back to chats on back', () => {
    fixture = TestBed.createComponent(ChatWindowPage);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.chat-header__back')
      ?.click();
    expect(navSpy).toHaveBeenCalledWith(['/chats']);
  });

  it('renders a wallpaper-only thread for an unknown contact', async () => {
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ChatWindowPage],
      providers: [
        { provide: ActivatedRoute, useValue: stubRoute('chat-999') },
        { provide: Router, useValue: { navigate: navSpy } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ChatWindowPage);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-message-bubble').length).toBe(0);
    expect(fixture.nativeElement.querySelector('[data-testid="message-thread"]')).not.toBeNull();
  });
});