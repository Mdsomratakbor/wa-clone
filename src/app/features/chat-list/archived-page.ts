import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ChatStore } from '../../core/chat.store';
import { NavAction } from '../chat-list/chat.model';
import { ChatListItem } from '../../shared/components/chat-list-item/chat-list-item';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';

@Component({
  selector: 'app-archived-page',
  imports: [NavigationBar, ChatListItem],
  templateUrl: './archived-page.html',
  styleUrl: './archived-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArchivedPage {
  private readonly router = inject(Router);
  private readonly store = inject(ChatStore);

  protected readonly chats = computed(() => {
    const archived = new Set(this.store.archivedIds());
    return this.store.conversations().filter((chat) => archived.has(chat.id));
  });

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Chats', icon: 'back' },
  ];

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/chats']);
    }
  }

  protected onOpenChat(chatId: string): void {
    this.store.unarchiveConversations([chatId]);
    this.store.openConversation(chatId);
    void this.router.navigate(['/chat', chatId]);
  }
}