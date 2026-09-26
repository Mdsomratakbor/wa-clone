import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { AddModal } from '../new-chat-modal/add-modal';
import { ChatStore } from '../../core/chat.store';
import { ChatSort, PrefsStore } from '../../core/prefs.store';
import { Action } from '../../shared/components/action-sheet/action-sheet.model';
import { ChatActionsBar } from '../../shared/components/chat-actions-bar/chat-actions-bar';
import { ChatListItem } from '../../shared/components/chat-list-item/chat-list-item';
import { Fab } from '../../shared/components/fab/fab';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { TabBar } from '../../shared/components/tab-bar/tab-bar';
import { ChatPreview, NavAction, TabItem, TabKey } from './chat.model';
import { NEW_CHAT_ACTIONS } from '../new-chat-modal/new-chat-modal.seed';

const TAB_KEYS: readonly TabKey[] = ['settings', 'chats', 'camera', 'calls', 'status'];
const TAB_LABELS: Record<TabKey, string> = {
  settings: 'Settings',
  chats: 'Chats',
  camera: 'Camera',
  calls: 'Calls',
  status: 'Status',
};

const SORT_OPTIONS: readonly { value: ChatSort; label: string }[] = [
  { value: 'recent', label: 'Recent' },
  { value: 'name', label: 'Name' },
  { value: 'unread', label: 'Unread' },
];

@Component({
  selector: 'app-chats-page',
  imports: [NavigationBar, ChatListItem, Fab, TabBar, ChatActionsBar, AddModal],
  templateUrl: './chats-page.html',
  styleUrl: './chats-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatsPage {
  private readonly router = inject(Router);
  private readonly store = inject(ChatStore);
  private readonly prefs = inject(PrefsStore);
  private readonly fabRef = viewChild(Fab);

  protected readonly conversations = computed(() => this.store.conversations());

  protected readonly activeTab = signal<TabKey>('chats');
  protected readonly editing = signal(false);
  protected readonly selectedIds = signal<ReadonlySet<string>>(new Set());
  protected readonly items = signal<ChatPreview[]>([]);
  protected readonly searchQuery = signal('');
  protected readonly modalOpen = signal(false);
  protected readonly newChatActions: readonly Action[] = NEW_CHAT_ACTIONS;
  protected readonly sortOptions: readonly { value: ChatSort; label: string }[] = SORT_OPTIONS;

  protected readonly chatSort = this.prefs.chatSort;

  protected readonly visibleItems = computed<readonly ChatPreview[]>(() => {
    const list = this.items();
    const query = this.searchQuery().trim().toLowerCase();
    const filtered = query
      ? list.filter(
          (chat) =>
            chat.contactName.toLowerCase().includes(query) ||
            chat.preview.toLowerCase().includes(query),
        )
      : list;
    const sort = this.prefs.chatSort();
    const result = [...filtered];
    if (sort === 'name') {
      result.sort((a, b) =>
        a.contactName.toLowerCase().localeCompare(b.contactName.toLowerCase()),
      );
    } else if (sort === 'unread') {
      result.sort((a, b) => Number(a.read === true) - Number(b.read === true));
    }
    return result;
  });

  protected readonly searchActive = computed(() => this.searchQuery().trim().length > 0);

  protected readonly searchEmpty = computed(
    () => this.searchActive() && this.items().length > 0 && this.visibleItems().length === 0,
  );

  constructor() {
    effect(() => {
      this.items.set([...this.conversations()]);
    });
  }

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'broadcast-lists', label: 'Broadcast Lists' },
    { id: 'new-group', label: 'New Group' },
  ];

  protected readonly trailingActions = computed<readonly NavAction[]>(() =>
    this.editing() ? [{ id: 'done', label: 'Done' }] : [{ id: 'edit', label: 'Edit' }],
  );

  protected readonly tabs = computed<TabItem[]>(() =>
    TAB_KEYS.map((key) => ({ key, label: TAB_LABELS[key], active: key === this.activeTab() })),
  );

  protected readonly activeLabel = computed(() => TAB_LABELS[this.activeTab()]);

  protected readonly selectedCount = computed(() => this.selectedIds().size);

  protected onTabSelect(key: TabKey): void {
    if (this.editing()) {
      return;
    }
    if (key === 'calls') {
      void this.router.navigate(['/calls']);
      return;
    }
    if (key === 'status') {
      void this.router.navigate(['/status']);
      return;
    }
    if (key === 'camera') {
      void this.router.navigate(['/camera']);
      return;
    }
    if (key === 'settings') {
      void this.router.navigate(['/settings']);
      return;
    }
    this.activeTab.set(key);
  }

  protected onChatSelected(chat: ChatPreview): void {
    if (this.editing()) {
      this.toggleSelection(chat.id);
      return;
    }
    this.store.openConversation(chat.id);
    void this.router.navigate(['/chat', chat.id]);
  }

  protected onNavAction(id: string): void {
    if (id === 'edit') {
      this.editing.set(true);
      this.selectedIds.set(new Set());
      return;
    }
    if (id === 'done') {
      this.editing.set(false);
      this.selectedIds.set(new Set());
      return;
    }
    // F-001/003: broadcast-lists / new-group flows are later features.
  }

  protected onFabPressed(): void {
    this.modalOpen.set(true);
  }

  protected onSearchInput(value: string): void {
    this.searchQuery.set(value);
  }

  protected onClearSearch(): void {
    this.searchQuery.set('');
  }

  protected onSort(value: ChatSort): void {
    this.prefs.setChatSort(value);
  }

  protected onAddModalAction(id: string): void {
    // F-009 targets (new group / community) are later features (spec Non-Goals).
    if (id === 'new-contact') {
      this.onDismissModal();
      const chatId = this.store.createConversation();
      void this.router.navigate(['/chat', chatId]);
    }
  }

  protected onDismissModal(): void {
    this.modalOpen.set(false);
    this.fabRef()?.focus();
  }

  protected isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  protected onArchive(): void {
    this.removeSelected();
  }

  protected onDelete(): void {
    this.removeSelected();
  }

  protected onReadAll(): void {
    this.store.markAllRead();
  }

  private toggleSelection(id: string): void {
    const next = new Set(this.selectedIds());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.selectedIds.set(next);
  }

  private removeSelected(): void {
    const selected = this.selectedIds();
    if (selected.size === 0) {
      return;
    }
    this.items.set(this.items().filter((chat) => !selected.has(chat.id)));
    this.selectedIds.set(new Set());
  }
}