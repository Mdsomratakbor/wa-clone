import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ChatListItem } from '../../shared/components/chat-list-item/chat-list-item';
import { Fab } from '../../shared/components/fab/fab';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { TabBar } from '../../shared/components/tab-bar/tab-bar';
import { CHAT_SEED } from './chat-list.seed';
import { ChatPreview, NavAction, TabItem, TabKey } from './chat.model';

const TAB_KEYS: readonly TabKey[] = ['settings', 'chats', 'camera', 'calls', 'status'];
const TAB_LABELS: Record<TabKey, string> = {
  settings: 'Settings',
  chats: 'Chats',
  camera: 'Camera',
  calls: 'Calls',
  status: 'Status',
};

@Component({
  selector: 'app-chats-page',
  imports: [NavigationBar, ChatListItem, Fab, TabBar],
  templateUrl: './chats-page.html',
  styleUrl: './chats-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatsPage {
  private readonly router = inject(Router);

  readonly conversations = input<ChatPreview[]>(CHAT_SEED as ChatPreview[]);

  protected readonly activeTab = signal<TabKey>('chats');

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'broadcast-lists', label: 'Broadcast Lists' },
    { id: 'new-group', label: 'New Group' },
  ];

  protected readonly trailingActions: readonly NavAction[] = [{ id: 'edit', label: 'Edit' }];

  protected readonly tabs = computed<TabItem[]>(() =>
    TAB_KEYS.map((key) => ({ key, label: TAB_LABELS[key], active: key === this.activeTab() })),
  );

  protected readonly activeLabel = computed(() => TAB_LABELS[this.activeTab()]);

  protected onTabSelect(key: TabKey): void {
    this.activeTab.set(key);
  }

  protected onChatSelected(chat: ChatPreview): void {
    void this.router.navigate(['/chat', chat.id]);
  }

  protected onNavAction(_id: string): void {
    // F-001: edit / new-chat flows are later features.
  }

  protected onFabPressed(): void {
    // F-001: new-chat action sheet is a later feature.
  }
}