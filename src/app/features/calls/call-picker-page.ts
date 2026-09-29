import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CallStore } from '../../core/call.store';
import { Clock } from '../../core/clock';
import { ChatStore } from '../../core/chat.store';
import { NavAction } from '../chat-list/chat.model';
import { CallTarget } from './calls.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { UserAvatar } from '../../shared/components/avatar/user-avatar';

// F-045 (specs/045-calling-flow). PROVISIONAL chrome: no Figma node exists for a
// contact picker. The layout follows contacts-page.ts rather than inventing a
// second search-and-list pattern (research.md §7).
@Component({
  selector: 'app-call-picker-page',
  imports: [NavigationBar, UserAvatar],
  templateUrl: './call-picker-page.html',
  styleUrl: './call-picker-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallPickerPage {
  private readonly router = inject(Router);
  private readonly chatStore = inject(ChatStore);
  private readonly callStore = inject(CallStore);
  private readonly clock = inject(Clock);

  protected readonly searchQuery = signal('');

  // FR-015: read live from the store, so a rename made while the picker is open
  // shows up without a reload - the same posture as F-044's media title.
  protected readonly contacts = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const contacts = this.chatStore.contactConversations();
    if (query.length === 0) {
      return contacts;
    }
    return contacts.filter((contact) => contact.contactName.toLowerCase().includes(query));
  });

  protected readonly emptyLabel = computed(() =>
    this.chatStore.contactConversations().length === 0 ? 'No contacts' : 'No results',
  );

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Back', icon: 'back' },
  ];

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/calls']);
    }
  }

  protected onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  protected onClearSearch(): void {
    this.searchQuery.set('');
  }

  /**
   * FR-003: choosing a contact starts a voice call. FR-011: if a call is already
   * active, startCall refuses - so we stay on the picker and the existing call is
   * untouched rather than being replaced.
   */
  protected onSelectContact(contact: { id: string; contactName: string; avatarRef: string | null }): void {
    const target: CallTarget = {
      contactId: contact.id,
      contactName: contact.contactName,
      avatarRef: contact.avatarRef,
    };
    const started = this.callStore.startCall(target, 'voice', this.clock.now());
    if (!started) {
      return;
    }
    void this.router.navigate(['/calls/active'], { queryParams: { from: '/calls' } });
  }
}
