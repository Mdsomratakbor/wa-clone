import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { ContactHeader } from '../../../features/chat-window/chat-window.model';
import { UserAvatar } from '../avatar/user-avatar';

@Component({
  selector: 'app-chat-header',
  imports: [UserAvatar],
  templateUrl: './chat-header.html',
  styleUrl: './chat-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatHeader {
  private readonly trigger =
    viewChild.required<ElementRef<HTMLButtonElement>>('actionsTrigger');

  readonly contact = input.required<ContactHeader>();
  readonly backLabel = input<string>('Back to chats');
  readonly back = output<void>();
  readonly identity = output<void>();
  readonly actions = output<void>();

  focus(): void {
    this.trigger().nativeElement.focus();
  }
}