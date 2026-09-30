import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { ChatPreview } from '../../../features/chat-list/chat.model';
import { PrefsStore } from '../../../core/prefs.store';
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

  private readonly prefs = inject(PrefsStore);

  // F-046 FR-006: the read ticks stay, because they convey read state rather
  // than message content. Only the preview text is gated.
  protected readonly showPreviewText = computed(() => this.prefs.prefs().showPreviews);

  protected onActivate(): void {
    this.selected.emit(this.chat());
  }
}