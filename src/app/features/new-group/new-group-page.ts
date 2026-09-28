import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ChatStore } from '../../core/chat.store';
import { NavAction } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { UserAvatar } from '../../shared/components/avatar/user-avatar';

@Component({
  selector: 'app-new-group-page',
  imports: [NavigationBar, UserAvatar],
  templateUrl: './new-group-page.html',
  styleUrl: './new-group-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewGroupPage {
  private readonly router = inject(Router);
  private readonly store = inject(ChatStore);

  protected readonly nameDraft = signal('');
  protected readonly selectedIds = signal<ReadonlySet<string>>(new Set());

  protected readonly contacts = computed(() => this.store.contactConversations());

  protected readonly canCreate = computed(() => this.nameDraft().trim().length > 0);

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Back', icon: 'back' },
  ];

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/chats']);
    }
  }

  protected onNameInput(value: string): void {
    this.nameDraft.set(value);
  }

  protected isSelected(chatId: string): boolean {
    return this.selectedIds().has(chatId);
  }

  protected onToggleContact(chat: { id: string; contactName: string }): void {
    const next = new Set(this.selectedIds());
    if (next.has(chat.id)) {
      next.delete(chat.id);
    } else {
      next.add(chat.id);
    }
    this.selectedIds.set(next);
  }

  protected onCreate(): void {
    const name = this.nameDraft().trim();
    if (name.length === 0) {
      return;
    }
    const chatId = this.store.createGroup(name, [...this.selectedIds()]);
    void this.router.navigate(['/chat', chatId]);
  }
}
