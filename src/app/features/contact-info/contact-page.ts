import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavAction } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { UserAvatar } from '../../shared/components/avatar/user-avatar';
import { CHAT_SEED } from '../chat-list/chat-list.seed';
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

  protected readonly chatId = computed(() => this.route.snapshot.paramMap.get('id') ?? '');
  protected readonly name = computed(() => {
    const chat = CHAT_SEED.find((c) => c.id === this.chatId());
    return chat?.contactName ?? 'Contact';
  });
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
    // F-015: messaging loop is a later feature (Non-Goal).
  }

  protected onRowActivate(_row: SettingsRowSeed): void {
    // F-015: media/groups/starred targets are later features.
  }
}