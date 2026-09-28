import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PrefsStore } from '../../core/prefs.store';
import { ChatStore } from '../../core/chat.store';
import { NavAction } from '../chat-list/chat.model';
import { ChatListItem } from '../../shared/components/chat-list-item/chat-list-item';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';

@Component({
  selector: 'app-broadcasts-page',
  imports: [NavigationBar, ChatListItem],
  templateUrl: './broadcasts-page.html',
  styleUrl: './broadcasts-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BroadcastsPage {
  private readonly router = inject(Router);
  private readonly store = inject(ChatStore);
  private readonly prefs = inject(PrefsStore);

  protected readonly chats = computed(() => this.store.broadcasts());

  protected readonly fontScale = this.prefs.fontScale;

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Back', icon: 'back' },
  ];

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/chats']);
    }
  }

  protected onOpenChat(chatId: string): void {
    this.store.openConversation(chatId);
    void this.router.navigate(['/chat', chatId]);
  }
}
