import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Message } from '../../../features/chat-window/chat-window.model';
import { PrefsStore } from '../../../core/prefs.store';

const HOLD_MS = 550;

@Component({
  selector: 'app-message-bubble',
  templateUrl: './message-bubble.html',
  styleUrl: './message-bubble.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageBubble {
  readonly message = input.required<Message>();
  readonly starred = input(false);
  readonly star = output<string>();

  private readonly prefs = inject(PrefsStore);
  private holdTimer: number | undefined;

  // F-059 FR-008: media visibility OFF replaces the media surface with a privacy
  // placeholder. The decision lives here so every host that renders a bubble -
  // the chat thread and the starred page alike - obeys the one switch.
  protected readonly masked = computed(() => !this.prefs.prefs().mediaVisibility);

  protected readonly ariaLabel = computed(() => {
    const m = this.message();
    const direction = m.sender === 'outgoing' ? 'sent' : 'received';
    let body: string;
    if (this.masked()) {
      // F-059 FR-010: the placeholder announces itself plus any caption.
      const caption = m.text.trim();
      body = caption ? `Media hidden, ${caption}` : 'Media hidden';
    } else if (m.file) {
      const caption = m.text.trim();
      if (m.file.dataUrl !== undefined) {
        body = caption ? `Photo, ${caption}` : 'Photo';
      } else {
        body = caption ? `${m.file.filename}, ${caption}` : m.file.filename;
      }
    } else {
      body = m.text || 'image attachment';
    }
    return `${m.time}, ${body}, ${direction}`;
  });

  protected onHoldStart(): void {
    if (this.holdTimer !== undefined) {
      return;
    }
    this.holdTimer = window.setTimeout(() => {
      this.holdTimer = undefined;
      this.star.emit(this.message().id);
    }, HOLD_MS);
  }

  protected onHoldEnd(): void {
    if (this.holdTimer !== undefined) {
      window.clearTimeout(this.holdTimer);
      this.holdTimer = undefined;
    }
  }

  protected onContextMenu(event: Event): void {
    event.preventDefault();
    this.onHoldEnd();
    this.star.emit(this.message().id);
  }
}