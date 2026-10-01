import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatStore } from '../../core/chat.store';
import { PrefsStore } from '../../core/prefs.store';
import { NavAction } from '../chat-list/chat.model';
import { ChatListItem } from '../../shared/components/chat-list-item/chat-list-item';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';

// Chrome is PROVISIONAL: the design file has no shared-Groups screen, so the
// title, row treatment and empty-state copy are hypotheses, not design values
// (specs/048-contact-groups, G1 BLOCKED).
@Component({
  selector: 'app-groups-page',
  imports: [NavigationBar, ChatListItem],
  templateUrl: './groups-page.html',
  styleUrl: './groups-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(ChatStore);
  private readonly prefs = inject(PrefsStore);

  protected readonly chatId = computed(() => this.route.snapshot.paramMap.get('id') ?? '');
  protected readonly groups = computed(() => this.store.contactGroups(this.chatId()));

  // chat-list-item does not read the font scale itself, so every screen that
  // hosts it applies data-font-scale (F-041). Omitting it would make the font
  // size setting silently inert here.
  protected readonly fontScale = this.prefs.fontScale;

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Back', icon: 'back' },
  ];

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/contact', this.chatId()]);
    }
  }

  protected onOpenChat(chatId: string): void {
    this.store.openConversation(chatId);
    void this.router.navigate(['/chat', chatId]);
  }
}
