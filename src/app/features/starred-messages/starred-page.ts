import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ChatStore } from '../../core/chat.store';
import { NavAction } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { UserAvatar } from '../../shared/components/avatar/user-avatar';

@Component({
  selector: 'app-starred-page',
  imports: [NavigationBar, UserAvatar],
  templateUrl: './starred-page.html',
  styleUrl: './starred-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StarredPage {
  private readonly router = inject(Router);
  private readonly store = inject(ChatStore);

  protected readonly entries = computed(() => this.store.starredEntries());

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Settings', icon: 'back' },
  ];

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/settings']);
    }
  }

  protected onOpenChat(chatId: string): void {
    this.store.openConversation(chatId);
    void this.router.navigate(['/chat', chatId]);
  }
}