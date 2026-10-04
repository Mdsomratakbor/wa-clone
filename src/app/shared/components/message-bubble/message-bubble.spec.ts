import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Message } from '../../../features/chat-window/chat-window.model';
import { MessageBubble } from './message-bubble';

const OUTGOING: Message = {
  id: 'msg-001',
  sender: 'outgoing',
  text: 'Japan looks amazing!',
  time: '10:10',
  file: null,
};

const INCOMING: Message = {
  id: 'msg-002',
  sender: 'incoming',
  text: 'Do you like it?',
  time: '11:45',
  file: null,
};

const FILE_MSG: Message = {
  id: 'msg-003',
  sender: 'outgoing',
  text: '',
  time: '10:15',
  file: { filename: 'IMG_0481', ext: 'png', size: '2.8 MB' },
};

const PHOTO_MSG: Message = {
  id: 'msg-004',
  sender: 'outgoing',
  text: '',
  time: '10:16',
  file: { filename: 'Alpine', ext: 'jpg', size: '2.4 MB', dataUrl: 'data:image/jpeg;base64,PHOTO' },
};

const PHOTO_WITH_CAPTION: Message = {
  id: 'msg-005',
  sender: 'outgoing',
  text: 'Look at the lake',
  time: '10:17',
  file: { filename: 'Alpine', ext: 'jpg', size: '2.4 MB', dataUrl: 'data:image/jpeg;base64,PHOTO' },
};

describe('MessageBubble', () => {
  let fixture: ComponentFixture<MessageBubble>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageBubble],
    }).compileComponents();
  });

  it('renders text and timestamp', () => {
    fixture = TestBed.createComponent(MessageBubble);
    fixture.componentRef.setInput('message', OUTGOING);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.message-bubble__text')?.textContent).toBe('Japan looks amazing!');
    expect(el.querySelector('.message-bubble__time')?.textContent).toBe('10:10');
  });

  it('marks the sender side with the right modifier class', () => {
    fixture = TestBed.createComponent(MessageBubble);
    fixture.componentRef.setInput('message', INCOMING);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.message-bubble')?.className).toContain('message-bubble--incoming');
  });

  it('renders read ticks only for outgoing messages', () => {
    fixture = TestBed.createComponent(MessageBubble);
    fixture.componentRef.setInput('message', OUTGOING);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.message-bubble__ticks')).not.toBeNull();

    fixture.detectChanges();
    fixture.componentRef.setInput('message', INCOMING);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.message-bubble__ticks')).toBeNull();
  });

  it('renders the file card with filename, size and extension', () => {
    fixture = TestBed.createComponent(MessageBubble);
    fixture.componentRef.setInput('message', FILE_MSG);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.message-bubble__file-name')?.textContent).toBe('IMG_0481');
    expect(el.querySelector('.message-bubble__file-size')?.textContent).toBe('2.8 MB');
    expect(el.querySelector('.message-bubble__file-ext')?.textContent).toBe('png');
    expect(el.querySelector('.message-bubble__text')).toBeNull();
  });

  it('renders an inline photo for a message whose file carries a data URL (F-058 FR-002)', () => {
    fixture = TestBed.createComponent(MessageBubble);
    fixture.componentRef.setInput('message', PHOTO_MSG);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const image = el.querySelector<HTMLImageElement>('[data-testid="bubble-photo"]');
    expect(image).not.toBeNull();
    expect(image?.getAttribute('src')).toBe('data:image/jpeg;base64,PHOTO');
    expect(el.querySelector('.message-bubble__file')).toBeNull();
  });

  it('renders a caption line for a photo that was sent with one (F-058 FR-005)', () => {
    fixture = TestBed.createComponent(MessageBubble);
    fixture.componentRef.setInput('message', PHOTO_WITH_CAPTION);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="bubble-caption"]')?.textContent).toBe('Look at the lake');
    expect(el.querySelector('[data-testid="bubble-photo"]')).not.toBeNull();
  });

  it('gains a caption line below the existing file card meanwhile (F-058 FR-005)', () => {
    fixture = TestBed.createComponent(MessageBubble);
    fixture.componentRef.setInput('message', {
      ...FILE_MSG,
      text: 'The file',
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.message-bubble__file')).not.toBeNull();
    expect(el.querySelector('[data-testid="bubble-caption"]')?.textContent).toBe('The file');
  });

  it('labels a photo bubble as a photo in the aria-label (F-058 FR-007)', () => {
    fixture = TestBed.createComponent(MessageBubble);
    fixture.componentRef.setInput('message', PHOTO_WITH_CAPTION);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const label = el.querySelector('.message-bubble')?.getAttribute('aria-label');
    expect(label).toContain('Photo, Look at the lake');
  });

  it('shows the star badge only when starred', () => {
    fixture = TestBed.createComponent(MessageBubble);
    fixture.componentRef.setInput('message', OUTGOING);
    fixture.componentRef.setInput('starred', true);
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[data-testid="star-badge"]'),
    ).not.toBeNull();

    fixture.componentRef.setInput('starred', false);
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[data-testid="star-badge"]'),
    ).toBeNull();
  });

  it('emits the message id on hold after the hold duration and not for quick taps', () => {
    jasmine.clock().install();
    try {
      fixture = TestBed.createComponent(MessageBubble);
      fixture.componentRef.setInput('message', OUTGOING);
      fixture.detectChanges();
      const bubble = (fixture.nativeElement as HTMLElement).querySelector('.message-bubble')!;
      let emitted: string | undefined;
      fixture.componentInstance.star.subscribe((id: string) => (emitted = id));

      bubble.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      jasmine.clock().tick(549);
      expect(emitted).toBeUndefined();
      jasmine.clock().tick(2);
      expect(emitted).toBe('msg-001');

      // quick tap: start + release before the hold duration
      emitted = undefined;
      bubble.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      bubble.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
      jasmine.clock().tick(600);
      expect(emitted).toBeUndefined();
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('emits the message id on right-click and prevents the context menu', () => {
    fixture = TestBed.createComponent(MessageBubble);
    fixture.componentRef.setInput('message', INCOMING);
    fixture.detectChanges();
    const bubble = (fixture.nativeElement as HTMLElement).querySelector('.message-bubble')!;
    let emitted: string | undefined;
    fixture.componentInstance.star.subscribe((id: string) => (emitted = id));

    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    bubble.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(emitted).toBe('msg-002');
  });
});