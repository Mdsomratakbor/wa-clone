import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NavAction } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { AccountStore } from '../../core/account.store';
import { ChatStore } from '../../core/chat.store';
import { PrefsStore } from '../../core/prefs.store';
import { StatusStore } from '../../core/status.store';

const CONFIRM_WORD = 'DELETE';

@Component({
  selector: 'app-delete-account-page',
  imports: [NavigationBar],
  templateUrl: './delete-account-page.html',
  styleUrl: './delete-account-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteAccountPage {
  private readonly router = inject(Router);
  private readonly accountStore = inject(AccountStore);
  private readonly chatStore = inject(ChatStore);
  private readonly prefsStore = inject(PrefsStore);
  private readonly statusStore = inject(StatusStore);

  protected readonly confirmation = signal('');
  protected readonly deleted = signal(false);
  protected readonly announcement = signal('');

  protected readonly canDelete = computed(() => this.confirmation() === CONFIRM_WORD);

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Back', icon: 'back' },
  ];

  protected onNavAction(id: string): void {
    if (id === 'back' && !this.deleted()) {
      void this.router.navigate(['/settings/account']);
    }
  }

  // FR-008: wipe every persisted store - chats, prefs, statuses, account/two-step.
  // Order is irrelevant (all four are independent keys) but is kept stable so the
  // test can assert the full wipe in one pass.
  protected onDelete(): void {
    if (!this.canDelete() || this.deleted()) {
      return;
    }
    this.chatStore.reset();
    this.prefsStore.reset();
    this.statusStore.reset();
    this.accountStore.reset();
    this.deleted.set(true);
    this.announcement.set('Your account has been deleted');
  }

  protected onContinue(): void {
    void this.router.navigate(['/chats']);
  }
}