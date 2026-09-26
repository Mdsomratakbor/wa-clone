import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Message } from '../../../features/chat-window/chat-window.model';

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

  private holdTimer: number | undefined;

  protected readonly ariaLabel = computed(() => {
    const m = this.message();
    const body = m.file ? m.file.filename : m.text || 'image attachment';
    const direction = m.sender === 'outgoing' ? 'sent' : 'received';
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