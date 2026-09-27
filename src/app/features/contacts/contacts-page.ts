import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ChatStore } from '../../core/chat.store';
import { NavAction } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { UserAvatar } from '../../shared/components/avatar/user-avatar';

@Component({
  selector: 'app-contacts-page',
  imports: [NavigationBar, UserAvatar],
  templateUrl: './contacts-page.html',
  styleUrl: './contacts-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactsPage {
  private readonly router = inject(Router);
  private readonly store = inject(ChatStore);

  protected readonly searchQuery = signal('');

  protected readonly contacts = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const contacts = this.store.contactConversations();
    if (query.length === 0) {
      return contacts;
    }
    return contacts.filter((contact) => contact.contactName.toLowerCase().includes(query));
  });

  protected readonly emptyLabel = computed(() => {
    if (this.store.contactConversations().length === 0) {
      return 'No contacts';
    }
    return 'No results';
  });

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Back', icon: 'back' },
  ];

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/settings']);
    }
  }

  protected onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  protected onClearSearch(): void {
    this.searchQuery.set('');
  }

  protected onOpenContact(chatId: string): void {
    void this.router.navigate(['/contact', chatId]);
  }
}
