import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatStore } from '../../core/chat.store';
import { NavAction } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { UserAvatar } from '../../shared/components/avatar/user-avatar';
import { CONTACT_ROWS } from './contact-info.seed';
import { SettingsRowSeed } from '../settings/settings.seed';

@Component({
  selector: 'app-contact-page',
  imports: [NavigationBar, UserAvatar],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(ChatStore);

  protected readonly chatId = computed(() => this.route.snapshot.paramMap.get('id') ?? '');
  protected readonly name = computed(() => this.store.contactName(this.chatId()));
  protected readonly rows: readonly SettingsRowSeed[] = CONTACT_ROWS;

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Back', icon: 'back' },
  ];

  protected readonly trailingActions: readonly NavAction[] = [
    { id: 'edit', label: 'Edit' },
  ];

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/chat', this.chatId()]);
      return;
    }
    if (id === 'edit') {
      // F-019: Edit Contact screen (design-map row 19; entry is a declared hypothesis).
      void this.router.navigate(['/contact', this.chatId(), 'edit']);
    }
  }

  protected onMessages(): void {
    this.store.openConversation(this.chatId());
    void this.router.navigate(['/chat', this.chatId()]);
  }

  protected onRowActivate(row: SettingsRowSeed): void {
    // F-015: media/groups targets are later features (spec Non-Goals).
    if (row.id === 'contact-starred') {
      void this.router.navigate(['/starred-messages']);
    }
  }
}