import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ChatPreview } from '../../../features/chat-list/chat.model';
import { UserAvatar } from '../avatar/user-avatar';

@Component({
  selector: 'app-chat-list-item',
  imports: [UserAvatar],
  templateUrl: './chat-list-item.html',
  styleUrl: './chat-list-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatListItem {
  readonly chat = input.required<ChatPreview>();
  readonly selectMode = input(false);
  readonly checked = input(false);
  readonly selected = output<ChatPreview>();

  protected onActivate(): void {
    this.selected.emit(this.chat());
  }
}