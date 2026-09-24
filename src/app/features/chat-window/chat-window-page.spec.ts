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

  it('does not render the chat actions sheet when closed', () => {
    fixture = TestBed.createComponent(ChatWindowPage);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="action-sheet"]')).toBeNull();
  });

  it('opens the chat actions sheet from the More options affordance', () => {
    fixture = TestBed.createComponent(ChatWindowPage);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[data-testid="chat-header__more"]')
      ?.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="action-sheet"]')).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('[data-testid="action-sheet-backdrop"]'),
    ).not.toBeNull();
  });

  it('renders the chat action rows from the seed', () => {
    fixture = TestBed.createComponent(ChatWindowPage);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[data-testid="chat-header__more"]')
      ?.click();
    fixture.detectChanges();
    const rows = Array.from(
      fixture.nativeElement.querySelectorAll('[data-testid="action-sheet-row"]') as NodeListOf<
        HTMLElement
      >,
    );
    expect(rows.map((r) => r.textContent?.trim())).toEqual(['Mute', 'Wallpaper', 'More']);
  });

  it('keeps the sheet open when a row is activated (targets are later features)', () => {
    fixture = TestBed.createComponent(ChatWindowPage);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[data-testid="chat-header__more"]')
      ?.click();
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement)
      .querySelectorAll<HTMLButtonElement>('[data-testid="action-sheet-row"]')[0]
      ?.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="action-sheet"]')).not.toBeNull();
  });

  it('dismisses on backdrop and restores focus to the More options trigger', () => {
    fixture = TestBed.createComponent(ChatWindowPage);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[data-testid="chat-header__more"]')
      ?.click();
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[data-testid="action-sheet-backdrop"]')
      ?.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="action-sheet"]')).toBeNull();
    expect(
      document.activeElement,
    ).toBe(fixture.nativeElement.querySelector('[data-testid="chat-header__more"]'));
  });

  it('dismisses on Escape and restores focus to the More options trigger', () => {
    fixture = TestBed.createComponent(ChatWindowPage);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[data-testid="chat-header__more"]')
      ?.click();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="action-sheet"]')).toBeNull();
    expect(
      document.activeElement,
    ).toBe(fixture.nativeElement.querySelector('[data-testid="chat-header__more"]'));
  });
});