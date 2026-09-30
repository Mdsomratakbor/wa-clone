import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatListItem } from './chat-list-item';
import { ChatPreview } from '../../../features/chat-list/chat.model';
import { PrefsStore } from '../../../core/prefs.store';

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
    // F-046: the item now reads a pref, and Jasmine randomizes order, so the
    // snapshot must be reset here or a sibling spec's pref leaks into these.
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ChatListItem],
    }).compileComponents();
    TestBed.inject(PrefsStore).reset();
  });

  afterEach(() => {
    localStorage.clear();
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

    it('renders no mute badge for an unmuted chat', () => {
    fixture = TestBed.createComponent(ChatListItem);
    fixture.componentRef.setInput('chat', CHAT);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.chat-list-item__mute')).toBeNull();
    expect(el.querySelector('[data-testid^="chat-mute-badge-"]')).toBeNull();
  });

  it('renders a labelled mute badge for a muted chat (feature 033)', () => {
    fixture = TestBed.createComponent(ChatListItem);
    fixture.componentRef.setInput('chat', { ...CHAT, muted: true });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const badge = el.querySelector('[data-testid="chat-mute-badge-chat-001"]');
    expect(badge).not.toBeNull();
    expect(badge?.getAttribute('aria-label')).toBe('Muted');
    expect(badge?.getAttribute('role')).toBe('img');
  });

  it('renders the badge in edit mode as well (feature 033)', () => {
    fixture = TestBed.createComponent(ChatListItem);
    fixture.componentRef.setInput('chat', { ...CHAT, muted: true });
    fixture.componentRef.setInput('selectMode', true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="select-circle"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="chat-mute-badge-chat-001"]')).not.toBeNull();
    expect(el.querySelector('.chat-list-item')?.getAttribute('aria-label')).toBe(
      'Maximillian Jacobson',
    );
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

  it('renders a selection circle with checkbox semantics in select mode', () => {
    fixture = TestBed.createComponent(ChatListItem);
    fixture.componentRef.setInput('chat', CHAT);
    fixture.componentRef.setInput('selectMode', true);
    fixture.componentRef.setInput('checked', false);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const row = el.querySelector('.chat-list-item') as HTMLElement;
    expect(row.getAttribute('role')).toBe('checkbox');
    expect(row.getAttribute('aria-checked')).toBe('false');
    expect(el.querySelector('[data-testid="select-circle"]')).not.toBeNull();
    expect(
      el.querySelector('[data-testid="select-circle"]')?.classList.contains(
        'chat-list-item__select--checked',
      ),
    ).toBe(false);
  });

  it('marks the circle checked when selected', () => {
    fixture = TestBed.createComponent(ChatListItem);
    fixture.componentRef.setInput('chat', CHAT);
    fixture.componentRef.setInput('selectMode', true);
    fixture.componentRef.setInput('checked', true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.chat-list-item')?.getAttribute('aria-checked')).toBe('true');
    expect(
      el.querySelector('[data-testid="select-circle"]')?.classList.contains(
        'chat-list-item__select--checked',
      ),
    ).toBe(true);
  });

  it('keeps button semantics outside select mode', () => {
    fixture = TestBed.createComponent(ChatListItem);
    fixture.componentRef.setInput('chat', CHAT);
    fixture.detectChanges();
    const row = (fixture.nativeElement as HTMLElement).querySelector('.chat-list-item');
    expect(row?.getAttribute('role')).toBe('button');
    expect(row?.getAttribute('aria-checked')).toBeNull();
    expect((fixture.nativeElement as HTMLElement).querySelector('[data-testid="select-circle"]')).toBeNull();
  });

  it('renders a read tick when read is true', () => {
    fixture = TestBed.createComponent(ChatListItem);
    fixture.componentRef.setInput('chat', { ...CHAT, read: true });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const tick = el.querySelector<SVGElement>('[data-testid="read-tick-chat-001"]');
    expect(tick).not.toBeNull();
    expect(
      el
        .querySelector('.chat-list-item__ticks')
        ?.classList.contains('chat-list-item__ticks--read'),
    ).toBe(true);
  });

  it('hides the read tick when read is false or undefined', () => {
    fixture = TestBed.createComponent(ChatListItem);
    fixture.componentRef.setInput('chat', { ...CHAT, read: false });
    fixture.detectChanges();
    let el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid^="read-tick-"]')).toBeNull();

    fixture.componentRef.setInput('chat', { ...CHAT, read: undefined });
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid^="read-tick-"]')).toBeNull();
  });

  describe('F-046 FR-006: showPreviews gates the preview text', () => {
    function previewText(fixture: ComponentFixture<ChatListItem>): string {
      return (
        (fixture.nativeElement as HTMLElement).querySelector(
          '[data-testid="preview-text-chat-001"]',
        )?.textContent?.trim() ?? ''
      );
    }

    it('shows the preview by default', () => {
      fixture = TestBed.createComponent(ChatListItem);
      fixture.componentRef.setInput('chat', CHAT);
      fixture.detectChanges();
      expect(previewText(fixture)).toBe('Bro, I have a good idea!');
    });

    it('hides the preview text when showPreviews is off', () => {
      TestBed.inject(PrefsStore).set('showPreviews', false);
      fixture = TestBed.createComponent(ChatListItem);
      fixture.componentRef.setInput('chat', CHAT);
      fixture.detectChanges();
      expect(previewText(fixture)).toBe('');
    });

    it('keeps the name, timestamp and read ticks while the preview is hidden', () => {
      TestBed.inject(PrefsStore).set('showPreviews', false);
      fixture = TestBed.createComponent(ChatListItem);
      fixture.componentRef.setInput('chat', { ...CHAT, read: true });
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      // Read state is not message content, so the ticks stay visible...
      expect(el.querySelector('[data-testid="read-tick-chat-001"]')).not.toBeNull();
      // ...and the row is still identifiable.
      expect(el.querySelector('.chat-list-item__name')?.textContent).toBe('Maximillian Jacobson');
      expect(el.querySelector('.chat-list-item__timestamp')?.textContent).toBe('10/30/19');
    });

    it('restores the preview when the pref is turned back on', () => {
      const prefs = TestBed.inject(PrefsStore);
      prefs.set('showPreviews', false);
      fixture = TestBed.createComponent(ChatListItem);
      fixture.componentRef.setInput('chat', CHAT);
      fixture.detectChanges();
      expect(previewText(fixture)).toBe('');
      prefs.set('showPreviews', true);
      fixture.detectChanges();
      expect(previewText(fixture)).toBe('Bro, I have a good idea!');
    });
  });
});