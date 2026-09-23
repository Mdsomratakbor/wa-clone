import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Message } from '../../../features/chat-window/chat-window.model';

@Component({
  selector: 'app-message-bubble',
  templateUrl: './message-bubble.html',
  styleUrl: './message-bubble.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageBubble {
  readonly message = input.required<Message>();

  protected readonly ariaLabel = computed(() => {
    const m = this.message();
    const body = m.file ? m.file.filename : m.text || 'image attachment';
    const direction = m.sender === 'outgoing' ? 'sent' : 'received';
    return `${m.time}, ${body}, ${direction}`;
  });
}