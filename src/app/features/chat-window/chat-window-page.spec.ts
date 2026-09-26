import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatWindowPage } from './chat-window-page';
import { ChatStore } from '../../core/chat.store';
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
    TestBed.inject(ChatStore).reset();
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

  it('navigates to contact info on identity activation', () => {
    fixture = TestBed.createComponent(ChatWindowPage);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[data-testid="chat-header__identity"]')
      ?.click();
    expect(navSpy).toHaveBeenCalledWith(['/contact', 'chat-006']);
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

  it('sends a message via the Send button: bubble appended and input cleared', () => {
    fixture = TestBed.createComponent(ChatWindowPage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector<HTMLInputElement>('input[aria-label="Message"]')!;

    input.value = 'hello tokyo';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(el.querySelector('[aria-label="Send message"]')).not.toBeNull();

    (el.querySelector('[aria-label="Send message"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    const bubbles = el.querySelectorAll('app-message-bubble');
    expect(bubbles.length).toBe(CHAT_SEED.length + 1);
    expect(bubbles[bubbles.length - 1].textContent).toContain('hello tokyo');
    expect(input.value).toBe('');
    expect(el.querySelector('[aria-label="Send message"]')).toBeNull();
  });

  it('sends a message via Enter and drops blank drafts', () => {
    fixture = TestBed.createComponent(ChatWindowPage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector<HTMLInputElement>('input[aria-label="Message"]')!;

    input.value = '   ';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(el.querySelectorAll('app-message-bubble').length).toBe(CHAT_SEED.length);

    input.value = 'on my way';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    const bubbles = el.querySelectorAll('app-message-bubble');
    expect(bubbles.length).toBe(CHAT_SEED.length + 1);
    expect(bubbles[bubbles.length - 1].textContent).toContain('on my way');
    expect(input.value).toBe('');
  });

  it('sends into the threaded conversation and keeps the seed thread intact', () => {
    const store = TestBed.inject(ChatStore);
    expect(store.conversationMessages('chat-006').length).toBe(CHAT_SEED.length);
    store.sendMessage('chat-006', 'direct');
    expect(store.conversationMessages('chat-006').length).toBe(CHAT_SEED.length + 1);
    expect(store.conversations().find((c) => c.id === 'chat-006')?.preview).toBe('direct');
  });

  it('marks the opened conversation read and leaves the rest unread', () => {
    fixture = TestBed.createComponent(ChatWindowPage);
    fixture.detectChanges();
    const store = TestBed.inject(ChatStore);
    expect(store.conversations().find((c) => c.id === 'chat-006')?.read).toBe(true);
    expect(store.conversations().find((c) => c.id === 'chat-001')?.read).toBe(false);
  });

  it('stars and unstars a message via a long-press on its bubble', () => {
    fixture = TestBed.createComponent(ChatWindowPage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const store = TestBed.inject(ChatStore);
    const bubble = el.querySelector('[data-testid="bubble-msg-007"]') as HTMLElement;

    jasmine.clock().install();
    try {
      bubble.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      jasmine.clock().tick(600);
      fixture.detectChanges();
      expect(store.isStarred('chat-006', 'msg-007')).toBe(true);
      expect(
        el.querySelector('[data-testid="bubble-msg-007"] [data-testid="star-badge"]'),
      ).not.toBeNull();

      bubble.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      jasmine.clock().tick(600);
      fixture.detectChanges();
      expect(store.isStarred('chat-006', 'msg-007')).toBe(false);
      expect(
        el.querySelector('[data-testid="bubble-msg-007"] [data-testid="star-badge"]'),
      ).toBeNull();
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('renders a created conversation with its name and an empty thread', async () => {
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ChatWindowPage],
      providers: [
        { provide: ActivatedRoute, useValue: stubRoute('chat-new-1') },
        { provide: Router, useValue: { navigate: navSpy } },
      ],
    }).compileComponents();
    const store = TestBed.inject(ChatStore);
    store.createConversation();
    fixture = TestBed.createComponent(ChatWindowPage);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.chat-header__name')?.textContent).toBe('New contact');
    expect(el.querySelectorAll('app-message-bubble').length).toBe(0);
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